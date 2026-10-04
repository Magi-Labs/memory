# Contributing to Memory

Memory is a single-owner personal context service. Read [AGENTS.md](AGENTS.md), [architecture](docs/ARCHITECTURE.md) and the [current API contract](docs/API.md) before changing behavior. All contributor-facing requirements are available here; access to the private maintainer standards repository is not required.

## Development setup

Use Python 3.12, Node 24 and npm. Docker Compose is an alternative for the gateway. Durable-memory operations require a separate Supermemory instance; use a disposable instance/container tag and synthetic source documents, never a personal production dataset.

From the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
.venv/bin/python scripts/make_login.py
```

Fill in `.env` locally, including the generated login values, engine URL/key and a development container tag. The helper prints login hashes; keep them out of issue reports and command transcripts. On Windows, use `.venv\Scripts\python.exe` instead of `.venv/bin/python`.

For Vite development, set `PUBLIC_ORIGIN=http://127.0.0.1:5173` and `STATE_DIR=./state`. The tracked example's `/app/state` is for the container. The shell does not automatically load `.env`; inject its values with your environment/secret manager, or load it only if you created and trust its shell syntax. Never execute an environment file obtained from an issue or memory.

In a second terminal:

```sh
cd frontend
npm ci
npm run dev
```

With the configured environment loaded, run the gateway from the repo root:

```sh
.venv/bin/python -m uvicorn gateway:app --app-dir app --host 127.0.0.1 --port 8080 --no-access-log
```

Open the Vite origin and use the development owner login. Vite proxies `/api` to the gateway. Connect development MCP clients directly to port 8080. For same-origin gateway serving, build the frontend and set `PUBLIC_ORIGIN=http://127.0.0.1:8080` before starting the gateway.

For a container build only, run `docker compose build memory`. To intentionally start a local installation, follow the README and [operations guide](docs/OPERATIONS.md); the engine is a separate dependency.

## Structure and boundaries

| Location | Responsibility |
| --- | --- |
| `app/gateway.py` | Authentication, HTTP/MCP transport and tool input validation |
| `app/backend.py` | Backend adapter and graph assembled from backend evidence |
| `app/storage.py` | SQLite credential and handoff state |
| `frontend/src/features` | Product behavior composed from UI libraries |
| `frontend/src/components/ui` | Upstream shadcn primitives |
| `deploy` | Existing-installation upgrade helper; read before using |
| `docs/decisions` | Architecture decisions and proposals |

Keep external engine behavior behind the adapter. Preserve credential state, container access checks and handoff concurrency/idempotency. The owned PostgreSQL engine is a proposal; do not describe it as implemented.

## UI and source conventions

Use shadcn/Radix for controls and feedback, React Flow for graph rendering/interaction, D3 for layout and Phosphor icons. Compose these for features; do not add custom UI primitives. Retain light/dark tokens and upstream notices. Keep domain transformations in focused modules and avoid unrelated formatting or dependency changes.

Source text, summaries, inferred statements and task handoffs have different meanings. Missing metadata stays unknown. Latest-version flags do not establish truth. Keep graph edges supported by source membership or lineage until another relationship contract is implemented.

## Checks and reporting

`npm run build` in `frontend` performs a TypeScript check and production build. It does not run tests. Use the installed Prettier binary on changed files rather than formatting the whole repository incidentally.

There is no checked-in automated test suite or CI workflow. For agent work, add/run tests only when the user requests verification/evaluation, as required by AGENTS.md. Report the actual commands, observed results and unverified flows; do not imply a build establishes browser behavior, authorization or recovery correctness.

## Issues, changes and releases

Use `bug`, `enhancement`, `documentation` or `question` as the primary work type. Add `accessibility`, `good first issue` or `help wanted` when appropriate. Explain `duplicate`, `invalid` and `wontfix` resolutions. Topics describe the product; labels describe work.

Keep commits/PRs focused, describe the user-visible change and update affected contracts/docs. Use an ADR for consequential architecture decisions. Companion links belong near the top of the README. Preserve the existing lockfile, third-party notices and data exclusions.

Record release commits, actual deployment observations and rollback limitations in [release notes](docs/RELEASES.md). A repository push does not deploy the service. Deployments require the task's authorization and the data/credential preservation steps in the operations guide.

For vulnerabilities use [SECURITY.md](SECURITY.md), not a public issue with private context.
