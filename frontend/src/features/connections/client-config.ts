export type ClientKind = 'codex' | 'claude' | 'generic' | 'chatgpt'
export function clientSetup(type: ClientKind, url: string) {
  switch (type) {
    case 'codex':
      return {
        description:
          'Add this to ~/.codex/config.toml. The helper in this repository reads MEMORY_MCP_TOKEN from the local environment. Set the absolute helper path, provide the secret to the Codex process, and reconnect MCP.',
        config: `[mcp_servers.personal-memory]\nurl = "${url}"\nhttp_headers_helper = "python3 /absolute/path/to/memory/scripts/mcp_headers.py"\nstartup_timeout_sec = 30\ntool_timeout_sec = 150\nenabled = true`,
      }
    case 'claude':
      return {
        description:
          'Claude Code supports remote HTTP headers and environment references. Merge this server entry into your .mcp.json, set MEMORY_MCP_TOKEN locally, and approve/reconnect the server in Claude Code.',
        config: JSON.stringify(
          {
            mcpServers: {
              'personal-memory': {
                type: 'http',
                url,
                headers: { Authorization: 'Bearer ${MEMORY_MCP_TOKEN}' },
              },
            },
          },
          null,
          2,
        ),
      }
    case 'generic':
      return {
        description:
          'Hermes example: merge into the active profile’s MCP configuration and store MEMORY_MCP_TOKEN in its secret environment. Other clients need the same HTTP endpoint and bearer header, using their own config syntax.',
        config: `mcp_servers:\n  personal-memory:\n    url: "${url}"\n    headers:\n      Authorization: "Bearer \${MEMORY_MCP_TOKEN}"\n    timeout: 150`,
      }
    case 'chatgpt':
      return {
        description:
          'ChatGPT web uses its own remote app/connector setup; local Codex settings do not configure it. This prototype exposes bearer authentication, and does not yet implement OAuth for web connectors. A secure web connector is a planned integration; do not turn off authentication.',
        config: `Endpoint: ${url}\nStatus: OAuth / web connector integration pending\nThis does not synchronize ChatGPT’s built-in memory.`,
      }
  }
}
