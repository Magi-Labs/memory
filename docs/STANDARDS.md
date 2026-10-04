# Standards alignment

Review date: 5 October 2026.
Shared guideline revision: `783936b1e566dc0ccefe41c511e4790ffd1efd77`.
Scope: Memory repository source, documentation and GitHub metadata. This records alignment with maintainer guidelines; it is not a security certification or complete runtime verification.

The shared source is the private Magi Labs standards repository referenced in AGENTS.md. The requirements relevant to public contributors are retained in [CONTRIBUTING.md](../CONTRIBUTING.md), [AGENTS.md](../AGENTS.md) and the documents below. Private access is not required for builds or contributions.

## Review record

| Area | Evidence / alignment |
| --- | --- |
| Repository identity | Public under Magi-Labs, main branch, accurate prototype description and technology topics; no public product homepage is claimed |
| Shared labels | All 10 names, colors and descriptions match the reviewed catalog; no label changes or issue relabeling needed |
| Contribution workflow | Public setup, commands, boundaries and change/release conventions in CONTRIBUTING.md; PR template in `.github/` |
| Agent instructions | Reviewed standards SHA, local commands, verification policy and project constraints in AGENTS.md |
| Architecture | Ownership, flows and limits in ARCHITECTURE.md; ADRs now explicitly distinguish implementation, deployment and proposal |
| Contracts | API.md records current tools, inputs, permissions, engine response boundaries, retries, cancellation and compatibility |
| UI | Feature source composes shadcn/Radix, React Flow, D3 and Phosphor; existing theme tokens and notices retained |
| Evidence semantics | Missing fact status/version stays unknown; summaries are labeled; graph coverage is displayed and latest filtering requires explicit metadata |
| Secrets and distribution | Git excludes environment variants; Docker context additionally excludes nested environments, keys, databases and state/export directories |
| Security reporting | SECURITY.md and GitHub private vulnerability reporting; reporting was observed enabled during this review |
| Release documentation | Changes and deployment boundaries in RELEASES.md; companion link retained near README top |
| Third-party provenance | THIRD_PARTY.md and frontend license notices retained; no dependency additions in this change |

## Current limitations and reconsideration triggers

These are recorded prototype limitations, not newly implemented guarantees:

- **Source ownership and ingestion:** Supermemory remains authoritative for durable sources and asynchronous extraction. Gateway idempotency/outbox and version checks are implemented for handoffs only. Revisit before owned-engine cutover using ADR 0002's migration gates.
- **Graph coverage:** Source membership and version lineage only, capped at 1,000 documents. Revisit before claiming a complete semantic export or shipping typed entity relationships.
- **Recovery and access:** Restore drills, comprehensive deletion/retention, credential expiry, per-space permissions and login rate limiting remain pending. Resolve the relevant gaps before claiming a fully governed archive or broadening the deployment trust model.
- **Web/client integration:** Bearer MCP is implemented; web OAuth, universal automatic capture and offline sync are not. Revisit per client when its integration is actually implemented and exercised.
- **Validation:** No automated suite was added/run, and no browser/mobile/accessibility, mutation, restore or deployment check was performed for this change. Existing accessibility behavior is supplied by libraries but has not received a complete audit.

These limits do not authorize bypassing existing migration or data-preservation requirements. Current source ownership, API behavior and last observed deployment remain explicit in the architecture and release notes.

## Checks performed

- Read current source, contribution/architecture/operations docs and pinned shared guidelines.
- Compared live GitHub labels against the shared JSON catalog: 10 exact matches.
- Inspected feature/layout/shared composition source for raw controls/custom SVG or native confirmation usage; no such primitives found outside the library component directory.
- Formatted the three changed frontend files with the installed Prettier binary.
- Ran `npm run build` in `frontend`: TypeScript and Vite production build passed.
- Confirmed GitHub visibility, updated description/topics and enabled private vulnerability reporting.

Changes are repository changes pending deployment. No production memory, credential or engine state was changed. Future guideline revisions require a fresh scoped review and an updated reviewed SHA; this document is not an evergreen compliance badge.
