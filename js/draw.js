// Canvas drawing for the scene. Everything is vector-drawn so the game ships with no image files.
// Logical canvas is 760 x 980; game.js scales it to fit the screen.
const VW = 760, VH = 980;
const INK = '#1d120a';

const SKINS = [
  { body: '#FFD23F', shade: '#E39A10', line: '#5c3300', comb: '#E5352B', beak: '#FF8A1F' }, // classic yellow
  { body: '#5CD65A', shade: '#2B963A', line: '#0f3a16', comb: '#E5352B', beak: '#FF8A1F' }, // the big green one
  { body: '#3B3940', shade: '#17161a', line: '#000000', comb: '#E5352B', beak: '#FFB21F' }, // black keychain one
  { body: '#FF9CC6', shade: '#D9578F', line: '#5a1532', comb: '#B51F6A', beak: '#FFB21F' }, // pink
  { body: '#8FD7FF', shade: '#3F8FC9', line: '#0d2f4a', comb: '#E5352B', beak: '#FF8A1F' }, // blue
];

const D = {
  ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); },
  rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); },
  fs(ctx, fill, stroke, lw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw || 4; ctx.strokeStyle = stroke; ctx.stroke(); } },

  text(ctx, str, x, y, size, fill, opts = {}) {
    ctx.save();
    ctx.font = `${opts.weight || ''} ${size}px ${opts.font || "'Rammetto One', 'Arial Black', Impact, sans-serif"}`;
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.base || 'middle';
    if (opts.rot) { ctx.translate(x, y); ctx.rotate(opts.rot); x = 0; y = 0; }
    if (opts.stroke !== false) {
      ctx.lineJoin = 'round'; ctx.lineWidth = opts.lw || Math.max(3, size * 0.18); ctx.strokeStyle = opts.stroke || INK;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = fill; ctx.fillText(str, x, y);
    ctx.restore();
  },

  // ---------- room ----------
  room(ctx, t, opts = {}) {
    // wall
    const g = ctx.createLinearGradient(0, 0, 0, 520);
    g.addColorStop(0, '#0b2c29'); g.addColorStop(1, '#13463f');
    ctx.fillStyle = g; ctx.fillRect(-800, -400, VW + 1600, 920);
    // wallpaper pattern: faint diamonds
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#9fe0c8';
    for (let y = 30; y < 520; y += 60) for (let x = -780 + ((y / 60) % 2) * 30; x < VW + 780; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.fill();
    }
    ctx.restore();
    D.window(ctx, t, opts);
    // poster on the left
    ctx.save(); ctx.translate(150, 240); ctx.rotate(-0.06);
    D.rr(ctx, -62, -86, 124, 160, 6); D.fs(ctx, '#f3e3c3', INK, 4);
    D.text(ctx, 'NO', 0, -52, 26, '#E5352B', { lw: 0, stroke: false });
    D.text(ctx, 'BELL', 0, -20, 26, INK, { stroke: false });
    D.text(ctx, 'RINGING', 0, 10, 17, INK, { stroke: false });
    D.text(ctx, '— management', 0, 46, 13, '#6b4a2a', { stroke: false, font: "'Barlow Semi Condensed', sans-serif", weight: 600 });
    ctx.restore();
    // hanging lamp + light cone
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(380, -400); ctx.lineTo(380, 40); ctx.stroke();
    const lg = ctx.createRadialGradient(380, 560, 30, 380, 560, 520);
    lg.addColorStop(0, 'rgba(255,214,140,0.28)'); lg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = lg; ctx.fillRect(-800, -400, VW + 1600, 1600);
    ctx.beginPath(); ctx.moveTo(330, 72); ctx.quadraticCurveTo(380, 22, 430, 72); ctx.closePath(); D.fs(ctx, '#d2462f', INK, 4);
    D.ellipse(ctx, 380, 74, 22, 7); D.fs(ctx, '#fff3c4');
  },
  window(ctx, t, opts) {
    const x = 500, y = 118, w = 160, h = 210;
    ctx.save();
    D.rr(ctx, x - 10, y - 10, w + 20, h + 20, 8); D.fs(ctx, '#5a3018', INK, 4);
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#0e1236'); sky.addColorStop(1, '#3b2a5c');
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff8d8'; ctx.beginPath(); ctx.arc(x + 128, y + 46, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0e1236'; ctx.beginPath(); ctx.arc(x + 136, y + 40, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; [[20, 30], [60, 70], [95, 20], [40, 120], [150, 110], [110, 150]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 2, 2));
    ctx.fillStyle = '#1b1530';
    [[0, 150, 40, 60], [36, 128, 34, 82], [72, 160, 44, 50], [112, 138, 58, 72]].forEach(([a, b, c, d]) => ctx.fillRect(x + a, y + b, c, d));
    ctx.fillStyle = '#ffd36b';
    [[46, 140], [56, 160], [120, 150], [140, 170], [86, 175], [10, 165]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 6, 8));
    if (opts.windowBroken) {
      ctx.strokeStyle = '#e8f4ff'; ctx.lineWidth = 2;
      const cx = x + w / 2, cy = y + h / 2;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 140); ctx.stroke(); }
      ctx.fillStyle = '#05061a'; D.ellipse(ctx, cx, cy, 34, 30); ctx.fill();
    } else {
      ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(x + 20, y + h); ctx.lineTo(x + 70, y); ctx.lineTo(x + 95, y); ctx.lineTo(x + 45, y + h); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.strokeStyle = '#5a3018'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  },
  table(ctx) {
    const top = 500;
    ctx.beginPath(); ctx.moveTo(-800, top); ctx.lineTo(VW + 800, top); ctx.lineTo(VW + 800, VH + 400); ctx.lineTo(-800, VH + 400); ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, VH);
    g.addColorStop(0, '#3e140a'); g.addColorStop(0.35, '#6b2513'); g.addColorStop(1, '#8a3518');
    ctx.fillStyle = g; ctx.fill();
    // wood grain
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = top + 30 + i * i * 6;
      ctx.beginPath(); ctx.moveTo(-800, y); ctx.bezierCurveTo(100, y - 10, 500, y + 14, VW + 800, y - 4); ctx.stroke();
    }
    ctx.restore();
    // lacquer gloss
    const gl = ctx.createRadialGradient(380, 690, 10, 380, 690, 330);
    gl.addColorStop(0, 'rgba(255,190,120,0.25)'); gl.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = gl; ctx.fillRect(-800, top, VW + 1600, 700);
    ctx.fillStyle = '#250b04'; ctx.fillRect(-800, top - 4, VW + 1600, 8);
    // the chicken's tray (nod to the video)
    ctx.save(); ctx.translate(175, 600); ctx.rotate(-0.05);
    D.rr(ctx, -70, -26, 140, 52, 8); D.fs(ctx, '#aeb4b8', INK, 3);
    D.rr(ctx, -60, -18, 120, 36, 5); D.fs(ctx, '#c9cfd2');
    ctx.restore();
  },

  bell(ctx, x, y, gleam) {
    D.ellipse(ctx, x, y + 2, 66, 16); D.fs(ctx, '#2b2b30', INK, 4);
    D.ellipse(ctx, x, y - 2, 60, 13); D.fs(ctx, '#55565e');
    ctx.beginPath(); ctx.ellipse(x, y - 4, 46, 44, 0, Math.PI, 0); ctx.closePath();
    const g = ctx.createLinearGradient(x - 46, 0, x + 46, 0);
    g.addColorStop(0, '#9a7a1c'); g.addColorStop(0.35, '#ffe27a'); g.addColorStop(0.6, '#e6b53a'); g.addColorStop(1, '#7a5a10');
    D.fs(ctx, g, INK, 4);
    D.rr(ctx, x - 5, y - 60, 10, 14, 3); D.fs(ctx, '#3a3a40', INK, 3);
    D.ellipse(ctx, x, y - 61, 10, 5); D.fs(ctx, '#55565e', INK, 3);
    if (gleam > 0) {
      ctx.save(); ctx.globalAlpha = gleam; ctx.translate(x - 18, y - 30);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-2, -16 - gleam * 10, 4, 32 + gleam * 20); }
      ctx.restore();
    }
  },
  // inverted plastic cup; (x, y) is the top centre of the cup
  cup(ctx, x, y, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const h = 108, tw = 48, bw = 70;
    ctx.beginPath(); ctx.moveTo(-tw, 0); ctx.lineTo(tw, 0); ctx.lineTo(bw, h); ctx.lineTo(-bw, h); ctx.closePath();
    const g = ctx.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, '#8d97a3'); g.addColorStop(0.3, '#eef3f8'); g.addColorStop(0.55, '#c3ccd6'); g.addColorStop(1, '#6f7884');
    D.fs(ctx, g, INK, 4);
    ctx.strokeStyle = 'rgba(29,18,10,0.35)'; ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) { const yy = i * h / 5; const ww = tw + (bw - tw) * yy / h; ctx.beginPath(); ctx.moveTo(-ww + 4, yy); ctx.lineTo(ww - 4, yy); ctx.stroke(); }
    D.ellipse(ctx, 0, 0, tw, 9); D.fs(ctx, '#dfe6ee', INK, 4);
    D.ellipse(ctx, 0, h, bw, 12); D.fs(ctx, null, INK, 4);
    ctx.restore();
  },

  // ---------- characters ----------
  // c: {x,y,scale,sx,sy,tilt,neck,mouth,eyes,look,skin,flash,t,legs,blush}
  chicken(ctx, c) {
    const s = SKINS[c.skin || 0];
    ctx.save();
    if (c.flash > 0) ctx.filter = `brightness(${1 + c.flash * 1.6})`;
    ctx.translate(c.x, c.y); ctx.rotate(c.tilt || 0); ctx.scale((c.scale || 1) * (c.sx || 1), (c.scale || 1) * (c.sy || 1));
    const L = 70 + 110 * (c.neck || 0);
    const wob = Math.sin((c.t || 0) * 9) * 4 * (c.neck || 0);
    const hy = -78 - L - 40;
    if (c.legs) {
      ctx.lineCap = 'round';
      [[-40, 1], [40, -1]].forEach(([lx, d]) => {
        const sw = Math.sin((c.t || 0) * 8 + lx) * 0.25;
        ctx.save(); ctx.translate(lx, 80); ctx.rotate(sw);
        ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 80); ctx.stroke();
        ctx.strokeStyle = s.beak; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(-18 * d, 100); ctx.moveTo(0, 80); ctx.lineTo(0, 104); ctx.moveTo(0, 80); ctx.lineTo(18 * d, 100);
        ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = s.beak; ctx.lineWidth = 6; ctx.stroke();
        ctx.restore();
      });
    }
    // tail
    ctx.beginPath(); ctx.moveTo(70, -40); ctx.quadraticCurveTo(150, -110, 120, -20); ctx.quadraticCurveTo(150, -40, 110, 20); ctx.closePath();
    D.fs(ctx, s.shade, s.line, 5);
    // body
    D.ellipse(ctx, 0, 0, 118, 100);
    const bg = ctx.createRadialGradient(-30, -40, 10, 0, 0, 130);
    bg.addColorStop(0, s.body); bg.addColorStop(1, s.shade);
    D.fs(ctx, bg, s.line, 5);
    // far wing (static)
    D.ellipse(ctx, 92, 6, 34, 56, -0.35); D.fs(ctx, s.shade, s.line, 4);
    // goosebumps (plucked rubber look)
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    [[-50, 20], [-20, 45], [10, 30], [40, 55], [-60, -20], [30, -10]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 3, 0, Math.PI * 2); ctx.fill(); });
    // neck
    ctx.beginPath();
    ctx.moveTo(-30, -70);
    ctx.bezierCurveTo(-26 + wob, -70 - L * 0.5, -22 - wob, -70 - L, -22, -78 - L);
    ctx.lineTo(22, -78 - L);
    ctx.bezierCurveTo(22 - wob, -70 - L, 26 + wob, -70 - L * 0.5, 30, -70);
    ctx.closePath();
    D.fs(ctx, s.body, s.line, 5);
    ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = s.line; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { const yy = -70 - L * i / 4; ctx.beginPath(); ctx.moveTo(-16, yy); ctx.quadraticCurveTo(0, yy + 5, 16, yy); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = s.body; ctx.fillRect(-26, -82, 52, 22); // hide seam
    // head
    ctx.save(); ctx.translate(wob, hy);
    // comb
    [[-24, -46, 17], [-2, -58, 20], [20, -50, 17], [36, -36, 12]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, Math.PI * 2); D.fs(ctx, s.comb, s.line, 4); });
    D.ellipse(ctx, 0, 0, 54, 50);
    const hg = ctx.createRadialGradient(-14, -18, 5, 0, 0, 60);
    hg.addColorStop(0, s.body); hg.addColorStop(1, s.shade);
    D.fs(ctx, hg, s.line, 5);
    if (c.blush) { ctx.fillStyle = 'rgba(255,80,80,0.35)'; D.ellipse(ctx, -36, 12, 10, 6); ctx.fill(); D.ellipse(ctx, 36, 12, 10, 6); ctx.fill(); }
    D.eyes(ctx, c);
    // beak + mouth
    // mouth 0 = beak shut; it only opens while the chicken is making a sound
    const m = Math.min(1, Math.max(0, c.mouth || 0));
    const open = 36 * m;
    if (m > 0.03) {
      ctx.beginPath(); ctx.ellipse(0, 20 + open * 0.5, 15 + 6 * m, open * 0.5 + 3, 0, 0, Math.PI * 2); D.fs(ctx, '#7a0f1a', s.line, 4);
      ctx.fillStyle = '#e5455a'; D.ellipse(ctx, 0, 20 + open * 0.8, 8 + 4 * m, 2 + 3 * m); ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(-19, 19 + open); ctx.quadraticCurveTo(0, 15 + open, 19, 19 + open); ctx.lineTo(0, 34 + open); ctx.closePath(); D.fs(ctx, s.beak, s.line, 4);
    ctx.beginPath(); ctx.moveTo(-26, 10); ctx.quadraticCurveTo(0, 2, 26, 10); ctx.lineTo(0, 28); ctx.closePath(); D.fs(ctx, s.beak, s.line, 4);
    // wattle
    ctx.beginPath(); ctx.moveTo(-8, 32 + open); ctx.quadraticCurveTo(-16, 60 + open, 0, 62 + open); ctx.quadraticCurveTo(16, 60 + open, 8, 32 + open); D.fs(ctx, s.comb, s.line, 4);
    ctx.restore();
    ctx.restore();
    return { headX: c.x, headY: c.y + hy * (c.scale || 1) * (c.sy || 1) };
  },
  eyes(ctx, c) {
    const s = SKINS[c.skin || 0];
    const mode = c.eyes || 'normal';
    const t = c.t || 0;
    let r = 15, pr = 6.5, look = c.look || 0;
    if (mode === 'wide') { r = 19; pr = 4; }
    if (mode === 'bulge') { r = 15 + 12 * (c.bulge || 1); pr = 5; }
    if (mode === 'shifty') look = Math.sin(t * 16) > 0 ? 1 : -1;
    [-21, 21].forEach((ex, i) => {
      const ey = -10;
      ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); D.fs(ctx, '#fff', s.line, 3.5);
      if (mode === 'x') {
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath();
        ctx.moveTo(ex - 8, ey - 8); ctx.lineTo(ex + 8, ey + 8); ctx.moveTo(ex + 8, ey - 8); ctx.lineTo(ex - 8, ey + 8); ctx.stroke();
      } else if (mode === 'dizzy') {
        ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let a = 0; a < 12; a += 0.3) { const rr = a * 1.05; const px = ex + Math.cos(a + t * 10) * rr, py = ey + Math.sin(a + t * 10) * rr; a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
        ctx.stroke();
      } else {
        ctx.fillStyle = mode === 'angry' ? '#b3121b' : INK; ctx.beginPath(); ctx.arc(ex + look * (r - pr - 3), ey + 2, pr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look * (r - pr - 3) - 2, ey - 1, pr * 0.3, 0, Math.PI * 2); ctx.fill();
        if (mode === 'bulge' && (c.bulge || 0) > 0.5) {
          ctx.strokeStyle = 'rgba(220,30,30,0.7)'; ctx.lineWidth = 1.5;
          for (let k = 0; k < 5; k++) { const a = k * 1.3 + i; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); ctx.lineTo(ex + Math.cos(a + 0.2) * r * 0.6, ey + Math.sin(a + 0.2) * r * 0.6); ctx.stroke(); }
        }
      }
      if (mode === 'angry') {
        const d = ex < 0 ? 1 : -1; // inner side slopes down
        ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, r + 1, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath(); ctx.moveTo(ex - r - 2, ey - r - 2); ctx.lineTo(ex + r + 2, ey - r - 2);
        ctx.lineTo(ex + (r + 2) * d, ey + 2); ctx.lineTo(ex - (r + 2) * d, ey - r * 0.7); ctx.closePath();
        ctx.fillStyle = s.body; ctx.fill(); ctx.restore();
        ctx.strokeStyle = s.line; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex - (r + 2) * d, ey - r * 0.7); ctx.lineTo(ex + (r + 2) * d, ey + 2); ctx.stroke();
      }
      if (mode === 'shifty' || mode === 'smug') {
        // heavy lids
        ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, r + 1, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = s.body; ctx.fillRect(ex - r - 2, ey - r - 2, r * 2 + 4, r + 1);
        ctx.restore();
        ctx.strokeStyle = s.line; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex - r, ey - 1); ctx.lineTo(ex + r, ey - 1); ctx.stroke();
      }
    });
  },
  noodle(ctx, a, b, w, color, bend = 0.25) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const cx = mx - dy * bend, cy = my + dx * bend;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cx, cy, b.x, b.y);
    ctx.strokeStyle = INK; ctx.lineWidth = w + 9; ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  },
  // cartoon glove. pose: 'flat' (slap), 'grip' (holding)
  glove(ctx, x, y, s = 1, rot = 0, pose = 'flat') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const W = '#fbfaf2';
    D.rr(ctx, -26, 30, 52, 30, 10); D.fs(ctx, W, INK, 4); // cuff
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, 42); ctx.lineTo(22, 42); ctx.stroke();
    if (pose === 'grip') {
      D.ellipse(ctx, 0, 6, 40, 34); D.fs(ctx, W, INK, 4);
      [-24, -8, 8, 24].forEach((fx) => { D.ellipse(ctx, fx, -20, 10, 13); D.fs(ctx, W, INK, 4); });
      D.ellipse(ctx, -38, 4, 12, 18, 0.5); D.fs(ctx, W, INK, 4);
    } else {
      [-27, -9, 9, 27].forEach((fx, i) => { D.rr(ctx, fx - 9, -50 + Math.abs(i - 1.5) * 6, 18, 50, 9); D.fs(ctx, W, INK, 4); });
      D.ellipse(ctx, 0, 6, 42, 32); D.fs(ctx, W, INK, 4);
      D.ellipse(ctx, -44, 8, 11, 22, 0.7); D.fs(ctx, W, INK, 4);
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath();
      [-12, 0, 12].forEach((lx) => { ctx.moveTo(lx, -6); ctx.lineTo(lx, 14); }); ctx.stroke();
    }
    ctx.restore();
  },
  mitten(ctx, x, y, s, skin, rot = 0) {
    const k = SKINS[skin || 0];
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    [[-18, -10], [0, -16], [18, -10]].forEach(([fx, fy]) => { D.ellipse(ctx, fx, fy, 12, 18); D.fs(ctx, k.body, k.line, 4); });
    D.ellipse(ctx, 0, 6, 32, 22); D.fs(ctx, k.body, k.line, 4);
    ctx.restore();
  },

  // ---------- weapons: origin is the grip, the business end points up (-y) ----------
  weapon(ctx, id, t = 0) {
    ctx.save();
    ctx.lineJoin = 'round';
    switch (id) {
      case 'hand': D.glove(ctx, 0, -40, 1.3, 0, 'flat'); break;
      case 'tray': {
        D.rr(ctx, -66, -190, 132, 182, 10); D.fs(ctx, '#a9b0b5', INK, 5);
        D.rr(ctx, -54, -178, 108, 158, 6); D.fs(ctx, '#d2d8db', '#8b9297', 2);
        ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-40, -170); ctx.lineTo(-20, -170); ctx.lineTo(-48, -30); ctx.lineTo(-54, -60); ctx.fill();
        break;
      }
      case 'pan': {
        D.rr(ctx, -8, -78, 16, 82, 6); D.fs(ctx, '#5b3218', INK, 4);
        ctx.beginPath(); ctx.arc(0, -138, 64, 0, Math.PI * 2); D.fs(ctx, '#2c2c31', INK, 5);
        ctx.beginPath(); ctx.arc(0, -138, 50, 0, Math.PI * 2); D.fs(ctx, '#3d3e45');
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -138, 40, 3.6, 4.6); ctx.stroke();
        break;
      }
      case 'baguette': {
        D.rr(ctx, -19, -215, 38, 230, 19); D.fs(ctx, '#D99A4E', INK, 5);
        ctx.strokeStyle = '#a3622a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) { const y = -190 + i * 40; ctx.beginPath(); ctx.moveTo(-10, y + 12); ctx.lineTo(10, y); ctx.stroke(); }
        break;
      }
      case 'plunger': {
        D.rr(ctx, -7, -150, 14, 160, 6); D.fs(ctx, '#C99158', INK, 4);
        ctx.beginPath(); ctx.moveTo(-52, -150); ctx.quadraticCurveTo(-52, -205, 0, -208); ctx.quadraticCurveTo(52, -205, 52, -150); ctx.closePath(); D.fs(ctx, '#d9302a', INK, 5);
        D.ellipse(ctx, 0, -150, 52, 10); D.fs(ctx, '#a51f1b', INK, 4);
        break;
      }
      case 'cone': {
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(62, -178); ctx.lineTo(-62, -178); ctx.closePath(); D.fs(ctx, '#ff7a1a', INK, 5);
        ctx.fillStyle = '#fff';
        [[-60, 0.35], [-120, 0.7]].forEach(([y]) => { const w1 = 12 + 50 * (-y) / 178, w2 = 12 + 50 * (-y + 22) / 178; ctx.beginPath(); ctx.moveTo(-w1, y); ctx.lineTo(w1, y); ctx.lineTo(w2, y - 22); ctx.lineTo(-w2, y - 22); ctx.fill(); });
        D.rr(ctx, -76, -192, 152, 16, 4); D.fs(ctx, '#d65a0a', INK, 4);
        break;
      }
      case 'keyboard': {
        D.rr(ctx, -42, -240, 84, 250, 8); D.fs(ctx, '#2f3138', INK, 5);
        ctx.fillStyle = '#d7d9de';
        for (let r = 0; r < 4; r++) for (let k = 0; k < 11; k++) ctx.fillRect(-34 + r * 18, -230 + k * 21, 14, 16);
        break;
      }
      case 'sock': {
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-22, -140); ctx.quadraticCurveTo(-22, -190, 30, -188); ctx.quadraticCurveTo(70, -186, 66, -158); ctx.quadraticCurveTo(62, -134, 22, -136); ctx.lineTo(22, 0); ctx.closePath();
        D.fs(ctx, '#f3f0e6', INK, 5);
        ctx.save(); ctx.clip(); ctx.fillStyle = '#d6302b';
        for (let y = -20; y > -140; y -= 30) ctx.fillRect(-30, y - 10, 60, 12);
        ctx.fillStyle = 'rgba(80,60,20,0.25)'; ctx.fillRect(-40, -200, 120, 70);
        ctx.restore();
        ctx.fillStyle = '#5fb7ff';
        [[-30, -60], [30, -100], [70, -150], [-28, -150]].forEach(([a, b], i) => { const dy = ((t * 120 + i * 40) % 60); ctx.beginPath(); ctx.arc(a, b + dy, 4, 0, Math.PI * 2); ctx.fill(); });
        break;
      }
      case 'chancla': {
        D.rr(ctx, -34, -200, 68, 205, 32); D.fs(ctx, '#2a7fd6', INK, 5);
        D.rr(ctx, -26, -192, 52, 189, 26); D.fs(ctx, '#58a6ef');
        ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-30, -90); ctx.lineTo(0, -160); ctx.lineTo(30, -90); ctx.stroke();
        ctx.strokeStyle = '#ffcf33'; ctx.lineWidth = 7; ctx.stroke();
        break;
      }
      case 'fish': {
        ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(-30, 8); ctx.lineTo(30, 8); ctx.closePath(); D.fs(ctx, '#4f86ad', INK, 4);
        D.ellipse(ctx, 0, -115, 34, 92); D.fs(ctx, '#6FA3C7', INK, 5);
        ctx.fillStyle = '#9fc6e0'; D.ellipse(ctx, 8, -115, 14, 70); ctx.fill();
        ctx.beginPath(); ctx.arc(-12, -170, 8, 0, Math.PI * 2); D.fs(ctx, '#fff', INK, 3);
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-12, -170, 3.5, 0, Math.PI * 2); ctx.fill();
        D.ellipse(ctx, 0, -205, 10, 6); D.fs(ctx, '#e5455a', INK, 3);
        break;
      }
      case 'wobbler': {
        // a suspicious purple wobbly thing. it jiggles.
        const segs = 14, len = 180, amp = 10 + 8 * Math.sin(t * 3);
        const pts = [];
        for (let i = 0; i <= segs; i++) { const u = i / segs; pts.push([Math.sin(t * 22 - u * 3) * amp * u * u, -u * len]); }
        ctx.lineCap = 'round';
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = INK; ctx.lineWidth = 50; ctx.stroke();
        ctx.strokeStyle = '#9B4DFF'; ctx.lineWidth = 41; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 8;
        ctx.beginPath(); pts.slice(2, 12).forEach(([x, y], i) => (i ? ctx.lineTo(x - 10, y) : ctx.moveTo(x - 10, y))); ctx.stroke();
        const [tx, ty] = pts[segs];
        ctx.beginPath(); ctx.arc(tx, ty - 6, 26, 0, Math.PI * 2); D.fs(ctx, '#a960ff', INK, 4.5);
        D.ellipse(ctx, 0, 6, 38, 12); D.fs(ctx, '#7a2fe0', INK, 4.5);
        break;
      }
      case 'junior': {
        ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-10, -40); ctx.moveTo(8, 0); ctx.lineTo(10, -40); ctx.stroke();
        ctx.strokeStyle = '#FF8A1F'; ctx.lineWidth = 5; ctx.stroke();
        D.chicken(ctx, { x: 0, y: -80, scale: 0.42, mouth: 0.8 + 0.2 * Math.sin(t * 20), eyes: 'wide', t, skin: 0 });
        break;
      }
      // ---- commons ----
      case 'duck': {
        D.ellipse(ctx, 0, -60, 54, 40); D.fs(ctx, '#ffd84a', INK, 5);
        D.ellipse(ctx, -34, -70, 18, 12, -0.5); D.fs(ctx, '#ffd84a', INK, 4); // tail
        ctx.beginPath(); ctx.arc(16, -112, 30, 0, Math.PI * 2); D.fs(ctx, '#ffd84a', INK, 5);
        D.ellipse(ctx, 48, -106, 18, 9); D.fs(ctx, '#ff8a1f', INK, 4);
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(24, -120, 5, 0, Math.PI * 2); ctx.fill();
        D.ellipse(ctx, 8, -56, 26, 14, 0.2); D.fs(ctx, '#f7c52e', INK, 3);
        break;
      }
      case 'noodle': {
        D.rr(ctx, -17, -240, 34, 250, 17); D.fs(ctx, '#ff5fa2', INK, 5);
        ctx.strokeStyle = 'rgba(29,18,10,0.25)'; ctx.lineWidth = 3;
        for (let y = -220; y < 0; y += 22) { ctx.beginPath(); ctx.moveTo(-15, y); ctx.lineTo(15, y); ctx.stroke(); }
        D.ellipse(ctx, 0, -232, 9, 5); D.fs(ctx, '#7a1d4a');
        break;
      }
      case 'spoon': {
        D.rr(ctx, -7, -130, 14, 140, 7); D.fs(ctx, '#c9915a', INK, 4);
        D.ellipse(ctx, 0, -165, 30, 44); D.fs(ctx, '#c9915a', INK, 5);
        D.ellipse(ctx, 0, -168, 20, 32); D.fs(ctx, '#a8733f');
        break;
      }
      case 'newspaper': {
        D.rr(ctx, -20, -210, 40, 220, 10); D.fs(ctx, '#ece6d6', INK, 5);
        ctx.fillStyle = '#7b7465';
        for (let y = -195; y < -10; y += 12) ctx.fillRect(-12, y, 8 + ((y * 7) % 13 + 13) % 13, 3);
        ctx.fillStyle = '#d6302b'; ctx.fillRect(-21, -120, 42, 8);
        D.ellipse(ctx, 0, -208, 18, 6); D.fs(ctx, '#d8d0bc', INK, 3);
        break;
      }
      case 'banana': {
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-4, -4); ctx.quadraticCurveTo(60, -110, 8, -210);
        ctx.strokeStyle = INK; ctx.lineWidth = 46; ctx.stroke();
        ctx.strokeStyle = '#ffe04a'; ctx.lineWidth = 37; ctx.stroke();
        ctx.strokeStyle = '#e8b81e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(8, -20); ctx.quadraticCurveTo(52, -110, 14, -196); ctx.stroke();
        ctx.fillStyle = '#5a3a12'; D.ellipse(ctx, 8, -214, 7, 7); ctx.fill(); D.ellipse(ctx, -4, 0, 6, 6); ctx.fill();
        break;
      }
      case 'spatula': {
        D.rr(ctx, -7, -110, 14, 120, 7); D.fs(ctx, '#2c2c31', INK, 4);
        D.rr(ctx, -36, -205, 72, 98, 10); D.fs(ctx, '#c4cbd0', INK, 5);
        ctx.fillStyle = '#7d868c'; [-18, 0, 18].forEach((x) => ctx.fillRect(x - 3, -192, 6, 60));
        break;
      }
      case 'sponge': {
        D.rr(ctx, -42, -150, 84, 150, 12); D.fs(ctx, '#ffd84a', INK, 5);
        D.rr(ctx, -42, -150, 84, 34, [12, 12, 0, 0]); D.fs(ctx, '#3fa34d', INK, 4);
        ctx.fillStyle = '#d9a91c';
        [[-20, -90], [10, -70], [24, -100], [-14, -40], [16, -30], [-26, -62]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = '#9fe3ff'; [[-30, -165], [20, -175], [0, -190]].forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x + Math.sin(t * 3 + i) * 4, y, 7, 0, Math.PI * 2); ctx.fill(); });
        break;
      }
      case 'phone': {
        D.rr(ctx, -32, -110, 64, 110, 12); D.fs(ctx, '#b9c0c7', INK, 5);
        ctx.fillStyle = '#4b535b';
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-20 + c * 15, -92 + r * 18, 10, 10);
        D.rr(ctx, -32, -220, 64, 108, 12); D.fs(ctx, '#b9c0c7', INK, 5);
        D.rr(ctx, -22, -205, 44, 60, 4); D.fs(ctx, '#5fd0ff', INK, 3);
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(12, -220); ctx.lineTo(12, -250); ctx.stroke();
        break;
      }
      case 'cucumber': {
        D.rr(ctx, -23, -215, 46, 225, 23); D.fs(ctx, '#3e9a3a', INK, 5);
        ctx.fillStyle = '#7fd06a';
        [[-8, -190], [9, -160], [-10, -120], [8, -90], [-7, -55], [10, -30]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); });
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-12, -190); ctx.lineTo(-12, -30); ctx.stroke();
        break;
      }
      case 'brush': {
        D.rr(ctx, -7, -140, 14, 150, 7); D.fs(ctx, '#f3f3f0', INK, 4);
        D.ellipse(ctx, 0, -178, 38, 34); D.fs(ctx, '#3b7fd6', INK, 5);
        ctx.strokeStyle = '#1d4f94'; ctx.lineWidth = 3;
        for (let a = 0; a < Math.PI * 2; a += 0.5) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, -178 + Math.sin(a) * 16); ctx.lineTo(Math.cos(a) * 44, -178 + Math.sin(a) * 40); ctx.stroke(); }
        break;
      }
      // ---- rares ----
      case 'eggplant': {
        ctx.beginPath(); ctx.moveTo(-14, -30); ctx.bezierCurveTo(-60, -60, -50, -210, 0, -215); ctx.bezierCurveTo(55, -215, 50, -60, 14, -30); ctx.closePath();
        D.fs(ctx, '#6b2fa8', INK, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; D.ellipse(ctx, -18, -140, 8, 40, 0.15); ctx.fill();
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI; ctx.lineTo(Math.cos(a) * 30, -30 + Math.sin(a) * -14); ctx.lineTo(Math.cos(a + 0.3) * 12, -36); }
        ctx.closePath(); D.fs(ctx, '#3e9a3a', INK, 4);
        D.rr(ctx, -6, -30, 12, 32, 5); D.fs(ctx, '#3e9a3a', INK, 4);
        break;
      }
      case 'bat': {
        ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-30, -200); ctx.quadraticCurveTo(0, -240, 30, -200); ctx.lineTo(10, 6); ctx.closePath();
        D.fs(ctx, '#ff8a1f', INK, 5);
        ctx.strokeStyle = 'rgba(29,18,10,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -40); ctx.lineTo(14, -40); ctx.stroke();
        D.text(ctx, 'FOAM', 0, -130, 16, '#fff3c4', { rot: -Math.PI / 2, lw: 4 });
        break;
      }
      case 'guitar': {
        D.rr(ctx, -9, -150, 18, 155, 4); D.fs(ctx, '#7a4a22', INK, 4);
        ctx.strokeStyle = '#d8c39a'; ctx.lineWidth = 2;
        for (let y = -20; y > -150; y -= 18) { ctx.beginPath(); ctx.moveTo(-9, y); ctx.lineTo(9, y); ctx.stroke(); }
        D.rr(ctx, -14, 0, 28, 26, 6); D.fs(ctx, '#2c2c31', INK, 4); // headstock
        ctx.beginPath(); ctx.arc(0, -190, 52, 0, Math.PI * 2); D.fs(ctx, '#d6302b', INK, 5);
        ctx.beginPath(); ctx.arc(0, -255, 40, 0, Math.PI * 2); D.fs(ctx, '#d6302b', INK, 5);
        ctx.fillStyle = '#d6302b'; ctx.fillRect(-36, -240, 72, 30);
        D.rr(ctx, -24, -205, 48, 14, 4); D.fs(ctx, '#2c2c31');
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.5;
        [-6, -2, 2, 6].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -205); ctx.stroke(); });
        break;
      }
      case 'mop': {
        D.rr(ctx, -6, -160, 12, 170, 6); D.fs(ctx, '#3b7fd6', INK, 4);
        ctx.lineCap = 'round';
        for (let i = -5; i <= 5; i++) {
          const x = i * 7, w = Math.sin(t * 8 + i) * 8;
          ctx.beginPath(); ctx.moveTo(x * 0.5, -158); ctx.quadraticCurveTo(x + w, -200, x * 1.4 + w, -250);
          ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke();
          ctx.strokeStyle = '#e6e2d3'; ctx.lineWidth = 7; ctx.stroke();
        }
        break;
      }
      case 'shovel': {
        D.rr(ctx, -6, -140, 12, 150, 6); D.fs(ctx, '#c9915a', INK, 4);
        D.rr(ctx, -22, -4, 44, 12, 6); D.fs(ctx, '#2c2c31', INK, 4);
        ctx.beginPath(); ctx.moveTo(-40, -140); ctx.lineTo(40, -140); ctx.lineTo(36, -205); ctx.quadraticCurveTo(0, -250, -36, -205); ctx.closePath();
        D.fs(ctx, '#9aa3aa', INK, 5);
        break;
      }
      case 'roast': {
        ctx.lineCap = 'round';
        ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -70); ctx.stroke();
        ctx.strokeStyle = '#f3ead6'; ctx.lineWidth = 9; ctx.stroke();
        D.ellipse(ctx, 0, -130, 66, 56); D.fs(ctx, '#c9772e', INK, 5);
        ctx.fillStyle = 'rgba(255,220,150,0.45)'; D.ellipse(ctx, -18, -146, 26, 16, -0.3); ctx.fill();
        [[-36, -180], [36, -180]].forEach(([x, y]) => { D.ellipse(ctx, x, y, 18, 26, x < 0 ? -0.5 : 0.5); D.fs(ctx, '#b4651f', INK, 4); ctx.beginPath(); ctx.arc(x * 1.25, y - 26, 7, 0, Math.PI * 2); D.fs(ctx, '#f3ead6', INK, 3); });
        break;
      }
      case 'skateboard': {
        D.rr(ctx, -30, -240, 60, 250, 30); D.fs(ctx, '#e8a33d', INK, 5);
        D.rr(ctx, -22, -228, 44, 226, 22); D.fs(ctx, '#2a2a2e');
        [[-38, -40], [38, -40], [-38, -195], [38, -195]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); D.fs(ctx, '#fff3c4', INK, 4); });
        break;
      }
      case 'croissant': {
        for (let i = 0; i <= 6; i++) {
          const u = i / 6, r = 16 + 24 * Math.sin(u * Math.PI);
          D.ellipse(ctx, 70 * Math.sin(u * Math.PI) - 10, -10 - 200 * u, r * 1.1, r * 0.8, 0.5 - u); D.fs(ctx, i % 2 ? '#e0a052' : '#d48c3c', INK, 4);
        }
        break;
      }
      case 'racket': {
        D.rr(ctx, -8, -95, 16, 100, 6); D.fs(ctx, '#2c2c31', INK, 4);
        ctx.save(); D.ellipse(ctx, 0, -165, 48, 64); ctx.clip();
        ctx.strokeStyle = '#e6e6e6'; ctx.lineWidth = 2;
        for (let x = -48; x <= 48; x += 12) { ctx.beginPath(); ctx.moveTo(x, -230); ctx.lineTo(x, -100); ctx.stroke(); }
        for (let y = -230; y <= -100; y += 12) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(50, y); ctx.stroke(); }
        ctx.restore();
        D.ellipse(ctx, 0, -165, 48, 64); ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = '#3fbf6a'; ctx.lineWidth = 7; ctx.stroke();
        break;
      }
      case 'toiletseat': {
        D.rr(ctx, -30, -24, 60, 24, 8); D.fs(ctx, '#e8e8e2', INK, 4); // hinge
        ctx.beginPath(); ctx.ellipse(0, -120, 62, 86, 0, 0, Math.PI * 2); ctx.ellipse(0, -120, 34, 54, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fbfaf2'; ctx.fill('evenodd'); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
        break;
      }
      // ---- epics ----
      case 'stopsign': {
        D.rr(ctx, -6, -120, 12, 130, 4); D.fs(ctx, '#9aa3aa', INK, 4);
        const oct = (r) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, -180 + Math.sin(a) * r); } ctx.closePath(); };
        oct(64); D.fs(ctx, '#fff', INK, 5); oct(56); D.fs(ctx, '#d6302b');
        D.text(ctx, 'STOP', 0, -180, 28, '#fff', { stroke: false });
        break;
      }
      case 'extinguisher': {
        D.rr(ctx, -30, -200, 60, 200, 26); D.fs(ctx, '#d6302b', INK, 5);
        D.rr(ctx, -30, -120, 60, 40, 0); D.fs(ctx, '#fff3c4', INK, 3);
        D.text(ctx, 'FIRE', 0, -100, 14, '#d6302b', { stroke: false });
        D.rr(ctx, -12, -224, 24, 26, 4); D.fs(ctx, '#2c2c31', INK, 4);
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(10, -215); ctx.quadraticCurveTo(60, -200, 46, -120); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-20, -190, 8, 160);
        break;
      }
      case 'bowlingpin': {
        ctx.beginPath(); ctx.moveTo(-16, 0); ctx.bezierCurveTo(-52, -40, -40, -110, -14, -140); ctx.bezierCurveTo(-8, -160, -26, -190, -14, -215);
        ctx.quadraticCurveTo(0, -232, 14, -215); ctx.bezierCurveTo(26, -190, 8, -160, 14, -140); ctx.bezierCurveTo(40, -110, 52, -40, 16, 0); ctx.closePath();
        D.fs(ctx, '#fbfaf2', INK, 5);
        ctx.fillStyle = '#d6302b'; ctx.fillRect(-15, -168, 30, 7); ctx.fillRect(-14, -154, 28, 7);
        break;
      }
      case 'purse': {
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(-34, -150); ctx.lineTo(0, 0); ctx.lineTo(34, -150); ctx.stroke();
        ctx.strokeStyle = '#7a2fa8'; ctx.lineWidth = 5; ctx.stroke();
        D.rr(ctx, -62, -245, 124, 100, 22); D.fs(ctx, '#9b4dca', INK, 5);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
        for (let x = -50; x < 60; x += 14) { ctx.beginPath(); ctx.moveTo(x, -240); ctx.lineTo(x + 20, -150); ctx.stroke(); }
        D.rr(ctx, -14, -165, 28, 16, 6); D.fs(ctx, '#ffd84a', INK, 3);
        break;
      }
      case 'mic': {
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-40, 40, 30, 60, -10, 90); ctx.stroke();
        D.rr(ctx, -13, -130, 26, 138, 11); D.fs(ctx, '#2c2c31', INK, 4);
        ctx.beginPath(); ctx.arc(0, -160, 34, 0, Math.PI * 2); D.fs(ctx, '#b9c0c7', INK, 5);
        ctx.save(); ctx.beginPath(); ctx.arc(0, -160, 32, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = '#7d868c'; ctx.lineWidth = 2;
        for (let k = -40; k <= 40; k += 9) { ctx.beginPath(); ctx.moveTo(k, -200); ctx.lineTo(k + 40, -120); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k, -120); ctx.lineTo(k + 40, -200); ctx.stroke(); }
        ctx.restore();
        break;
      }
      case 'trophy': {
        D.rr(ctx, -34, -40, 68, 40, 6); D.fs(ctx, '#3a2a1e', INK, 4);
        D.rr(ctx, -9, -90, 18, 52, 4); D.fs(ctx, '#e6b53a', INK, 4);
        ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(-54, -165, 22, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(54, -165, 22, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-56, -205); ctx.lineTo(56, -205); ctx.quadraticCurveTo(52, -100, 0, -90); ctx.quadraticCurveTo(-52, -100, -56, -205); ctx.closePath();
        D.fs(ctx, '#ffd84a', INK, 5);
        D.text(ctx, '#1', 0, -160, 26, '#fff3c4', { lw: 5 });
        D.rr(ctx, -26, -32, 52, 14, 2); D.fs(ctx, '#e6b53a');
        break;
      }
      case 'lollipop': {
        D.rr(ctx, -5, -140, 10, 150, 5); D.fs(ctx, '#fbfaf2', INK, 3);
        ctx.beginPath(); ctx.arc(0, -190, 58, 0, Math.PI * 2); D.fs(ctx, '#fff', INK, 5);
        ['#ff4d6d', '#ffd84a', '#4de1ff', '#9ff2a0'].forEach((c, i) => {
          ctx.strokeStyle = c; ctx.lineWidth = 9; ctx.beginPath();
          for (let a = 0; a < 9; a += 0.2) { const r = a * 6; ctx.lineTo(Math.cos(a + i * 1.57 + t) * r, -190 + Math.sin(a + i * 1.57 + t) * r); }
          ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(0, -190, 58, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
        break;
      }
      // ---- legendaries ----
      case 'anvil': {
        ctx.strokeStyle = '#7d868c'; ctx.lineWidth = 6;
        for (let y = 0; y > -70; y -= 14) { D.ellipse(ctx, 0, y - 7, 6, 9); ctx.stroke(); }
        ctx.save(); ctx.translate(0, -260); ctx.scale(1, -1); // drawn with the flat top facing away from the chain
        ctx.beginPath(); ctx.moveTo(-80, -110); ctx.lineTo(60, -110); ctx.quadraticCurveTo(95, -110, 100, -95); ctx.lineTo(40, -95);
        ctx.lineTo(30, -150); ctx.lineTo(55, -170); ctx.lineTo(-55, -170); ctx.lineTo(-30, -150); ctx.lineTo(-40, -95); ctx.lineTo(-80, -95); ctx.closePath();
        D.fs(ctx, '#3d3e45', INK, 5);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-70, -158, 120, 5);
        D.text(ctx, 'ACME-ISH', 0, -102, 13, '#9aa3aa', { stroke: false });
        break;
      }
      case 'sink': {
        D.rr(ctx, -8, -110, 16, 115, 6); D.fs(ctx, '#c4cbd0', INK, 4);
        D.rr(ctx, -72, -200, 144, 92, 14); D.fs(ctx, '#c4cbd0', INK, 5);
        D.rr(ctx, -60, -192, 120, 70, 10); D.fs(ctx, '#8d969c');
        ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(30, -200); ctx.lineTo(30, -240); ctx.quadraticCurveTo(30, -262, 6, -262); ctx.lineTo(-10, -262); ctx.stroke();
        ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = 8; ctx.stroke();
        ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.arc(-12, -244 + ((t * 200) % 50), 5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'goldpan': {
        D.rr(ctx, -8, -78, 16, 82, 6); D.fs(ctx, '#8a5a12', INK, 4);
        ctx.beginPath(); ctx.arc(0, -138, 64, 0, Math.PI * 2);
        const gg = ctx.createRadialGradient(-20, -160, 5, 0, -138, 70); gg.addColorStop(0, '#fff3a0'); gg.addColorStop(0.5, '#ffcc29'); gg.addColorStop(1, '#b07a0a');
        D.fs(ctx, gg, INK, 5);
        ctx.beginPath(); ctx.arc(0, -138, 48, 0, Math.PI * 2); ctx.strokeStyle = '#b07a0a'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1; ctx.save(); ctx.translate(Math.cos(a) * 40, -138 + Math.sin(a) * 40); ctx.rotate(a); ctx.fillRect(-1.5, -8, 3, 16); ctx.fillRect(-8, -1.5, 16, 3); ctx.restore(); }
        break;
      }
      case 'goose': {
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(-30, -70, 6, 0);
        ctx.strokeStyle = INK; ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = '#f3f3ee'; ctx.lineWidth = 22; ctx.stroke();
        D.ellipse(ctx, 10, -185, 64, 44, -0.3); D.fs(ctx, '#f3f3ee', INK, 5);
        D.ellipse(ctx, 28, -195, 30, 18, -0.4); D.fs(ctx, '#d9d9d2', INK, 3);
        ctx.beginPath(); ctx.arc(10, 12, 18, 0, Math.PI * 2); D.fs(ctx, '#f3f3ee', INK, 4);
        const op = 6 + Math.abs(Math.sin(t * 14)) * 10;
        ctx.beginPath(); ctx.moveTo(22, 4); ctx.lineTo(54, 10 - op / 2); ctx.lineTo(24, 14); ctx.closePath(); D.fs(ctx, '#ff8a1f', INK, 3);
        ctx.beginPath(); ctx.moveTo(22, 16); ctx.lineTo(50, 18 + op / 2); ctx.lineTo(24, 22); ctx.closePath(); D.fs(ctx, '#ff8a1f', INK, 3);
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(14, 6, 3.5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'cactus': {
        ctx.beginPath(); ctx.moveTo(-32, -44); ctx.lineTo(32, -44); ctx.lineTo(24, 0); ctx.lineTo(-24, 0); ctx.closePath(); D.fs(ctx, '#c8653a', INK, 4);
        D.rr(ctx, -36, -52, 72, 12, 4); D.fs(ctx, '#b4552c', INK, 4);
        D.rr(ctx, -22, -210, 44, 162, 22); D.fs(ctx, '#3e9a3a', INK, 5);
        D.rr(ctx, -58, -160, 26, 60, 13); D.fs(ctx, '#3e9a3a', INK, 4);
        D.rr(ctx, 32, -185, 26, 70, 13); D.fs(ctx, '#3e9a3a', INK, 4);
        ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 2;
        [[-22, -180], [22, -150], [-22, -120], [22, -90], [-58, -140], [58, -165], [0, -205]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sign(x || 1) * 9, y - 5); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(0, -214, 9, 0, Math.PI * 2); D.fs(ctx, '#ff5fa2', INK, 3);
        break;
      }
    }
    ctx.restore();
  },

  // ---------- HUD bits ----------
  hpBar(ctx, x, y, w, h, val, max, color, align = 'left') {
    const gap = 5, seg = (w - gap * (max - 1)) / max;
    for (let i = 0; i < max; i++) {
      const idx = align === 'right' ? max - 1 - i : i;
      const sx = x + i * (seg + gap);
      D.rr(ctx, sx, y, seg, h, 5);
      D.fs(ctx, idx < val ? color : 'rgba(0,0,0,0.45)', INK, 3);
      if (idx < val) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(sx + 4, y + 3, seg - 8, h * 0.25); }
    }
  },
  egg(ctx, x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.bezierCurveTo(10, -14, 12, 4, 11, 6); ctx.bezierCurveTo(10, 14, -10, 14, -11, 6); ctx.bezierCurveTo(-12, 4, -10, -14, 0, -14);
    D.fs(ctx, '#fff4d6', INK, 3);
    ctx.restore();
  },
  bubble(ctx, x, y, str, size = 22) {
    ctx.save();
    ctx.font = `${size}px 'Rammetto One', 'Arial Black', sans-serif`;
    const w = ctx.measureText(str).width + 30, h = size + 24;
    const bx = Math.min(VW - w - 10, Math.max(10, x - w / 2));
    D.rr(ctx, bx, y - h, w, h, 14);
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 6, y + 18); ctx.lineTo(x + 14, y);
    D.fs(ctx, '#fffaf0', INK, 4);
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(x - 8, y - 4, 20, 6);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(str, bx + w / 2, y - h / 2 + 1);
    ctx.restore();
  },
  // comic "POW" burst behind text
  burst(ctx, x, y, r, fill, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 24; i++) { const rr = i % 2 ? r * 0.62 : r; const a = (i / 24) * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); D.fs(ctx, fill, INK, 5);
    ctx.restore();
  },
};

// ---------- particles ----------
const FX = {
  list: [],
  add(p) { this.list.push(Object.assign({ vx: 0, vy: 0, g: 600, rot: 0, vr: 0, life: 1, age: 0, s: 1 }, p)); },
  burst(x, y, kind, n, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (opts.speed || 380) * (0.4 + Math.random() * 0.8);
      this.add({ kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.lift || 150), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
        life: (opts.life || 1.1) * (0.7 + Math.random() * 0.6), g: opts.g ?? 600, color: opts.colors ? opts.colors[i % opts.colors.length] : opts.color, s: opts.s || 1 });
    }
  },
  update(dt) {
    for (const p of this.list) {
      p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.kind === 'feather') { p.vx *= 0.96; p.vy = Math.min(p.vy, 90); }
    }
    this.list = this.list.filter((p) => p.age < p.life);
  },
  draw(ctx) {
    for (const p of this.list) {
      const a = 1 - p.age / p.life;
      ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.5); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.s, p.s);
      if (p.kind === 'feather') {
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 16, 0, 0, Math.PI * 2); D.fs(ctx, p.color || '#FFD23F', INK, 2);
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 18); ctx.stroke();
      } else if (p.kind === 'star') {
        ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 15; const an = i / 10 * Math.PI * 2; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
        ctx.closePath(); D.fs(ctx, p.color || '#ffe14d', INK, 2.5);
      } else if (p.kind === 'glass') {
        ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(10, -2); ctx.lineTo(-2, 9); ctx.closePath(); D.fs(ctx, 'rgba(210,235,255,0.85)', '#fff', 1.5);
      } else if (p.kind === 'confetti') {
        ctx.fillStyle = p.color || '#ff4d6d'; ctx.fillRect(-6, -3, 12, 6);
      } else if (p.kind === 'sweat') {
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); D.fs(ctx, '#7fd0ff', INK, 1.5);
      }
      ctx.restore();
    }
  },
};
