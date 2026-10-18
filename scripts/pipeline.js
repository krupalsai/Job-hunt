#!/usr/bin/env node
/* The Pipeline tracker's keeper: data/job-pipeline.json, the per-opportunity
 * lifecycle Krupal watches instead of checking his phone (1–3 hrs/day saved).
 *
 *   node scripts/pipeline.js list
 *   node scripts/pipeline.js add --company "Infosys" --role "Specialist Programmer" \
 *       --location "Pan India" --source feed --official_url "https://…"
 *   node scripts/pipeline.js update --id <id> --field verification.status verified
 *   node scripts/pipeline.js update --id <id> --field referrals.0.status responded
 *   node scripts/pipeline.js update --id <id> --field deadline --value-null
 *   (the new value is the word after the field path; --value="…" also works
 *   for values starting with "--", and --value-null sets null)
 *
 * --value is parsed as JSON when it looks like JSON (numbers, booleans,
 * arrays, objects), otherwise kept as a string. --value-null sets null.
 * Dot paths understand array indices: referrals.0.status.
 *
 * HONESTY RULES (same as the rest of this repo):
 *  - Never invent a deadline, link, or status. Unknown stays null.
 *  - verification.status is only "verified" after the official portal
 *    3-check (live posting, last date captured, apply flow accepting).
 *  - The daily watcher crons call this script; it never touches the network.
 *
 * Run: node scripts/pipeline.js <command> [options]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'data', 'job-pipeline.json');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : def;
}
const FLAG = n => process.argv.includes(n);
function die(msg, code = 1) { console.error('pipeline: ' + msg); process.exit(code); }

function load() {
  let data;
  try { data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')); }
  catch (e) { die('cannot read ' + JSON_PATH + ': ' + e.message); }
  if (!Array.isArray(data)) die(JSON_PATH + ' is not an array');
  return data;
}
function save(data) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n');
}

function slug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'opp';
}
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* Set a value at a dot path, creating objects/arrays as needed.
   "referrals.0.status" on {} builds { referrals: [ { status: … } ] }. */
function setPath(obj, dotPath, value) {
  const parts = String(dotPath).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i], next = parts[i + 1];
    const wantArray = /^\d+$/.test(next);
    if (/^\d+$/.test(p)) {
      const idx = Number(p);
      if (!Array.isArray(cur)) die('path "' + dotPath + '": expected an array at "' + parts.slice(0, i + 1).join('.') + '"');
      if (cur[idx] == null || typeof cur[idx] !== 'object') cur[idx] = wantArray ? [] : {};
      cur = cur[idx];
    } else {
      if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = wantArray ? [] : {};
      cur = cur[p];
    }
  }
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) {
    if (!Array.isArray(cur)) die('path "' + dotPath + '": expected an array at the end');
    cur[Number(last)] = value;
  } else {
    cur[last] = value;
  }
}

function parseValue(raw, isNull) {
  if (isNull) return null;
  if (raw == null) die('--field needs --value (or --value-null)');
  const t = raw.trim();
  if (/^(null|true|false|-?\d+(\.\d+)?|\[.*\]|\{.*\})$/s.test(t)) {
    try { return JSON.parse(t); } catch (e) { /* fall through to string */ }
  }
  return raw;
}

const cmd = process.argv[2];
if (!cmd || cmd === 'help' || cmd === '--help') {
  console.log('usage: node scripts/pipeline.js <list|get|add|update> [options]');
  console.log('  list                                   compact table of opportunities');
  console.log('  get --id <id>                          print one opportunity as JSON');
  console.log('  add --company <c> [--role R] [--location L] [--source S]');
  console.log('      [--found_at YYYY-MM-DD] [--official_url U] [--deadline YYYY-MM-DD] [--id ID]');
  console.log('  update --id <id> --field <dot.path> [--value V | --value-null]');
  process.exit(cmd ? 0 : 1);
}

if (cmd === 'list') {
  const data = load();
  const rows = data.map(o => ({
    id: o.id,
    company: o.company,
    role: o.role,
    stage: (o.verification && o.verification.status === 'failed') ? 'failed'
      : (o.application && /applied/.test(o.application.status)) ? o.application.status
      : (o.verification && o.verification.status) || 'found',
    deadline: o.deadline || '—',
    referrals: (o.referrals || []).map(r => r.name + ':' + r.status).join(', ') || '—',
  }));
  console.table(rows);
  process.exit(0);
}

if (cmd === 'get') {
  const id = arg('--id');
  if (!id) die('get needs --id');
  const o = load().find(x => x.id === id);
  if (!o) die('no opportunity with id "' + id + '"');
  console.log(JSON.stringify(o, null, 2));
  process.exit(0);
}

if (cmd === 'add') {
  const company = arg('--company');
  if (!company) die('add needs --company');
  const data = load();
  const id = arg('--id') || (slug(company) + '-' + slug(arg('--role')));
  if (data.some(x => x.id === id)) die('id "' + id + '" already exists');
  const opp = {
    id,
    company,
    role: arg('--role', null),
    location: arg('--location', null),
    source: arg('--source', null),
    found_at: arg('--found_at', today()),
    official_url: arg('--official_url', null),
    verification: { status: 'pending', checked_at: null, notes: null },
    company_research: { status: 'pending', summary: null, news_sources: [] },
    referrals: [],
    resume: { draft_path: null, ats_score: null },
    deadline: arg('--deadline', null),
    application: { status: 'not-applied', applied_at: null },
  };
  data.push(opp);
  save(data);
  console.log('added "' + id + '"');
  process.exit(0);
}

if (cmd === 'update') {
  const id = arg('--id');
  if (!id) die('update needs --id');
  const fi = process.argv.indexOf('--field');
  if (fi === -1 || !process.argv[fi + 1]) die('update needs --field <dot.path> <value>');
  const field = process.argv[fi + 1];
  /* The new value is the word right after the field path, so
       update --id X --field referrals.0.status responded
     reads naturally. --value="…" covers values starting with "--". */
  const positional = process.argv[fi + 2] && !process.argv[fi + 2].startsWith('--')
    ? process.argv[fi + 2] : null;
  const raw = FLAG('--value-null') ? null : (arg('--value') != null ? arg('--value') : positional);
  const value = parseValue(raw, FLAG('--value-null'));
  const data = load();
  const o = data.find(x => x.id === id);
  if (!o) die('no opportunity with id "' + id + '"');
  setPath(o, field, value);
  save(data);
  console.log('updated "' + id + '" ' + field + ' = ' + JSON.stringify(value));
  process.exit(0);
}

die('unknown command "' + cmd + '" — try: list, get, add, update');
