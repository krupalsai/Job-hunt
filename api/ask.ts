/**
 * POST /api/ask — Alexa-like voice tutor for the Professor chat (chat.html).
 *
 * Body: { messages: [{ role: "user"|"assistant", content: string }], mode?: string }
 * Returns: { reply: string }
 *
 * Default backend: Pollinations (https://text.pollinations.ai/openai) — free,
 * keyless, OpenAI-compatible. The tutor works out of the box; no key, no env
 * var, nothing to set up.
 *
 * Optional upgrade: if GEMINI_API_KEY is set (Vercel env var; redeploy after
 * adding/changing it), the Gemini OpenAI-compatible endpoint is used instead.
 * The key is never logged, echoed, or exposed in any response.
 */

const POLLINATIONS_URL = "https://text.pollinations.ai/openai";
const POLLINATIONS_MODEL = "openai";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_MSGS = 20;
const MAX_LEN = 4000;

const TUTOR_SYSTEM = [
  "You are an Alexa-like voice tutor inside the Job Hunt study app.",
  "Your student is Krupal, a 2025 B.Tech graduate preparing for the Telangana",
  "Sub-Inspector (TS SI) prelims (29 Nov 2026). He is learning programming,",
  "quant, reasoning, English and general awareness from zero.",
  "",
  "How you teach — never break these rules:",
  "- Explain simply, from zero. Short sentences, plain words, phone-screen length.",
  "- Teach ONE small thing at a time, then ask exactly ONE question and WAIT",
  "  for his answer. Never stack two or more questions in one reply.",
  "- When he answers: say right or wrong in the first line, explain a mistake",
  "  in one line, then teach the next small step.",
  "- Keep every reply short enough to be read aloud (about 120 words max,",
  "  unless he asks for more detail).",
  "- Recommend a YouTube video when it would genuinely help, as a search link",
  "  like https://www.youtube.com/results?search_query=<topic>. NEVER invent",
  "  specific video URLs, titles, or channel names — search links only.",
  "- NEVER invent facts: exam dates, fees, vacancies, cutoffs, application",
  "  links, notifications. If you are not sure, say so in one line and move on.",
  "- Be warm and encouraging, like a patient teacher. No fluff, no lectures.",
].join("\n");

function cleanMessages(input: any): Array<{ role: string; content: string }> {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m: any) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }))
    .slice(-MAX_MSGS);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });

  const body = req.body ?? {};
  const messages = cleanMessages(body.messages);
  if (!messages.length || !messages.some((m) => m.role === "user")) {
    return res
      .status(400)
      .json({ error: "messages with at least one user message are required." });
  }

  // Backend choice: Gemini when its key is configured, else free Pollinations.
  const geminiKey = process.env.GEMINI_API_KEY ?? "";
  const url = geminiKey ? GEMINI_URL : POLLINATIONS_URL;
  const payload = {
    model: geminiKey ? GEMINI_MODEL : POLLINATIONS_MODEL,
    messages: [{ role: "system", content: TUTOR_SYSTEM }].concat(messages),
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (geminiKey) headers["Authorization"] = "Bearer " + geminiKey;

  let upstream: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60000);
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    return res
      .status(502)
      .json({ error: "The tutor is unreachable right now. Try again in a bit." });
  }

  if (!upstream.ok) {
    if (upstream.status === 429) {
      return res.status(502).json({
        error: "The tutor is busy (rate limit). Wait a minute and try again.",
      });
    }
    return res
      .status(502)
      .json({ error: "The tutor had a problem. Try again in a bit." });
  }

  let data: any;
  try {
    data = await upstream.json();
  } catch (e) {
    return res
      .status(502)
      .json({ error: "The tutor returned something unreadable. Try again." });
  }

  const reply =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;
  if (!reply || !String(reply).trim()) {
    return res
      .status(502)
      .json({ error: "The tutor came back empty. Try asking again." });
  }
  return res.status(200).json({ reply: String(reply).trim().slice(0, 6000) });
}
