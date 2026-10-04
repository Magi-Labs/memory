# 0001: Personal control plane with replaceable memory backend

Date: 3 October 2026.
Status: Accepted for the initial prototype; owned-engine replacement proposed in [ADR 0002](0002-owned-memory-engine.md).
Implementation: Gateway, SQLite control store and Supermemory adapter implemented; initial source `133479a`, handoff correction `6504010`.
Deployment: Initial rollout recorded 3 October; latest recorded gateway deployment is `c7ca73b` on 4 October. See [release evidence](../RELEASES.md).

## Context

The user needs shared context across agents and devices, with control over their data. The existing personal Supermemory installation already has sources and retrieval. The missing product pieces are inspection, client identity, and explicit task continuity.

## Decision

Retaining the engine behind an adapter preserves current data/retrieval while the control plane is developed. Immediate replacement would require export, extraction/search implementation and recovery validation before cutover. Vendor-specific client integrations would couple every agent to the engine. The adapter/control-plane choice preserves existing state and client contracts; it is not based on comparative benchmark results.

Build a small single-owner service around the existing backend. Preserve source memories. Store credentials and versioned handoffs in a separate persistent SQLite database. Use Streamable HTTP MCP as the first common client interface and keep engine calls behind an adapter. Reuse the backend while researching alternatives.

Task handoffs are structured saves and do not require another LLM. Automated extraction/reflection remains optional and must justify its cost. Plan an independent source journal before promising lossless backend portability.

## Consequences

The first version is useful for explicit agent switches and inspection, but it is not automatic universal memory sync. It still depends on Supermemory for durable-memory sources and indexing. Graph coverage is limited to observed API relationships. Web OAuth, offline queues, finer scopes, retention, and complete backup/removal behavior need further work.

No benchmark winner is selected by this decision. Revisit it using the evaluation protocol and measured personal workloads.

## Upgrade and recovery

Preserve engine state, owner login configuration and the control-state volume. Follow [gateway-only upgrade and rollback](../OPERATIONS.md); restoring the pre-registry gateway can bypass newer credential revocations. Future replacement must satisfy ADR 0002's export, reconciliation and rollback gates before changing production ownership.
