// Draws the native app icons and splash screens from the game's own chicken art and writes them
// into the Capacitor projects (replacing Capacitor's placeholder images).
//   node tools/make-native-art.js      (needs Playwright with Chromium, and ffmpeg)
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cluck-art-'));
const BG = '#0b2c29';

async function draw(page, size, kind) {
  const url = await page.evaluate(({ size, kind, BG }) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d');
    if (kind !== 'foreground') {
      const g = x.createRadialGradient(size / 2, size * 0.45, size * 0.05, size / 2, size / 2, size * 0.75);
      g.addColorStop(0, '#1d6b5f'); g.addColorStop(1, BG);
      x.fillStyle = g; x.fillRect(0, 0, size, size);
    }
    const k = size / 512;
    x.save(); x.translate(size / 2, size / 2);
    if (kind === 'icon') { x.scale(k, k); D.chicken(x, { x: 0, y: 385, scale: 1.75, neck: 0.25, mouth: 1, eyes: 'bulge', bulge: 0.6, skin: 0, t: 0 }); }
    if (kind === 'foreground') { x.scale(k * 0.6, k * 0.6); D.chicken(x, { x: 0, y: 385, scale: 1.75, neck: 0.25, mouth: 1, eyes: 'bulge', bulge: 0.6, skin: 0, t: 0 }); }
    if (kind === 'splash') {
      x.scale(k * 0.28, k * 0.28);
      D.chicken(x, { x: 0, y: 160, scale: 1.3, neck: 0.4, mouth: 1, eyes: 'wide', skin: 0, t: 0, legs: true });
      D.text(x, 'CLUCK AROUND', 0, -330, 92, '#ffd23f');
      D.text(x, 'AND FIND OUT', 0, -230, 64, '#fff3c4');
    }
    x.restore();
    return c.toDataURL('image/png');
  }, { size, kind, BG });
  const file = path.join(TMP, `${kind}-${size}.png`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  return file;
}
const dims = (f) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim().split(',').map(Number);
const resize = (src, dst, w, h, opaque) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf',
  `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}${opaque ? ',format=rgb24' : ''}`, dst]);
const center = (src, dst, w, h) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=${BG}:s=${w}x${h}`, '-i', src,
  '-filter_complex', `[1]scale=${Math.min(w, h)}:${Math.min(w, h)}[s];[0][s]overlay=(W-w)/2:(H-h)/2:format=auto,format=rgb24`, '-frames:v', '1', dst]);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  const icon = await draw(page, 1024, 'icon');
  const fg = await draw(page, 432, 'foreground');
  const splash = await draw(page, 2732, 'splash');
  await b.close();

  // iOS: single 1024 icon (no transparency allowed) + splash
  resize(icon, path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'), 1024, 1024, true);
  for (const f of fs.readdirSync(path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset')).filter((n) => n.endsWith('.png'))) {
    const p = path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset', f); const [w, h] = dims(p); center(splash, p, w, h);
  }
  // Android: legacy + round launcher icons, adaptive foreground, splash screens
  const res = path.join(ROOT, 'android/app/src/main/res');
  for (const dir of fs.readdirSync(res)) {
    for (const f of fs.readdirSync(path.join(res, dir)).filter((n) => n.endsWith('.png'))) {
      const p = path.join(res, dir, f); const [w, h] = dims(p);
      if (f === 'ic_launcher.png' || f === 'ic_launcher_round.png') resize(icon, p, w, h, true);
      else if (f === 'ic_launcher_foreground.png') resize(fg, p, w, h, false);
      else if (f === 'splash.png') center(splash, p, w, h);
    }
  }
  const bgXml = path.join(res, 'values/ic_launcher_background.xml');
  if (fs.existsSync(bgXml)) fs.writeFileSync(bgXml, fs.readFileSync(bgXml, 'utf8').replace(/#[0-9A-Fa-f]{6}/, BG.toUpperCase()));
  console.log('native icons and splash screens written');
})().catch((e) => { console.error(e); process.exit(1); });
