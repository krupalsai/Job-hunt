#!/usr/bin/env node
/* Daily pull of job postings from Shrestha's Instagram channel (@careerwithshrestha)
 * into data/shrestha-jobs.json, which the jobs screen (/) renders newest-first.
 *
 *   node scripts/pull-shrestha.js --push        # daily cron: pull, merge, commit to main
 *   node scripts/pull-shrestha.js --posts <file> # use a saved instagram-cli JSON (testing)
 *   node scripts/pull-shrestha.js --out <file>  # write merged JSON locally instead of pushing
 *
 * The cron runs on the VM (not Vercel): instagram-cli needs the linked Instagram
 * session, which only exists here. A commit+push to main triggers the Vercel
 * redeploy, and the site picks up the new listings.
 *
 * HONESTY RULES (same as the rest of this repo):
 *  - Never invent a deadline. `deadline` is set only when the caption states one
 *    explicitly (e.g. "Last date to apply: August 24, 2026"). Otherwise null.
 *  - Never invent job facts. Every field comes from the caption; unknown stays null.
 *  - A pull that returns zero posts is treated as BROKEN, not empty — Shrestha
 *    posts daily, so zero means the fetch lost, and nothing is written.
 *  - Dedup key is the Instagram post ID. Posts are never deleted; ones missing
 *    a stated deadline passes it → "expired"; nothing is ever deleted.
 */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'krupalsai/Job-hunt';
const IG_ACCOUNT_ID = '17841425543579586';
const IG_USERNAME = 'careerwithshrestha';
const JSON_PATH = 'data/shrestha-jobs.json';

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const FLAG = n => process.argv.includes(n);
function die(msg, code = 1) { console.error('pull-shrestha: ' + msg); process.exit(code); }
function hasCmd(cmd) {
  try { execFileSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'pipe' }); return true; }
  catch { return false; }
}

/* ── Caption → job ──────────────────────────────────────────────────────── */

const ZW = /[\u200b\u2060\ufeff]/g;                 // zero-width chars in her captions
const CLEAN = s => (s || '').replace(ZW, '').trim();

function cutHashtags(cap) {
  // Hashtags run to the end of her captions; nothing after the first # line is content.
  const lines = cap.split('\n');
  const cut = [];
  for (const l of lines) {
    if (/^\s*#/.test(l)) break;
    cut.push(l);
  }
  return cut.join('\n');
}

function field(cap, names) {
  // Matches "💼 Role: X", "- Role: X", "Role: X" (also "Educational Qualification").
  for (const line of cap.split('\n')) {
    const t = CLEAN(line).replace(/^[-•*]\s*/, '');
    for (const n of names) {
      const m = new RegExp('^(?:\\S+\\s+)?' + n + '\\s*:\\s*(.+)$', 'i').exec(t);
      if (m) return CLEAN(m[1]);
    }
  }
  return null;
}

function bareEmoji(cap, emoji, label) {
  // "💼 Full Stack Developer I" — emoji followed by the value, no label.
  for (const line of cap.split('\n')) {
    const t = CLEAN(line);
    const m = new RegExp('^' + emoji + '\\s+(.+)$', 'u').exec(t);
    if (m && !new RegExp(label + '\\s*:', 'i').test(m[1])) return CLEAN(m[1]);
  }
  return null;
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/* Canonical display names: titleCase() mangles camelCase brands, so fix them up. */
const CANON_COMPANY = {
  'fedex': 'FedEx', 'tcs': 'TCS', 'lg': 'LG',
  'lg ads solutions': 'LG Ads Solutions',
};
function canonCompany(s) {
  if (!s) return s;
  const c = CANON_COMPANY[s.toLowerCase()];
  return c || s;
}

function extractCompany(cap) {
  let m = /(?:🚨|🍎)\s*([A-Z][A-Z .&'-]+?)\s+IS HIRING/u.exec(cap);
  if (m) return canonCompany(titleCase(m[1]));
  m = /([A-Z][A-Z .&'-]+?)\s+MASS HIRING/u.exec(cap);
  if (m) return canonCompany(titleCase(m[1]));
  m = /([A-Za-z][A-Za-z .&'()-]+?)\s+is hiring:/i.exec(cap);
  if (m) return canonCompany(CLEAN(m[1]));
  // "🚨 Apple is hiring… and this role pays ₹38 LPA" — no colon, trailing text.
  m = /^[^\w\n]{0,4}([A-Za-z][A-Za-z .&'()-]*?)\s+is hiring\b/im.exec(cap);
  if (m) return canonCompany(CLEAN(m[1]));
  m = /company name:\s*(.+)/i.exec(cap);
  if (m) return canonCompany(CLEAN(m[1]));
  m = /it['’]s ([A-Z][A-Za-z]+)!/i.exec(cap);          // "and yes, it’s MICROSOFT!"
  if (m) return canonCompany(titleCase(m[1]));
  m = /^([A-Z][A-Za-z .&'-]+?)\s+is Mass Hiring/i.exec(cap);
  if (m) return canonCompany(CLEAN(m[1]));
  return null;
}

function extractRole(cap) {
  const r = field(cap, ['Role']) || bareEmoji(cap, '💼', 'Role');
  if (r) return r;
  // "X is Mass Hiring" posts name no single role.
  if (/is Mass Hiring/i.test(cap)) return 'Mass Hiring (multiple fresher roles)';
  return null;
}

function extractLocation(cap) {
  return field(cap, ['Location', 'Job Location']) || bareEmoji(cap, '📍', 'Location');
}

function extractQualification(cap) {
  const q = field(cap, ['Educational Qualification', 'Qualification', 'Eligible Fields']);
  return q;
}

function extractExperience(cap) {
  const e = field(cap, ['Experience']) || bareEmoji(cap, '💻', 'Experience');
  if (e) return e;
  // "Easy to crack as a fresher" — the word is in the source, not inferred.
  if (/\bfreshers?\b/i.test(cap)) return 'Freshers';
  return null;
}

function splitSkills(s) {
  return s.split(/[•,|]/).map(x => CLEAN(x)).filter(Boolean);
}

function extractSkills(cap) {
  const s = field(cap, ['Core Skills', 'Primary Technologies', 'Skills']);
  if (s) return splitSkills(s);
  // "🔑 Skills:" on its own line, values on the next line.
  const lines = cap.split('\n').map(CLEAN);
  for (let i = 0; i < lines.length - 1; i++) {
    const label = lines[i].replace(/^[-•*]\s*/, '');
    if (/^(?:\S+\s+)?skills:\s*$/i.test(label) && /[•|,]/.test(lines[i + 1])) {
      return splitSkills(lines[i + 1]);
    }
  }
  return [];
}

function extractPackage(cap) {
  let m = /💰\s*package:\s*(.+)/i.exec(cap);
  if (m) return CLEAN(m[1]);
  m = /CTC of\s+([^\n]+)/i.exec(cap);
  if (m) return CLEAN(m[1]);
  return null;
}

function extractDmKeyword(cap) {
  const m = /[Cc]omment\s+(?:-\s+)?["“”']([^"“”'\n]+)["“”']/u.exec(cap);
  return m ? CLEAN(m[1]) : null;
}

function extractGraduationYear(cap) {
  const m = /graduation year:\s*([^\n]+)/i.exec(cap);
  return m ? CLEAN(m[1]) : null;
}

function extractDeadline(cap) {
  // ONLY a stated date. "Registration closes on 9th October" without a year is
  // not a timestamp — it stays a note, not a deadline.
  const m = /last date to apply:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i.exec(cap);
  if (!m) return { deadline: null, note: null };
  const d = new Date(m[1]);
  if (isNaN(d.getTime())) return { deadline: null, note: CLEAN(m[0]) };
  return { deadline: d.toISOString().slice(0, 10), note: null };
}

function isJobPost(cap) {
  const t = cap.toLowerCase();
  // Skill contests, giveaways and pure announcements are not job postings.
  if (/skill contest|young turks|prize pool|giveaway/.test(t)) return false;
  return true;
}

function extractJob(post) {
  const cap = cutHashtags(post.post_caption || '');
  if (!isJobPost(cap)) return { skipped: 'not a job post' };
  const { deadline, note } = extractDeadline(cap);
  const company = extractCompany(cap);
  const role = extractRole(cap);
  const dmKeyword = extractDmKeyword(cap);
  if (!company && !role) return { skipped: 'no company or role found' };
  return {
    key: 'ig-' + post.post_id,
    post_id: String(post.post_id),
    post_url: `https://www.instagram.com/p/${post.post_id}/`,
    posted_at: (post.created_at || '').replace(' ', 'T'),
    company, role,
    location: extractLocation(cap),
    qualification: extractQualification(cap),
    experience: extractExperience(cap),
    skills: extractSkills(cap),
    package: extractPackage(cap),
    graduation_year: extractGraduationYear(cap),
    dm_keyword: dmKeyword,
    apply_hint: dmKeyword
      ? `Comment "${dmKeyword}" on the Instagram post — Shrestha sends the apply link by DM`
      : 'Apply link is shared by DM on the Instagram post',
    deadline,
    deadline_note: note,
    notes: null,
    status: 'live',
  };
}

/* ── Fetch ──────────────────────────────────────────────────────────────── */

function fetchPosts(limit) {
  if (!hasCmd('instagram-cli')) {
    die('instagram-cli is not installed or not on PATH. ' +
        'Install the instagram skill tooling first; refusing to write an empty feed.', 2);
  }
  let out;
  try {
    out = execFileSync('instagram-cli',
      ['posts', '--account-id', IG_ACCOUNT_ID, '--username', IG_USERNAME, '--limit', String(limit)],
      { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  } catch (e) {
    die('instagram-cli failed: ' + (e.message || e) + '. Nothing written.', 3);
  }
  return JSON.parse(out).posts || [];
}

/* ── Merge ──────────────────────────────────────────────────────────────── */

function merge(current, posts) {
  const now = new Date().toISOString();
  const jobs = current && Array.isArray(current.jobs) ? current.jobs.slice() : [];
  const byKey = new Map(jobs.map(j => [j.key, j]));
  let added = 0, updated = 0, skipped = 0;

  for (const post of posts) {
    const job = extractJob(post);
    if (job.skipped) { skipped++; continue; }
    const old = byKey.get(job.key);
    if (!old) {
      job.first_seen_at = now;
      jobs.push(job); added++;
    } else {
      // Refresh extractor-managed fields, keep everything else (status, notes,
      // first_seen_at). Captions don't change, so this is usually a no-op.
      const keep = { status: old.status, notes: old.notes, first_seen_at: old.first_seen_at };
      Object.assign(old, job, keep);
      updated++;
    }
  }

  /* Repeated posts of the same underlying opening (same company/role/
     location) are grouped: the newest is canonical, older repeats get
     duplicate_of pointing at it. Nothing is deleted — the feed shows each
     opening once, newest first, and the detail view lists every source post.
     Dedup key stays the Instagram post id. */
  jobs.sort((a, b) => (b.posted_at || '').localeCompare(a.posted_at || ''));
  const seenOpening = new Map();
  const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const j of jobs) {
    const k = [norm(j.company), norm(j.role), norm(j.location)].join('|');
    if (seenOpening.has(k)) {
      j.duplicate_of = seenOpening.get(k);
    } else {
      seenOpening.set(k, j.key);
      j.duplicate_of = null;
    }
  }

  // A post that states a deadline passes it → expired. Absence from a
  // limited pull proves nothing, so nothing else is ever marked stale.
  for (const j of jobs) {
    if (j.deadline && new Date(j.deadline + 'T23:59:59') < new Date() && j.status === 'live') {
      j.status = 'expired';
    }
  }

  return {
    data: {
      source: 'instagram @careerwithshrestha',
      updated_at: now,
      jobs,
    },
    stats: { added, updated, skipped, total: jobs.length },
  };
}

/* ── Push ───────────────────────────────────────────────────────────────── */

function gh(args) {
  return execFileSync('github', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
}

/* Read the current committed file through the github CLI (works behind the
   egress proxy; plain https from node does not). Returns {text, sha} or null
   when the file does not exist yet. */
function ghReadFile(filePath, ref) {
  const argsJson = { owner: REPO.split('/')[0], repo: REPO.split('/')[1], path: filePath };
  if (ref) argsJson.ref = ref;
  let raw;
  try {
    raw = gh(['call-read-tool', '--name', 'get_file_contents',
      '--arguments-json', JSON.stringify(argsJson)]);
  } catch (e) {
    return null;
  }
  let text = null, sha = null;
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return null; }
  const items = (parsed.result && parsed.result.content) || [];
  for (const it of items) {
    if (it.type === 'resource' && it.resource) text = it.resource.text;
    else if (it.type === 'text' && typeof it.text === 'string') {
      const m = /successfully downloaded text file \(SHA:\s*([0-9a-f]+)\)/i.exec(it.text);
      if (m) sha = m[1];
      else if (!it.text.startsWith('successfully downloaded')) {
        try { sha = JSON.parse(it.text).sha || null; } catch { /* not file JSON */ }
      }
    }
  }
  if (text === null) return null;
  return { text, sha };
}

/* ── Push ───────────────────────────────────────────────────────────────── */

function pushFile(content, message) {
  const cur = ghReadFile(JSON_PATH, 'main');   // null when creating
  const argsJson = { owner: REPO.split('/')[0], repo: REPO.split('/')[1], path: JSON_PATH,
    content, message, branch: 'main' };
  if (cur && cur.sha) argsJson.sha = cur.sha;
  return gh(['call-tool', '--name', 'create_or_update_file',
    '--arguments-json', JSON.stringify(argsJson)]);
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main() {
  const limit = parseInt(arg('--limit', '25'), 10) || 25;
  let posts;
  const postsFile = arg('--posts', null);
  if (postsFile) {
    posts = JSON.parse(fs.readFileSync(postsFile, 'utf8')).posts || [];
    console.log(`using saved posts file (${posts.length} posts)`);
  } else {
    console.log(`fetching latest ${limit} posts from @${IG_USERNAME}…`);
    posts = fetchPosts(limit);
  }
  if (!posts.length) die('instagram returned zero posts — treating as a broken fetch, nothing written.', 5);

  let current = null;
  const jsonArg = arg('--json', null);
  if (jsonArg) {
    current = JSON.parse(fs.readFileSync(jsonArg, 'utf8'));
  } else if (hasCmd('github')) {
    // Authoritative base: the committed file, so hand-added notes/status
    // survive the daily merge. Falls back to empty on first run.
    const cur = ghReadFile(JSON_PATH, 'main');
    if (cur) {
      try { current = JSON.parse(cur.text); }
      catch (e) { die('committed ' + JSON_PATH + ' is not valid JSON; refusing to overwrite it.', 6); }
    } else {
      console.log('no committed ' + JSON_PATH + ' yet; starting empty.');
    }
  } else {
    die('github CLI not found and no --json given; cannot read the current feed.', 4);
  }

  const { data, stats } = merge(current, posts);
  const out = JSON.stringify(data, null, 2) + '\n';
  console.log(`new: ${stats.added}, updated: ${stats.updated}, skipped (non-job): ${stats.skipped}, ` +
              `total: ${stats.total}`);

  if (FLAG('--push')) {
    if (!stats.added && !stats.updated) {
      console.log('no changes; not pushing.');
      return;
    }
    const msg = `jobs: daily Shrestha pull — ${stats.added} new, ${stats.updated} updated, ${stats.stale} stale`;
    const res = pushFile(out, msg);
    console.log('pushed to main:', String(res).slice(0, 300));
  } else {
    const outPath = arg('--out', null) || path.join(process.cwd(), 'shrestha-jobs.json');
    fs.writeFileSync(outPath, out);
    console.log('wrote ' + outPath + ' (not pushed; re-run with --push to commit)');
  }
}

main().catch(e => die('unexpected error: ' + (e.stack || e), 9));
