# Roadmap

## Initial implementation

- [x] Personal, single-owner service around the existing memory backend.
- [x] Document/search/source inspection.
- [x] Graph visualization using exposed source and version relationships.
- [x] Persistent per-client credentials with scopes and revocation.
- [x] Explicit, versioned handoffs over dashboard and MCP.
- [x] Adapter boundary and source-backed research/architecture notes.
- [x] Container packaging and client setup examples.

“Implemented” means code exists. It does not imply benchmark results or verified connectivity from every client.

## Next: portability and trustworthy context

- [ ] Canonical source journal with event IDs, timestamps, provenance, authority, and content hashes.
- [ ] Durable indexing outbox, retries, ingestion status, and explicit save acknowledgements.
- [ ] Owner-approved fact corrections and historical-state retrieval.
- [ ] Full-text baseline and optional embeddings behind the backend contract.
- [ ] Budgeted context assembly with source citations and stale/inferred labels.
- [ ] Portable source/handoff export and complete deletion/retention controls.

## Next: more clients and devices

- [ ] Opt-in Codex, Claude Code, and Hermes start/end hooks with visible capture status.
- [ ] Standards-based OAuth for ChatGPT/Claude web connector compatibility.
- [ ] Device onboarding and credential rotation/expiry.
- [ ] Personal/project visibility grants per client.
- [ ] Offline local queue, server acknowledgement, tombstones, and conflict reconciliation.

## Evaluation and operations

- [ ] Run the agreed evaluation protocol in isolated namespaces with a fixed cost/privacy budget.
- [ ] Compare engine configurations against the deterministic baseline; publish only measured results.
- [ ] Measure VPS idle/peak resource use and ingestion costs.
- [ ] Exercise backup/restore, index failures, concurrent writes, and removal when verification is requested.
- [ ] Add login rate limiting, request-size ceilings, audit events without raw content, and recovery tooling.

## Later, only if evidence supports it

Reflection, graph traversal, background consolidation, browser capture extensions, and native mobile clients. Each should solve a measured gap in context continuity rather than increase captured data or dependencies by default.
