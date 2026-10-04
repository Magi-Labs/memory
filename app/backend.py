"""The initial backend adapter. Other engines remain research candidates."""
import asyncio
from typing import Protocol
from urllib.parse import quote

import httpx


class MemoryBackend(Protocol):
    async def search(self, query: str, limit: int = 10) -> dict: ...
    async def list(self, page: int = 1, limit: int = 200) -> dict: ...
    async def get(self, document_id: str) -> dict: ...
    async def add(self, content: str, metadata: dict) -> dict: ...
    async def update(self, document_id: str, content: str) -> dict: ...
    async def delete(self, document_id: str) -> dict: ...
    async def all_documents(self, max_documents: int = 1000) -> dict: ...


class SupermemoryBackend:
    def __init__(self, base_url: str, api_key: str, tag: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.tag = tag

    async def request(self, method, path, body=None):
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.request(method, self.base_url + path, json=body,
                headers={"Authorization": "Bearer " + self.api_key})
            response.raise_for_status()
            if response.status_code == 204 or not response.content:
                return {"ok": True}
            return response.json()

    async def list(self, page=1, limit=200):
        return await self.request("POST", "/v3/documents/list", {
            "containerTags": [self.tag], "page": max(1, page),
            "limit": min(200, max(1, limit))})

    async def search(self, query, limit=10):
        return await self.request("POST", "/v4/search", {"q": query, "containerTag": self.tag,
            "searchMode": "hybrid", "limit": min(max(limit, 1), 100)})

    async def add(self, content, metadata):
        return await self.request("POST", "/v3/documents", {"content": content,
            "containerTag": self.tag, "metadata": metadata})

    async def update(self, document_id, content):
        await self.get(document_id)
        return await self.request("PATCH", "/v3/documents/" + quote(document_id, safe=""), {"content": content})

    async def delete(self, document_id):
        await self.get(document_id)
        return await self.request("DELETE", "/v3/documents/" + quote(document_id, safe=""))

    async def get(self, document_id):
        document = await self.request("GET", "/v3/documents/" + quote(document_id, safe=""))
        # Never expose a document belonging to a different personal container.
        if self.tag not in document.get("containerTags", []):
            raise ValueError("Document is outside this personal memory space")
        return document

    async def all_documents(self, max_documents=1000):
        rows, page, total = [], 1, 0
        while len(rows) < max_documents:
            result = await self.list(page, min(200, max_documents - len(rows)))
            # Supermemory lists source documents under `memories`.
            batch = result.get("documents") or result.get("memories") or []
            total = result.get("pagination", {}).get("totalItems", len(rows) + len(batch))
            rows.extend(batch)
            if not batch or len(rows) >= total:
                break
            page += 1
        semaphore = asyncio.Semaphore(4)
        async def detail(row):
            async with semaphore:
                try:
                    return await self.get(row["id"])
                except (httpx.HTTPError, ValueError):
                    return {**row, "detailUnavailable": True}
        documents = await asyncio.gather(*(detail(row) for row in rows))
        return {"documents": documents, "total": total, "truncated": len(rows) < total}


def document_graph(collection):
    """Visualize only relationships returned by document detail, never guessed edges."""
    nodes, edges, edge_ids = {}, [], set()
    def edge(source, target, kind):
        key = (source, target, kind)
        if source != target and key not in edge_ids:
            edge_ids.add(key)
            edges.append({"source": source, "target": target, "type": kind})
    for document in collection["documents"]:
        document_id = "document:" + document["id"]
        nodes[document_id] = {"id": document_id, "kind": "document",
            "label": document.get("title") or "Untitled document", "data": document}
        for memory in document.get("memories", []):
            if not memory.get("id"):
                continue
            memory_id = "memory:" + memory["id"]
            nodes[memory_id] = {"id": memory_id, "kind": "memory",
                "label": memory.get("memory") or "Extracted memory", "data": memory}
            edge(document_id, memory_id, "contains")
            if memory.get("parentMemoryId"):
                parent_id = "memory:" + memory["parentMemoryId"]
                nodes.setdefault(parent_id, {"id": parent_id, "kind": "reference",
                    "label": "Previous memory (content unavailable)",
                    "data": {"id": memory["parentMemoryId"]}})
                edge(memory_id, parent_id, "previous_version")
    return {"nodes": list(nodes.values()), "edges": edges,
        "totalDocuments": collection["total"], "truncated": collection["truncated"],
        "unavailableDocuments": sum(bool(d.get("detailUnavailable")) for d in collection["documents"]),
        "coverage": "Document-linked memories and parentMemoryId lineage. Internal semantic graph completeness is not established."}
