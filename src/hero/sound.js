// Procedural sound for the hero — no audio files, ~3 KB of code.
// Everything is synthesised on demand and only after a user gesture.

export function createSound() {
  let ctx = null;
  let master = null;
  let bedTimer = null;
  let stopTimer = null;
  let noiseBuf = null;
  let running = false;

  const noise = () => {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  };

  function ensure() {
    if (ctx) return ctx;
    // Respect the device's silent switch where the platform lets us (iOS 17+).
    try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch { /* noop */ }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    return ctx;
  }

  function wind() {
    const src = ctx.createBufferSource();
    src.buffer = noise();
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.5;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.11;
    const lg = ctx.createGain();
    lg.gain.value = 0.08;
    lfo.connect(lg).connect(g.gain);
    src.connect(bp).connect(lp).connect(g).connect(master);
    src.start(); lfo.start();
    return () => { try { src.stop(); lfo.stop(); } catch { /* noop */ } };
  }

  return {
    get on() { return running; },

    /** Must be called from a click/tap. */
    start() {
      if (!ensure()) return false;
      ctx.resume();
      if (running) return true;
      running = true;
      const stopWind = wind();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(0, t);
      master.gain.linearRampToValueAtTime(1, t + 3);
      // keep the whole bed under a minute so it never loops audibly
      master.gain.setValueAtTime(1, t + 48);
      master.gain.linearRampToValueAtTime(0.0001, t + 56);
      stopTimer = setTimeout(() => { stopWind(); clearTimeout(bedTimer); }, 57000);
      this._stopWind = stopWind;
      return true;
    },

    stop() {
      running = false;
      clearTimeout(bedTimer); clearTimeout(stopTimer);
      if (!ctx) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(0, t, 0.25);
      const sw = this._stopWind;
      setTimeout(() => { sw?.(); }, 1200);
    },

    /** Duck the bed as the visitor leaves the hero. */
    level(v) {
      if (!ctx || !running) return;
      master.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, 0.2);
    },

    /** One soft bamboo-flute note as the truck stops. */
    flute() {
      if (!running) return;
      const t = ctx.currentTime + 0.05;
      const f0 = 587.33; // D5
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.35);
      g.gain.setValueAtTime(0.22, t + 1.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
      g.connect(master);

      const vib = ctx.createOscillator();
      vib.frequency.value = 5.2;
      const vg = ctx.createGain();
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(5, t + 1.5);
      vib.connect(vg);

      [[1, 1], [2, 0.22], [3, 0.07]].forEach(([m, a]) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f0 * m * 0.965, t);
        o.frequency.exponentialRampToValueAtTime(f0 * m, t + 0.18);
        vg.connect(o.detune);
        const og = ctx.createGain();
        og.gain.value = a;
        o.connect(og).connect(g);
        o.start(t); o.stop(t + 4.4);
      });
      vib.start(t); vib.stop(t + 4.4);

      // breath
      const n = ctx.createBufferSource();
      n.buffer = noise();
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.4;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.05, t + 0.2);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 2);
      n.connect(bp).connect(ng).connect(master);
      n.start(t, 0, 2.2);
    },

    /** A quiet temple bell as the screen flickers. */
    bell() {
      if (!running) return;
      const t = ctx.currentTime + 0.02;
      [[1, 0.1, 3.4], [2.76, 0.05, 2.2], [5.4, 0.03, 1.4], [8.93, 0.015, 0.9]].forEach(([m, a, d]) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = 523 * m;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(a, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(master);
        o.start(t); o.stop(t + d + 0.1);
      });
    },
  };
}
