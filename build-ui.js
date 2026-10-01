const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = String(pkg.version);
if(!/^\d+\.\d+\.\d+$/.test(VERSION)) throw new Error('package.json version must be semver x.y.z');
const parts = [
  'ui-core.part.js',
  'ui-learning.part.js',
  'ui-practice-progress.part.js',
  'ui-plan.part.js',
  'ui-session.part.js',
  'ui-search.part.js',
  'ui-render-ai.part.js',
  'ui-simple-v14.part.js'
];
const dir = path.join(__dirname, 'ui-modules');
const out = parts.map((p, i) => `\n/* ===== UI MODULE ${i + 1}: ${p} ===== */\n` + fs.readFileSync(path.join(dir, p), 'utf8')).join('\n');
fs.writeFileSync(path.join(__dirname, 'ui.js'), `/* Dakshinamurthy UI production bundle — ${VERSION}. Generated; edit ui-modules instead. */\n` + out);
const intelligencePath=path.join(__dirname,'intelligence.js');
let intelligence=fs.readFileSync(intelligencePath,'utf8').replace("SM.VERSION='__VERSION__'", `SM.VERSION='${VERSION}'`);
fs.writeFileSync(intelligencePath,intelligence);
const indexPath=path.join(__dirname,'index.html');
let index=fs.readFileSync(indexPath,'utf8').replace(/(<meta name=\"application-version\" content=\")[^\"]+(\")/, `$1${VERSION}$2`);
fs.writeFileSync(indexPath,index);
const swPath=path.join(__dirname,'sw.js');
let sw=fs.readFileSync(swPath,'utf8').replace(/CACHE_NAME='dakshinamurthy-v[^']*'/, `CACHE_NAME='dakshinamurthy-v${VERSION}'`).replace(/RELEASE='[^']*'/, `RELEASE='${VERSION}'`);
fs.writeFileSync(swPath,sw);
console.log(`Built ui.js from ${parts.length} modules (${out.split(/\r?\n/).length} lines), release ${VERSION}.`);
