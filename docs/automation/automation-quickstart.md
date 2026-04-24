# Automation Quickstart (5-minute version)

1. Add Cloud secret `GRANOLA_API_TOKEN`.
2. Add Notion MCP (HTTP URL: `https://mcp.notion.com/mcp`) and connect OAuth.
3. Add Granola MCP (STDIO):
   - command: `python3`
   - args: `-m granola_mcp_server`
   - env: `GRANOLA_DOCUMENT_SOURCE=remote`, `GRANOLA_API_TOKEN=${GRANOLA_API_TOKEN}`
4. Ensure environment installs dependency:
   - `python3 -m pip install --upgrade granola-mcp-server`
5. Create scheduled automation and paste prompt from:
   - `docs/automation/granola-to-notion-prompt.md`
6. Run once manually and verify create/update counts.
