#!/bin/bash
npm run build
cp dist/voiceit3.min.js ../dist/voiceit3.min.js
cp dist/voiceit3.min.js ../node-server-example/public/js/voiceit3.min.js
cp dist/voiceit3.min.js ../php-server-example/js/voiceit3.min.js
cp dist/voiceit3.min.js ../go-server-example/public/js/voiceit3.min.js
rm dist/voiceit3.min.js.LICENSE.txt
