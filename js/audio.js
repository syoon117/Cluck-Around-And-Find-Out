// Every sound in the game is synthesized with the Web Audio API — no audio files.
// The audio clock (Sfx.now) is also the game's master clock so the rhythm stays tight.
const Sfx = (() => {
  let ac = null, master, sfxBus, musicBus, noiseBuf, comp, recDest = null;
  let musicOn = true, sfxOn = true;

  // `offline` lets tools render sounds into an OfflineAudioContext to check them without speakers.
  function init(offline) {
    if (ac) { if (ac.state === 'suspended' && !offline) ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC && !offline) return null;
    // iPhones mute web audio when the ring/silent switch is on unless the page asks for playback audio
    try { if (!offline && navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ac = offline || new AC({ latencyHint: 'interactive' });
    master = ac.createGain(); master.gain.value = 0.9;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    master.connect(comp); comp.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 0.5 : 0; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }

  const perf0 = performance.now();
  const now = () => (ac ? ac.currentTime : (performance.now() - perf0) / 1000);
  const latency = () => (ac ? Math.min(0.12, (ac.outputLatency || 0) + (ac.baseLatency || 0)) : 0);
  const ready = () => ac && sfxOn;

  // ---------- building blocks ----------
  function gainEnv(t, a, peak, d, dest) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(dest || sfxBus);
    return g;
  }
  function tone(type, f, t, a, d, peak, dest, f2) {
    const o = ac.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    o.connect(gainEnv(t, a, peak, d, dest));
    o.start(t); o.stop(t + a + d + 0.05);
    return o;
  }
  function noise(t, a, d, peak, ftype, freq, Q, dest, freq2) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = 1;
    const f = ac.createBiquadFilter(); f.type = ftype || 'bandpass';
    f.frequency.setValueAtTime(freq || 1000, t);
    if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + a + d);
    f.Q.value = Q || 1;
    s.connect(f); f.connect(gainEnv(t, a, peak, d, dest));
    s.start(t, Math.random() * 1.5); s.stop(t + a + d + 0.05);
    return s;
  }
  function distCurve(k) {
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
    return c;
  }

  // ---------- table sounds ----------
  function tap(t, who) {
    if (!ready()) return;
    const f = who === 'chicken' ? 1900 : 2500;
    noise(t, 0.001, 0.045, 0.55, 'bandpass', f, 2.5);
    tone('triangle', who === 'chicken' ? 640 : 820, t, 0.001, 0.07, 0.35, null, who === 'chicken' ? 420 : 560);
  }
  function rattle(t) {
    if (!ready()) return;
    for (let i = 0; i < 4; i++) noise(t + i * 0.028, 0.001, 0.03, 0.35 - i * 0.07, 'bandpass', 2200 + i * 200, 4);
  }
  function ding(t) {
    if (!ready()) return;
    const f0 = 2350;
    [[1, 0.42, 1.9], [1.0013, 0.25, 1.7], [2.74, 0.15, 0.9], [5.18, 0.07, 0.45], [0.5, 0.06, 0.6]].forEach(([r, p, d]) =>
      tone('sine', f0 * r, t, 0.002, d, p));
    noise(t, 0.001, 0.02, 0.4, 'highpass', 5000, 0.7);
  }
  function snatch(t) {
    if (!ready()) return;
    noise(t, 0.01, 0.16, 0.35, 'bandpass', 900, 1.5, null, 3500);
    noise(t, 0.001, 0.035, 0.4, 'bandpass', 2800, 3);
  }
  function whoosh(t, dur = 0.22, peak = 0.35) {
    if (!ready()) return;
    noise(t, dur * 0.6, dur * 0.4, peak, 'bandpass', 400, 1.2, null, 2600);
  }
  function buzzer(t) {
    if (!ready()) return;
    tone('sawtooth', 140, t, 0.01, 0.45, 0.18);
    tone('square', 147, t, 0.01, 0.45, 0.1);
  }
  function tick(t, accent) {
    if (!ready()) return;
    tone('sine', accent ? 1760 : 1320, t, 0.001, 0.05, 0.28);
    noise(t, 0.001, 0.02, 0.15, 'bandpass', 3000, 5);
  }
  function coin(t) {
    if (!ready()) return;
    tone('square', 988, t, 0.002, 0.07, 0.08);
    tone('square', 1319, t + 0.07, 0.002, 0.16, 0.08);
  }
  function fanfare(t) {
    if (!ready()) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      tone('square', f, t + i * 0.11, 0.005, 0.18, 0.09);
      tone('triangle', f / 2, t + i * 0.11, 0.005, 0.2, 0.12);
    });
    tone('square', 1047, t + 0.44, 0.005, 0.7, 0.09);
    tone('square', 1319, t + 0.44, 0.005, 0.7, 0.06);
  }
  function sadTrombone(t) {
    if (!ready()) return;
    [[392, 0.35], [370, 0.35], [349, 0.35], [330, 1.1]].reduce((tt, [f, d]) => {
      const o = tone('sawtooth', f, tt, 0.03, d, 0.14);
      if (d > 1) { const l = ac.createOscillator(); const lg = ac.createGain(); l.frequency.value = 6; lg.gain.value = 8; l.connect(lg); lg.connect(o.frequency); l.start(tt); l.stop(tt + d); }
      return tt + d;
    }, t);
  }

  // ---------- weapon impacts ----------
  function clang(t) {
    [[420, 0.3, 0.9], [1113, 0.22, 0.7], [1730, 0.16, 0.5], [2650, 0.1, 0.35], [3810, 0.06, 0.25]].forEach(([f, p, d]) =>
      tone('sine', f * (0.97 + Math.random() * 0.06), t, 0.001, d, p));
    noise(t, 0.001, 0.06, 0.6, 'highpass', 2000, 0.7);
  }
  function thud(t) {
    tone('sine', 150, t, 0.002, 0.18, 0.7, null, 50);
    noise(t, 0.001, 0.12, 0.5, 'lowpass', 900, 0.7);
    noise(t + 0.02, 0.001, 0.08, 0.25, 'bandpass', 2400, 2); // crusty crumbs
  }
  function slap(t, wet) {
    noise(t, 0.001, 0.09, 0.9, 'highpass', 1200, 0.6);
    noise(t, 0.001, 0.05, 0.6, 'bandpass', 3000, 1);
    if (wet) { noise(t + 0.02, 0.01, 0.22, 0.45, 'bandpass', 600, 4, null, 200); tone('sine', 400, t + 0.03, 0.005, 0.15, 0.2, null, 120); }
  }
  function thwop(t) {
    tone('sine', 380, t, 0.003, 0.2, 0.6, null, 70);
    slap(t, false);
    tone('sine', 900, t + 0.25, 0.002, 0.06, 0.4, null, 1600); // suction pop
  }
  function bonk(t) {
    tone('sine', 330, t, 0.001, 0.25, 0.5, null, 300);
    tone('sine', 495, t, 0.001, 0.18, 0.3, null, 460);
    noise(t, 0.001, 0.05, 0.4, 'bandpass', 900, 2);
  }
  function boing(t) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(380, t + 0.5);
    const l = ac.createOscillator(); const lg = ac.createGain(); l.frequency.value = 13;
    lg.gain.setValueAtTime(90, t); lg.gain.exponentialRampToValueAtTime(5, t + 0.6);
    l.connect(lg); lg.connect(o.frequency);
    o.connect(gainEnv(t, 0.005, 0.55, 0.65)); o.start(t); o.stop(t + 0.7); l.start(t); l.stop(t + 0.7);
    slap(t, false);
  }
  function clack(t) {
    for (let i = 0; i < 9; i++) noise(t + i * 0.018 + Math.random() * 0.01, 0.001, 0.025, 0.5 - i * 0.04, 'bandpass', 2500 + Math.random() * 2500, 3);
    thud(t);
  }
  function foam(t) { noise(t, 0.004, 0.12, 0.7, 'lowpass', 500, 0.7); tone('sine', 110, t, 0.004, 0.12, 0.4, null, 60); }
  function knock(t) { tone('sine', 620, t, 0.001, 0.07, 0.5, null, 480); noise(t, 0.001, 0.04, 0.5, 'bandpass', 1100, 3); tone('sine', 300, t, 0.001, 0.1, 0.3); }
  function crinkle(t) { for (let i = 0; i < 12; i++) noise(t + i * 0.012 + Math.random() * 0.02, 0.001, 0.02, 0.4, 'highpass', 3000 + Math.random() * 3000, 1); slap(t, false); }
  function splat(t) { slap(t, true); noise(t + 0.01, 0.005, 0.18, 0.6, 'lowpass', 800, 1, null, 200); }
  function crunch(t) { thud(t); for (let i = 0; i < 8; i++) noise(t + i * 0.015, 0.001, 0.03, 0.35, 'bandpass', 1500 + Math.random() * 2500, 2); }
  function twang(t) { [82, 110, 147, 196, 247].forEach((f, i) => tone('sawtooth', f, t + i * 0.012, 0.003, 1.2, 0.08)); thud(t); }
  function spray(t) { clang(t); noise(t + 0.05, 0.03, 0.6, 0.45, 'highpass', 2500, 0.6); }
  function feedback(t) { thud(t); tone('sine', 2900, t + 0.04, 0.25, 0.35, 0.12); tone('sine', 2905, t + 0.04, 0.25, 0.35, 0.08); }
  function anvil(t) { clang(t); tone('sine', 70, t, 0.002, 0.5, 1, null, 35); noise(t, 0.001, 0.3, 0.6, 'lowpass', 400, 0.7); }
  function honk(t) { slap(t, false); bawk(t + 0.03, 0.62); bawk(t + 0.22, 0.6); }
  function gold(t) { clang(t); [2093, 2637, 3136].forEach((f, i) => tone('sine', f, t + 0.08 + i * 0.07, 0.002, 0.5, 0.08)); }
  function impact(kind, t) {
    if (!ready()) return;
    ({ clang, thud, slap: (tt) => slap(tt, false), wet: (tt) => slap(tt, true), thwop, bonk, boing, clack,
      foam, knock, crinkle, splat, crunch, twang, spray, feedback, anvil, honk, gold,
      duck: (tt) => { slap(tt, false); squeak(tt + 0.02, 2.2, { dur: 0.12, hard: 0.3 }); },
      squeak: (tt) => { slap(tt, false); squeak(tt + 0.02, 1.25); } }[kind] || thud)(t);
  }

  // ---------- the rubber chicken ----------
  // The voice is a reed tone built from the harmonic mix measured off a real rubber chicken
  // (2nd and 3rd harmonics nearly as loud as the fundamental = the nasal honk). A soft squeeze
  // is closer to a pure tone, a hard squeeze is the full mix. No breath noise, and instead of a
  // smooth vibrato (which reads as a bird) it gets a small random pitch wobble like real rubber.
  const HARD = [1, 0.62, 0.97, 0.14, 0.3, 0.38, 0.3, 0.13, 0.1, 0.1, 0.1, 0.1, 0.12, 0.06, 0.05, 0.04];
  const SOFT = [1, 0.3, 0.14, 0.06, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0, 0, 0];
  const waves = {};
  function reedWave(hard) {
    const k = Math.round(Math.min(1, Math.max(0, hard)) * 4) / 4;
    if (!waves[k]) {
      const n = HARD.length + 1, real = new Float32Array(n), imag = new Float32Array(n);
      for (let i = 1; i < n; i++) imag[i] = SOFT[i - 1] * (1 - k) + HARD[i - 1] * k;
      waves[k] = ac.createPeriodicWave(real, imag);
    }
    return waves[k];
  }
  function voice(dest, hard = 1) {
    const out = ac.createGain(); out.gain.value = 0.0001; out.connect(dest || sfxBus);
    const o = ac.createOscillator(); o.setPeriodicWave(reedWave(hard));
    // rubber wobble: slow random drift in pitch (a few cents), not a regular vibrato
    const ns = ac.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
    const nlp = ac.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 22; nlp.Q.value = 0.7;
    const jg = ac.createGain(); jg.gain.value = 60;
    ns.connect(nlp); nlp.connect(jg); jg.connect(o.detune);
    const lfo = ac.createOscillator(); lfo.frequency.value = 6;
    const lfoG = ac.createGain(); lfoG.gain.value = 0; // off unless an effect wants it
    lfo.connect(lfoG); lfoG.connect(o.frequency);
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    o.connect(hp); hp.connect(lp); lp.connect(out);
    const t = ac.currentTime;
    [o, ns, lfo].forEach((n) => n.start(t));
    return {
      out, freq: [o.frequency], lfo, lfoG,
      stop(at) { [o, ns, lfo].forEach((n) => { try { n.stop(at + 0.05); } catch (e) {} }); setTimeout(() => out.disconnect(), (at - ac.currentTime + 0.3) * 1000); },
    };
  }

  // Short squeak for every normal hit. Each one is a different squeeze: pitch, length and how
  // hard it was squeezed all vary. Shape follows the real toy: rises into the note, then sags.
  function squeak(t, pm = 1, opts = {}) {
    if (!ready()) return;
    const f = (opts.f || 400 + Math.random() * 330) * pm;
    const dur = opts.dur || 0.14 + Math.random() * 0.34;
    const hard = opts.hard ?? 0.5 + Math.random() * 0.5;
    const v = voice(null, hard);
    const fr = v.freq[0];
    fr.setValueAtTime(f * 0.66, t);
    fr.exponentialRampToValueAtTime(f, t + dur * 0.28);
    fr.linearRampToValueAtTime(f * 0.86, t + dur * 0.82);
    fr.exponentialRampToValueAtTime(f * 0.66, t + dur);
    const g = v.out.gain, peak = opts.vol || 0.42 + 0.12 * hard;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(peak, t + 0.018);
    g.setValueAtTime(peak * 0.92, t + dur * 0.78);
    g.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    v.stop(t + dur + 0.06);
  }
  // A chicken "bawk?" for speech bubbles.
  function bawk(t, pm = 1) {
    if (!ready()) return;
    const v = voice(null, 0.75);
    v.freq.forEach((f) => { f.setValueAtTime(480 * pm, t); f.exponentialRampToValueAtTime(660 * pm, t + 0.04); f.exponentialRampToValueAtTime(380 * pm, t + 0.15); });
    const g = v.out.gain;
    g.setValueAtTime(0.0001, t); g.exponentialRampToValueAtTime(0.28, t + 0.012); g.exponentialRampToValueAtTime(0.0001, t + 0.17);
    v.stop(t + 0.2);
  }

  // The long HAAAAWWWWW, controlled live while the player squeezes. Like the real toy it starts
  // high and slowly sags as the air runs out; letting go drops the pitch as it dies.
  function scream(opts = {}) {
    if (!ready()) return null;
    const pm = opts.pitch || 1;
    const v = voice(null, 1);
    v.lfoG.gain.value = opts.vibrato || 0;
    if (opts.lfoRate) v.lfo.frequency.value = opts.lfoRate;
    const t0 = ac.currentTime;
    const api = {
      // amt 0..1 is squeeze strength; pitchMul for helium/bass/doppler tweaks; `at` for offline renders
      set(amt, pitchMul = 1, at = ac.currentTime) {
        const drift = Math.max(0.8, 1 - 0.045 * (at - t0));
        const f = (600 + 350 * amt) * pm * pitchMul * drift;
        v.freq.forEach((fr) => fr.setTargetAtTime(f, at, 0.04));
        v.out.gain.setTargetAtTime(amt > 0.02 ? 0.14 + 0.34 * Math.min(1, amt) : 0.0001, at, 0.035);
      },
      release(at = ac.currentTime) {
        v.freq.forEach((fr) => fr.setTargetAtTime(fr.value * 0.6 || 380 * pm, at, 0.07));
        v.out.gain.setTargetAtTime(0.0001, at, 0.06);
      },
      fadeOut(dur, pitchTo) {
        const tt = ac.currentTime;
        if (pitchTo) v.freq.forEach((fr) => { fr.cancelScheduledValues(tt); fr.setValueAtTime(fr.value, tt); fr.exponentialRampToValueAtTime(pitchTo, tt + dur); });
        v.out.gain.cancelScheduledValues(tt); v.out.gain.setValueAtTime(Math.max(0.0002, v.out.gain.value), tt);
        v.out.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
        v.stop(tt + dur + 0.1);
      },
      stop(at = ac.currentTime) { v.out.gain.setTargetAtTime(0.0001, at, 0.03); v.stop(at + 0.25); },
    };
    if (opts.distort) {
      // Bass-boosted: clip the output hard.
      const ws = ac.createWaveShaper(); ws.curve = distCurve(40);
      const lp = ac.createBiquadFilter(); lp.type = 'lowshelf'; lp.frequency.value = 300; lp.gain.value = 18;
      v.out.disconnect(); v.out.connect(lp); lp.connect(ws); ws.connect(sfxBus);
    }
    return api;
  }
  // The rubber chicken sucking air back in after a squeeze.
  function wheeze(t, dur = 0.45) {
    if (!ready()) return;
    noise(t, dur * 0.7, dur * 0.3, 0.07, 'bandpass', 700, 3, null, 2400);
    tone('sine', 1900, t + 0.05, dur * 0.6, dur * 0.3, 0.03, null, 2600);
  }
  function raspberry(t) {
    if (!ready()) return;
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(70, t + 0.6);
    const am = ac.createGain(); const l = ac.createOscillator(); l.frequency.value = 32; const lg = ac.createGain(); lg.gain.value = 0.5;
    am.gain.value = 0.5; l.connect(lg); lg.connect(am.gain);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    o.connect(am); am.connect(lp); lp.connect(gainEnv(t, 0.02, 0.5, 0.6));
    o.start(t); o.stop(t + 0.7); l.start(t); l.stop(t + 0.7);
  }
  function pop(t) {
    if (!ready()) return;
    noise(t, 0.001, 0.25, 1, 'lowpass', 3000, 0.5);
    tone('sine', 120, t, 0.001, 0.3, 0.9, null, 40);
  }
  function shatter(t) {
    if (!ready()) return;
    noise(t, 0.001, 0.4, 0.7, 'highpass', 2500, 0.7);
    for (let i = 0; i < 14; i++) tone('sine', 3000 + Math.random() * 5000, t + 0.03 + Math.random() * 0.5, 0.001, 0.08 + Math.random() * 0.1, 0.06);
  }

  // ---------- intro: ominous drone, heartbeat, then the chicken screams ----------
  function intro(t) {
    if (!ac) return { stop() {} };
    const ib = ac.createGain(); ib.gain.value = sfxOn || musicOn ? 1 : 0; ib.connect(master);
    [[55, 0.12], [55.7, 0.12], [82.4, 0.05]].forEach(([f, peak]) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(140, t); lp.frequency.linearRampToValueAtTime(700, t + 4.6);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 2.5);
      g.gain.setValueAtTime(peak, t + 4.55); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.7);
      o.connect(lp); lp.connect(g); g.connect(ib); o.start(t); o.stop(t + 4.8);
    });
    tone('sine', 1400, t + 1, 2.5, 1.1, 0.025, ib, 2100); // thin rising whine
    [1.2, 1.45, 2.3, 2.52, 3.2, 3.4, 3.85, 4.02, 4.35, 4.48].forEach((x) => tone('sine', 70, t + x, 0.005, 0.18, 0.55, ib, 38));
    // the snap
    tone('sine', 90, t + 5, 0.005, 1.2, 0.9, ib, 30);
    noise(t + 5, 0.002, 0.5, 0.6, 'lowpass', 2500, 0.7, ib);
    const v = voice(ib, 1);
    v.freq.forEach((f) => { f.setValueAtTime(560, t + 5); f.exponentialRampToValueAtTime(950, t + 5.1); f.linearRampToValueAtTime(880, t + 5.95); f.exponentialRampToValueAtTime(520, t + 6.45); });
    const g = v.out.gain;
    g.setValueAtTime(0.0001, t + 5); g.exponentialRampToValueAtTime(0.42, t + 5.05); g.setValueAtTime(0.42, t + 6); g.exponentialRampToValueAtTime(0.0001, t + 6.5);
    v.stop(t + 6.6);
    return {
      stop() {
        const n = ac.currentTime;
        ib.gain.cancelScheduledValues(n); ib.gain.setValueAtTime(ib.gain.value, n); ib.gain.linearRampToValueAtTime(0, n + 0.15);
        setTimeout(() => ib.disconnect(), 400);
      },
    };
  }

  // ---------- backing groove (follows the beat clock) ----------
  const BASS = [110, 110, 130.8, 110, 146.8, 110, 164.8, 98];
  function groove(t, n, T) {
    if (!ac || !musicOn) return;
    const i = ((n % 8) + 8) % 8;
    if (n % 2 !== 0) { // player beat: kick
      tone('sine', 120, t, 0.002, 0.16, 0.5, musicBus, 45);
    } else { // chicken beat: hat
      noise(t, 0.001, 0.035, 0.18, 'highpass', 7000, 0.7, musicBus);
    }
    if (i === 3 || i === 7) noise(t, 0.001, 0.12, 0.22, 'bandpass', 1800, 0.8, musicBus);
    const f = BASS[i];
    const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = f;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(200, t + T * 0.8);
    o.connect(lp); lp.connect(gainEnv(t, 0.005, 0.11, T * 0.8, musicBus));
    o.start(t); o.stop(t + T);
  }

  return {
    init, now, latency, get ctx() { return ac; },
    // the final mix as a MediaStream, so clips can record the game's sound
    stream() {
      if (!ac || !ac.createMediaStreamDestination) return null;
      if (!recDest) { recDest = ac.createMediaStreamDestination(); comp.connect(recDest); }
      return recDest.stream;
    },
    suspend() { if (ac && ac.state === 'running') ac.suspend(); },
    resume() { if (ac && ac.state === 'suspended') ac.resume(); },
    get musicOn() { return musicOn; },
    set musicOn(v) { musicOn = v; if (musicBus) musicBus.gain.value = v ? 0.5 : 0; },
    get sfxOn() { return sfxOn; },
    set sfxOn(v) { sfxOn = v; },
    tap, rattle, ding, snatch, whoosh, buzzer, tick, coin, fanfare, sadTrombone,
    impact, squeak, bawk, scream, wheeze, raspberry, pop, shatter, groove, intro,
  };
})();
