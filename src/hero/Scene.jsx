import { memo, useMemo } from 'react';
import { truckGeom, makeLamps, makeDashes, pts } from './geometry';

// Deterministic pseudo-random so SSR/re-render never reshuffles the stars.
const rnd = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Lamp({ l, L, reg }) {
  const k = l.s * L.lampU;
  const delay = `${(rnd(l.id) * 2).toFixed(2)}s`;
  return (
    <g
      ref={(el) => (reg.lamps[l.id] = el)}
      transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) scale(${k.toFixed(3)})`}
      style={{ opacity: 0 }}
    >
      {/* light pool on the road */}
      <ellipse cx="0" cy="8" rx="170" ry="34" fill="url(#poolGold)" />
      <circle cx="0" cy="-14" r="120" fill="url(#lampGlow)" />
      {/* diya bowl */}
      <path d="M-26 -6 Q0 22 26 -6 Q14 -2 0 -2 Q-14 -2 -26 -6Z" fill="#2a1a0c" />
      <path d="M-26 -6 Q0 -1 26 -6" stroke="#c9974a" strokeWidth="2.2" fill="none" />
      {/* flame */}
      <g className="flame" style={{ animationDelay: delay }}>
        <path d="M0 -8 C-8 -20 -3 -30 0 -42 C3 -30 8 -20 0 -8Z" fill="#ffc761" />
        <path d="M0 -9 C-3.5 -16 -1.5 -22 0 -28 C1.5 -22 3.5 -16 0 -9Z" fill="#fff3cf" />
      </g>
    </g>
  );
}

/**
 * The whole hero picture as vector art. Positions of animated nodes are
 * written imperatively by the engine through `reg` (no React re-renders).
 */
function Scene({ L, reg, showTruck = true }) {
  const lamps = useMemo(() => makeLamps(L), [L]);
  const dashes = useMemo(() => makeDashes(L), [L]);
  const G = useMemo(() => truckGeom(L), [L]);
  const { W, H, vx, vy } = L;
  reg.lamps = [];

  const stars = useMemo(
    () =>
      Array.from({ length: L.portrait ? 38 : 56 }, (_, i) => ({
        x: rnd(i + 1) * W,
        y: rnd(i + 99) * vy * 0.62,
        r: 0.6 + rnd(i + 7) * 1.1,
        o: 0.25 + rnd(i + 33) * 0.5,
      })),
    [L, W, vy]
  );

  const roadBL = vx - L.roadHalf * 1.25;
  const roadBR = vx + L.roadHalf * 1.25;
  const roadSpan = (s) => [vx - L.roadHalf * s, vx + L.roadHalf * s, vy + (H - vy) * s];

  const hills = (seed, base, amp, step) => {
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W + step; x += step) {
      d += ` L${x} ${(base - rnd(seed + x) * amp).toFixed(1)}`;
    }
    return d + ` L${W} ${H}Z`;
  };

  return (
    <svg
      className="hero__svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={vy}>
          <stop offset="0" stopColor="#06040f" />
          <stop offset="0.45" stopColor="#120c33" />
          <stop offset="0.75" stopColor="#2d1a55" />
          <stop offset="0.9" stopColor="#8e4a52" />
          <stop offset="0.975" stopColor="#ee9a4b" />
          <stop offset="1" stopColor="#ffc56e" />
        </linearGradient>
        <linearGradient id="ground" gradientUnits="userSpaceOnUse" x1="0" y1={vy} x2="0" y2={H}>
          <stop offset="0" stopColor="#1c1022" />
          <stop offset="0.25" stopColor="#0d0814" />
          <stop offset="1" stopColor="#04030a" />
        </linearGradient>
        <linearGradient id="road" gradientUnits="userSpaceOnUse" x1="0" y1={vy} x2="0" y2={H}>
          <stop offset="0" stopColor="#b8683f" stopOpacity="0.85" />
          <stop offset="0.12" stopColor="#4a2a35" />
          <stop offset="0.45" stopColor="#1a1223" />
          <stop offset="1" stopColor="#0a0712" />
        </linearGradient>
        <radialGradient id="horizonGlow">
          <stop offset="0" stopColor="#ffb85c" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#e0803f" stopOpacity="0.22" />
          <stop offset="1" stopColor="#e0803f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#ffc761" stopOpacity="0.65" />
          <stop offset="0.35" stopColor="#ff9d3a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ff9d3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poolGold">
          <stop offset="0" stopColor="#ffb85c" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="haloGold">
          <stop offset="0" stopColor="#fff1c9" stopOpacity="1" />
          <stop offset="0.25" stopColor="#ffd488" stopOpacity="0.7" />
          <stop offset="0.6" stopColor="#ffa845" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffa845" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ledGlow">
          <stop offset="0" stopColor="#4fd0c8" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#2a9aa0" stopOpacity="0.16" />
          <stop offset="1" stopColor="#2a9aa0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ledFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fdcd0" />
          <stop offset="0.6" stopColor="#2d9ba3" />
          <stop offset="1" stopColor="#1d6f7e" />
        </linearGradient>
        <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2b1f2b" />
          <stop offset="1" stopColor="#120c18" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d98a4c" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#2d1a3c" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0b0712" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc56e" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffc56e" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g ref={(el) => (reg.camera = el)}>
        {/* sky */}
        <rect width={W} height={vy + 2} fill="url(#sky)" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f6e7c8" opacity={s.o} />
        ))}
        <ellipse cx={vx} cy={vy} rx={W * 0.5} ry={vy * 0.16} fill="url(#horizonGlow)" />

        {/* far, generic land */}
        <path d={hills(5, vy - 6, 22, 38)} fill="#1b0f27" />
        <path d={hills(61, vy + 4, 14, 26)} fill="#120a1d" />

        {/* ground + road */}
        <rect y={vy} width={W} height={H - vy} fill="url(#ground)" />
        <polygon points={pts([{ x: vx - 2, y: vy }, { x: vx + 2, y: vy }, { x: roadBR, y: H }, { x: roadBL, y: H }])} fill="url(#road)" />
        <ellipse cx={vx} cy={vy + 6} rx={W * 0.16} ry="10" fill="url(#horizonGlow)" opacity="0.9" />
        {dashes.map((d, i) => {
          const [, , y1] = roadSpan(d.s);
          const [, , y2] = roadSpan(d.s2);
          const w1 = 6 * d.s, w2 = 6 * d.s2;
          return (
            <polygon
              key={i}
              points={pts([{ x: vx - w1, y: y1 }, { x: vx + w1, y: y1 }, { x: vx + w2, y: y2 }, { x: vx - w2, y: y2 }])}
              fill="#f2dcb0"
              opacity="0.2"
            />
          );
        })}
        {[-1, 1].map((sg) => (
          <line key={sg} x1={vx + sg * 2} y1={vy} x2={vx + sg * L.roadHalf * 1.25} y2={H} stroke="#c9974a" strokeOpacity="0.18" strokeWidth="1.2" />
        ))}

        {/* lamps along the edge */}
        <g>{lamps.map((l) => <Lamp key={l.id} l={l} L={L} reg={reg} />)}</g>

        {/* truck */}
        {showTruck && (
          <>
            <g ref={(el) => (reg.truck = el)} style={{ opacity: 0 }}>
              {/* light pools / beams on the road, in front of the truck */}
              <g ref={(el) => (reg.pool = el)} style={{ opacity: 0 }}>
                <polygon points="-190,-100 -95,-100 40,1100 -520,1100" fill="url(#beam)" />
                <polygon points="95,-100 190,-100 520,1100 -40,1100" fill="url(#beam)" />
                <ellipse cx="-150" cy="40" rx="260" ry="62" fill="url(#poolGold)" />
                <ellipse cx="150" cy="40" rx="260" ry="62" fill="url(#poolGold)" />
              </g>

              {/* silhouette base: always present */}
              <g fill="#07050f">
                <polygon points={pts(G.boxSide)} />
                <rect x="-235" y="-540" width="470" height="450" />
                <polygon points={pts(G.cabSide)} />
                <rect x="-190" y="-330" width="380" height="280" rx="30" />
                <rect x="-205" y="-62" width="410" height="34" rx="8" />
                <rect x="-172" y="-78" width="64" height="78" rx="6" />
                <rect x="108" y="-78" width="64" height="78" rx="6" />
              </g>

              {/* revealed detail */}
              <g ref={(el) => (reg.detail = el)} style={{ opacity: 0 }}>
                <polygon points={pts(G.boxSide)} fill="url(#bodyShade)" />
                <polygon points={pts(G.trim)} fill="#c9974a" opacity="0.8" />
                {G.seams.map((s, i) => (
                  <line key={i} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke="#07050f" strokeWidth="2.5" opacity="0.7" />
                ))}
                <rect x="-235" y="-540" width="470" height="450" fill="#1a121d" />
                <rect x="-235" y="-540" width="470" height="6" fill="#c9974a" opacity="0.5" />
                <polygon points={pts(G.cabSide)} fill="#1d1522" />
                <rect x="-190" y="-330" width="380" height="280" rx="30" fill="#241a28" />
                <path d="M-165 -300 H165 L150 -190 H-150Z" fill="url(#glass)" />
                <rect x="-110" y="-165" width="220" height="82" rx="8" fill="#0b0810" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="-104" x2="104" y1={-155 + i * 16} y2={-155 + i * 16} stroke="#c9974a" strokeOpacity="0.35" strokeWidth="2" />
                ))}
                <rect x="-205" y="-62" width="410" height="34" rx="8" fill="#0f0a14" />
                <rect x="-172" y="-78" width="64" height="78" rx="6" fill="#050309" />
                <rect x="108" y="-78" width="64" height="78" rx="6" fill="#050309" />
                {/* rim light from the amber horizon on the roofline */}
                <path d="M-235 -540 H235" stroke="#ffb35c" strokeOpacity="0.55" strokeWidth="3" />
                {/* headlight lenses */}
                <rect x="-168" y="-152" width="56" height="40" rx="14" fill="#fff0c2" />
                <rect x="112" y="-152" width="56" height="40" rx="14" fill="#fff0c2" />
              </g>

              {/* LED screen — the one cool light */}
              <g ref={(el) => (reg.led = el)} style={{ opacity: 0 }}>
                <ellipse cx={G.screenCentre.x} cy={G.screenCentre.y} rx="230" ry="260" fill="url(#ledGlow)" />
                <polygon points={pts(G.screen)} fill="url(#ledFace)" />
                <polygon points={pts(G.screen)} fill="none" stroke="#a9f0e6" strokeOpacity="0.35" strokeWidth="2" />
              </g>
            </g>

            {/* headlight halos live in scene space so they read from far away */}
            <g ref={(el) => (reg.halos = el)} style={{ opacity: 0 }}>
              <circle ref={(el) => (reg.hl0 = el)} r="10" fill="url(#haloGold)" />
              <circle ref={(el) => (reg.hl1 = el)} r="10" fill="url(#haloGold)" />
              <ellipse ref={(el) => (reg.streak = el)} rx="40" ry="1.4" fill="#ffe3a8" opacity="0.5" />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}

export default memo(Scene);
