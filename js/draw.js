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
