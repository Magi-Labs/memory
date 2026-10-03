# Architecture research and evidence

Reviewed 3 October 2026. This document separates upstream descriptions, observations from the existing personal deployment, and proposed design judgments. It does not claim that all candidates have been installed or benchmarked.

## Candidate comparison

| Candidate | Pattern worth examining | Practical question for personal use | Current project decision |
| --- | --- | --- | --- |
| SQLite + full-text search | Explicit records, predictable storage, minimal dependencies | How much retrieval quality does a no-extraction baseline achieve? | Planned baseline; SQLite currently stores handoffs/credentials only |
| Supermemory local | Source documents, derived facts, hybrid retrieval, version lineage | Extraction quality/cost with the chosen model; completeness of export; VPS resources | First implemented backend; keep existing data |
| Mem0 OSS | Memory extraction and configurable retrieval stack | Which features/results actually exist in the pinned OSS revision? | Comparison candidate, not a migration decision |
| Graphiti | Temporal entities, relationships, source episodes | Does graph retrieval help actual personal tasks enough to justify ingestion and database operations? | Candidate for relational/temporal workloads |
| Hindsight | Retain/recall/reflect and derived knowledge | Does reflection improve handoffs or just cost more? What original evidence survives? | Candidate; source retention must be independently checked |
| Letta | Stateful agents, editable/versioned memory, background consolidation | What can be reused across outside clients without adopting its whole agent runtime? | Study its patterns; not an interchangeable search engine |

These judgments are provisional. A small owner-controlled handoff record is a low-complexity starting point; choosing a semantic engine needs measured evidence.

## Primary-source notes

### Supermemory

[Local vs Enterprise](https://supermemory.ai/docs/self-hosting/local-vs-enterprise) describes local as an embedded graph engine with one generated API key and environment-based configuration. Its full platform adds controls, dashboards, and connectors. That explains why a personal control plane is useful around the local binary; it does not prove local and managed memory quality are identical.

[Architecture reference](https://github.com/supermemoryai/supermemory/blob/main/skills/supermemory/references/architecture.md) describes derived memories and update/extend/derive relationships. Our inspected API returned document-linked facts, `isLatest`, `isInference`, and `parentMemoryId`. The UI uses only those observed fields.

[Issue #1653](https://github.com/supermemoryai/supermemory/issues/1653) reports limitations in exporting extracted memories on v0.0.8. It is a user report, not a specification. Our actual document-detail response included an extracted-memory array, so the report cannot be applied as a blanket claim that this deployment exposes none. We have not established a lossless enumeration of the entire internal semantic graph.

### Mem0

[Upstream README](https://github.com/mem0ai/mem0) describes a model-based memory pipeline, configurable providers, and self-hosted server controls. It explicitly says its headline benchmark scores reflect managed-platform optimizations unavailable in the OSS SDK. Therefore those scores cannot be copied into an OSS selection table as measured results for our server.

### Graphiti

[Upstream repository](https://github.com/getzep/graphiti) documents evolving temporal facts, source episodes, hybrid retrieval, and graph backends. It also highlights structured-output requirements and concurrency/rate-limit considerations. Those are useful properties for changing relationships; the surrounding auth, owner UI, source retention, and task lifecycle still need implementation.

[Graphiti MCP documentation](https://help.getzep.com/graphiti/getting-started/mcp-server) describes its server as experimental and documents database/provider prerequisites. A personal deployment should measure those costs rather than assume a graph improves every query.

### Hindsight

[Upstream repository](https://github.com/vectorize-io/hindsight) presents retain/recall/reflect, memory banks, and MCP integration. Its benchmark claims are vendor-provided evidence to investigate, not results from this project.

[Retain documentation](https://hindsight.vectorize.io/developer/api/retain) says normal retention decomposes input into model-extracted facts rather than storing raw text verbatim. It also documents document IDs and replace/append behaviors. This supports retaining original evidence in our own journal if this backend is evaluated; derived facts alone do not preserve everything needed for an engine migration.

### Letta

[Memory documentation](https://docs.letta.com/configuration/memory) describes git-backed MemFS, explicit remembering, and background consolidation. [Stateful agents](https://docs.letta.com/concepts/stateful-agents) treats memory as part of an agent's persistent state. These patterns inform editable memory and source history, while their portability across different client runtimes still requires adapters.

## Research that guides evaluation

[LongMemEval](https://github.com/xiaowu0162/LongMemEval) evaluates extraction, multiple-session reasoning, knowledge updates, temporal reasoning, and abstention. Record the dataset revision and cleaned variant; scores from different variants or retrieval budgets are not directly comparable.

[LoCoMo](https://github.com/snap-research/locomo) offers long conversations with evidence annotations and multiple question types. It is a useful secondary recall workload, but conversation QA does not establish successful coding-task handoffs, offline recovery, or credential revocation.

[LongMemEval-V2](https://arxiv.org/abs/2605.12493) extends evaluation toward agentic experience. It is relevant future work; it has not been run here.

The [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) provides the basis for secure HTTP client authorization. Static bearer credentials in this prototype are useful for configurable clients; proper web-connector OAuth is a separate implementation.

## Observed deployment, not a benchmark

The pre-upgrade personal installation ran Supermemory local v0.0.8 and a custom Python gateway. A read-only document-list call returned 19 source documents; the newest document was processed and its detail included derived facts and parent IDs. Earlier migration records reported preservation of 18 original Mem0 sources. These observations establish available API fields and current records, not retrieval accuracy, future reliability, or end-to-end integration with every agent.

No model provider key, bearer token, personal source content, or plaintext login password is included in this repository. Deployment-specific secrets and data remain outside Git.

## Revision ledger

Main-branch identifiers observed through GitHub while researching (these are references, not selected runtime pins):

| Repository | Revision |
| --- | --- |
| getzep/graphiti | `3c427640abf909f12f71f963fce15eb514a3c493` |
| mem0ai/mem0 | `abb81c88e1f738a8117d8293530fbc31a5ef8fd9` |
| supermemoryai/supermemory | `62cc57eda67213dba351144246f1bbbdd330a347` |
| vectorize-io/hindsight | `f7dd3f4fd7420f7beec60c32c965e5e5cf7be066` |
| letta-ai/letta | `5bcdd177d70fa2b31a754cfcd801e77b2e1ab16a` |

The installed binary revision and model/configuration must be captured separately for any comparison. Research against `main` is not evidence that the same implementation exists in an older release binary.
