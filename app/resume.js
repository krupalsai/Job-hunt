/* ============================================================================
   RESUME DRAFTS — one per listing, built only from the candidate's own details.

   The rule this file exists to enforce:

       NOTHING IN A RESUME IS WRITTEN BY THE APP.

   Every line of the draft is a line the candidate typed into their profile.
   The app only chooses ORDER (the lines that share words with the listing go
   first) and reports GAPS (words the listing uses that the profile does not
   contain). A gap is shown so the candidate can decide whether it is true for
   them; it is never added. A resume that claims a skill nobody has is worse
   than a low score.

   THE SCORE IS A KEYWORD MATCH, NOT AN ATS SCORE. It is the share of the
   listing's keywords that appear in the draft. Real applicant-tracking systems
   parse files their own way and are not available to test against here, so
   the number says how well the profile matches the wording of this listing,
   and nothing more. TARGET is 95: the draft is judged against it, and it is
   reached only when the profile really contains the listing's keywords.

   Pure functions above the line, DOM below it. Node tests load this file for
   the pure part; the browser loads it for both.
   ========================================================================== */
(function (root) {
  "use strict";

  const PROFILE_KEY = "jobhunt_resume_profile";
  const SEEN_KEY    = "jobhunt_seen_listings";
  const TARGET      = 95;

  /* Words every listing contains and none of them says what the job needs. */
  const STOP = new Set((
    "a an and are as at be by for from has have in is it of on or the to with " +
    "will post posts vacancy vacancies recruitment notification eligibility " +
    "candidate candidates degree graduate passed minimum required must should " +
    "any other only marks percent years year age none nil etc who which that " +
    "this such their through within per also either both not may shall each"
  ).split(/\s+/));

  /* Lower-case, drop full stops so "B.Tech" and "BTech" meet, keep + and # for
     C++ and C#. */
  function normalize(s) {
    return String(s || "").toLowerCase().replace(/\./g, "");
  }

  function tokens(s) {
    return normalize(s)
      .split(/[^a-z0-9+#]+/)
      .filter(t => t.length >= 2 && !STOP.has(t) && !/^\d+$/.test(t));
  }

  /* The listing's keywords with weights: the job title counts double, because
     a title word is what a reader scans for first. Duplicates keep the higher
     weight. */
  function listingKeywords(job) {
    const w = new Map();
    const add = (text, weight) => {
      for (const t of tokens(text)) w.set(t, Math.max(w.get(t) || 0, weight));
    };
    add(job && job.post_name, 2);
    add(job && job.eligibility, 1);
    add(job && job.profile, 1);
    return [...w].map(([term, weight]) => ({ term, weight }));
  }

  /* Split a free-text field into its lines or items. */
  function items(text, sep) {
    // An array is already split; a string is split on the separator. Both are
    // accepted so a caller never gets one comma-joined line by mistake.
    const parts = Array.isArray(text) ? text : String(text || "").split(sep);
    return parts.map(s => String(s).trim()).filter(Boolean);
  }

  /* The candidate's details, normalised. Returns null when nothing has been
     entered, so the caller can ask for details instead of drafting nothing. */
  function normaliseProfile(p) {
    if (!p || typeof p !== "object") return null;
    const out = {
      name: String(p.name || "").trim(),
      contact: String(p.contact || "").trim(),
      education: items(p.education, /\n/),
      skills: items(p.skills, /[,;\n]/),
      experience: items(p.experience, /\n/),
      projects: items(p.projects, /\n/),
      certifications: items(p.certifications, /\n/),
    };
    const any = out.name || out.contact || out.education.length || out.skills.length ||
      out.experience.length || out.projects.length || out.certifications.length;
    return any ? out : null;
  }

  /* Every word the candidate has written in the body of their resume. Used by
     the no-fabrication test: a draft may contain nothing outside this set. */
  function profileTokens(profile) {
    const p = normaliseProfile(profile);
    if (!p) return new Set();
    const all = [...p.education, ...p.skills, ...p.experience, ...p.projects, ...p.certifications].join(" ");
    return new Set(tokens(all));
  }

  /* How many of the listing's keywords a line of the candidate's text carries. */
  function relevance(line, keywords) {
    const here = new Set(tokens(line));
    let n = 0;
    for (const k of keywords) if (here.has(k.term)) n += k.weight;
    return n;
  }

  /* Stable sort: lines with more of the listing's words first, original order
     kept between ties so the candidate's own sequence is not scrambled. */
  function byRelevance(lines, keywords) {
    return lines
      .map((line, i) => ({ line, i, r: relevance(line, keywords) }))
      .sort((a, b) => (b.r - a.r) || (a.i - b.i))
      .map(x => x.line);
  }

  /* The score of a piece of text against the listing. Returns null when the
     listing gave no usable keywords, because then there is nothing to match. */
  function scoreText(text, keywords) {
    if (!keywords.length) return null;
    const here = new Set(tokens(text));
    let total = 0, got = 0;
    const matched = [], missing = [];
    for (const k of keywords) {
      total += k.weight;
      if (here.has(k.term)) { got += k.weight; matched.push(k.term); }
      else missing.push(k.term);
    }
    return { score: Math.round(100 * got / total), matched, missing };
  }

  /* The draft itself. `body` is what the score is taken over: only the
     candidate's own words, so the header (name, contact) and the target line
     cannot inflate the score. */
  function buildResume(profile, job) {
    const p = normaliseProfile(profile);
    if (!p) return null;
    const keywords = listingKeywords(job);
    const sections = [];
    if (p.education.length)     sections.push(["EDUCATION", byRelevance(p.education, keywords).map(l => "- " + l)]);
    if (p.skills.length) {
      // Skills are one comma-separated line, as most applicant systems expect.
      // The ones that match the listing lead; nothing is added to the list.
      const sorted = p.skills
        .map((s, i) => ({ s, i, r: relevance(s, keywords) }))
        .sort((a, b) => (b.r - a.r) || (a.i - b.i))
        .map(x => x.s);
      sections.push(["SKILLS", [sorted.join(", ")]]);
    }
    if (p.experience.length)    sections.push(["EXPERIENCE", byRelevance(p.experience, keywords).map(l => "- " + l)]);
    if (p.projects.length)      sections.push(["PROJECTS", byRelevance(p.projects, keywords).map(l => "- " + l)]);
    if (p.certifications.length) sections.push(["CERTIFICATIONS", p.certifications.map(l => "- " + l)]);

    const body = sections.map(([h, lines]) => h + "\n" + lines.join("\n")).join("\n\n");
    const result = scoreText(body, keywords);
    const header = [p.name, p.contact].filter(Boolean).join("\n");
    const text = (header ? header + "\n\n" : "") + body;
    return {
      text,
      body,
      target: TARGET,
      score: result ? result.score : null,
      matched: result ? result.matched : [],
      missing: result ? result.missing : [],
      keywords: keywords.length,
    };
  }

  /* A short, stable fingerprint of the details, so a cached score can tell it
     has gone stale after an edit. Not security: only change detection. */
  function profileSignature(profile) {
    const s = JSON.stringify(normaliseProfile(profile) || {});
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return String(h);
  }

  /* New listings: the first visit records what is there and marks nothing as
     new, so a 900-row list does not light up on day one. Later visits return
     the ids that were not in the stored set. `store` is injected so the test
     can use a plain object instead of localStorage. */
  function trackNew(ids, store) {
    const seenRaw = store.get(SEEN_KEY);
    const current = new Set(ids);
    if (seenRaw === null || seenRaw === undefined) {
      store.set(SEEN_KEY, JSON.stringify([...current]));
      return new Set();
    }
    let seen;
    try { seen = new Set(JSON.parse(seenRaw)); } catch (e) { seen = new Set(); }
    const fresh = new Set([...current].filter(id => !seen.has(id)));
    // Keep what is still listed plus what was seen before. Dropping a closed
    // listing is what lets the store stay small over months.
    const kept = [...seen].filter(id => current.has(id));
    store.set(SEEN_KEY, JSON.stringify([...new Set([...kept, ...fresh])]));
    return fresh;
  }

  /* ── Browser-only below ─────────────────────────────────────────────── */

  const lsStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  function loadProfile() {
    try { return normaliseProfile(JSON.parse(lsStore.get(PROFILE_KEY))); } catch (e) { return null; }
  }

  function saveProfile(p) {
    const n = normaliseProfile(p);
    if (!n) { try { localStorage.removeItem(PROFILE_KEY); } catch (e) {} return null; }
    lsStore.set(PROFILE_KEY, JSON.stringify(n));
    return n;
  }

  let newIds = new Set();
  function noteListings(jobs) {
    newIds = trackNew(jobs.map(j => j.id), lsStore);
    return newIds;
  }
  function isNew(id) { return newIds.has(id); }

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* The one line each job card shows. Score and target are always visible;
     the candidate never has to open a draft to learn how well it matches. */
  function cardLine(job) {
    const profile = loadProfile();
    if (!profile) {
      return `<div class="jrow rs-line"><span class="jlab">Resume</span><span class="jval">` +
        `<button class="btn-n" data-resume="${esc(job.id)}">Add your details to draft one</button></span></div>`;
    }
    const r = buildResume(profile, job);
    const score = r && r.score !== null ? r.score : null;
    const cls = score === null ? "" : score >= TARGET ? " rs-good" : score >= 70 ? " rs-mid" : " rs-low";
    const label = score === null ? "no keywords in this listing" : `match ${score}% · target ${TARGET}`;
    return `<div class="jrow rs-line"><span class="jlab">Resume</span><span class="jval">` +
      `<span class="rs-score${cls}">${esc(label)}</span>${isNew(job.id) ? ' <span class="rs-new">NEW</span>' : ""} ` +
      `<button class="btn-n" data-resume="${esc(job.id)}">Open draft</button></span></div>`;
  }

  /* The compact version for the rows of the other openings: one button, with
     the score on it, so the list stays scannable. */
  function rowLine(job) {
    const profile = loadProfile();
    const tag = isNew(job.id) ? ' <span class="rs-new">NEW</span>' : "";
    if (!profile) return `<button class="other-mark" data-resume="${esc(job.id)}">Draft resume</button>${tag}`;
    const r = buildResume(profile, job);
    const label = r && r.score !== null ? `Resume ${r.score}%` : "Resume";
    return `<button class="other-mark" data-resume="${esc(job.id)}">${esc(label)}</button>${tag}`;
  }

  /* ── The sheet: one overlay, edit or view ───────────────────────────── */

  const CSS = `
  .rs-sheet{position:fixed;inset:0;z-index:300;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;justify-content:center}
  .rs-sheet[hidden]{display:none}
  .rs-panel{background:var(--surface,#fff);color:var(--ink,#0f172a);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:14px 14px 0 0;padding:16px 16px 22px;box-sizing:border-box;font-size:15px;line-height:1.45}
  .rs-panel h2{font-size:18px;margin:0 0 4px}
  .rs-panel .rs-for{color:#64748b;font-size:13px;margin:0 0 12px}
  .rs-panel label{display:block;font-weight:600;margin:12px 0 4px;font-size:14px}
  .rs-panel .rs-hint{display:block;font-weight:400;color:#64748b;font-size:12px;margin-top:2px}
  .rs-panel textarea,.rs-panel input{width:100%;box-sizing:border-box;font:inherit;padding:9px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a}
  .rs-panel textarea{min-height:64px;resize:vertical}
  .rs-text{white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:10px 0}
  .rs-meta{font-size:14px;margin:8px 0}
  .rs-gaps{font-size:13px;color:#475569}
  .rs-note{font-size:12px;color:#64748b;margin:10px 0}
  .rs-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  .rs-actions button{flex:1 1 auto;padding:10px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;font:inherit;cursor:pointer}
  .rs-actions .rs-primary{background:#16a34a;border-color:#16a34a;color:#fff;font-weight:600}
  .rs-score{font-weight:600}
  .rs-score.rs-good{color:#15803d}
  .rs-score.rs-mid{color:#b45309}
  .rs-score.rs-low{color:#b91c1c}
  .rs-new{background:#16a34a;color:#fff;font-size:11px;border-radius:4px;padding:1px 5px;font-weight:700}
  `;

  let sheet = null;
  function ensureSheet() {
    if (sheet) return sheet;
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    sheet = document.createElement("div");
    sheet.className = "rs-sheet";
    sheet.hidden = true;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.innerHTML = `<div class="rs-panel" id="rs-panel"></div>`;
    sheet.addEventListener("click", e => { if (e.target === sheet) close(); });
    document.body.appendChild(sheet);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) close(); });
    return sheet;
  }

  function close() { if (sheet) sheet.hidden = true; }
  function panel() { return document.getElementById("rs-panel"); }

  function openEditor(job) {
    ensureSheet();
    const p = loadProfile() || { name: "", contact: "", education: [], skills: [], experience: [], projects: [], certifications: [] };
    const area = (v, arr) => `<textarea id="rs-${v}">${esc((arr || []).join("\n"))}</textarea>`;
    panel().innerHTML = `
      <h2>Your details</h2>
      <p class="rs-for">Only what you type here goes into a draft. Nothing is added for you, and nothing leaves this device.</p>
      <label>Full name<input id="rs-name" value="${esc(p.name)}"></label>
      <label>Contact line<span class="rs-hint">Phone, email, city</span><input id="rs-contact" value="${esc(p.contact)}"></label>
      <label>Education<span class="rs-hint">One degree per line</span>${area("education", p.education)}</label>
      <label>Skills<span class="rs-hint">Separated by commas. Only skills you actually have.</span><textarea id="rs-skills">${esc(p.skills.join(", "))}</textarea></label>
      <label>Experience<span class="rs-hint">One role or achievement per line, in your own words</span>${area("experience", p.experience)}</label>
      <label>Projects<span class="rs-hint">One per line</span>${area("projects", p.projects)}</label>
      <label>Certifications<span class="rs-hint">One per line</span>${area("certifications", p.certifications)}</label>
      <div class="rs-actions">
        <button type="button" id="rs-cancel">Cancel</button>
        <button type="button" class="rs-primary" id="rs-save">Save details</button>
      </div>`;
    sheet.hidden = false;
    document.getElementById("rs-cancel").onclick = close;
    document.getElementById("rs-save").onclick = () => {
      const v = id => document.getElementById("rs-" + id).value;
      saveProfile({
        name: v("name"), contact: v("contact"), education: v("education"), skills: v("skills"),
        experience: v("experience"), projects: v("projects"), certifications: v("certifications"),
      });
      document.dispatchEvent(new CustomEvent("resume:changed"));
      if (job) openDraft(job); else close();
    };
  }

  function openDraft(job) {
    ensureSheet();
    const profile = loadProfile();
    if (!profile) return openEditor(job);
    const r = buildResume(profile, job);
    const hasScore = r && r.score !== null;
    const gaps = r && r.missing.length
      ? `<div class="rs-gaps">The listing uses these words and your details do not contain them: <strong>${esc(r.missing.join(", "))}</strong>. Add one only if it is true for you.</div>`
      : "";
    panel().innerHTML = `
      <h2>Draft for this listing</h2>
      <p class="rs-for">${esc(job.post_name || "")}${job.organization ? " · " + esc(job.organization) : ""}</p>
      ${hasScore
        ? `<div class="rs-meta"><span class="rs-score ${r.score >= TARGET ? "rs-good" : r.score >= 70 ? "rs-mid" : "rs-low"}">Keyword match ${r.score}%</span> · target ${TARGET}</div>`
        : `<div class="rs-meta">This listing gave no keywords to match against.</div>`}
      ${gaps}
      <div class="rs-text" id="rs-text"></div>
      <p class="rs-note">This is a keyword match against the listing's wording, not a real ATS score. A real applicant-tracking system reads the file its own way and cannot be tested here. Lines were only reordered, never written by the app.</p>
      <div class="rs-actions">
        <button type="button" class="rs-primary" id="rs-copy">Copy</button>
        <button type="button" id="rs-download">Download .txt</button>
        <button type="button" id="rs-edit">Edit details</button>
        <button type="button" id="rs-done">Close</button>
      </div>`;
    document.getElementById("rs-text").textContent = r.text;
    sheet.hidden = false;
    document.getElementById("rs-done").onclick = close;
    document.getElementById("rs-edit").onclick = () => openEditor(job);
    document.getElementById("rs-copy").onclick = () => {
      const t = document.getElementById("rs-text").textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(() => {});
    };
    document.getElementById("rs-download").onclick = () => {
      const name = (job.post_name || "resume").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "resume";
      const blob = new Blob([r.text + "\n"], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "resume-" + name + ".txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
  }

  const api = {
    TARGET, STOP, normalize, tokens, listingKeywords, normaliseProfile, profileTokens,
    scoreText, buildResume, profileSignature, trackNew,
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Resume = Object.assign(api, {
      loadProfile, saveProfile, noteListings, isNew, cardLine, rowLine, openDraft, openEditor, close,
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
