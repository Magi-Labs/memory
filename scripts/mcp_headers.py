"""Invoked by the MCP client; stdout is a credential channel, not a log."""
import json
import os
import sys

token = os.environ.get("MEMORY_MCP_TOKEN", "")
if not token or token.strip() != token:
    sys.exit("MEMORY_MCP_TOKEN is missing or contains surrounding whitespace")
print(json.dumps({"Authorization": "Bearer " + token}))
