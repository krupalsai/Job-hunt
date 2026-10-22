# Job Hunt ↔ ChatGPT MCP

## Implemented
- `/api/activity` records coarse app events (page views, clicks, form submits) without recording typed values or answer text.
- `/api/mcp` exposes read-only tools for recent activity, activity summaries, and official exam-result notices.
- `supabase/migrations/0011_app_activity.sql` creates the activity table with RLS enabled and public table access revoked.
- No OpenAI API call is made by this integration, so it adds no OpenAI API usage charges.

## ChatGPT Go limitation
OpenAI's current documentation lists custom MCP connections for ChatGPT Business and Enterprise/Edu. Pro supports read/fetch MCP in developer mode. ChatGPT Go is not listed as supporting custom MCP connections, and custom MCP apps are currently web-only. Therefore, this code does **not** connect Job Hunt directly to a Go account or automatically send messages from Job Hunt into the current ChatGPT conversation.
- https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt
- https://help.openai.com/en/articles/11989085-what-is-chatgpt-go

## Configure MCP when your ChatGPT plan supports it
Set these Vercel environment variables for Production:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never expose to the browser)
- `MCP_API_TOKEN` (a long random secret; never commit it)

Endpoint: `https://krupal-job-tracker.vercel.app/api/mcp`
Authentication: `Authorization: Bearer <MCP_API_TOKEN>`.

Before connecting, verify that the deployment is reachable without Vercel SSO protection for the ChatGPT connector. Do not make the database service-role key public. The MCP endpoint currently provides read-only access; it cannot submit applications or send every Job Hunt message into this conversation.

## Privacy
The tracker records only event type, page path/hash, and a stable element identifier/class. It never records text typed into fields, form contents, or ChatGPT answers. The public app activity POST endpoint should be kept behind same-origin checks and monitored for abuse.
