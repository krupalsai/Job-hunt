/* Offline regression tests: no production credentials or network requests.
   Run: npm install && npm run test:feed-privacy */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'api/feed.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
let reads = 0, writes = 0;
const query = { select() { return this; }, order() { return this; }, limit() { return this; }, lt() { return this; }, eq() { return this; },
  then(resolve) { reads++; return Promise.resolve({ data: [{id: 1, title: 'Test'}], error: null }).then(resolve); },
  insert() { writes++; return { select() { return { single: async () => ({ data: {id: 1, created_at: '2026-10-07'}, error: null }) }; } }; },
  delete() { writes++; return {eq: async () => ({error: null})}; }
};
const key = 'test-owner-only-key-32-characters-long';
const writer = 'test-publishing-key-32-characters-long';
function makeHandler(secret = key) {
  const module = { exports: {} };
  vm.runInNewContext(js, { module, exports: module.exports, process: {env: {
    SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'mock-service-key', INSTINCT_FEED_READ_SECRET: secret, INSTINCT_FEED_SECRET: writer
  }}, console, require(name) { return name === '@supabase/supabase-js' ? { createClient: () => ({ from: () => query }) } : require(name); }});
  return module.exports.default;
}
async function call(token, method = 'GET', handler = makeHandler()) {
  const res = { headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({method, headers: token === undefined ? {} : {authorization: 'Bearer ' + token}, query: {}, body: {type:'note', title:'Test', body:'Test'}}, res);
  assert.match(res.headers['Cache-Control'], /private.*no-store/);
  assert.equal(res.headers['Vercel-CDN-Cache-Control'], 'no-store');
  assert.equal(res.headers.Vary, 'Authorization');
  return res;
}
(async () => {
  for (const token of [undefined, '', 'wrong', writer]) assert.equal((await call(token)).code, 401);
  assert.equal(reads, 0, 'unauthorized GET must not query Supabase');
  assert.equal((await call(key)).code, 200);
  assert.equal(reads, 1);
  for (const secret of ['', 'short', writer]) assert.equal((await call(key, 'GET', makeHandler(secret))).code, 401);
  for (const method of ['POST','DELETE']) assert.equal((await call(key, method)).code, 401, 'reader cannot write');
  assert.equal(writes, 0);
  assert.equal((await call(writer, 'POST')).code, 200);
  assert.equal(writes, 1, 'existing writer still works');
  const reader = fs.readFileSync(path.join(root,'app/feed.js'),'utf8');
  assert.ok(!/SUPABASE_KEY|rest\/v1|localStorage|sessionStorage/.test(reader));
  assert.ok(reader.includes('cache: "no-store"'));
  const sql = fs.readFileSync(path.join(root,'supabase/migrations/0008_private_instinct_posts.sql'),'utf8');
  assert.ok(sql.includes('enable row level security'));
  assert.ok(sql.includes('from public, anon, authenticated'));
  console.log('PASS: feed authorization, no-store, separate read/write scopes, fail-closed config, reader and migration checks');
})().catch(error => { console.error(error); process.exitCode = 1; });
