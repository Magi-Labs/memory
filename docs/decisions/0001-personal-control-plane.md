# 0001: Personal control plane with replaceable memory backend

Date: 3 October 2026. Status: provisional, accepted for the initial prototype.

## Context

The user needs shared context across agents and devices, with control over their data. The existing personal Supermemory installation already has sources and retrieval. The missing product pieces are inspection, client identity, and explicit task continuity.

## Decision

Build a small single-owner service around the existing backend. Preserve source memories. Store credentials and versioned handoffs in a separate persistent SQLite database. Use Streamable HTTP MCP as the first common client interface and keep engine calls behind an adapter. Reuse the backend while researching alternatives.

Task handoffs are structured saves and do not require another LLM. Automated extraction/reflection remains optional and must justify its cost. Plan an independent source journal before promising lossless backend portability.

## Consequences

The first version is useful for explicit agent switches and inspection, but it is not automatic universal memory sync. It still depends on Supermemory for durable-memory sources and indexing. Graph coverage is limited to observed API relationships. Web OAuth, offline queues, finer scopes, retention, and complete backup/removal behavior need further work.

No benchmark winner is selected by this decision. Revisit it using the evaluation protocol and measured personal workloads.
