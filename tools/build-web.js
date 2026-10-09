// Copies just the game files into www/ (the folder Capacitor and the itch.io zip are built from).
//   node tools/build-web.js            -> www/
//   node tools/build-web.js --itch     -> www/ + store/itch/cluck-around-and-find-out-web.zip
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const FILES = ['index.html', 'privacy.html', 'manifest.webmanifest', 'sw.js', 'js', 'fonts', 'icons'];

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW);
for (const f of FILES) fs.cpSync(path.join(ROOT, f), path.join(WWW, f), { recursive: true });
console.log('built www/ with', FILES.join(', '));

if (process.argv.includes('--itch')) {
  const zip = path.join(ROOT, 'store', 'itch', 'cluck-around-and-find-out-web.zip');
  fs.mkdirSync(path.dirname(zip), { recursive: true });
  fs.rmSync(zip, { force: true });
  // index.html must sit at the root of the zip for itch.io's HTML player
  execFileSync('zip', ['-r', '-X', '-q', zip, '.'], { cwd: WWW });
  console.log('itch.io zip:', path.relative(ROOT, zip), Math.round(fs.statSync(zip).size / 1024) + ' KB');
}
