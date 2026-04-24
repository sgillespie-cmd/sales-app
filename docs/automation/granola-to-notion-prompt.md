# Granola -> Notion Automation Prompt

Use this as your Cloud Automation prompt.

## Prompt

You have access to both Granola and Notion MCP tools.

Goal: sync my recent Granola meeting notes into a Notion database with idempotent upsert behavior.

Rules:
1. Look back 24 hours in Granola (or since last successful run if available).
2. For each meeting, gather:
   - Meeting ID
   - Title
   - Date/time
   - Attendees
   - Markdown notes (or best available notes body)
   - Source URL if provided
3. Upsert into Notion using `Granola Meeting ID` as the unique key:
   - If a page exists with this key, update it.
   - If not, create it.
4. Never create duplicates for the same Granola Meeting ID.
5. If required Notion properties are missing, report exactly which properties are missing and stop safely.
6. Continue processing other meetings when one meeting fails; include per-meeting errors.
7. At the end, return a summary with:
   - meetings_scanned
   - pages_created
   - pages_updated
   - pages_skipped
   - errors (with meeting ID and reason)

Notion target:
- Workspace: <YOUR WORKSPACE>
- Database/Data Source name: <YOUR DATABASE NAME>
- Required properties:
  - Granola Meeting ID (text, unique key)
  - Title (title)
  - Date (date)
  - Attendees (rich text or multi-select)
  - Notes (rich text or markdown-compatible field)
  - Source URL (url, optional)

Output format:
- Start with a JSON block containing the final counts.
- Then include a short bullet list of any errors.
