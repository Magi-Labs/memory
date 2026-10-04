# Current API and MCP contract

Reviewed against `app/gateway.py`, `app/backend.py` and `app/storage.py` on 5 October 2026. Source definitions are authoritative. This documents the implemented Supermemory adapter, not the proposed owned engine.

## Identity and transport

Streamable HTTP MCP is mounted at `/mcp/`. Use a bearer credential per client/device with `read` or `read,write` scopes. The owner dashboard uses HTTP Basic authentication; tokens cannot administer credentials or open the dashboard. Serve through HTTPS outside loopback.

Document reads, updates and deletes check personal-container membership. That is an access check, not verification of factual truth. All current tokens address the configured personal container; per-space grants are planned.

## MCP tools

| Tool | Inputs | Access and result |
| --- | --- | --- |
| `search_memories` | `query: str`, `limit: int = 10` | Read; engine hybrid-search result, limit clamped to 1–100 |
| `list_memories` | `page: int = 1`, `limit: int = 50` | Read; engine source list/status/pagination, page at least 1, limit 1–200 |
| `get_memory` | `memory_id: str` | Read; source and extracted memories after container check |
| `add_memory` | `content: str` | Write; engine ingestion response; nonblank content, at most 100,000 characters; metadata records MCP and client ID |
| `update_memory` | `memory_id: str`, `content: str` | Write; engine response after container check; same content bounds |
| `delete_memory` | `memory_id: str` | Write; engine response after container check; requires explicit user intent |
| `list_handoffs` | None | Read; `{handoffs: [...]}` with the latest revision per project |
| `get_handoff` | `project: str`, `version: int or null = null` | Read; requested/latest revision, or `{project, version: 0, context: null}` if absent |
| `save_handoff` | `project`, `goal`, `summary`, `expected_version`, `request_id`; optional `decisions`, `next_steps`, `references` lists | Write; transactionally stored revision |

The first six tools return engine-dependent envelopes. Consumers must not assume an owned-engine schema. Lists may expose documents under `memories` or `documents`; the graph adapter handles both. A successful source write does not prove extraction has finished.

### Handoff constraints

- `project`: 1–100 characters; letters, digits, `.`, `_`, `/` and `-`.
- `goal`: 1–8,000 characters; `summary`: at most 20,000 characters.
- `expected_version`: integer at least zero; zero for the first revision.
- `request_id`: 8–100 characters; letters, digits, `.`, `_` and `-`.
- Each optional list: at most 30 strings, each at most 2,000 characters; omission means an empty list.

Results contain `project`, `version`, `context`, `author` and `created_at`. Context contains goal, summary and the three lists. Author comes from the authenticated caller; this is not evidence of user confirmation.

## Retry, concurrency and cancellation

Handoff writes use a SQLite immediate transaction, compare-and-swap version and per-project request ID. Repeating the ID with identical context returns the original revision. Reusing it for changed context fails. A stale expected version fails: read and reconcile before saving a new request ID.

Source mutations forward to Supermemory without gateway idempotency keys, revision checks or a transactional ingestion outbox. After a timeout/disconnection, inspect state before retrying: the engine may have accepted the write. Client cancellation does not establish rollback. The proposed source journal/outbox addresses these gaps later.

## Source and fact semantics

Documents may include `id`, `title`, `content`, `raw`, `summary`, `status`, timestamps, metadata and extracted `memories`. A summary fallback must be labeled when source text is unavailable.

Facts may include `id`, `memory`, `version`, `isLatest`, `isInference`, `isForgotten`, `createdAt` and `parentMemoryId`:

- `isLatest: true` means latest version, not independently verified truth.
- `isLatest: false` means historical; missing status/version is unknown, never a fabricated version 1.
- `isInference: true` marks inference; missing/false does not prove user confirmation.
- The latest-version graph filter includes explicitly latest facts not marked forgotten; source documents remain visible.

Graph fields are `nodes`, `edges`, `totalDocuments`, `truncated`, `unavailableDocuments` and `coverage`. Node kinds: `document`, `memory`, unavailable `reference`. Edge types: `contains`, `previous_version`, supported by membership/lineage. Collection caps at 1,000 source documents and four concurrent detail reads. This is not a complete semantic graph export.

## Dashboard HTTP routes

| Route | Purpose |
| --- | --- |
| `GET /api/config` | Owner-only endpoint/configuration |
| `GET /api/memories?page=1` | Source list, 200 per page |
| `GET /api/memories/{memory_id}` | Source detail |
| `GET /api/graph` | Bounded evidence graph |
| `POST /api/search` | `{query}`; 1–4,000 characters |
| `GET /api/handoffs` | Latest handoffs |
| `GET /api/handoffs/{project}?version=N` | Specific/latest handoff |
| `POST /api/handoffs` | Handoff input above |
| `GET /api/credentials` | Owner-only metadata; no token/digest |
| `POST /api/credentials` | Owner-only `{name, access}`; access `read_only`/`read_write`; returns `{id, token}` once |
| `DELETE /api/credentials/{credential_id}` | Owner-only revocation |

Owner HTTP mutations require the exact configured `Origin` and `X-Memory-Request: dashboard`; MCP has its own transport boundary. Source mutations currently use MCP, not dashboard HTTP mutation routes.

HTTP middleware uses 401 for invalid identity and 403 for dashboard/origin/read-only restrictions. Route errors include 400 for application input/access validation, 409 for handoff conflicts, 422 for schema validation, 502 for upstream HTTP errors and 503 for an unreachable engine. FastMCP encodes tool exceptions separately; do not assume HTTP route statuses apply inside MCP. Errors must not expose upstream response bodies or secrets.

## Compatibility

Preserve existing tool names and inputs; make additions discoverable when clients reconnect. Native fact/entity/relationship writes, context assembly, web OAuth and PostgreSQL are proposed, not available tools. See [client integrations](INTEGRATIONS.md) and the [companion plugin](https://github.com/Magi-Labs/memory-plugin) for setup.
