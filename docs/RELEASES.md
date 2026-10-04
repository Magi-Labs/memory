# Release notes

## Standards alignment — 5 October 2026 (not deployed)

Reviewed against shared standards revision `783936b1e566dc0ccefe41c511e4790ffd1efd77`; see [scope and evidence](STANDARDS.md). Added public contribution/security guidance, a PR template and the current API/tool contract. Updated architecture/ADR status, the agent instruction revision and Git/Docker secret exclusions. GitHub description/topics now describe the implemented prototype, all 10 shared labels match, and private vulnerability reporting is enabled.

The UI no longer invents Current/v1 metadata when the backend omits it. It distinguishes latest, historical, forgotten and unknown version state, labels summary fallbacks when source text is unavailable, and displays backend graph coverage. Latest-version filtering requires an explicit latest flag. The MCP read-tool description now distinguishes container access from truth verification.

Local TypeScript/Vite build passed. No automated tests, new browser/mobile observations, Docker build, runtime mutation or production deployment were performed for this change. No data/schema migration is required. Deployment remains a separate step; the last recorded gateway deployment is `c7ca73b` on 4 October. Reverting these source changes does not alter stored memories or credential state.

## Library UI and owned-engine design — 4 October 2026

Source revisions: `b680c69`, `c7ca73b`. Recorded deployed release on this date: `20261004-c7ca73b`.

All feature controls now compose upstream shadcn components, including dialogs, credential revocation confirmation, forms, cards/items, badges, alerts, accordions, tables and pagination. The custom SVG/pointer graph was replaced by React Flow's default nodes, edges, controls and minimap. D3 force supplies layout; the initial Dagre layout rendered this dataset in an excessively narrow column and was replaced. Graph code is loaded on demand. Seven bespoke component CSS files and the handwritten graph layout were removed. Theme tokens and Tailwind composition remain. The policy is recorded in AGENTS.md and frontend/README.md.

Local TypeScript/Vite and production Docker builds completed. Only the gateway was recreated, with backup `backups/memory-project-20261004-c7ca73b`. No automated tests or complete interaction/mobile verification were run. The memory engine, control data, credentials and provider settings remain unchanged.

[ADR 0002](decisions/0002-owned-memory-engine.md) designs an owned PostgreSQL memory engine with canonical sources, jobs, optional pgvector/LLM stages, evidence-backed facts, context assembly, and migration/rollback gates. It is a design deliverable; no PostgreSQL backend or engine migration is claimed as implemented.

## Dashboard shell and graph recovery — 4 October 2026

Deployed source revision: `a0634a6`, release `20261004-a0634a6-r2`. The shell now adapts the official shadcn dashboard-01 composition with SidebarProvider/SidebarInset, collapsible navigation, a mobile Sheet, and the existing logo and theme. The old sidebar styling was removed. Upstream notices remain in the image.

Graph panning now snapshots the drag origin before queuing a React state update; pointer release could previously clear the mutable ref before that update read it. Lost pointer capture also clears dragging. Per-view and root error boundaries provide recovery UI, and unreadable API JSON becomes an explicit request error. The reported original blank-screen exception was not captured or reproduced, so the drag race is a code-level finding rather than a confirmed diagnosis of that screenshot.

Local TypeScript/Vite and production Docker builds completed. An interrupted initial source upload was stopped before activating a release; the compressed runtime-only retry succeeded. The upgrade backed up configuration under `backups/memory-project-20261004-a0634a6-r2` and recreated only the gateway. LiveMCP in Personal Arc displayed the new shell and graph with 525 nodes and 521 connections. No automated tests or complete interaction/mobile verification were performed.

## Empty graph correction — 4 October 2026

Deployed source revision: `a0154cc` (release `20261004-a0154cc`).

The deployed graph collector expected source documents under `documents`, but the engine returned `memories`. Live diagnosis showed 45 listed documents and zero collected graph nodes. The adapter now accepts either response field. The canvas also shows explicit loading, error/retry, empty-library, and no-matching-filter states.

TypeScript/Vite and the Docker image built successfully. Only the gateway was recreated, with a configuration backup at `backups/memory-project-20261004-a0154cc`. After reloading the graph in Personal Arc through LiveMCP, the dashboard reported 525 nodes and 521 connections. These are source membership and version-lineage relationships; this fix does not introduce inferred semantic edges. No automated tests were added or run.

## Dashboard redesign — 4 October 2026

Source revision: `23410d9`.

The selected loop-logo direction and document-list/reading-pane layout are implemented in a React/TypeScript frontend with editable shadcn/ui controls. Shared theme tokens cover light and dark mode; the initial mode follows the device, and explicit choices persist across reloads and synchronize across tabs. The code is separated into layout, shared primitives, feature components, typed API contracts, and focused style files. Inter and the logo are served locally.

The new multi-stage Docker image compiles the frontend using Node 24, then serves its static output through the existing Python gateway. TypeScript and Vite completed locally and on Hostinger. The gateway image built successfully and was recreated from release `20261004-23410d9`. Uvicorn reported application startup complete. The engine remained running with its existing container and two-day uptime at rollout.

The upgrade helper retained the engine configuration, memory data, owner login hashes, credential hashes, and persistent control-state mount. It saved the restricted configuration backup at `backups/memory-project-20261004-23410d9`. This release changes dashboard serving paths without relaxing the existing Content Security Policy or API authorization/origin checks.

LiveMCP in Arc rendered the deployed Connections page (`#connections`), including the self-hosted assets, dark theme, and endpoint returned by the owner API. No credentials were created or revoked, and no memories or handoffs were submitted during the UI review.

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
