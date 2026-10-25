#!/usr/bin/env node
/* e2e-pipeline — the per-job pipeline order, checked without a browser.
 *
 * Krupal's order (2026-10-25): NOTIFY (verified first, then push) -> DRAFT
 * from the JD -> ATS 90 gate -> REFERRAL (correct ask, nothing sent) ->
 * APPROVE -> STUDY. This test runs the REAL functions extracted verbatim
 * from index.html against the REAL data files, so a broken gate or a
 * faked score fails here instead of reaching him.
 *
 *   node scripts/e2e-pipeline.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + (extra ? ' — ' + extra : ''));
  if (!ok) failures++;
}

const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g)
  .map(s => s.replace(/^<script>/, '').replace(/<\/script>$/, ''));
const script = scripts.join('\n');

function extract(src, startMarker) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('not found in index.html: ' + startMarker);
  const j = src.indexOf('{', i);
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (!depth) return src.slice(i, k + 1); }
  }
  throw new Error('unbalanced braces after: ' + startMarker);
}

const need = [
  'function escapeHtml(', 'const SH_ATS_TARGET', 'function shLinkRec(',
  'function shApply(', 'function shClosed(', 'function shFit(',
  'function shStatusOf(', 'function shMd(', 'async function shDraftHtml(',
  'function shReferralsHtml(', 'function shGateHtml(', 'const SH_STEP_LABELS',
];
const parts = need.map(m => extract(script, m));

const jobs = JSON.parse(fs.readFileSync(path.join(REPO, 'data/shrestha-jobs.json'), 'utf8')).jobs;
const links = JSON.parse(fs.readFileSync(path.join(REPO, 'data/apply-links.json'), 'utf8')).links;
const content = JSON.parse(fs.readFileSync(path.join(REPO, 'data/job-content.json'), 'utf8'));

const harness = `
let shJobs = jobs;
let shLinks = links;
let shContent = content;
let shStatus = {};
async function shFetchText(url) {
  const file = url.replace(/^\\//, '');
  try { return fs.readFileSync(path.join(REPO, file), 'utf8'); }
  catch (e) { return null; }
}
${parts.join('\n')}
return { shFit, shApply, shClosed, shStatusOf, shDraftHtml, shReferralsHtml, shGateHtml };
`;
// new Function (not eval): strict-mode eval would hide the extracted
// declarations in its own scope; a constructed function returns them.
const { shFit, shApply, shClosed, shStatusOf, shDraftHtml, shReferralsHtml, shGateHtml } =
  new Function('fs', 'path', 'REPO', 'jobs', 'links', 'content', harness)(fs, path, REPO, jobs, links, content);

(async () => {
  // Every job with a draft must have its draft file on disk and a score.
  for (const [key, c] of Object.entries(content)) {
    if (!c.draft) continue;
    const p = path.join(REPO, c.draft.file);
    check(`draft file exists for ${key}`, fs.existsSync(p));
    check(`draft for ${key} has an ATS score`, typeof c.draft.ats_score === 'number');
    // The 90 gate: a sub-90 draft must never claim the referral is unlocked.
    if (c.draft.ats_score < 90 && c.referrals) {
      check(`referral locked for sub-90 ${key} (ATS ${c.draft.ats_score})`,
        /locked/i.test(c.referrals.status || ''));
    }
  }

  // JLL is the first job run through the full new sequence — check it end to end.
  const j = jobs.find(x => x.key === 'jll-req510700');
  check('JLL job is in the feed', !!j);
  if (j) {
    check('JLL is Eligible (verified fresher intake)', shFit(j).ok, JSON.stringify(shFit(j)));
    check('JLL has a live apply link on JLL\u2019s own site',
      !!(shApply(j) && /jll\.wd1\.myworkdayjobs\.com/.test(shApply(j).url)));
    const live = jobs.filter(x => x.status === 'live' && !shClosed(x));
    const linked = live.filter(x => shFit(x).ok).filter(x => shApply(x));
    check('JLL appears in the main linked list', linked.some(x => x.key === 'jll-req510700'));
    const draft = await shDraftHtml(j);
    check('JLL draft shows ATS 82 and the 90 target', /ATS ~82/.test(draft) && /below the 90 target/.test(draft));
    check('JLL draft says referral stays locked', /referral stays locked/.test(draft));
    const ref = shReferralsHtml(j);
    check('JLL referral is step 3', /sh-stepnum">3<\/span> Referral/.test(ref));
    check('JLL referral is locked below 90', /Locked — ATS ~82 is below the 90 target/.test(ref));
    check('JLL referral invents no names', /No GNIT Hyderabad alumnus at JLL verified/.test(ref));
    check('JLL referral ask is draft-only, nothing sent',
      /draft only — nothing sent/.test(ref) && /Needs Krupal/.test(ref));
    check('JLL referral is never shown as unlocked', !/Unlocked — ATS/.test(ref));
    check('Approval gate moved to step 4', /sh-stepnum">4<\/span> Your approval/.test(shGateHtml(j)));
  }

  // Back-compat: a job with an empty asked list and no referral plan still
  // shows the "no one asked yet" note, not a crash.
  const oracle = jobs.find(x => x.key === 'ig-17916795342430968');
  if (oracle) {
    check('Oracle referral section still renders (empty asked list)',
      /No one asked yet for this role/.test(shReferralsHtml(oracle)));
  }

  if (failures) { console.error(`\n✗ ${failures} pipeline check(s) failed`); process.exit(1); }
  console.log('\n✅ pipeline order holds: notify → draft → ATS 90 → referral → approve');
})().catch(e => { console.error('e2e-pipeline FAIL', e); process.exit(1); });
