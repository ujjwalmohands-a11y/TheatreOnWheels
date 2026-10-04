// Dust drifting through the headlight beams + embers rising from the lamps.
// One small canvas, drawn in scene coordinates so it lines up with the SVG.

import { makeLamps } from './geometry';

export function createParticles(canvas, L) {
  const ctx = canvas.getContext('2d');
  const lamps = makeLamps(L);
  let cw = 0, ch = 0, k = 1, ox = 0, oy = 0, dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    k = Math.max(cw / L.W, ch / L.H);
    ox = (cw - L.W * k) / 2; oy = (ch - L.H * k) / 2;
  };
  resize();

  const rand = (a, b) => a + Math.random() * (b - a);

  // dust lives around the road & beam area
  const dust = Array.from({ length: L.dust }, () => ({
    x: rand(L.vx - L.W * 0.3, L.vx + L.W * 0.32),
    y: rand(L.vy + (L.H - L.vy) * 0.18, L.H * 0.95),
    r: rand(0.8, 2.4),
    vx: rand(-14, -3),
    vy: rand(-3, 3),
    a: rand(0.12, 0.4),
    ph: Math.random() * 6.28,
  }));

  const embers = Array.from({ length: L.embers }, () => spawn());
  function spawn(e = {}) {
    const l = lamps[(Math.random() * lamps.length) | 0];
    e.x = l.x + rand(-6, 6) * l.s;
    e.y = l.y - 36 * l.s * L.lampU;
    e.s = l.s;
    e.life = 0;
    e.max = rand(3.5, 7);
    e.vx = rand(-8, 10) * (0.5 + l.s);
    e.vy = -rand(18, 42) * (0.4 + l.s);
    e.ph = Math.random() * 6.28;
    return e;
  }
  embers.forEach((e) => (e.life = Math.random() * e.max));

  return {
    resize,
    /** T: intro time (s), v: visibility 0..1 */
    draw(dt, T, v) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      if (v <= 0.01) return;
      ctx.setTransform(k * dpr, 0, 0, k * dpr, ox * dpr, oy * dpr);

      const dustA = Math.min(1, Math.max(0, (T - 2.4) / 1.6)) * v;
      const emberA = Math.min(1, Math.max(0, (T - 0.9) / 1.2)) * v;

      for (const p of dust) {
        p.x += p.vx * dt; p.y += (p.vy + Math.sin(T + p.ph) * 3) * dt;
        if (p.x < L.vx - L.W * 0.34) { p.x = L.vx + L.W * 0.34; p.y = rand(L.vy + 30, L.H); }
        ctx.globalAlpha = p.a * dustA;
        ctx.fillStyle = '#f3cf92';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }

      for (const e of embers) {
        e.life += dt;
        if (e.life > e.max) spawn(e);
        const t = e.life / e.max;
        e.x += (e.vx + Math.sin(e.life * 1.7 + e.ph) * 8 * e.s) * dt;
        e.y += e.vy * dt;
        const a = Math.sin(Math.PI * t) * emberA;
        const r = (1.2 + 2.2 * e.s) * (1 - t * 0.5);
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = '#ffb347';
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a * 0.25;
        ctx.beginPath(); ctx.arc(e.x, e.y, r * 3.2, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
