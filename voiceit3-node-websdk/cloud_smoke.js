// Cloud smoke test: exercises the Node web-SDK backend against the real
// api.voiceit.io using the voiceit3-testingscripts video fixtures.
// Env: VOICEIT_API_KEY, VOICEIT_API_TOKEN, TEST_DATA (dir with
//      videoEnrollmentA1/2/3.mov + videoVerificationA1.mov).
const VoiceIt = require('./index.js');
const { VOICEIT_API_KEY: KEY, VOICEIT_API_TOKEN: TOK, TEST_DATA: TD } = process.env;
if (!KEY || !TOK) { console.error('Missing VOICEIT_API_KEY/VOICEIT_API_TOKEN'); process.exit(1); }
if (!TD) { console.error('Missing TEST_DATA'); process.exit(1); }
const v = new VoiceIt(KEY, TOK);
const lang = 'en-US', phrase = 'Never forget tomorrow is a new day';
const call = (fn, opts) => new Promise((resolve) => {
  const cb = (data) => resolve(typeof data === 'string' ? JSON.parse(data) : data);
  opts === undefined ? fn(cb) : fn(opts, cb);
});
(async () => {
  let userId, ok = true;
  try {
    let r = await call(v.createUser);
    console.log('createUser:', r.responseCode);
    if (r.responseCode !== 'SUCC') throw new Error('createUser ' + JSON.stringify(r));
    userId = r.userId;
    for (const f of ['videoEnrollmentA1.mov', 'videoEnrollmentA2.mov', 'videoEnrollmentA3.mov']) {
      r = await call(v.createVideoEnrollment, { userId, contentLanguage: lang, phrase, videoFilePath: `${TD}/${f}` });
      console.log('createVideoEnrollment', f + ':', r.responseCode);
      if (r.responseCode !== 'SUCC') throw new Error('enroll ' + f + ' ' + JSON.stringify(r));
    }
    r = await call(v.videoVerification, { userId, contentLanguage: lang, phrase, videoFilePath: `${TD}/videoVerificationA1.mov` });
    console.log('videoVerification:', r.responseCode);
    // SUCC or FAIL are both valid biometric outcomes (the cloud call worked);
    // anything else (network/4xx/5xx) means the SDK->cloud path is broken.
    if (r.responseCode !== 'SUCC' && r.responseCode !== 'FAIL') throw new Error('verify pipeline error ' + JSON.stringify(r));
    console.log('PASSED: node web-SDK backend completed a real enroll/verify cycle against api.voiceit.io');
  } catch (e) {
    console.error('FAILED:', e.message); ok = false;
  } finally {
    if (userId) { try { await call(v.deleteUser, { userId }); console.log('cleanup: deleted ' + userId); } catch (_) {} }
    process.exit(ok ? 0 : 1);
  }
})();
