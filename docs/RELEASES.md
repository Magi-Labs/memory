# Release notes

## Empty graph correction — 4 October 2026

Deployed source revision: `a0154cc` (release `20261004-a0154cc`).

The deployed graph collector expected source documents under `documents`, but the engine returned `memories`. Live diagnosis showed 45 listed documents and zero collected graph nodes. The adapter now accepts either response field. The canvas also shows explicit loading, error/retry, empty-library, and no-matching-filter states.

TypeScript/Vite and the Docker image built successfully. Only the gateway was recreated, with a configuration backup at `backups/memory-project-20261004-a0154cc`. After reloading the graph in Personal Arc through LiveMCP, the dashboard reported 525 nodes and 521 connections. These are source membership and version-lineage relationships; this fix does not introduce inferred semantic edges. No automated tests were added or run.

## Dashboard redesign — 4 October 2026

Source revision: `23410d9`.

The selected loop-logo direction and document-list/reading-pane layout are implemented in a React/TypeScript frontend with editable shadcn/ui controls. Shared theme tokens cover light and dark mode; the initial mode follows the device, and explicit choices persist across reloads and synchronize across tabs. The code is separated into layout, shared primitives, feature components, typed API contracts, and focused style files. Inter and the logo are served locally.

The new multi-stage Docker image compiles the frontend using Node 24, then serves its static output through the existing Python gateway. TypeScript and Vite completed locally and on Hostinger. The gateway image built successfully and was recreated from release `20261004-23410d9`. Uvicorn reported application startup complete. The engine remained running with its existing container and two-day uptime at rollout.

The upgrade helper retained the engine configuration, memory data, owner login hashes, credential hashes, and persistent control-state mount. It saved the restricted configuration backup at `backups/memory-project-20261004-23410d9`. This release changes dashboard serving paths without relaxing the existing Content Security Policy or API authorization/origin checks.

LiveMCP in Personal Arc rendered the deployed Connections page at `https://memory.deepaksilaych.me/#connections`, including the self-hosted assets, dark theme, and endpoint returned by the owner API. No credentials were created or revoked, and no memories or handoffs were submitted during the UI review.

The selected visual reference and illustrative local browser comparisons are recorded in [design QA](../design-qa.md). No automated tests, end-to-end MCP/client flows, or credential/handoff mutation flows were run. Build, startup, and browser rendering observations do not establish complete functional verification.

## Initial prototype — 3 October 2026

Source revision: `133479a`.

The existing personal installation's gateway was rebuilt from this repository and recreated. Docker build completed, the Uvicorn process reported application startup complete, and the container ran as the non-root `memory` user with no restart observed at deployment time. Only the gateway was recreated; the existing Supermemory engine remained running.

The upgrade added a separate persistent control-state mount, preserved the existing owner login hashes and imported client credential hashes, and saved a restricted gateway configuration backup. Personal records, credentials, provider keys, and server database files are not part of the repository.

Included: source-document/search views, document-linked graph, per-client credential administration, setup examples, and task handoffs via dashboard/MCP. Research, architecture, and a comparison protocol are included.

Verification boundary: build and startup signals only. No automated implementation tests, end-to-end client flows, comparative benchmark runs, or backup/restore drill were performed. Feature availability in code/deployment is not a claim that all clients/devices have been connected.

Next work is recorded in the roadmap and in the personal service's `magi-labs/memory` handoff.

### Handoff correction

Saving the first real project handoff exposed an INSERT with the wrong number of SQL placeholders. The save rolled back without creating a partial revision. The INSERT now names its seven columns explicitly with seven bindings. The upgrade helper also handles successive release directories without duplicating the state mount.

Corrected gateway revision: `6504010`. Its build and application startup completed. The actual project handoff was then saved as version 1 under `magi-labs/memory`. This was a real state save through the server-side store, not end-to-end MCP/browser flow verification.
