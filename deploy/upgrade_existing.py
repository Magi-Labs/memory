"""Prepare a reversible gateway-only upgrade of the existing two-service deployment.

Run on the deployment host after unpacking a source release into root/releases/RELEASE.
Does not print credentials, restart services, or modify the engine service/data.
"""
import argparse
import os
import shutil
from pathlib import Path
from urllib.parse import urlparse

parser = argparse.ArgumentParser()
parser.add_argument("--root", required=True)
parser.add_argument("--release", required=True)
parser.add_argument("--origin", required=True)
parser.add_argument("--tag", required=True)
args = parser.parse_args()
os.umask(0o077)
root = Path(args.root).resolve()
release = (root / "releases" / args.release).resolve()
if release.parent != root / "releases" or not (release / "Dockerfile").is_file():
    raise SystemExit("Release must be a direct child of root/releases with a Dockerfile")
origin = args.origin.rstrip("/")
parsed = urlparse(origin)
if parsed.scheme != "https" or not parsed.netloc or parsed.path or parsed.query or parsed.fragment:
    raise SystemExit("A plain HTTPS origin is required")
compose_path = root / "docker-compose.yaml"
env_path = root / "gateway.env"
original_compose = compose_path.read_text()
before, separator, gateway_and_networks = original_compose.partition("  gateway:\n")
if not separator:
    raise SystemExit("Expected gateway service was not found")
gateway, network_separator, networks = gateway_and_networks.partition("\nnetworks:\n")
expected_build = "      context: .\n      dockerfile: Dockerfile.gateway"
expected_env = "    env_file: gateway.env\n"
if expected_build not in gateway or expected_env not in gateway or not network_separator:
    raise SystemExit("Deployment layout differs; inspect it before upgrading")
gateway = gateway.replace(expected_build,
    "      context: ./releases/" + args.release + "\n      dockerfile: Dockerfile", 1)
gateway = gateway.replace(expected_env, expected_env +
    "    volumes:\n      - ./gateway-data:/app/state\n"
    "    read_only: true\n    tmpfs:\n      - /tmp:size=16m,mode=1777\n"
    "    cap_drop: [ALL]\n    security_opt: [no-new-privileges:true]\n    mem_limit: 512m\n", 1)
updated_compose = before + separator + gateway + network_separator + networks
original_env = env_path.read_text()
lines = original_env.splitlines()
for key, value in {"PUBLIC_ORIGIN": origin, "MEMORY_CONTAINER_TAG": args.tag, "STATE_DIR": "/app/state"}.items():
    if any(c in value for c in "\r\n"):
        raise SystemExit("Invalid configuration value")
    lines = [line for line in lines if not line.startswith(key + "=")]
    lines.append(key + "=" + value)
backup = root / "backups" / ("memory-project-" + args.release)
backup.mkdir(mode=0o700, parents=True, exist_ok=False)
for filename in ("docker-compose.yaml", "gateway.env", "gateway.py", "dashboard.html", "Dockerfile.gateway", ".dockerignore"):
    path = root / filename
    if path.is_file():
        destination = backup / filename
        shutil.copy2(path, destination)
        destination.chmod(0o600)
state = root / "gateway-data"
state.mkdir(mode=0o700, exist_ok=True)
os.chown(state, 10001, 10001)
state.chmod(0o700)
compose_path.write_text(updated_compose)
env_path.write_text("\n".join(lines) + "\n")
env_path.chmod(0o600)
print("Prepared gateway-only upgrade; backup: " + str(backup))
print("Engine service and data are unchanged. Build before recreating the gateway.")
