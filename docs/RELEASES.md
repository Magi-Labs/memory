# Release notes

## Initial prototype — 3 October 2026

Source revision: `133479a`.

The existing personal installation's gateway was rebuilt from this repository and recreated. Docker build completed, the Uvicorn process reported application startup complete, and the container ran as the non-root `memory` user with no restart observed at deployment time. Only the gateway was recreated; the existing Supermemory engine remained running.

The upgrade added a separate persistent control-state mount, preserved the existing owner login hashes and imported client credential hashes, and saved a restricted gateway configuration backup. Personal records, credentials, provider keys, and server database files are not part of the repository.

Included: source-document/search views, document-linked graph, per-client credential administration, setup examples, and task handoffs via dashboard/MCP. Research, architecture, and a comparison protocol are included.

Verification boundary: build and startup signals only. No automated implementation tests, end-to-end client flows, comparative benchmark runs, or backup/restore drill were performed. Feature availability in code/deployment is not a claim that all clients/devices have been connected.

Next work is recorded in the roadmap and in the personal service's `magi-labs/memory` handoff.

### Handoff correction

Saving the first real project handoff exposed an INSERT with the wrong number of SQL placeholders. The save rolled back without creating a partial revision. The INSERT now names its seven columns explicitly with seven bindings. The upgrade helper also handles successive release directories without duplicating the state mount.
