# Evaluation protocol

Status: proposed protocol, not executed. No test harness or performance results have been added. Run comparisons when explicitly requested, with agreed API-cost and privacy limits.

## Questions to answer

1. Does extraction improve useful recall over explicit records plus full-text/embedding search?
2. Does temporal/graph retrieval reduce stale or incorrect facts?
3. Can a second agent continue a task with less repetition and fewer mistakes?
4. Are those gains worth the VPS resources, model calls, and operating effort?
5. Can the owner inspect, export, correct, and remove their context reliably?

## Candidates and controls

Compare the same source stream against a no-extraction baseline and pinned local configurations of Supermemory, Mem0, Hindsight, and Graphiti. Use separate disposable namespaces, not the live personal memory space.

Keep the answer model/prompt, evidence-token budget, timestamps, ingestion completion policy, and question set constant. Run comparable extraction/embedding configurations when the engines support them; disclose differences rather than treating incompatible pipelines as identical. Repeat runs where stochastic extraction affects results. Record source and engine revisions, dependency versions, prompts, model identifiers, and all configurations.

No answers or evidence labels may enter an engine's ingestion stream. Freeze a development set and a held-out set before tuning. Human review should distinguish a supported answer from a plausible one, and an LLM judge should not be the only evidence.

## Workloads

| Workload | Example | What it detects |
| --- | --- | --- |
| Durable preferences | An explicit preference repeated across sessions | Relevant recall and duplicate handling |
| Corrections | A tool/provider choice changes on a dated turn | Stale-fact retrieval and update behavior |
| Temporal questions | Which decision was in effect last month? | Event-time versus ingestion-time errors |
| Exact identifiers | A project ID, file path, version, or issue number | Keyword retrieval and source precision |
| Agent handoff | Client A saves; client B resumes with a different local path | Useful continuation and missing state |
| Concurrent handoff | Two clients save based on the same version | Conflict visibility and no silent overwrite |
| Unsupported question | The stream contains no answer | Abstention and unsupported inference |
| Scope separation | Finance context must not appear in a coding-project query | Data visibility and relevance |
| Recovery | Restart, provider timeout, indexing backlog, restore | Durability and usable recovery |
| Removal | Delete a source and follow its derived records/caches | Deletion completeness |
| Adversarial stored text | A memory contains instructions to reveal secrets | Memory treated as evidence, not authority |

Start with synthetic or owner-reviewed sanitized scenarios. Real personal transcripts require explicit selection; do not commit them or upload them to new providers implicitly. LongMemEval and LoCoMo add external recall workloads with pinned data variants. They supplement practical handoffs rather than replacing them.

## Measurements

- Evidence precision/recall at fixed budgets, and end-to-end answer correctness with citations.
- Current-fact accuracy, historical-query accuracy, abstention correctness, and unsupported-inference rate.
- Handoff continuation: constraints preserved, right next step, repeated questions, and recoverable source references.
- Readiness: time between acknowledged source save and usable indexed evidence; count failures and retries.
- Retrieval and end-to-end p50/p95 latency under specified load.
- Ingestion/retrieval model calls, tokens, actual provider charges, and monthly cost estimates for a stated workload.
- Idle/peak RAM, CPU, disk growth, backup size, operator steps, and recovery time.
- Scope/removal failures separately from aggregate quality scores.

Do not compare recall@k against QA accuracy, claim a sampled subset is a full benchmark, or compare a generous evidence budget with a restrictive one. Publish raw sanitized outputs/configs alongside summary results when publication is authorized.

## Decision rule

Treat successful isolation, recoverable original evidence, and explainable corrections as requirements. Among candidates meeting them, choose the simplest configuration that improves the practical workload enough to justify its cost. Pre-agree acceptable latency and monthly spend after measuring the existing VPS baseline. No candidate has passed this protocol yet.
