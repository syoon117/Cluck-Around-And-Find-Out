// Captures store screenshots, the trailer / app preview, the Google Play feature graphic and the
// itch.io cover straight from the game, so they can be regenerated whenever the game changes.
//
//   node tools/capture-store-assets.js            (needs Playwright + Chromium, and ffmpeg)
//   PLAYWRIGHT=/path/to/playwright node tools/...  (if Playwright isn't resolvable normally)
//
// Output goes to store/ (see store/README.md for what each file is for).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const GAME = 'file://' + path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'store');
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cluck-capture-'));
const mk = (...p) => { const d = path.join(OUT, ...p); fs.mkdirSync(d, { recursive: true }); return d; };
const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const wait = (p, ms) => p.waitForTimeout(ms);

// Store sizes. App Store: 6.9" iPhone portrait; Google Play: 9:16 phone.
const SIZES = {
  appstore: { w: 1320, h: 2868, vw: 440, vh: 956, scale: 3 },
  play: { w: 1080, h: 1920, vw: 360, vh: 640, scale: 3 },
};

const CAPTIONS = [
  ['01-tap', 'Tap the cup.', "Don't touch the bell."],
  ['02-dont-tap', 'It took the cup.', 'DO NOT TAP.'],
  ['03-smack', 'Trick it.', 'Then SMACK it.'],
  ['04-finisher', 'Finish it.', 'HAAAAWWWWW'],
  ['05-packs', '44 ridiculous things', 'to smack it with'],
  ['06-faster', 'It gets faster.', 'And it learns your habits.'],
];

async function openGame(browser, size, opts = {}) {
  const page = await browser.newPage({ viewport: { width: size.vw, height: size.vh }, deviceScaleFactor: size.scale });
  await page.goto(GAME);
  await wait(page, 400);
  await page.evaluate((o) => {
    const c = window.__cluck;
    c.save.intro = false; c.save.tutDone = true; c.save.eggs = 999; c.save.sfx = o.sound || false; c.save.music = o.sound || false;
    ['pan', 'baguette', 'plunger', 'duck', 'sink', 'goose', 'eggplant', 'guitar', 'anvil', 'cone'].forEach((k) => (c.save.items[k] = true));
  }, opts);
  if (opts.hideControls) await page.addStyleTag({ content: '#controls,#btnPause,#btnSkipTut{display:none!important}' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// a bot that taps on every beat (dodging when the chicken holds the cup); returns a stop function
async function startBot(page, mode = 'tap') {
  await page.evaluate((mode) => {
    const { G, press } = window.__cluck;
    window.__botMode = mode; let lastM = -1;
    clearInterval(window.__bot);
    window.__bot = setInterval(() => {
      if (G.scene === 'ready' && window.__botMode !== 'idle') { if (Sfx.now() - G.ready.t0 > 0.5) press('tap'); return; }
      if (G.scene !== 'play') return;
      const now = Sfx.now() - Sfx.latency(), m = G.nextPlayer, t = G.t0 + m * G.T;
      // generous timing: page rendering slows down while recording, so don't demand frame-perfect presses
      if (m === lastM || now < t - 0.03 || now > t + Math.min(0.09, G.W * 0.6)) return;
      lastM = m;
      if (window.__botMode === 'idle') return;
      if (G.cup === 'chicken') { if (window.__botMode === 'bell') press('tap'); return; }
      if (G.cup === 'player') { press('tap'); return; }
      if (window.__botMode === 'take' && G.streakP >= 3) { press('grab'); G.trickP = 1; window.__botMode = 'tap'; return; }
      press('tap');
    }, 2);
  }, mode);
}

// make the chicken grab the cup on its next unplanned beat (keeps captures short and on cue)
const forceGrab = (page) => page.evaluate(() => {
  const G = window.__cluck.G;
  for (let n = G.nextChick; n < G.nextChick + 6; n += 2) { G.beats[n] = G.beats[n] || {}; if (!G.beats[n].intent) { G.beats[n].intent = { grab: true, fake: false, tell: true }; break; } }
});

// ---------- screenshots ----------
async function rawScenes(browser, key) {
  const size = SIZES[key];
  const dir = path.join(TMP, key); fs.mkdirSync(dir, { recursive: true });
  const shot = (page, name) => page.screenshot({ path: path.join(dir, name + '.png') });
  let p;

  // 1: mid-rally, ring closing on the cup
  p = await openGame(browser, size);
  await p.evaluate(() => window.__cluck.startLevel(3));
  await startBot(p, 'tap');
  await p.waitForFunction(() => { const G = window.__cluck.G; if (G.scene !== 'play' || G.cup !== 'on') return false; const d = G.t0 + G.nextPlayer * G.T - Sfx.now(); return d > 0.55 * G.T && d < 0.8 * G.T && G.nextPlayer > 3; }, null, { timeout: 20000 });
  await shot(p, '01-tap'); await p.close();

  // 2: the chicken took the cup (level 2 shows the DON'T TAP warning)
  p = await openGame(browser, size);
  await p.evaluate(() => window.__cluck.startLevel(2));
  await startBot(p, 'tap');
  await p.waitForFunction(() => window.__cluck.G.nextChick >= 4, null, { timeout: 20000 });
  await forceGrab(p);
  await p.waitForFunction(() => window.__cluck.G.cup === 'chicken', null, { timeout: 20000 });
  await wait(p, 260);
  await shot(p, '02-dont-tap'); await p.close();

  // 3: frozen, weapon raised, chicken cowering
  p = await openGame(browser, size);
  await p.evaluate(() => { const c = window.__cluck; c.startLevel(5); c.G.scene = 'play'; c.readySmack(); c.G.ready.weapon = 'sink'; });
  await wait(p, 900);
  await shot(p, '03-smack'); await p.close();

  // 4: mid-squeeze
  p = await openGame(browser, size);
  await p.evaluate(() => { const c = window.__cluck; c.startLevel(7); c.startFinisher(); });
  await wait(p, 1000);
  await p.evaluate(() => window.__cluck.finHold(true));
  await wait(p, 1500);
  await shot(p, '04-finisher'); await p.close();

  // 5: a pack opening with a good pull
  p = await openGame(browser, size);
  await p.evaluate(() => window.__cluck.showPack([
    { k: 'goose', isNew: true, back: 0 }, { k: 'guitar', isNew: true, back: 0 }, { k: 'eggplant', isNew: true, back: 0 },
    { k: 'duck', isNew: false, back: 3 }, { k: 'extinguisher', isNew: true, back: 0 }], 3));
  await wait(p, 2600);
  await shot(p, '05-packs'); await p.close();

  // 6: level 24, the chicken has read you
  p = await openGame(browser, size);
  await p.evaluate(() => { const c = window.__cluck; c.startLevel(24); });
  await startBot(p, 'tap');
  await p.waitForFunction(() => { const G = window.__cluck.G; if (G.scene !== 'play' || G.cup !== 'on' || G.nextPlayer < 5) return false; G.habit = [5, 5]; G.streakP = 5; const d = G.t0 + G.nextPlayer * G.T - Sfx.now(); return d > 0.5 * G.T && d < 0.9 * G.T; }, null, { timeout: 20000 });
  await shot(p, '06-faster'); await p.close();
  return dir;
}

async function composeCaptioned(browser, key, rawDir) {
  const size = SIZES[key];
  const outDir = mk(key === 'appstore' ? 'app-store' : 'google-play', 'screenshots');
  const rawOut = mk(key === 'appstore' ? 'app-store' : 'google-play', 'screenshots-raw');
  const page = await browser.newPage({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1 });
  const fontCss = fs.readFileSync(path.join(ROOT, 'fonts', 'fonts.css'), 'utf8')
    .replace(/url\('([^']+)'\)/g, (m, f) => `url('data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', f)).toString('base64')}')`);
  for (const [name, l1, l2] of CAPTIONS) {
    const raw = path.join(rawDir, name + '.png');
    fs.copyFileSync(raw, path.join(rawOut, name + '.png'));
    const img = 'data:image/png;base64,' + fs.readFileSync(raw).toString('base64');
    const k = size.w / 1080;
    await page.setContent(`<style>${fontCss}
      body{margin:0;width:${size.w}px;height:${size.h}px;overflow:hidden;background:radial-gradient(circle at 50% 30%,#1d6b5f,#0b2c29 70%);font-family:'Rammetto One',sans-serif}
      .cap{position:absolute;top:${70 * k}px;left:0;right:0;text-align:center;line-height:1.05}
      .l1{color:#fff3c4;font-size:${74 * k}px;-webkit-text-stroke:${5 * k}px #1d120a;paint-order:stroke fill}
      .l2{color:#ffd23f;font-size:${88 * k}px;-webkit-text-stroke:${6 * k}px #1d120a;paint-order:stroke fill;margin-top:${10 * k}px;text-shadow:${6 * k}px ${6 * k}px 0 #c8352a}
      .shot{position:absolute;left:50%;bottom:${-40 * k}px;width:${size.w * 0.8}px;transform:translateX(-50%) rotate(-1.5deg);border:${10 * k}px solid #1d120a;border-radius:${56 * k}px;box-shadow:${18 * k}px ${18 * k}px 0 rgba(0,0,0,.45)}
    </style><div class="cap"><div class="l1">${l1}</div><div class="l2">${l2}</div></div><img class="shot" src="${img}">`);
    await page.evaluate(() => document.fonts.ready);
    await wait(page, 100);
    await page.screenshot({ path: path.join(outDir, name + '.png') });
  }
  await page.close();
}

// ---------- graphics ----------
async function renderCard(browser, w, h, file, layout) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(GAME);
  await wait(page, 300);
  await page.evaluate(({ w, h, layout }) => {
    document.body.innerHTML = '';
    const c = document.createElement('canvas'); c.width = w; c.height = h; document.body.appendChild(c);
    document.body.style.margin = '0';
    const x = c.getContext('2d');
    const g = x.createRadialGradient(w * 0.7, h * 0.45, 10, w * 0.7, h * 0.45, w * 0.8);
    g.addColorStop(0, '#1d6b5f'); g.addColorStop(1, '#0b2c29'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#6b2513'; x.fillRect(0, h * 0.78, w, h * 0.22);
    const s = layout.chickenScale;
    D.chicken(x, { x: layout.cx, y: layout.cy, scale: s, neck: 0.55, mouth: 1, eyes: 'bulge', bulge: 0.7, skin: 0, t: 0.3, legs: true });
    D.glove(x, layout.cx - 125 * s, layout.cy + 20 * s, 1.1 * s, Math.PI / 2 + 0.2, 'grip');
    D.glove(x, layout.cx + 125 * s, layout.cy + 20 * s, 1.1 * s, -Math.PI / 2 - 0.2, 'grip');
    x.save(); x.translate(layout.wx, layout.wy); x.rotate(-0.5); x.scale(layout.ws, layout.ws); D.weapon(x, 'pan', 0); x.restore();
    const t = (str, px, py, size, fill) => D.text(x, str, px, py, size, fill, { align: layout.align, lw: size * 0.16 });
    t('CLUCK AROUND', layout.tx, layout.ty, layout.ts, '#ffd23f');
    t('AND FIND OUT', layout.tx, layout.ty + layout.ts * 1.05, layout.ts * 0.72, '#fff3c4');
    if (layout.tag) D.text(x, layout.tag, layout.tx, layout.ty + layout.ts * 2, layout.ts * 0.32, '#fff3c4', { align: layout.align, font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 5 });
  }, { w, h, layout });
  await page.evaluate(() => document.fonts.ready);
  await wait(page, 200);
  await page.locator('canvas').screenshot({ path: file });
  await page.close();
}

// ---------- trailer ----------
// Records the real game (canvas + audio) while a script plays it, then cuts it into store videos.
async function recordTrailer(browser, vw, vh, outFile) {
  const page = await openGame(browser, { vw, vh, scale: 2 }, { sound: true, hideControls: true });
  await page.evaluate(() => { Sfx.init(); Sfx.musicOn = true; Sfx.sfxOn = true; });
  await page.evaluate(() => {
    const canvas = document.getElementById('cv');
    const tracks = [...canvas.captureStream(30).getVideoTracks(), ...Sfx.stream().getAudioTracks()];
    const type = ['video/webm;codecs=vp9,opus', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
    window.__rec = new MediaRecorder(new MediaStream(tracks), { mimeType: type, videoBitsPerSecond: 12e6 });
    window.__chunks = [];
    window.__rec.ondataavailable = (e) => e.data.size && window.__chunks.push(e.data);
    window.__rec.start(200);
  });
  // 1. hook: the finisher scream (about 4.5 s)
  await page.evaluate(() => { const c = window.__cluck; c.startLevel(9); c.startFinisher(); });
  await wait(page, 950);
  await page.evaluate(() => window.__cluck.finHold(true));
  await wait(page, 2600);
  await page.evaluate(() => window.__cluck.finHold(false));
  await wait(page, 900);
  // 2. a rally at level 3: dodge a grab, take the cup, SMACK (about 10 s)
  await page.evaluate(() => window.__cluck.startLevel(3));
  await startBot(page, 'tap');
  await page.waitForFunction(() => window.__cluck.G.nextChick >= 4, null, { timeout: 15000 }).catch(() => {});
  await forceGrab(page);
  await page.waitForFunction(() => window.__cluck.G.cup === 'chicken', null, { timeout: 15000 }).catch(() => {});
  await wait(page, 1100);
  await page.evaluate(() => { window.__botMode = 'take'; });
  await page.waitForFunction(() => window.__cluck.G.scene === 'ready' || window.__cluck.G.smack, null, { timeout: 20000, polling: 10 }).catch(() => {});
  await page.evaluate(() => { const G = window.__cluck.G; if (G.scene === 'ready' && G.ready) G.ready.weapon = 'goose'; });
  await page.waitForFunction(() => window.__cluck.G.scene === 'play' && !window.__cluck.G.smack, null, { timeout: 8000 }).catch(() => {});
  // 3. level 20, 400 BPM, then you blow it and get bonked (about 5 s)
  await page.evaluate(() => { window.__cluck.startLevel(20); window.__botMode = 'tap'; });
  await wait(page, 3200);
  await page.evaluate(() => { window.__botMode = 'idle'; });
  await page.waitForFunction(() => window.__cluck.G.smack && window.__cluck.G.smack.hit, null, { timeout: 10000 }).catch(() => {});
  await wait(page, 1200);
  const b64 = await page.evaluate(() => new Promise((res) => {
    window.__rec.onstop = async () => {
      const buf = new Uint8Array(await new Blob(window.__chunks).arrayBuffer());
      let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      res(btoa(s));
    };
    window.__rec.stop();
  }));
  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
  await page.close();
}

async function endCard(browser, w, h, file) {
  await renderCard(browser, w, h, file, {
    cx: w * 0.5, cy: h * 0.62, chickenScale: w / 620, wx: w * 0.2, wy: h * 0.9, ws: w / 900,
    tx: w * 0.5, ty: h * 0.16, ts: w * 0.085, align: 'center', tag: 'Tap. Steal. Smack. Free to play.',
  });
}

function buildVideo(raw, card, w, h, out) {
  // game footage (scaled to fill), then a 2.5 s end card; H.264 + AAC at 30 fps for both stores
  ffmpeg(['-i', raw, '-loop', '1', '-t', '2.5', '-i', card, '-f', 'lavfi', '-t', '2.5', '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex',
    `[0:v]trim=0:26.5,setpts=PTS-STARTPTS,fps=30,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1,format=yuv420p[v0];` +
    `[1:v]fps=30,scale=${w}:${h},setsar=1,format=yuv420p,fade=t=in:st=0:d=0.3[v1];` +
    `[0:a]atrim=0:26.5,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a0];[2:a]aformat=channel_layouts=stereo[a1];` +
    `[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]`,
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '18',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-t', '29.5', out]);
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const key of ['appstore', 'play']) {
    const raw = await rawScenes(browser, key);
    await composeCaptioned(browser, key, raw);
    console.log('screenshots:', key);
  }
  await renderCard(browser, 1024, 500, path.join(mk('google-play'), 'feature-graphic-1024x500.png'), {
    cx: 845, cy: 345, chickenScale: 0.82, wx: 640, wy: 480, ws: 0.55, tx: 56, ty: 150, ts: 62, align: 'left', tag: 'Tap the cup. Steal the cup. Smack the chicken.',
  });
  await renderCard(browser, 630, 500, path.join(mk('itch'), 'cover-630x500.png'), {
    cx: 505, cy: 365, chickenScale: 0.62, wx: 360, wy: 480, ws: 0.45, tx: 30, ty: 300, ts: 44, align: 'left', tag: 'A reflex game vs. a rubber chicken',
  });
  console.log('graphics done');
  const tdir = mk('trailer');
  for (const [w, h, name] of [[1080, 1920, 'trailer-1080x1920.mp4'], [886, 1920, 'app-preview-886x1920.mp4']]) {
    const raw = path.join(TMP, `raw-${w}.webm`), card = path.join(TMP, `card-${w}.png`);
    await recordTrailer(browser, w / 2, h / 2, raw);
    await endCard(browser, w, h, card);
    buildVideo(raw, card, w, h, path.join(tdir, name));
    console.log('video:', name);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
