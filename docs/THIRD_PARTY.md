# Third-party architecture notes

This project uses a separate memory engine over its API. It does not vendor engine source or redistribute the installed engine binary.

Sources studied:

- [Supermemory](https://github.com/supermemoryai/supermemory) — repository license observed as MIT; installed binary/version and applicable terms must be tracked separately.
- [Mem0](https://github.com/mem0ai/mem0) — Apache 2.0 in upstream README.
- [Graphiti](https://github.com/getzep/graphiti) — Apache 2.0 in repository metadata.
- [Hindsight](https://github.com/vectorize-io/hindsight) — MIT in upstream README.
- [Letta](https://github.com/letta-ai/letta) — architecture reference only; check current licenses and dependency terms before copying code or embedding components.

FastAPI, the MCP Python SDK, httpx, and uvicorn are installed as dependencies; their own licenses apply. Preserve upstream notices if source is incorporated later. Managed service capabilities and terms are distinct from an OSS repository license.
