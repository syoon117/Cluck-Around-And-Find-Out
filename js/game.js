// Cluck Around and Find Out — game logic.
//
// The rhythm: beats alternate CHICKEN (even n) / YOU (odd n). Each side taps the cup on its own beat.
// On your beat you can GRAB the cup instead. If the other side then slams down on the open bell: DING, they get smacked.
// Whoever holds the cup has to put it back on their next beat. Miss your beat and you get smacked too.
(() => {
  const canvas = document.getElementById('cv');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  // ---------- content ----------
  // Everything the chicken can hit you with. You collect them from Mystery Packs and smack it back.
  // r: rarity (starter items are owned from the start). snd: impact sound in audio.js.
  const WEAPONS = {
    hand: { name: 'Bare Hand', r: 'starter', snd: 'slap' },
    tray: { name: 'Cafeteria Tray', r: 'starter', snd: 'clang' },
    // common
    pan: { name: 'Frying Pan', r: 'common', snd: 'clang' },
    baguette: { name: 'Baguette', r: 'common', snd: 'crunch' },
    plunger: { name: 'Plunger', r: 'common', snd: 'thwop' },
    sock: { name: 'Wet Sock', r: 'common', snd: 'wet' },
    duck: { name: 'Rubber Duck', r: 'common', snd: 'duck' },
    noodle: { name: 'Pool Noodle', r: 'common', snd: 'foam' },
    spoon: { name: 'Wooden Spoon', r: 'common', snd: 'knock' },
    newspaper: { name: 'Rolled-Up Newspaper', r: 'common', snd: 'crinkle' },
    banana: { name: 'Banana', r: 'common', snd: 'splat' },
    spatula: { name: 'Spatula', r: 'common', snd: 'slap' },
    sponge: { name: 'Soggy Sponge', r: 'common', snd: 'wet' },
    phone: { name: 'Flip Phone', r: 'common', snd: 'clack' },
    cucumber: { name: 'Cucumber', r: 'common', snd: 'knock' },
    brush: { name: 'Toilet Brush', r: 'common', snd: 'wet' },
    // rare
    cone: { name: 'Traffic Cone', r: 'rare', snd: 'bonk' },
    keyboard: { name: 'Keyboard', r: 'rare', snd: 'clack' },
    chancla: { name: 'Chancla', r: 'rare', snd: 'slap' },
    fish: { name: 'Rubber Fish', r: 'rare', snd: 'wet' },
    eggplant: { name: 'Eggplant', r: 'rare', snd: 'splat' },
    bat: { name: 'Foam Bat', r: 'rare', snd: 'foam' },
    guitar: { name: 'Electric Guitar', r: 'rare', snd: 'twang', len: 300 },
    mop: { name: 'Wet Mop', r: 'rare', snd: 'wet', len: 260 },
    shovel: { name: 'Shovel', r: 'rare', snd: 'clang' },
    roast: { name: 'Rotisserie Chicken', r: 'rare', snd: 'splat' },
    skateboard: { name: 'Skateboard', r: 'rare', snd: 'knock', len: 250 },
    croissant: { name: 'Croissant', r: 'rare', snd: 'crunch' },
    racket: { name: 'Tennis Racket', r: 'rare', snd: 'knock' },
    toiletseat: { name: 'Toilet Seat', r: 'rare', snd: 'knock' },
    // epic
    junior: { name: 'Chicken Jr.', r: 'epic', snd: 'squeak' },
    stopsign: { name: 'Stop Sign', r: 'epic', snd: 'clang', len: 250 },
    extinguisher: { name: 'Fire Extinguisher', r: 'epic', snd: 'spray' },
    bowlingpin: { name: 'Bowling Pin', r: 'epic', snd: 'knock' },
    purse: { name: "Grandma's Purse", r: 'epic', snd: 'thud', len: 250 },
    mic: { name: 'Microphone', r: 'epic', snd: 'feedback' },
    trophy: { name: 'Participation Trophy', r: 'epic', snd: 'clang' },
    lollipop: { name: 'Giant Lollipop', r: 'epic', snd: 'knock', len: 250 },
    // legendary
    wobbler: { name: 'The Purple Wobbler', r: 'legendary', snd: 'boing' },
    anvil: { name: 'Anvil', r: 'legendary', snd: 'anvil' },
    sink: { name: 'The Kitchen Sink', r: 'legendary', snd: 'anvil', len: 270 },
    goldpan: { name: 'Golden Frying Pan', r: 'legendary', snd: 'gold' },
    goose: { name: 'A Live Goose', r: 'legendary', snd: 'honk', len: 250 },
    cactus: { name: 'Cactus', r: 'legendary', snd: 'thud' },
  };
  const RARITY = {
    starter: { label: 'Starter', color: '#fff3c4', refund: 0 },
    common: { label: 'Common', color: '#cfd6dc', weight: 60, refund: 3 },
    rare: { label: 'Rare', color: '#4da3ff', weight: 27, refund: 8 },
    epic: { label: 'Epic', color: '#b56bff', weight: 10, refund: 20 },
    legendary: { label: 'Legendary', color: '#ffb800', weight: 3, refund: 50 },
  };
  // One pack type: 5 random items, at least one Rare or better. Duplicates turn into eggs.
  // `product` is the in-app purchase id to sell it under in the App Store build.
  const MYSTERY = { name: 'Mystery Pack', count: 5, price: 60, product: 'mystery_pack_5' };
  const FINISHERS = [
    { id: 'choke', name: 'Choke the Chicken', price: 0, blurb: 'Hold to squeeze. The classic HAAAWWW.' },
    { id: 'yeet', name: 'Window Yeet', price: 45, blurb: 'Wind it up, let go, straight out the window.' },
    { id: 'helium', name: 'Helium Huff', price: 70, blurb: 'Squeeze it bigger and higher until it pops.' },
    { id: 'bass', name: 'Bass Boosted', price: 100, blurb: 'Slow-mo, deep-fried, extremely loud.' },
  ];
  const NAMES = ["Lil' Squeaker", 'Gary', 'Big Green', 'Nugget', 'Keychain Kevin', 'Sir Honksalot', 'Drumstick Dan', 'The Squeakfather', 'Cluckzilla', 'Henrietta the Unhinged'];
  const SKIN_BY_LEVEL = [0, 0, 1, 0, 2, 3, 0, 4, 1, 2];
  const TAUNTS = ['get clucked', 'BAWK BAWK BOZO', 'skill issue', 'sit down', 'cluck around...', '...find out', 'too slow, meat'];
  const OUCH = ['SQUEAK!', 'ow my beak', 'rude!!', 'HONK', 'not the face'];

  // Tempo curve: the one knob for difficulty. Seconds between beats (yours and the chicken's alternate).
  // ~105 BPM at level 1, ~250 at 10, ~400 at 20, ~490 by 40: past ~15 you can't react, you have to read the chicken.
  // Ranked always uses ramp 1 so everyone's level means the same thing. Custom scales how fast it climbs.
  const tempoFor = (lv, ramp = 1) => 0.12 + 0.45 * Math.exp(-((lv - 1) * ramp) / 7);
  const RAMPS = [{ v: 0.5, label: 'Slow burn' }, { v: 1, label: 'Standard' }, { v: 2, label: 'Fast' }, { v: 4, label: 'Unhinged' }];
  const ranked = () => save.mode !== 'custom';
  const curRamp = () => (ranked() ? 1 : save.ramp);
  const customKey = () => String(save.ramp);
  const modeBest = () => (ranked() ? save.best : save.customBest[customKey()] || 1);
  const RANKS = [[1, 'Raw Egg'], [5, 'Chick'], [10, 'Spring Chicken'], [15, 'Rooster'], [20, 'Cock of the Walk'], [30, 'Fowl Play'],
    [40, 'Poultry-geist'], [50, 'Chicken Choker'], [75, 'Colonel of Chaos'], [100, 'The Final Squeak']];
  const rankFor = (lv) => RANKS.filter(([min]) => lv >= min).pop()[1];

  // ---------- save data ----------
  const SAVE_KEY = 'cluck-around-save-v1';
  const DEFAULTS = { eggs: 60, items: { hand: true, tray: true }, packs: {}, fins: { choke: true }, fin: 'choke', best: 1, mode: 'ranked', ramp: 2, customBest: {}, music: true, sfx: true, intro: true, tutorialDone: false };
  let save = (() => {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); return Object.assign({}, DEFAULTS, s, { packs: Object.assign({ starter: true }, s.packs), fins: Object.assign({ choke: true }, s.fins), customBest: Object.assign({}, s.customBest), items: Object.assign({ hand: true, tray: true }, s.items) }); }
    catch (e) { return JSON.parse(JSON.stringify(DEFAULTS)); }
  })();
  // older saves bought themed packs; hand over their items
  const OLD_PACKS = { kitchen: ['pan', 'baguette'], hardware: ['plunger', 'cone', 'keyboard'], laundry: ['sock', 'chancla'], cursed: ['fish', 'wobbler', 'junior'] };
  Object.keys(OLD_PACKS).forEach((k) => { if (save.packs && save.packs[k]) OLD_PACKS[k].forEach((w) => (save.items[w] = true)); });
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage blocked: progress lasts this session */ } };

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const lerpP = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const easeOut = (u) => 1 - (1 - u) * (1 - u);

  // ---------- geometry (logical 760 x 980) ----------
  const CK = { x: 380, y: 430 };
  const P = {
    cupTop: { x: 380, y: 606 },
    bell: { x: 380, y: 712 },
    wingShoulder: { x: 300, y: 405 },
    wingHome: { x: 262, y: 482 },
    wingHold: { x: 205, y: 318 },
    wingTap: { x: 380, y: 590 },
    wingBell: { x: 380, y: 642 },
    wingNope: { x: 372, y: 512 },
    gloveHome: { x: 505, y: 872 },
    gloveHold: { x: 600, y: 812 },
    gloveTap: { x: 386, y: 600 },
    gloveBell: { x: 386, y: 662 },
    playerShoulder: { x: 700, y: 1100 },
  };

  // ---------- state ----------
  const G = {
    scene: 'title', level: 1, T: 0.62, W: 0.26,
    hpP: 5, hpPMax: 5, hpC: 3, hpCMax: 3, skin: 0, name: NAMES[0],
    t0: 0, round: 0, cup: 'on', cupVis: 'on',
    streakP: 0, streakC: 0, trickP: 0, beats: {}, nextChick: 0, nextPlayer: 1, musicN: -4,
    events: [], wing: { m: null, home: P.wingHome }, glove: { m: null, home: P.gloveHome },
    floaters: [], bubble: null, banner: null,
    shake: 0, redFlash: 0, gleam: 0, rattleT: -9, fakeT: -9, bobT: -9, hitT: -9, squeakT: -9, tellUntil: -9, eyes: null,
    smack: null, fin: null, wait: null, paused: false, lastPress: -9,
    stats: { smacks: 0, dodges: 0, eggs: 0 }, grabbedOnce: false,
  };
  const tn = (n) => G.t0 + n * G.T;
  const beat = (n) => (G.beats[n] ||= {});
  const at = (t, fn) => G.events.push({ t, fn, round: G.round });

  function floater(text, x, y, opts = {}) {
    G.floaters.push(Object.assign({ text, x, y, t0: Sfx.now(), dur: 0.9, size: 34, color: '#fff3c4', rise: 50 }, opts));
  }
  function say(text, dur = 1.1) { G.bubble = { text, t0: Sfx.now(), dur }; }
  function addEggs(n, x = HUD.r - 40, y = 900) {
    save.eggs += n; G.stats.eggs += n; persist();
    floater(`+${n}`, x, y, { size: 26, color: '#ffe680', rise: 40 });
  }
  function trickChance(s) {
    const table = [0.08, 0.2, 0.4, 0.58, 0.72, 0.8];
    return Math.max(0.05, table[Math.min(s, 5)] - 0.02 * (G.level - 1));
  }
  // The chicken's memory: how many clean taps you made before each of your last 3 takes
  // (5+ counts as one habit). Repeat a habit 2 of 3 times and it reads you. It forgets
  // as soon as you mix it up, and it has no memory at all on levels 1-3.
  const READ = { memory: 3, repeats: 2, floor: 0.05 };
  function readPenalty(lv) {
    if (lv <= 3) return 0;
    if (lv >= 10) return 0.3;
    return 0.1 + (lv - 4) * 0.03; // 10% at level 4 up to 25% at level 9
  }
  function isRead(s) {
    if (G.tut || readPenalty(G.level) === 0) return false;
    const k = Math.min(s, 5);
    return G.habit.filter((h) => h === k).length >= READ.repeats;
  }
  // what a take right now would actually get you
  function takeChance(s) {
    const base = trickChance(s);
    return isRead(s) ? Math.max(READ.floor, base - readPenalty(G.level)) : base;
  }
  const playerPool = () => Object.keys(WEAPONS).filter((k) => save.items[k]);
  const CHICKEN_POOL = Object.keys(WEAPONS).filter((k) => k !== 'hand');

  // ---------- hand motion ----------
  function handPos(hand, t) {
    const m = hand.m;
    if (!m) return { ...hand.home };
    if (t <= m.start) return { ...m.from };
    if (t <= m.contact) { const u = (t - m.start) / Math.max(1e-3, m.contact - m.start); return lerpP(m.from, m.target, u * u); }
    if (t <= m.end) {
      const u = (t - m.contact) / Math.max(1e-3, m.end - m.contact);
      const p = lerpP(m.target, m.home, easeOut(u));
      if (m.fake) { p.x += Math.sin(u * 38) * 10 * (1 - u); p.y -= Math.sin(u * Math.PI) * 14; }
      return p;
    }
    return { ...m.home };
  }
  function motion(hand, start, contact, end, target, home, opts = {}) {
    const from = handPos(hand, start);
    hand.m = Object.assign({ start, contact, end, from, target, home }, opts);
    hand.home = home;
  }

  // ---------- intro cutscene ----------
  // Fade in on a beaten rubber chicken on the floor. Slow push-in. Its eye snaps open. It wants revenge.
  let introSeen = false;
  function beginGame(lv) {
    if (save.intro && !introSeen) playIntro(lv);
    else launch(lv);
  }
  function playIntro(lv) {
    Sfx.init();
    introSeen = true;
    const t0 = Sfx.now() + 0.1;
    G.scene = 'intro';
    G.intro = { t0, lv, audio: Sfx.intro(t0), creak: false, snap: false };
    showOverlay(null);
  }
  function endIntro() {
    if (!G.intro) return;
    G.intro.audio.stop();
    const lv = G.intro.lv;
    G.intro = null; G.shake = 0; G.redFlash = 0;
    launch(lv);
  }
  function updateIntro(now) {
    const I = G.intro, el = now - I.t0;
    if (el > 4.72 && !I.creak) { I.creak = true; Sfx.bawk(now, 0.5); }
    if (el > 5 && !I.snap) { I.snap = true; G.shake = 30; G.redFlash = 0.7; FX.burst(470, 640, 'feather', 10, { color: SKINS[0].body, speed: 300, g: 150, life: 1.5 }); }
    if (el > 7.3) endIntro();
  }
  function drawIntro(now) {
    const I = G.intro, el = now - I.t0;
    const smooth = (u) => u * u * (3 - 2 * u);
    const lying = el < 5;
    const head = { x: 528, y: 682 };
    const zoom = lying ? 1 + 1.3 * smooth(clamp(el / 5, 0, 1)) : lerp(2.3, 1.15, easeOut(clamp((el - 5) / 0.3, 0, 1)));
    const fp = lying ? lerpP({ x: 400, y: 620 }, head, smooth(clamp(el / 5, 0, 1))) : lerpP(head, { x: 400, y: 560 }, easeOut(clamp((el - 5) / 0.3, 0, 1)));
    ctx.save();
    ctx.translate(380, 520); ctx.scale(zoom, zoom); ctx.translate(-fp.x, -fp.y);
    // a bare floor under one bulb
    ctx.fillStyle = '#0d1113'; ctx.fillRect(-800, -600, 2400, 1120);
    const fg = ctx.createLinearGradient(0, 520, 0, 1300);
    fg.addColorStop(0, '#24150c'); fg.addColorStop(1, '#3d2414');
    ctx.fillStyle = fg; ctx.fillRect(-800, 520, 2400, 900);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 3;
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(380 + i * 40, 520); ctx.lineTo(380 + i * 140, 1400); ctx.stroke(); }
    ctx.fillStyle = '#080a0b'; ctx.fillRect(-800, 512, 2400, 10);
    const sg = ctx.createRadialGradient(440, 690, 20, 440, 690, 300);
    sg.addColorStop(0, 'rgba(255,226,170,0.32)'); sg.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = sg; ctx.fillRect(-800, -600, 2400, 2000);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; D.ellipse(ctx, 450, 735, 190, 26); ctx.fill();
    if (lying) {
      const blink = el > 4.6;
      D.chicken(ctx, { x: 380, y: 700, scale: 0.8, tilt: 1.45, neck: 0, mouth: 0.1, eyes: blink ? 'angry' : 'x', look: 1, skin: 0, t: 0, legs: true });
      if (el > 4.6 && el < 4.9) { ctx.fillStyle = 'rgba(255,40,40,0.8)'; D.burst(ctx, head.x - 10, head.y - 18, 14, '#ff3b1f', el * 8); }
    } else {
      const u = clamp((el - 5) / 0.35, 0, 1);
      const scream = el < 6.4;
      D.chicken(ctx, { x: 380, y: 640 - Math.sin(u * Math.PI) * 140, scale: 0.8, tilt: 1.45 * (1 - easeOut(u)) + Math.sin(el * 30) * 0.03 * (scream ? 1 : 0),
        neck: scream ? 0.55 : 0.1, mouth: scream ? 1 : 0, eyes: 'angry', skin: 0, t: el, legs: true });
    }
    ctx.restore();
    // letterbox, captions, fades (screen-ish space inside the logical frame)
    ctx.fillStyle = '#000'; ctx.fillRect(-800, -400, 2400, 470); ctx.fillRect(-800, 900, 2400, 600);
    const caps = [[0.9, 2.4, 'You squeezed it.'], [2.4, 3.8, 'You smacked it.'], [3.8, 4.9, 'You left it on the floor.']];
    caps.forEach(([a, b, txt]) => {
      if (el < a || el > b) return;
      ctx.save(); ctx.globalAlpha = Math.min(1, (el - a) * 4, (b - el) * 4);
      D.text(ctx, txt, 380, 940, 30, '#e9dcc0', { font: "'Barlow Semi Condensed', sans-serif", weight: 700, stroke: false });
      ctx.restore();
    });
    if (el > 5.05) {
      const k = clamp((el - 5.05) / 0.12, 0, 1);
      D.text(ctx, 'IT REMEMBERS.', 380, 160, 64 * (1.6 - 0.6 * k), '#ff3b1f', { rot: -0.04 });
      if (el > 5.8) D.text(ctx, 'Cluck around and find out.', 380, 945, 30, '#ffd84a', { font: "'Barlow Semi Condensed', sans-serif", weight: 800 });
    }
    const fade = el < 1.2 ? 1 - el / 1.2 : el > 6.7 ? clamp((el - 6.7) / 0.6, 0, 1) : 0;
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(-800, -400, 2400, 2000); }
    if (el > 0.4 && el < 6.7) D.text(ctx, 'tap to skip', HUD.r, 40, 16, 'rgba(255,255,255,0.45)', { align: 'right', font: "'Barlow Semi Condensed', sans-serif", weight: 700, stroke: false });
  }

  // ---------- level / round ----------
  function startLevel(lv, opts = {}) {
    Sfx.init();
    G.level = lv;
    G.tut = opts.tutorial ? { step: 'tap', good: 0 } : null;
    G.T = G.tut ? 0.85 : tempoFor(lv, curRamp());
    G.W = G.tut ? 0.3 : clamp(G.T * 0.45, 0.06, 0.25);
    G.hpPMax = 5; G.hpP = 5;
    G.hpCMax = lv === 1 ? 3 : lv <= 3 ? 4 : 5; G.hpC = G.hpCMax;
    G.skin = SKIN_BY_LEVEL[(lv - 1) % SKIN_BY_LEVEL.length];
    G.name = lv <= NAMES.length ? NAMES[lv - 1] : `${NAMES[(lv - 1) % NAMES.length]} ${romanize(Math.floor((lv - 1) / NAMES.length) + 1)}`;
    G.stats = { smacks: 0, dodges: 0, eggs: 0 };
    G.habit = []; G.readTake = false;
    G.fin = null; G.smack = null; FX.list = []; G.floaters = []; G.bubble = null;
    showOverlay(null);
    G.scene = 'play';
    newRound(0.7);
    if (G.tut) tutBanner('Hit TAP when the ring closes on the cup');
    else G.banner = { text: `${G.name} · ${Math.round(60 / G.T)} BPM`, until: Sfx.now() + 2.4 };
  }

  // ---------- first-time tutorial ----------
  // Slow tempo, no HP lost, scripted chicken: 3 clean taps -> survive a grab without tapping
  // -> take the cup yourself, the chicken always falls for it -> smack. Then level 1 for real.
  function launch(lv) {
    if (lv === 1 && !save.tutDone) startLevel(1, { tutorial: true });
    else startLevel(lv);
  }
  function tutBanner(text) { G.banner = { text, until: Infinity }; }
  function endTutorial() {
    save.tutDone = true; persist();
    G.tut = null;
    startLevel(1);
  }
  function tutGotIt() {
    save.tutDone = true; persist();
    G.tut.step = 'done';
    tutBanner("That's the game. Now faster. Forever.");
    waitThen(2.4, () => { G.tut = null; startLevel(1); });
  }
  function withArticle(name) {
    if (/^(the|a|an|grandma's|bare) /i.test(name)) return name.replace(/^The /, 'the ').replace(/^A /, 'a ');
    return `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name}`;
  }
  function romanize(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }

  function newRound(delay = 0.5) {
    const now = Sfx.now();
    G.round++;
    G.cup = 'on'; G.cupVis = 'on';
    G.streakP = 0; G.streakC = 0; G.beats = {}; G.events = [];
    G.t0 = now + delay + 4 * G.T;
    G.musicN = -4; G.nextChick = 0; G.nextPlayer = 1;
    G.wing.m = null; G.wing.home = P.wingHome;
    G.glove.m = null; G.glove.home = P.gloveHome;
    G.eyes = null; G.tellUntil = -9; G.wait = null;
  }
  function waitThen(delay, fn) { G.scene = 'wait'; G.wait = { until: Sfx.now() + delay, fn }; }

  // ---------- chicken brain ----------
  function decideIntent() {
    if (G.tut) return { grab: G.tut.step === 'dodge' && G.cup === 'on' && G.streakC >= 2, fake: false, tell: false };
    const L = G.level;
    let grab = false, fake = false, tell = false;
    if (G.cup === 'on' && G.streakC >= 2) grab = Math.random() < Math.min(0.7, 0.14 + 0.09 * (G.streakC - 2) + 0.02 * (L - 1));
    if (!grab && L >= 3 && G.streakC >= 1) fake = Math.random() < Math.min(0.28, 0.07 * (L - 2));
    if (grab) tell = L <= 3 ? true : L <= 6 ? Math.random() < 0.5 : false;
    else if (L >= 4 && L <= 8) tell = Math.random() < 0.12; // false tells, to keep you honest
    return { grab, fake, tell };
  }

  function finalizeChicken(n, now) {
    const t = tn(n), T = G.T, b = beat(n);
    b.final = true;
    const start = Math.max(now, t - 0.55 * T), end = t + 0.6 * T;
    if (G.cup === 'player') {
      if (Math.random() < G.trickP) {
        // fell for it
        motion(G.wing, start, t, end, P.wingBell, P.wingHome);
        Sfx.ding(t);
        at(t, chickenHitsBell);
      } else {
        motion(G.wing, start, t - 0.1 * T, end, P.wingNope, P.wingHome);
        Sfx.bawk(t, 1.1);
        const lines = G.readTake ? ['lol again?', 'I know your rhythm', 'predictable.', 'seen it.', 'same thing AGAIN?'] : ['NICE TRY', 'nope.', 'lol no', 'I SAW THAT'];
        at(t, () => { say(pick(lines)); G.eyes = { mode: 'smug', until: Sfx.now() + 1.2 * T + 0.3 }; });
      }
    } else if (G.cup === 'chicken') {
      motion(G.wing, start, t, end, P.wingTap, P.wingHome);
      Sfx.tap(t, 'chicken');
      at(t, () => { G.cup = 'on'; G.cupVis = 'on'; G.streakC = 0; G.bobT = t; });
    } else if (b.intent && b.intent.grab) {
      motion(G.wing, start, t, end, P.wingTap, P.wingHold);
      Sfx.snatch(t);
      at(t, () => {
        G.cup = 'chicken'; G.cupVis = 'chicken'; G.gleam = 1; G.streakC = 0; G.bobT = t;
        // levels 1-2 (and the tutorial) spell it out; after that you're on your own
        if (G.tut) tutBanner("IT TOOK THE CUP! DON'T TAP!");
        else if (G.level <= 2) floater("DON'T TAP!", 380, 470, { size: 46, color: '#ff6a4d', dur: Math.max(0.6, G.T * 1.4), rise: 0 });
        if (Math.random() < 0.35) say(pick(['bawk?', 'hehe', 'hehehe']), 0.7);
      });
    } else if (b.intent && b.intent.fake) {
      motion(G.wing, start, t, end, P.wingTap, P.wingHome, { fake: true });
      Sfx.tap(t, 'chicken'); Sfx.rattle(t + 0.03);
      at(t, () => { G.fakeT = t; G.streakC++; G.bobT = t; });
    } else {
      motion(G.wing, start, t, end, P.wingTap, P.wingHome);
      Sfx.tap(t, 'chicken');
      at(t, () => { G.streakC++; G.bobT = t; });
    }
  }

  function chickenHitsBell() {
    const now = Sfx.now();
    G.gleam = 1; G.shake = 8;
    floater('DING!', 380, 560, { size: 56, color: '#ffd84a', dur: 1 });
    G.eyes = { mode: 'wide', until: now + 2 };
    say(pick(['oh no', 'wait—', 'OH CLUCK']), 0.9);
    waitThen(0.45, () => (G.hpC <= 1 ? startFinisher() : readySmack()));
  }
  function playerHitsBell() {
    const now = Sfx.now();
    motion(G.glove, now, now + 0.05, now + 0.3, P.gloveBell, P.gloveHome);
    Sfx.ding(now + 0.05);
    at(now + 0.05, () => { G.gleam = 1; G.shake = 8; floater('DING!', 380, 560, { size: 56, color: '#ffd84a', dur: 1 }); });
    G.eyes = { mode: 'smug', until: now + 2 };
    if (G.tut) { // no smack in the tutorial, just a do-over
      tutBanner("You rang the bell. That's a smack! Try again.");
      say('hehehe', 1.2);
      waitThen(1.6, () => { newRound(0.4); tutBanner('When the chicken takes the cup, DON\'T tap'); });
      return;
    }
    waitThen(0.55, () => startSmack('player'));
  }
  function foul(text) {
    const now = Sfx.now();
    Sfx.buzzer(now);
    floater(text, 380, 540, { size: 44, color: '#ff6a4d', dur: 1.1 });
    G.eyes = { mode: 'smug', until: now + 2 };
    waitThen(0.5, () => startSmack('player'));
  }

  // ---------- player input ----------
  function press(kind) {
    if (G.paused) return;
    if (G.scene === 'intro') { if (Sfx.now() - G.intro.t0 > 0.3) endIntro(); return; }
    if (G.scene === 'fin') { finHold(true); return; }
    if (G.scene === 'ready') { if (Sfx.now() - G.ready.t0 > 0.15) startSmack('chicken'); return; }
    if (G.scene !== 'play') return;
    const now = Sfx.now();
    if (now - G.lastPress < 0.09) return;
    G.lastPress = now;
    const t = now - Sfx.latency();
    if (t < tn(1) - G.W) { // still counting in
      motion(G.glove, now, now + 0.05, now + 0.25, P.gloveTap, P.gloveHome);
      Sfx.tap(now + 0.04, 'player');
      return;
    }
    let m = Math.round(((t - G.t0) / G.T - 1) / 2) * 2 + 1;
    m = Math.max(1, m);
    const b = beat(m), dt = t - tn(m);
    const inWindow = Math.abs(dt) <= G.W && !b.resolved;
    if (inWindow) {
      b.resolved = true; G.nextPlayer = Math.max(G.nextPlayer, m + 2);
      if (G.cup === 'chicken') return playerHitsBell();
      if (G.cup === 'player') return returnCup(now);
      if (kind === 'grab') return playerGrab(now);
      return playerTap(now, dt);
    }
    if (G.cup === 'chicken') return playerHitsBell();
    if (G.cup === 'player') return;
    // off the beat: harmless, but the chicken gets suspicious
    motion(G.glove, now, now + 0.05, now + 0.25, P.gloveTap, P.gloveHome);
    Sfx.tap(now + 0.04, 'player');
    G.streakP = 0;
    if (G.tut && G.tut.step === 'tap') G.tut.good = 0;
    floater('OFF-BEAT', 380, 548, { size: 26, color: '#ff9d7a', dur: 0.6 });
  }
  function playerTap(now, dt) {
    motion(G.glove, now, now + 0.05, now + 0.25, P.gloveTap, P.gloveHome);
    Sfx.tap(now + 0.04, 'player');
    G.streakP++;
    if (Math.abs(dt) <= G.W * 0.35) floater('PERFECT', 520, 600, { size: 22, color: '#9ff2ff', dur: 0.5, rise: 30 });
    if (G.tut && G.tut.step === 'tap') {
      G.tut.good++;
      if (G.tut.good >= 3) { G.tut.step = 'dodge'; tutBanner('Nice. Keep tapping, and watch the chicken...'); }
      else tutBanner(`Hit TAP when the ring closes on the cup (${G.tut.good}/3)`);
    }
  }
  function playerGrab(now) {
    G.readTake = isRead(G.streakP);
    G.cup = 'player'; G.trickP = takeChance(G.streakP);
    G.habit = [...G.habit, Math.min(G.streakP, 5)].slice(-READ.memory);
    G.streakP = 0; G.grabbedOnce = true;
    if (G.tut) { G.trickP = G.tut.step === 'take' ? 1 : 0; if (G.tut.step === 'take') tutBanner('It fell for it!'); }
    motion(G.glove, now, now + 0.05, now + 0.3, P.gloveTap, P.gloveHold);
    Sfx.snatch(now + 0.04);
    at(now + 0.05, () => { G.cupVis = 'player'; G.gleam = 1; });
  }
  function returnCup(now) {
    G.cup = 'on';
    motion(G.glove, now, now + 0.06, now + 0.3, P.gloveTap, P.gloveHome);
    Sfx.tap(now + 0.05, 'player');
    at(now + 0.06, () => { G.cupVis = 'on'; });
  }
  function resolveMiss() {
    if (G.tut && G.cup !== 'chicken') { // tutorial: a missed beat is just a reminder
      floater('MISSED', 380, 548, { size: 30, color: '#ff9d7a', dur: 0.7 });
      if (G.tut.step === 'tap') { G.tut.good = 0; tutBanner('Hit TAP when the ring closes on the cup'); }
      if (G.cup === 'player') returnCup(Sfx.now());
      return;
    }
    if (G.cup === 'on') return foul(pick(['TOO SLOW!', 'MISSED YOUR BEAT!', 'HESITATED!']));
    if (G.cup === 'player') return foul('PUT IT BACK!');
    // chicken holds the cup and you didn't touch the bell
    G.stats.dodges++;
    floater('DODGED', 380, 548, { size: 34, color: '#9ff2a0', dur: 0.8 });
    addEggs(1);
    if (G.tut && G.tut.step === 'dodge') { G.tut.step = 'take'; tutBanner('Your turn to trick it. Hit TAKE on your beat!'); }
  }

  // ---------- update: rhythm ----------
  function updatePlay(now) {
    const T = G.T, lat = Sfx.latency();
    while (tn(G.musicN) < now + 0.12) {
      const n = G.musicN, t = tn(n);
      if (t > now - 0.03) {
        Sfx.groove(t, n, T);
        if (n < 0) {
          Sfx.tick(t, n === -4 || n === -2);
          at(t, () => floater(['3', '2', '1', 'GO'][n + 4], 380, 545, { size: 60, color: '#fff3c4', dur: T * 0.9, rise: 0 }));
        }
      }
      G.musicN++;
    }
    // chicken: plan intent, then commit the move
    const n = G.nextChick, b = beat(n);
    if (!b.intent && now >= tn(n) - 1.5 * T) {
      b.intent = decideIntent();
      if (b.intent.tell) G.tellUntil = tn(n);
    }
    const prevResolved = n === 0 || beat(n - 1).resolved;
    if (!b.final && now >= tn(n) - 0.55 * T && prevResolved) { finalizeChicken(n, now); G.nextChick += 2; }
    // player: a beat with no input
    const m = G.nextPlayer;
    if (now > tn(m) + G.W + lat) {
      const pb = beat(m);
      G.nextPlayer += 2;
      if (!pb.resolved) { pb.resolved = true; resolveMiss(); }
    }
  }

  // ---------- smacks ----------
  // The chicken rang the bell: everything freezes until you press SMACK.
  function readySmack() {
    G.scene = 'ready';
    G.ready = { t0: Sfx.now(), weapon: pick(playerPool()) };
    G.banner = null;
    say(pick(['wait wait wait', 'n-no...', "let's talk about this", 'please not the beak']), 30);
  }
  function startSmack(victim) {
    let now = Sfx.now();
    const weapon = victim === 'chicken' ? G.ready.weapon : pick(CHICKEN_POOL);
    G.scene = 'smack';
    G.bubble = null;
    // your swing starts already wound up so the hit lands right after the press
    if (victim === 'chicken') now -= 0.28;
    G.smack = { victim, weapon, t0: now, hit: false };
    G.banner = null; G.floaters = [];
    G.wing.m = null; G.wing.home = P.wingHome; G.cupVis = G.cupVis === 'player' ? 'player' : G.cupVis;
    Sfx.whoosh(Math.max(Sfx.now(), now + 0.25), 0.18, 0.4);
  }
  function updateSmack(now) {
    const s = G.smack, el = now - s.t0;
    if (!s.hit && el >= 0.45) {
      s.hit = true;
      const snd = WEAPONS[s.weapon].snd;
      Sfx.impact(snd, now);
      if (s.victim === 'chicken') {
        G.hpC--; G.stats.smacks++;
        Sfx.squeak(now + 0.03); // a quick light squeeze, not the big scream
        G.hitT = now; G.squeakT = now; G.shake = 12;
        FX.burst(390, 250, 'feather', 12, { color: SKINS[G.skin].body, speed: 300, g: 120, life: 1.6 });
        FX.burst(390, 250, 'star', 6, { speed: 420, life: 0.7 });
        floater(pick(OUCH), 520, 200, { size: 40, color: '#fff3c4', dur: 1.1, rot: -0.15 });
        floater('-1', 300, 230, { size: 48, color: '#ff6a4d', dur: 1 });
        addEggs(3);
      } else {
        G.hpP--; G.shake = 28; G.redFlash = 1;
        FX.burst(380, 520, 'star', 10, { speed: 520, life: 0.9, g: 300 });
        floater(pick(['BONK!', 'WHAM!', 'THWACK!', 'BOINK!']), 380, 470, { size: 80, color: '#ffd84a', dur: 1.1, rise: 0, burst: true });
        at(now + 0.35, () => say(pick(TAUNTS), 1.2));
      }
    }
    if (el >= 1.85) {
      G.smack = null;
      if (G.tut) return tutGotIt();
      if (G.hpP <= 0) return gameOver();
      G.scene = 'play';
      newRound(0.35);
    }
  }

  // ---------- finisher ----------
  function startFinisher() {
    const now = Sfx.now();
    G.scene = 'fin';
    G.hpC = 0;
    G.fin = { type: save.fin, t0: now, phase: 'intro', holding: false, sq: 0, screamT: 0, heldT: 0, inflate: 0, scream: null, endAt: 0, flyT: 0, broken: false, gone: false, hint: true };
    G.banner = null;
  }
  function finHold(down) {
    const f = G.fin;
    if (!f || f.phase !== 'play') { if (f) f.queued = down; return; }
    if (down && !f.holding) {
      f.holding = true; f.heldT = 0; f.hint = false;
      const opts = f.type === 'bass' ? { pitch: 0.42, distort: true, vibrato: 30, lfoRate: 3.5 } : f.type === 'helium' ? { pitch: 1.1 } : {};
      f.scream = Sfx.scream(opts);
    } else if (!down && f.holding) {
      f.holding = false;
      const now = Sfx.now();
      if (f.type === 'yeet' && f.heldT >= 0.45) {
        f.phase = 'outro'; f.flyT = now; f.endAt = now + 2.8;
        if (f.scream) f.scream.fadeOut(1.4, 240);
        Sfx.whoosh(now, 0.5, 0.5);
        at(now + 0.8, () => { f.broken = true; Sfx.shatter(Sfx.now()); FX.burst(580, 223, 'glass', 18, { speed: 260, g: 700, life: 1.2 }); G.shake = 10; });
        at(now + 2.0, () => Sfx.squeak(Sfx.now(), 0.8));
        return;
      }
      if (f.scream) { f.scream.release(); f.scream.stop(); f.scream = null; }
      if (f.type === 'helium' && f.inflate > 0.2) Sfx.raspberry(now);
      else Sfx.wheeze(now + 0.05);
      const need = f.type === 'bass' ? 2.6 : 2.4;
      if ((f.type === 'choke' || f.type === 'bass') && f.screamT >= need) koChicken(now);
    }
  }
  function koChicken(now) {
    const f = G.fin;
    f.phase = 'outro'; f.endAt = now + 1.7;
    floater('K.O.', 380, 200, { size: 84, color: '#ff6a4d', dur: 1.6, rise: 0, burst: true });
  }
  function updateFin(now, dt) {
    const f = G.fin;
    const el = now - f.t0;
    if (f.phase === 'intro' && el > 0.9) { f.phase = 'play'; if (f.queued) finHold(true); }
    if (f.phase === 'play' || (f.phase === 'outro' && f.type !== 'yeet')) {
      const target = f.holding ? 1 : 0;
      f.sq += (target - f.sq) * Math.min(1, dt * (f.holding ? 10 : 6));
    }
    if (f.phase === 'play' && f.holding) {
      f.heldT += dt;
      if (f.sq > 0.3) f.screamT += dt;
      let pm = 1;
      if (f.type === 'helium') { f.inflate += dt * 0.42; pm = 1 + f.inflate * 1.5; }
      if (f.type === 'yeet') pm = 1 + Math.min(1, f.heldT) * 0.25;
      if (f.type === 'bass') G.shake = Math.max(G.shake, 6 + 10 * f.sq);
      if (f.scream) f.scream.set(f.sq, pm * (1 + 0.04 * Math.sin(now * 23)));
      if (f.type === 'helium' && f.inflate >= 1) {
        if (f.scream) { f.scream.stop(); f.scream = null; }
        f.holding = false; f.gone = true;
        Sfx.pop(now);
        FX.burst(380, 380, 'feather', 26, { color: SKINS[G.skin].body, speed: 520, g: 140, life: 2 });
        FX.burst(380, 380, 'confetti', 40, { colors: ['#ff4d6d', '#ffd84a', '#4de1ff', '#9ff2a0', '#c08bff'], speed: 600, g: 400, life: 1.8 });
        floater('POP!', 380, 300, { size: 96, color: '#fff3c4', dur: 1.4, rise: 0, burst: true });
        G.shake = 22;
        f.phase = 'outro'; f.endAt = now + 2;
      }
      if ((f.type === 'choke' || f.type === 'bass') && f.screamT > 7) { finHold(false); }
    }
    if (f.phase === 'play' && !f.holding && f.type === 'helium') f.inflate = Math.max(0, f.inflate - dt * 0.9);
    if (f.phase === 'outro' && now >= f.endAt) levelClear();
  }

  // ---------- results ----------
  function levelClear() {
    const now = Sfx.now();
    G.scene = 'clear';
    G.fin = null;
    const bonus = 10 + 5 * G.level;
    save.eggs += bonus; G.stats.eggs += bonus;
    save.startLv = G.level + 1;
    const newBest = ranked() && G.level + 1 > save.best;
    if (ranked()) save.best = Math.max(save.best, G.level + 1);
    else save.customBest[customKey()] = Math.max(modeBest(), G.level + 1);
    if (G.level === 1) save.tutorialDone = true;
    persist();
    Sfx.fanfare(now + 0.05);
    $('clearTitle').textContent = `Level ${G.level} cleared`;
    $('clearSub').textContent = newBest ? `${G.name} has been dealt with. New best: level ${save.best}, rank ${rankFor(save.best)}.` : `${G.name} has been dealt with.`;
    setBrag('clearBrag');
    $('clearSmacks').textContent = G.stats.smacks + 1;
    $('clearDodges').textContent = G.stats.dodges;
    $('clearEggs').textContent = `+${G.stats.eggs}`;
    $('clearNext').textContent = `${Math.round(60 / tempoFor(G.level + 1, curRamp()))} BPM`;
    $('clearBragWrap').hidden = !ranked();
    showOverlay('clear');
  }
  function gameOver() {
    G.scene = 'over';
    persist();
    Sfx.sadTrombone(Sfx.now() + 0.1);
    $('overSub').textContent = `${G.name} wins level ${G.level}. You landed ${G.stats.smacks} smack${G.stats.smacks === 1 ? '' : 's'}. ${ranked() ? `Your best is still level ${save.best}.` : 'Custom runs don\'t change your badge.'}`;
    $('overBragWrap').hidden = !ranked();
    setBrag('overBrag');
    showOverlay('over');
  }

  // ---------- pause ----------
  function pause() {
    if (G.scene === 'intro') return endIntro();
    if (G.paused || !['play', 'wait', 'smack', 'fin', 'ready'].includes(G.scene)) return;
    if (G.fin && G.fin.holding) finHold(false);
    G.paused = true; Sfx.suspend(); showOverlay('pause');
  }
  function resume() {
    if (!G.paused) return;
    G.paused = false; Sfx.resume(); showOverlay(null);
    if (G.scene === 'play') newRound(0.4);
  }

  // ---------- control labels ----------
  let ctlMode = '';
  function syncControls() {
    const mode = G.scene === 'ready' ? 'smack' : G.scene === 'fin' ? 'fin' : G.scene === 'intro' ? 'intro' : 'play';
    if (mode === ctlMode) return;
    ctlMode = mode;
    document.body.classList.toggle('in-intro', mode === 'intro');
    $('bGrab').hidden = mode !== 'play';
    $('bTap').innerHTML = mode === 'smack' ? 'SMACK!<small>Space</small>' : mode === 'fin' ? 'HOLD<small>hold Space</small>' : 'TAP<small>Space</small>';
    $('bTap').classList.toggle('big', mode !== 'play');
  }
  // every frame: hint TAKE when it's likely to work (or when the tutorial asks for it)
  function syncHints() {
    const glow = G.scene === 'play' && G.cup === 'on' && (G.tut ? G.tut.step === 'take' : takeChance(G.streakP) >= 0.58);
    $('bGrab').classList.toggle('glow', glow);
    document.body.classList.toggle('in-tut', !!G.tut && G.scene !== 'title');
  }

  // ---------- main loop ----------
  let last = 0;
  function frame() {
    const now = Sfx.now();
    const dt = clamp(now - last, 0, 0.05); last = now;
    if (!G.paused) {
      if (G.scene === 'play') updatePlay(now);
      else if (G.scene === 'wait' && now >= G.wait.until) { const fn = G.wait.fn; G.wait = null; G.scene = 'play'; fn(); }
      else if (G.scene === 'smack') updateSmack(now);
      else if (G.scene === 'fin') updateFin(now, dt);
      else if (G.scene === 'intro') updateIntro(now);
      const due = G.events.filter((e) => e.t <= now);
      G.events = G.events.filter((e) => e.t > now);
      due.forEach((e) => { if (e.round === G.round) e.fn(); });
      FX.update(dt);
      G.shake = Math.max(0, G.shake - dt * 60);
      G.redFlash = Math.max(0, G.redFlash - dt * 2.2);
      G.gleam = Math.max(0, G.gleam - dt * 1.6);
    }
    syncControls();
    syncHints();
    render(now);
    requestAnimationFrame(frame);
  }

  // ---------- rendering ----------
  let vw = 0, vh = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
  const HUD = { l: 24, r: 736, t: 0, b: VH };
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    if (r.width === vw && r.height === vh && canvas.width === Math.round(r.width * dpr)) return;
    vw = r.width; vh = r.height;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    // only the middle 600 units have to fit; the outer wall/table can be cropped on narrow screens
    scale = Math.min(vw / 600, vh / VH);
    ox = (vw - VW * scale) / 2; oy = (vh - VH * scale) / 2;
    HUD.l = Math.max(24, -ox / scale + 16); HUD.r = Math.min(VW - 24, (vw - ox) / scale - 16);
  }

  // Beak stays shut unless the chicken is squeaking, talking, or trembling with fear.
  function chickenMouth(now, sinceSq, cower) {
    if (sinceSq >= 0 && sinceSq < 0.36) return Math.sqrt(Math.sin(Math.PI * sinceSq / 0.36));
    if (G.bubble) { const a = now - G.bubble.t0; if (a >= 0 && a < 0.55) return 0.45 * Math.abs(Math.sin(a * 22)); }
    if (cower) return 0.12 + 0.06 * Math.sin(now * 40);
    return 0;
  }
  function chickenParams(now) {
    const sinceHit = now - G.hitT;
    const wob = sinceHit < 1.2 ? Math.exp(-sinceHit * 5) * Math.cos(sinceHit * 28) : 0;
    const sinceBob = now - G.bobT;
    let eyes = 'normal';
    if (G.eyes && now < G.eyes.until) eyes = G.eyes.mode;
    else if (now < G.tellUntil) eyes = 'shifty';
    if (sinceHit < 1.4) eyes = 'dizzy';
    const cower = G.scene === 'ready';
    if (cower) eyes = 'wide';
    const sinceSq = now - G.squeakT;
    const gp = handPos(G.glove, now);
    return {
      x: CK.x + (cower ? Math.sin(now * 70) * 2.5 : 0), y: (cower ? 12 : 0) + CK.y + (sinceBob < 0.4 ? Math.sin(sinceBob / 0.4 * Math.PI) * 8 : 0) + Math.sin(now * 2) * 2,
      scale: 1, sx: 1 + 0.22 * wob, sy: 1 - 0.18 * wob,
      tilt: sinceHit < 1.4 ? -0.35 * Math.exp(-sinceHit * 3) * Math.cos(sinceHit * 9) : Math.sin(now * 1.3) * 0.03,
      neck: sinceSq < 0.3 ? 0.15 * Math.sin(sinceSq / 0.3 * Math.PI) : 0,
      mouth: chickenMouth(now, sinceSq, cower), eyes, look: clamp((gp.x - 380) / 160, -1, 1),
      skin: G.skin, t: now, flash: sinceHit < 0.15 ? 1 - sinceHit / 0.15 : 0, blush: G.scene === 'title',
    };
  }

  function render(now) {
    resize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b2c29'; ctx.fillRect(0, 0, vw, vh);
    const sh = G.shake;
    const sx = (Math.random() - 0.5) * sh, sy = (Math.random() - 0.5) * sh;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (ox + sx * scale), dpr * (oy + sy * scale));

    if (G.scene === 'intro') {
      drawIntro(now);
      FX.draw(ctx);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (G.redFlash > 0) { ctx.fillStyle = `rgba(200,0,0,${0.5 * G.redFlash})`; ctx.fillRect(0, 0, vw, vh); }
      return;
    }
    const f = G.fin;
    D.room(ctx, now, { windowBroken: f && f.broken });
    if (!f) D.chicken(ctx, chickenParams(now));
    D.table(ctx);

    if (f) drawFinisher(now);
    else drawTablePlay(now);

    if (G.smack) drawSmack(now);
    FX.draw(ctx);
    drawFloaters(now);
    if (G.scene !== 'title') drawHUD(now);

    // full-screen effects (in screen space)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (G.redFlash > 0) {
      const g = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.2, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
      g.addColorStop(0, `rgba(255,40,30,${0.15 * G.redFlash})`); g.addColorStop(1, `rgba(150,0,0,${0.75 * G.redFlash})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);
    }
    if (f && f.type === 'bass' && f.sq > 0.05) {
      ctx.fillStyle = `rgba(255,30,0,${0.22 * f.sq})`; ctx.fillRect(0, 0, vw, vh);
    }
  }

  function drawTablePlay(now) {
    // bell + cup
    D.bell(ctx, P.bell.x, P.bell.y, G.gleam);
    if (G.cupVis === 'on') {
      const sr = now - G.rattleT, sf = now - G.fakeT;
      let dx = 0, dy = 0, rot = 0;
      if (sf >= 0 && sf < 0.3) { const k = Math.sin(sf / 0.3 * Math.PI); dy = -22 * k; dx = Math.sin(sf * 70) * 5; rot = Math.sin(sf * 60) * 0.06; }
      if (sr >= 0 && sr < 0.25) dx += Math.sin(sr * 80) * 5;
      D.cup(ctx, P.cupTop.x + dx, P.cupTop.y + dy, rot);
    }
    // the beat ring for your next beat
    if (G.scene === 'play') drawRing(now);
    // chicken wing
    if (!(G.smack && G.smack.victim === 'player' && now - G.smack.t0 < 1)) {
      const wp = handPos(G.wing, now);
      const sh = { x: P.wingShoulder.x, y: P.wingShoulder.y + (chickenParams(now).y - CK.y) };
      D.noodle(ctx, sh, wp, 26, SKINS[G.skin].body, -0.18);
      if (G.cupVis === 'chicken') D.cup(ctx, wp.x, wp.y + 14, -0.12);
      D.mitten(ctx, wp.x, wp.y, 1, G.skin);
    }
    // player arm
    if (G.scene === 'ready') drawReady(now);
    else if (!(G.smack && G.smack.victim === 'chicken')) {
      const gp = handPos(G.glove, now);
      const s = 1 + 0.25 * clamp((gp.y - 600) / 270, 0, 1);
      D.noodle(ctx, P.playerShoulder, { x: gp.x + 8, y: gp.y + 50 * s }, 46, '#c8352a', 0.12);
      if (G.cupVis === 'player') { D.cup(ctx, gp.x, gp.y + 8, 0.1); D.glove(ctx, gp.x, gp.y, s, 0, 'grip'); }
      else D.glove(ctx, gp.x, gp.y, s, 0, 'flat');
    }
  }

  function drawRing(now) {
    const m = G.nextPlayer, dtb = tn(m) - now, span = 2 * G.T;
    if (dtb > span || dtb < -G.W) return;
    const u = clamp(dtb / span, 0, 1);
    const r = 92 + 200 * u;
    ctx.save();
    ctx.globalAlpha = dtb < 0 ? 0.4 : 0.35 + 0.6 * (1 - u);
    ctx.lineWidth = 6 + 6 * (1 - u);
    ctx.strokeStyle = G.cup === 'player' ? '#ffb84d' : '#9ff2ff';
    D.ellipse(ctx, 380, 662, r, r * 0.55); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.strokeStyle = '#fff3c4';
    D.ellipse(ctx, 380, 662, 92, 92 * 0.55); ctx.stroke();
    ctx.restore();
    if (G.cup === 'player' && u < 0.9) D.text(ctx, 'PUT IT BACK', 380, 800, 26, '#ffb84d');
  }

  function drawReady(now) {
    const r = G.ready, bob = Math.sin(now * 6) * 8;
    const x = 705, y = 830 + bob, rot = 1.35 + Math.sin(now * 6) * 0.05;
    D.noodle(ctx, P.playerShoulder, { x: x + 10, y: y + 50 }, 46, '#c8352a', 0.1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); D.weapon(ctx, r.weapon, now); ctx.restore();
    if (r.weapon !== 'hand') D.glove(ctx, x, y, 1.15, rot, 'grip');
    if (Math.random() < 0.06) FX.add({ kind: 'sweat', x: 380 + (Math.random() - 0.5) * 90, y: 200, vx: (Math.random() - 0.5) * 120, vy: -60, g: 500, life: 0.7 });
    const pulse = 1 + 0.08 * Math.sin(now * 10);
    D.burst(ctx, 380, 790, 120 * pulse, '#e8432e', now * 0.5);
    D.text(ctx, 'SMACK IT!', 380, 790, 50 * pulse, '#fff3c4');
    const nm = WEAPONS[r.weapon].name;
    D.text(ctx, `with ${nm === 'Bare Hand' ? 'your bare hand' : withArticle(nm)}`, 380, 880, 24, '#ffd84a', { font: "'Barlow Semi Condensed', sans-serif", weight: 800 });
  }

  function drawSmack(now) {
    const s = G.smack, el = now - s.t0;
    if (s.victim === 'chicken') {
      // your glove swings the weapon at the chicken's head
      const K = [[0, 640, 1010, 0.7], [0.28, 705, 830, 1.35], [0.45, 470, 400, -0.5], [0.75, 330, 430, -1.05], [1.4, 760, 1150, 0.3]];
      let i = 0; while (i < K.length - 2 && el > K[i + 1][0]) i++;
      const a = K[i], b = K[i + 1];
      const u = clamp((el - a[0]) / (b[0] - a[0]), 0, 1), e = i === 1 ? u * u : easeOut(u);
      const x = lerp(a[1], b[1], e), y = lerp(a[2], b[2], e), r = lerp(a[3], b[3], e);
      D.noodle(ctx, P.playerShoulder, { x: x + 10, y: y + 50 }, 46, '#c8352a', 0.1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(r);
      D.weapon(ctx, s.weapon, now);
      ctx.restore();
      if (s.weapon !== 'hand') D.glove(ctx, x, y, 1.15, r, 'grip');
      if (el > 0.45 && el < 1.5) D.text(ctx, `${WEAPONS[s.weapon].name.toUpperCase()}`, 380, 860, 30, '#fff3c4');
    } else {
      // the chicken swings at your face
      const wHold = { x: 190, y: 250 };
      if (el < 0.3) {
        const u = easeOut(el / 0.3);
        const p = lerpP(P.wingHome, wHold, u);
        const sh = P.wingShoulder;
        D.noodle(ctx, sh, p, 26, SKINS[G.skin].body, -0.2);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-0.9 * u); D.weapon(ctx, s.weapon, now); ctx.restore();
        D.mitten(ctx, p.x, p.y, 1, G.skin);
      } else {
        const sh = P.wingShoulder;
        const back = lerpP(wHold, P.wingHome, clamp((el - 0.45) / 0.4, 0, 1));
        D.noodle(ctx, sh, el < 0.45 ? wHold : back, 26, SKINS[G.skin].body, -0.2);
        D.mitten(ctx, (el < 0.45 ? wHold : back).x, (el < 0.45 ? wHold : back).y, 1, G.skin);
        let x, y, r, sc, alpha = 1;
        if (el < 0.45) { const u = (el - 0.3) / 0.15; x = lerp(230, 380, u); y = lerp(280, 700, u); r = lerp(-0.9, 0.35, u); sc = lerp(1, 3.6, u * u); }
        else { const u = clamp((el - 0.45) / 0.7, 0, 1); x = 380 + 80 * u; y = 700 + 500 * u * u; r = 0.35 + 0.8 * u; sc = 3.6; alpha = 1 - u; }
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(r); ctx.scale(sc, sc); D.weapon(ctx, s.weapon, now); ctx.restore();
      }
      if (el > 0.45 && el < 1.85) {
        // stars circling your head
        for (let k = 0; k < 5; k++) {
          const a = now * 5 + k * (Math.PI * 2 / 5);
          ctx.save(); ctx.translate(380 + Math.cos(a) * 170, 860 + Math.sin(a) * 40); ctx.rotate(a);
          ctx.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? 9 : 22; const an = j / 10 * Math.PI * 2; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
          ctx.closePath(); D.fs(ctx, '#ffe14d', INK, 3); ctx.restore();
        }
        const wn = WEAPONS[s.weapon], rr = RARITY[wn.r];
        D.text(ctx, `${G.name} hit you with ${withArticle(wn.name)}`, 380, 868, 26, '#fff3c4', { font: "'Barlow Semi Condensed', sans-serif", weight: 800 });
        D.text(ctx, save.items[s.weapon] ? rr.label.toUpperCase() : `${rr.label.toUpperCase()} · NOT IN YOUR COLLECTION YET`, 380, 898, 18, rr.color, { font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 4 });
      }
    }
  }

  function drawFinisher(now) {
    const f = G.fin, el = now - f.t0;
    const intro = clamp(el / 0.9, 0, 1), ie = easeOut(intro);
    if (f.gone) return drawFinText(now);
    let x = 380, y = lerp(CK.y, 520, ie), sc = lerp(1, 1.12, ie), rot = 0;
    const sq = f.sq;
    let sxx = 1 - 0.22 * sq, syy = 1 + 0.07 * sq;
    if (f.type === 'helium') { const k = 1 + f.inflate * 0.55; sxx *= k; syy *= k; y -= f.inflate * 25; }
    let eyes = sq > 0.15 ? 'bulge' : 'wide';
    if (f.phase === 'outro' && f.type !== 'yeet') eyes = 'x';
    if (f.type === 'yeet' && f.flyT) {
      const u = clamp((now - f.flyT) / 0.8, 0, 1);
      x = lerp(380, 580, u); y = lerp(520, 223, u) - Math.sin(u * Math.PI) * 160; sc *= lerp(1, 0.12, u); rot = u * 14;
      if (u >= 1) return drawFinText(now);
    }
    if (f.phase === 'outro' && f.type !== 'yeet') { rot = Math.min(0.5, (now - (f.endAt - 1.7)) * 1.2) * 0.6; sxx = 1; syy = 1; }
    const shake = (f.type === 'bass' ? 5 : 2.5) * sq;
    D.chicken(ctx, {
      x: x + (Math.random() - 0.5) * shake, y: y + (Math.random() - 0.5) * shake, scale: sc, sx: sxx, sy: syy, tilt: rot,
      neck: (f.phase === 'outro' && f.type !== 'yeet') ? 0.6 : sq * (f.type === 'helium' ? 0.3 : 0.65), mouth: f.phase === 'outro' && f.type !== 'yeet' ? 0.6 : sq,
      eyes, bulge: sq, skin: G.skin, t: now, legs: true,
    });
    if (!f.flyT) {
      // your two hands squeezing the body
      const hx = (128 - 34 * sq) * sc * (f.type === 'helium' ? 1 + f.inflate * 0.55 : 1);
      const lp = { x: x - hx, y: y + 16 }, rp = { x: x + hx, y: y + 16 };
      const inn = 1 - ie;
      lp.x -= inn * 300; rp.x += inn * 300;
      D.noodle(ctx, { x: -60, y: 1080 }, { x: lp.x - 30, y: lp.y + 40 }, 46, '#c8352a', -0.15);
      D.noodle(ctx, { x: 820, y: 1080 }, { x: rp.x + 30, y: rp.y + 40 }, 46, '#c8352a', 0.15);
      D.glove(ctx, lp.x, lp.y, 1.25, Math.PI / 2 + 0.2, 'grip');
      D.glove(ctx, rp.x, rp.y, 1.25, -Math.PI / 2 - 0.2, 'grip');
    }
    drawFinText(now);
  }
  function drawFinText(now) {
    const f = G.fin, el = now - f.t0;
    const fin = FINISHERS.find((x) => x.id === f.type);
    D.text(ctx, fin.name.toUpperCase(), 380, 770, 40, '#ffd84a', { rot: -0.03 });
    if (f.phase === 'play' && !f.holding) {
      const pulse = 1 + 0.06 * Math.sin(now * 8);
      const msg = f.type === 'yeet' ? 'HOLD, THEN LET GO' : f.type === 'helium' ? 'HOLD TO PUMP IT UP' : 'HOLD TO SQUEEZE';
      D.text(ctx, msg, 380, 840, 34 * pulse, '#fff3c4');
    }
    if (f.phase === 'play' && f.holding && f.type !== 'helium' && f.type !== 'yeet') {
      const need = f.type === 'bass' ? 2.6 : 2.4;
      const u = clamp(f.screamT / need, 0, 1);
      D.rr(ctx, 230, 862, 300, 22, 11); D.fs(ctx, 'rgba(0,0,0,0.5)', INK, 3);
      if (u > 0.02) { D.rr(ctx, 230, 862, 300 * u, 22, 11); D.fs(ctx, u >= 1 ? '#9ff2a0' : '#ffd84a'); }
      D.text(ctx, u >= 1 ? 'LET GO TO FINISH' : 'HAAAAWWWWW', 380, 828, 30, '#fff3c4');
    }
    if (f.type === 'bass' && f.sq > 0.2) D.text(ctx, 'BASS BOOSTED', 380 + (Math.random() - 0.5) * 10, 200, 52, '#ff3b1f', { rot: 0.05 });
    if (f.phase === 'intro') D.text(ctx, 'FINISH IT!', 380, 520, 70 * (0.8 + 0.2 * clamp(el / 0.3, 0, 1)), '#fff3c4');
  }

  function drawFloaters(now) {
    G.floaters = G.floaters.filter((fl) => now - fl.t0 < fl.dur);
    for (const fl of G.floaters) {
      const u = (now - fl.t0) / fl.dur;
      if (u < 0) continue;
      const pop = u < 0.15 ? 0.6 + 0.4 * (u / 0.15) * 1.15 : 1;
      ctx.save(); ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
      if (fl.burst) D.burst(ctx, fl.x, fl.y, fl.size * 1.5 * pop, '#e8432e', fl.rot || 0);
      D.text(ctx, fl.text, fl.x, fl.y - fl.rise * u, fl.size * pop, fl.color, { rot: fl.rot });
      ctx.restore();
    }
    if (G.bubble) {
      const b = G.bubble;
      if (now - b.t0 > b.dur) G.bubble = null;
      else if (!G.fin) D.bubble(ctx, 470, 130, b.text, 22);
    }
    if (G.banner && now < G.banner.until && !G.fin) {
      ctx.save(); ctx.globalAlpha = Math.min(1, (G.banner.until - now) * 3);
      ctx.font = "700 24px 'Barlow Semi Condensed', sans-serif";
      const w = Math.min(720, ctx.measureText(G.banner.text).width + 40);
      D.rr(ctx, 380 - w / 2, 514, w, 40, 20); D.fs(ctx, 'rgba(29,18,10,0.82)', '#ffd84a', 3);
      D.text(ctx, G.banner.text, 380, 535, 24, '#ffd84a', { font: "'Barlow Semi Condensed', sans-serif", weight: 700, stroke: false });
      ctx.restore();
    }
  }

  function drawHUD(now) {
    // top: chicken
    if (!G.fin) {
      D.text(ctx, G.name.toUpperCase(), 380, 26, 22, '#ffd84a');
      D.hpBar(ctx, 230, 44, 300, 22, G.hpC, G.hpCMax, '#ff6a4d');
      const sus = 1 - takeChance(G.streakP) / 0.8;
      D.text(ctx, 'SUSPICION', 300, 84, 14, '#fff3c4', { font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 4 });
      D.rr(ctx, 346, 78, 120, 12, 6); D.fs(ctx, 'rgba(0,0,0,0.5)', INK, 2);
      D.rr(ctx, 346, 78, Math.max(8, 120 * sus), 12, 6);
      D.fs(ctx, sus > 0.66 ? '#ff6a4d' : sus > 0.33 ? '#ffd84a' : '#9ff2a0');
      if (G.cup === 'on' && isRead(G.streakP)) {
        // it's seen this exact move before
        const ex = 486, ey = 84;
        ctx.beginPath(); ctx.moveTo(ex - 11, ey); ctx.quadraticCurveTo(ex, ey - 9, ex + 11, ey); ctx.quadraticCurveTo(ex, ey + 9, ex - 11, ey);
        D.fs(ctx, '#fff3c4', INK, 2);
        ctx.fillStyle = '#e8432e'; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
        D.text(ctx, 'READ YOU', ex + 18, ey, 14, '#ff6a4d', { align: 'left', font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 4 });
      }
    }
    // top-left: level
    D.text(ctx, G.tut ? 'TUTORIAL' : `LV ${G.level}`, HUD.l, 30, G.tut ? 20 : 26, '#fff3c4', { align: 'left' });
    D.text(ctx, `${Math.round(60 / G.T)} BPM`, HUD.l, 60, 18, '#9ff2ff', { align: 'left', font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 4 });
    if (!G.tut) D.text(ctx, ranked() ? 'RANKED' : `CUSTOM ×${save.ramp}`, HUD.l, 84, 15, ranked() ? '#ffd84a' : '#ff9d7a', { align: 'left', font: "'Barlow Semi Condensed', sans-serif", weight: 800, lw: 4 });
    // bottom: you
    D.text(ctx, 'YOU', HUD.l, 940, 22, '#9ff2ff', { align: 'left' });
    D.hpBar(ctx, HUD.l + 66, 928, 200, 24, G.hpP, G.hpPMax, '#4de1a0');
    D.egg(ctx, HUD.r - 64, 940, 1.2);
    D.text(ctx, `${save.eggs}`, HUD.r - 44, 941, 24, '#fff3c4', { align: 'left' });
  }

  // ---------- overlays / DOM ----------
  const overlays = ['title', 'howto', 'shop', 'clear', 'over', 'pause', 'packOpen'];
  function showOverlay(id) {
    overlays.forEach((o) => { $(o).hidden = o !== id; });
    document.body.classList.toggle('in-menu', !!id);
    if (id === 'title') refreshTitle();
    if (id === 'shop') renderShop();
    const first = id && $(id).querySelector('button');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  }
  let shopReturn = 'title';
  function bragText() {
    const goal = Math.max(save.best + 5, Math.ceil((save.best + 1) / 10) * 10);
    return `I'm on level ${save.best} (${rankFor(save.best)}) in Cluck Around and Find Out. Talk to me when you get to level ${goal}.`;
  }
  function setBrag(id) { $(id).textContent = bragText(); }
  function copyBrag(id, btn) {
    const done = () => { btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = 'Copy brag'), 1500); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($(id)); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); btn.textContent = 'Selected, copy it'; };
    try { navigator.clipboard.writeText(bragText()).then(done, fallback); } catch (e) { fallback(); }
  }
  // Play-testing shortcut: open the page with #level-20 to start at level 20.
  const testLevel = () => { const m = /^#level-(\d+)$/.exec(location.hash); return m ? Math.max(1, +m[1]) : 0; };
  // Start anywhere: picks up where you left off, but you can jump to any level.
  // (#level-20 on the URL presets it, for play-testing.)
  const startLv = () => testLevel() || clamp(save.startLv || modeBest(), 1, 999);
  function setStartLv(v) { save.startLv = clamp(v, 1, 999); persist(); refreshTitle(); }
  function refreshTitle() {
    $('badgeLevel').textContent = save.best;
    $('badgeRank').textContent = rankFor(save.best);
    const lv = startLv();
    $('lvNum').textContent = lv;
    $('lvBpm').textContent = `${Math.round(60 / tempoFor(lv, curRamp()))} BPM`;
    $('btnPlay').textContent = lv === 1 ? 'Play' : `Play · Level ${lv}`;
    $('lvDown').disabled = $('lvDown10').disabled = lv <= 1;
    $('mdRanked').setAttribute('aria-pressed', String(ranked()));
    $('mdCustom').setAttribute('aria-pressed', String(!ranked()));
    $('rampRow').hidden = ranked();
    $('modeNote').textContent = ranked()
      ? 'Ranked: same speed curve for everyone. This is the only mode that moves your badge.'
      : `Custom: tempo climbs ×${save.ramp} per level (${Math.round(60 / tempoFor(10, save.ramp))} BPM by level 10). Doesn't count toward your badge.`;
    document.querySelectorAll('#rampRow button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.ramp === save.ramp)));
    $('titleEggs').textContent = save.eggs;
    $('tgMusic').setAttribute('aria-pressed', String(save.music));
    $('tgSfx').setAttribute('aria-pressed', String(save.sfx));
    $('tgIntro').setAttribute('aria-pressed', String(save.intro));
  }
  function weaponIcon(id, locked) {
    const c = document.createElement('canvas');
    c.width = 112; c.height = 112; c.className = 'icon';
    const x = c.getContext('2d');
    const k = Math.min(0.42, 88 / (WEAPONS[id].len || 210));
    x.translate(56, 100); x.rotate(0.5); x.scale(k, k);
    D.weapon(x, id, 0.3);
    if (locked) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(29,18,10,0.55)'; x.fillRect(0, 0, 112, 112); }
    return c;
  }
  function finIcon(id) {
    const c = document.createElement('canvas');
    c.width = 112; c.height = 112; c.className = 'icon';
    const x = c.getContext('2d');
    const cfg = { choke: { sx: 0.8, sy: 1.08, neck: 0.9, eyes: 'bulge', bulge: 0.8 }, yeet: { tilt: 0.8, eyes: 'wide' }, helium: { sx: 1.5, sy: 1.5, eyes: 'bulge', bulge: 0.4, neck: 0.2 }, bass: { neck: 0.6, eyes: 'bulge', bulge: 1 } }[id];
    D.chicken(x, Object.assign({ x: 56, y: 92, scale: 0.24, mouth: 1, skin: 0, t: 0.2 }, cfg));
    return c;
  }
  function renderShop() {
    $('shopEggs').textContent = save.eggs;
    const ids = Object.keys(WEAPONS);
    const owned = ids.filter((k) => save.items[k]).length;
    $('collCount').textContent = `${owned} / ${ids.length}`;
    const per = ['common', 'rare', 'epic', 'legendary'].map((r) => {
      const n = ids.filter((k) => WEAPONS[k].r === r).length;
      return `${RARITY[r].label} ${n} items, ${(RARITY[r].weight / n).toFixed(2)}% each`;
    });
    $('oddsPerItem').textContent = `Per item: ${per.join(' · ')}.`;
    $('btnOpenPack').innerHTML = `Open a pack <span class="price"><span class="egg-dot"></span>${MYSTERY.price}</span>`;
    $('btnOpenPack').classList.toggle('short', save.eggs < MYSTERY.price);
    const grid = $('collGrid'); grid.innerHTML = '';
    ['starter', 'common', 'rare', 'epic', 'legendary'].forEach((r) => ids.filter((k) => WEAPONS[k].r === r).forEach((k) => {
      const have = !!save.items[k];
      const li = document.createElement('li'); li.className = 'tile' + (have ? '' : ' locked');
      li.style.setProperty('--rar', RARITY[r].color);
      li.appendChild(weaponIcon(k, !have));
      const nm = document.createElement('span'); nm.textContent = have ? WEAPONS[k].name : '???';
      li.appendChild(nm);
      li.title = have ? `${WEAPONS[k].name} · ${RARITY[r].label}` : `Locked · ${RARITY[r].label}`;
      grid.appendChild(li);
    }));
    const fl = $('finList'); fl.innerHTML = '';
    FINISHERS.forEach((f) => {
      const owned = !!save.fins[f.id];
      const li = document.createElement('li'); li.className = 'item' + (owned ? ' owned' : '') + (save.fin === f.id ? ' equipped' : '');
      const icons = document.createElement('div'); icons.className = 'icons'; icons.appendChild(finIcon(f.id));
      const body = document.createElement('div'); body.className = 'item-body';
      body.innerHTML = `<h3></h3><p class="blurb"></p>`;
      body.querySelector('h3').textContent = f.name;
      body.querySelector('.blurb').textContent = f.blurb;
      const btn = document.createElement('button'); btn.className = 'btn small';
      if (owned) {
        btn.textContent = save.fin === f.id ? 'Equipped' : 'Equip';
        btn.disabled = save.fin === f.id;
        btn.onclick = () => { save.fin = f.id; persist(); renderShop(); };
      } else {
        btn.innerHTML = `<span class="egg-dot"></span>${f.price}`;
        btn.setAttribute('aria-label', `Buy ${f.name} for ${f.price} eggs`);
        if (save.eggs < f.price) btn.classList.add('short');
        btn.onclick = () => buy('fins', f);
      }
      li.append(icons, body, btn); fl.appendChild(li);
    });
  }
  function rollItem(minRarity) {
    const tiers = ['common', 'rare', 'epic', 'legendary'].filter((r) => !minRarity || r !== 'common');
    const total = tiers.reduce((a, r) => a + RARITY[r].weight, 0);
    let x = Math.random() * total, tier = tiers[0];
    for (const r of tiers) { if ((x -= RARITY[r].weight) < 0) { tier = r; break; } }
    return pick(Object.keys(WEAPONS).filter((k) => WEAPONS[k].r === tier));
  }
  // Single entry point for buying a pack. Launch plan (Oct 2026 research): random packs stay
  // eggs-only, earned by playing. Real money buys items, finishers and fixed bundles directly,
  // which keeps the game clear of paid loot-box rules (Belgium, Brazil, PEGI 16, Apple odds).
  function buyPack() {
    const msg = $('shopMsg');
    if (save.eggs < MYSTERY.price) { msg.textContent = `You need ${MYSTERY.price - save.eggs} more eggs. Smack the chicken to earn them.`; return; }
    save.eggs -= MYSTERY.price;
    grantPack();
  }
  function grantPack() {
    Sfx.init();
    const rolls = [];
    for (let i = 0; i < MYSTERY.count; i++) rolls.push(rollItem(i === MYSTERY.count - 1 && !rolls.some((k) => WEAPONS[k].r !== 'common')));
    let refund = 0;
    const result = rolls.map((k) => {
      const isNew = !save.items[k];
      save.items[k] = true;
      const back = isNew ? 0 : RARITY[WEAPONS[k].r].refund;
      refund += back;
      return { k, isNew, back };
    });
    save.eggs += refund;
    persist();
    showPack(result, refund);
  }
  function showPack(result, refund) {
    const row = $('packCards'); row.innerHTML = '';
    const t0 = Sfx.now();
    result.forEach(({ k, isNew, back }, i) => {
      const w = WEAPONS[k], r = RARITY[w.r];
      const card = document.createElement('li'); card.className = `pcard r-${w.r}`;
      card.style.setProperty('--rar', r.color); card.style.animationDelay = `${0.15 + i * 0.4}s`;
      card.appendChild(weaponIcon(k));
      const nm = document.createElement('b'); nm.textContent = w.name;
      const tag = document.createElement('span'); tag.className = 'rar'; tag.textContent = r.label;
      const st = document.createElement('span'); st.className = isNew ? 'new' : 'dupe'; st.textContent = isNew ? 'NEW' : `Dupe +${back} eggs`;
      card.append(nm, tag, st); row.appendChild(card);
      const at = t0 + 0.15 + i * 0.4;
      if (w.r === 'legendary') Sfx.fanfare(at); else if (w.r === 'epic') { Sfx.coin(at); Sfx.coin(at + 0.12); } else Sfx.squeak(at, 1 + i * 0.08, { dur: 0.16, hard: 0.6 });
    });
    $('packSummary').textContent = refund ? `Duplicates paid back ${refund} eggs.` : 'Every one of them is going in your smack pool.';
    $('btnPackAgain').innerHTML = `Open another <span class="price"><span class="egg-dot"></span>${MYSTERY.price}</span>`;
    $('btnPackAgain').disabled = save.eggs < MYSTERY.price;
    showOverlay('packOpen');
  }
  function buy(kind, item) {
    const msg = $('shopMsg');
    if (save.eggs < item.price) {
      msg.textContent = `You need ${item.price - save.eggs} more eggs for ${item.name}. Smack the chicken to earn them.`;
      return;
    }
    Sfx.init();
    save.eggs -= item.price; save[kind][item.id] = true;
    if (kind === 'fins') save.fin = item.id;
    persist();
    Sfx.coin(Sfx.now()); Sfx.squeak(Sfx.now() + 0.2);
    msg.textContent = `${item.name} unlocked and equipped.`;
    renderShop();
  }

  // buttons
  const on = (id, fn) => $(id).addEventListener('click', fn);
  on('btnPlay', () => beginGame(startLv()));
  [['lvDown', -1], ['lvUp', 1], ['lvDown10', -10], ['lvUp10', 10]].forEach(([id, d]) => {
    // tap to step, hold to keep stepping
    let timer = null;
    const stop = () => { clearTimeout(timer); timer = null; };
    $(id).addEventListener('pointerdown', (e) => {
      e.preventDefault(); setStartLv(startLv() + d);
      const go = (delay) => { timer = setTimeout(() => { setStartLv(startLv() + d); go(70); }, delay); };
      go(400);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => $(id).addEventListener(ev, stop));
    $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStartLv(startLv() + d); } });
  });
  on('mdRanked', () => { save.mode = 'ranked'; save.startLv = null; persist(); refreshTitle(); });
  on('mdCustom', () => { save.mode = 'custom'; save.startLv = null; persist(); refreshTitle(); });
  RAMPS.forEach((r) => {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.ramp = r.v; b.textContent = `×${r.v} ${r.label}`;
    b.onclick = () => { save.ramp = r.v; persist(); refreshTitle(); };
    $('rampRow').appendChild(b);
  });
  on('btnHow', () => showOverlay('howto'));
  on('btnHowBack', () => showOverlay('title'));
  on('btnHowTut', () => { introSeen = true; startLevel(1, { tutorial: true }); });
  on('btnSkipTut', () => { if (G.tut) endTutorial(); });
  on('btnShop', () => { shopReturn = 'title'; $('shopMsg').textContent = ''; showOverlay('shop'); });
  on('btnShopBack', () => showOverlay(shopReturn));
  on('btnNext', () => startLevel(G.level + 1));
  on('btnClearShop', () => { shopReturn = 'clear'; $('shopMsg').textContent = ''; showOverlay('shop'); });
  on('btnClearMenu', () => { G.scene = 'title'; showOverlay('title'); });
  on('btnRetry', () => startLevel(G.level));
  on('btnOverMenu', () => { G.scene = 'title'; showOverlay('title'); });
  on('btnResume', resume);
  on('btnOpenPack', buyPack);
  on('btnPackAgain', buyPack);
  on('btnPackDone', () => { $('shopMsg').textContent = ''; showOverlay('shop'); });
  on('btnClearBrag', (e) => copyBrag('clearBrag', e.currentTarget));
  on('btnOverBrag', (e) => copyBrag('overBrag', e.currentTarget));
  on('btnQuit', () => { G.tut = null; G.paused = false; Sfx.resume(); G.fin = null; G.smack = null; G.ready = null; G.bubble = null; G.scene = 'title'; showOverlay('title'); });
  on('btnPause', pause);
  on('tgMusic', () => { save.music = !save.music; Sfx.musicOn = save.music; persist(); refreshTitle(); });
  on('tgIntro', () => { save.intro = !save.intro; persist(); refreshTitle(); });
  on('tgSfx', () => { save.sfx = !save.sfx; Sfx.sfxOn = save.sfx; persist(); refreshTitle(); });
  Sfx.musicOn = save.music; Sfx.sfxOn = save.sfx;

  // play controls: pointerdown for zero-delay taps; release matters for the finisher
  function bindHold(el, kind) {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); Sfx.init(); press(kind); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => el.addEventListener(ev, () => { if (G.scene === 'fin') finHold(false); }));
  }
  bindHold($('bTap'), 'tap');
  bindHold($('bGrab'), 'grab');
  bindHold(canvas, 'tap');

  const TAP_KEYS = ['Space', 'KeyJ', 'KeyK', 'ArrowDown'];
  const GRAB_KEYS = ['KeyF', 'KeyG', 'ArrowUp', 'ShiftLeft', 'ShiftRight'];
  window.addEventListener('keydown', (e) => {
    const inMenu = document.body.classList.contains('in-menu');
    if (e.code === 'Escape' || e.code === 'KeyP') { if (G.paused) resume(); else pause(); return; }
    if (inMenu) return;
    const tapK = TAP_KEYS.includes(e.code), grabK = GRAB_KEYS.includes(e.code);
    if (!tapK && !grabK) return;
    e.preventDefault();
    if (e.repeat) return;
    press(grabK ? 'grab' : 'tap');
  });
  window.addEventListener('keyup', (e) => {
    if ((TAP_KEYS.includes(e.code) || GRAB_KEYS.includes(e.code)) && G.scene === 'fin') finHold(false);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', () => { if (G.fin && G.fin.holding) finHold(false); });

  // title screen idle: the chicken squeaks if you poke it
  canvas.addEventListener('pointerdown', () => {
    if (G.scene === 'title') { Sfx.init(); G.squeakT = Sfx.now(); G.hitT = Sfx.now() - 1.3; Sfx.squeak(Sfx.now()); }
  });

  // test hook (used by the automated smoke test; harmless in play)
  window.__cluck = { G, save, beginGame, launch, startLevel, startFinisher, readySmack, tempoFor, rankFor, takeChance, isRead, readPenalty, press, finHold, WEAPONS, RARITY, MYSTERY, grantPack, FINISHERS };

  showOverlay('title');
  requestAnimationFrame(frame);
})();
