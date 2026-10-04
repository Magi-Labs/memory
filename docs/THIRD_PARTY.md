# Third-party architecture notes

This project uses a separate memory engine over its API. It does not vendor engine source or redistribute the installed engine binary.

Sources studied:

- [Supermemory](https://github.com/supermemoryai/supermemory) — repository license observed as MIT; installed binary/version and applicable terms must be tracked separately.
- [Mem0](https://github.com/mem0ai/mem0) — Apache 2.0 in upstream README.
- [Graphiti](https://github.com/getzep/graphiti) — Apache 2.0 in repository metadata.
- [Hindsight](https://github.com/vectorize-io/hindsight) — MIT in upstream README.
- [Letta](https://github.com/letta-ai/letta) — architecture reference only; check current licenses and dependency terms before copying code or embedding components.

FastAPI, the MCP Python SDK, httpx, and uvicorn are installed as dependencies; their own licenses apply. Preserve upstream notices if source is incorporated later. Managed service capabilities and terms are distinct from an OSS repository license.

## Frontend

The dashboard uses React, TanStack Query, Tailwind CSS, Radix UI, and other packages pinned in `frontend/package-lock.json`. shadcn/ui button, input, and textarea source was generated with its CLI and adapted locally. The shell adapts the official [dashboard-01 block](https://ui.shadcn.com/blocks?category=dashboard), with sidebar, sheet, separator, tooltip, skeleton, and use-mobile source from the official new-york-v4 registry (4 October 2026). Imports and icons are adapted to the existing local utilities and Phosphor set. Its MIT notice and the Phosphor Icons MIT notice are retained in `frontend/licenses`. The self-hosted Inter font's SIL Open Font License is retained there as well. Runtime images include these notices in `/app/ui/licenses`.

The loop logo was generated from the user's selected design direction; it is stored as a PNG. Standard outline icons come from the Phosphor React package. No memory engine source, private source documents, or API credentials are part of the frontend.
