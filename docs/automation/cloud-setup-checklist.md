# Granola -> Notion Cloud Agent Setup Checklist

This checklist is optimized for Cursor Cloud Agents.

## 1) Cloud secrets
In `cursor.com/dashboard/cloud-agents` add:
- `GRANOLA_API_TOKEN` (from https://granola.ai/settings)
- `NOTION_TOKEN` (only if using token mode; OAuth can be used instead)

## 2) MCP integrations in Cloud Agent UI
Open your agent/automation MCP settings and add:

### Notion (recommended remote)
- Type: HTTP
- URL: `https://mcp.notion.com/mcp`
- Auth: OAuth connect if available (preferred)

### Granola (community server, stdio)
- Type: STDIO
- Command: `python3`
- Args: `-m granola_mcp_server`
- Env:
  - `GRANOLA_DOCUMENT_SOURCE=remote`
  - `GRANOLA_API_TOKEN=${GRANOLA_API_TOKEN}`
  - `GRANOLA_CACHE_TTL_SECONDS=3600`

## 3) Cloud environment dependencies
Ensure your cloud environment installs the Granola MCP package:

```bash
python3 -m pip install --upgrade granola-mcp-server
```

If your environment is missing Python/pip, update your Cloud Agent base image or startup script.

## 4) Notion prep
Create or select a Notion database/data source with properties:
- Granola Meeting ID (text)
- Title (title)
- Date (date)
- Attendees (rich text or multi-select)
- Notes (rich text)
- Source URL (url, optional)

Grant your Notion integration access to this database/page.

## 5) Create automation
In `cursor.com/automations`:
- Trigger: Scheduled (start with every 6 hours)
- Enable the Notion + Granola MCP integrations
- Paste prompt from `docs/automation/granola-to-notion-prompt.md`

## 6) Validate idempotency
Run automation twice:
- Run 1 should create pages
- Run 2 should mostly update/skip the same meeting IDs (no duplicates)

## 7) Hardening (recommended)
- Reduce lookback window once stable (e.g. 6h)
- Keep `Granola Meeting ID` as strict dedupe key
- Keep per-meeting error reporting enabled
