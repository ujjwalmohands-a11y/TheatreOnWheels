// Shared perspective geometry for the hero scene.

const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (p, r, t) => ({ x: lerp(p.x, r.x, t), y: lerp(p.y, r.y, t) });
export const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** Truck local space: origin = ground centre, +y down, units at scale 1. */
export function truckGeom(L) {
  // vanishing point expressed in truck-local coordinates (constant for any distance)
  const vpl = { x: -L.off / L.q, y: -(L.H - L.vy) / L.q };
  const K_BOX = 0.62; // how far the side face recedes toward the vanishing point
  const K_CAB = 0.2;

  const A = { x: -235, y: -540 };
  const B = { x: -235, y: -90 };
  const A2 = lerp2(A, vpl, K_BOX);
  const B2 = lerp2(B, vpl, K_BOX);
  const E = { x: -190, y: -330 };
  const F = { x: -190, y: -50 };
  const E2 = lerp2(E, vpl, K_CAB);
  const F2 = lerp2(F, vpl, K_CAB);

  const onSide = (u, v) => lerp2(lerp2(A, A2, u), lerp2(B, B2, u), v);
  const quad = (u0, u1, v0, v1) => [onSide(u0, v0), onSide(u1, v0), onSide(u1, v1), onSide(u0, v1)];

  const screen = quad(0.14, 0.9, 0.17, 0.7);
  const trim = quad(0.0, 1.0, 0.86, 0.9);
  const seams = [0.38, 0.62].map((u) => [onSide(u, 0.02), onSide(u, 0.98)]);

  return {
    vpl,
    boxSide: [A, A2, B2, B],
    cabSide: [E, E2, F2, F],
    screen, trim, seams,
    screenCentre: {
      x: (screen[0].x + screen[2].x) / 2,
      y: (screen[0].y + screen[2].y) / 2,
    },
  };
}

/** Truck local → scene coordinates at scale s. */
export function toScene(L, s, p) {
  const gx = L.vx + L.off * s;
  const gy = L.vy + (L.H - L.vy) * s;
  return { x: gx + p.x * s * L.q, y: gy + p.y * s * L.q };
}

/** Roadside lamps, ordered by ignition (nearest-left first, then outward). */
export function makeLamps(L) {
  const n = L.lampsPerSide;
  const sMin = 0.07;
  const ratio = Math.pow(L.sMaxLamp / sMin, 1 / (n - 1));
  const list = [];
  for (let i = 0; i < n; i++) {
    const s = sMin * Math.pow(ratio, i);
    const y = L.vy + (L.H - L.vy) * s;
    const out = (L.roadHalf + 46) * s;
    list.push({ s, y, x: L.vx - out, side: 'L' });
    list.push({ s, y, x: L.vx + out, side: 'R' });
  }
  // ignite: biggest s first; left before right
  list.sort((a, b) => b.s - a.s || (a.side === 'L' ? -1 : 1));
  list.forEach((l, i) => {
    l.t0 = 0.25 + i * (1.9 / list.length);
    l.id = i;
  });
  return list;
}

export function makeDashes(L) {
  const out = [];
  let s = 0.08;
  while (s < 1.2) {
    const s2 = s * 1.13;
    out.push({ s, s2 });
    s = s2 * 1.1;
  }
  return out;
}
