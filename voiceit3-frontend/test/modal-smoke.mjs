// Headless smoke test for the modal builder.
//
// Regression guard for the v3.0.15 fix: an orphaned blueprint element (leftover
// active-liveness-challenge UI) with no 'parent' made buildModal throw
// "Cannot read properties of undefined (reading 'appendChild')" inside a promise
// chain with no handler, so the record button was never created and the modal
// never showed — breaking every video enroll/verify.
//
// This drives a real headless Chromium with a fake camera through
// encapsulatedVideoEnrollment (which runs initiate() -> modal.build() before any
// camera/network step) and asserts the record button (.viReadyButton) is built
// and that no appendChild crash occurred. Backend + wasm are stubbed, so the test
// needs no live API and no secrets.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// CI resolves 'playwright' from devDependencies; local runs may point PW_DIR at a cached install.
const { chromium } = require(process.env.PW_DIR ? path.join(process.env.PW_DIR, 'playwright') : 'playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, '..', 'dist');
const bundle = path.join(distDir, 'voiceit3.min.js');
if (!fs.existsSync(bundle)) {
  console.error('SMOKE SETUP ERROR: bundle not found — run "npm run build" first:', bundle);
  process.exit(2);
}

const HARNESS = `<!doctype html><html><head><meta charset="utf-8"></head>
<body><div id="app"></div>
<script src="/voiceit3.min.js"></script>
<script>
  window.startEnroll = function(){
    var v = voiceit3.initialize('/api/', 'en-US');
    v.setSecureToken('smoke-test-token');
    v.encapsulatedVideoEnrollment({
      phrase: 'never forget tomorrow',
      contentLanguage: 'en-US',
      completionCallback: function(){}
    });
  };
</script></body></html>`;

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(HARNESS); return; }
  if (url === '/voiceit3.min.js') { res.writeHead(200, { 'Content-Type': 'application/javascript' }); fs.createReadStream(bundle).pipe(res); return; }
  if (url === '/face_detector.wasm') {
    const w = path.join(distDir, 'face_detector.wasm');
    if (fs.existsSync(w)) { res.writeHead(200, { 'Content-Type': 'application/wasm' }); fs.createReadStream(w).pipe(res); return; }
  }
  // Stub every backend/API call so the enroll flow never hangs.
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}');
});

function fail(msg) { console.error('SMOKE FAIL: ' + msg); process.exitCode = 1; }

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port + '/';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}),
});
try {
  const ctx = await browser.newContext({ permissions: ['camera', 'microphone'] });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(base, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => window.startEnroll());

  let built = false;
  try { await page.waitForSelector('.viReadyButton', { timeout: 15000 }); built = true; } catch { built = false; }

  const appendChildCrash = pageErrors.some((m) => /reading 'appendChild'|appendChild/.test(m));

  console.log('record button (.viReadyButton) built :', built);
  console.log('appendChild crash present           :', appendChildCrash);
  if (pageErrors.length) console.log('page errors:', pageErrors.join(' | '));

  if (appendChildCrash) fail('buildModal threw an appendChild TypeError (orphaned blueprint element regression).');
  if (!built) fail('video-enrollment modal did not build a record button.');
  if (!process.exitCode) console.log('SMOKE PASS: video-enrollment modal built with a record button and no appendChild crash.');
} finally {
  await browser.close();
  server.close();
}
