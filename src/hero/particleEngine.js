/* =============================================================
   TheatreOnWheels — Particle Engine (Canvas 2D)
   Light-theme warm sunrise intro + living 7D theatre truck.
   ============================================================= */

/* ── Colour palette ─────────────────────────────────────────── */
const COLORS = {
  red:      '#E5383B', // vermilion — 45% of particles
  marigold: '#FF9F1C', // 35%
  magenta:  '#C2185B', // 12%
  ink:      '#2A0E14', // 8% (deep maroon-black)
  teal:     '#0FA3A3', // 7D cinema screen accent
};

/* ── Particle counts (dense for crisp typography & sharp truck) */
const PARTICLE_COUNT_DESKTOP = 2800;
const PARTICLE_COUNT_MOBILE  = 1300;

/* ── Physics (gentle, silky-smooth spring feel) ─────────────── */
const SPRING_K     = 0.044; // lower stiffness = smoother fluid glide
const DAMPING      = 0.81;  // higher damping = velvety settle without harsh snaps
const NOISE_AMT    = 0.18;  // subtle ambient shimmer
const NOISE_SPEED  = 0.85;
const MOUSE_RADIUS = 95;    // px repulsion radius
const MOUSE_FORCE  = 230;   // repulsion strength

/* ── Intro timeline (generous, cinematic pacing) ─────────────── */
const PHASE_DRIFT_START   =  0.0; // petals drift in gently from outer edges
const PHASE_GREET_START   =  1.0; // converge into large greeting in screen center
const PHASE_GREET_END     =  4.4; // hold and gracefully morph greetings (3.4s)
const PHASE_BURST_PEAK    =  4.8; // smooth Holi color powder burst outward
const PHASE_TAGLINE_START =  5.3; // re-form into "One door. Many worlds." in center
const PHASE_TAGLINE_END   =  7.8; // hold tagline (2.5s) for dignified reading
const PHASE_TRUCK_START   =  7.8; // stream across screen into 7D theatre truck
const PHASE_TRUCK_END     = 10.2; // truck fully formed, sunrise ascendant
const PHASE_HERO_FADE     = 10.2; // hero copy on left fades in

/* ── Tiny deterministic rng ──────────────────────────────────── */
const srand = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s <<  5)) >>> 0;
    return (s >>> 0) / 0xffffffff;
  };
};

/* ── Sample text to offscreen canvas and return sample pts ────
   Positioned in the DEAD CENTER of the screen with tight sampling
   for dense, high-contrast, beautiful typography.
   ───────────────────────────────────────────────────────────── */
function textTargets(text, font, color, canvasW, canvasH, dpr, opts = {}) {
  const off = document.createElement('canvas');
  off.width  = Math.round(canvasW * dpr);
  off.height = Math.round(canvasH * dpr);
  const ctx = off.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;

  if ('letterSpacing' in ctx && opts.letterSpacing) {
    ctx.letterSpacing = opts.letterSpacing;
  }

  // Perfectly centered on the full screen
  const textX = canvasW * 0.50;
  const textY = canvasH * 0.46;

  if (Array.isArray(text)) {
    const lineHeight = opts.lineHeight || 44;
    const totalH = (text.length - 1) * lineHeight;
    text.forEach((line, idx) => {
      const ly = textY - totalH / 2 + idx * lineHeight;
      ctx.fillText(line, textX, ly);
    });
  } else {
    ctx.fillText(text, textX, textY);
  }

  const { width, height } = off;
  const data = ctx.getImageData(0, 0, width, height).data;
  const pts = [];

  // Sample core glyph body (alpha > 85 avoids fuzzy edge halos that expand letters)
  const step = Math.max(2, Math.round(2.0 * dpr));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 85) {
        pts.push({
          x: x / dpr,
          y: y / dpr,
          isOutline: alpha > 175,
          color: color || COLORS.ink,
        });
      }
    }
  }
  return pts;
}

/* ── High-Precision Parametric Truck Silhouette ──────────────
   Creates an unmistakably detailed, crisp 7D Travelling Theatre
   truck with aerodynamic cab, windshield, 7D cinema screen,
   and 3 Konark spoked wheels firmly planted on the road line.
   ───────────────────────────────────────────────────────────── */
function truckTargets(canvasW, canvasH, dpr, portrait) {
  const pts = [];

  // On desktop: positioned in right half of screen (cx = 0.72)
  // On portrait: precisely centered in the upper portion with generous margins
  const scale = portrait ? Math.min(canvasW / 580, 0.58) : Math.min(canvasW / 1250, 1.05);
  const cx = portrait ? (canvasW * 0.50 + 26 * scale) : (canvasW * 0.72);
  const groundY = canvasH * (portrait ? 0.31 : 0.62);

  const tr = (x, y) => ({ x: cx + x * scale, y: groundY + y * scale });

  const addSeg = (x1, y1, x2, y2, step, color, isOutline = true) => {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(dist / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = tr(x1 + dx * t, y1 + dy * t);
      pts.push({ ...p, color, isOutline });
    }
  };

  const addArc = (acx, acy, r, a0, a1, step, color, isOutline = true) => {
    const span = a1 - a0;
    const circ = Math.abs(span * r);
    const steps = Math.max(4, Math.round(circ / step));
    for (let i = 0; i <= steps; i++) {
      const ang = a0 + (span * i) / steps;
      const p = tr(acx + Math.cos(ang) * r, acy + Math.sin(ang) * r);
      pts.push({ ...p, color, isOutline });
    }
  };

  const addStipple = (rx, ry, rw, rh, step, color) => {
    for (let y = ry + step; y < ry + rh; y += step) {
      for (let x = rx + step; x < rx + rw; x += step) {
        const ox = (Math.sin(x * 11.3 + y * 4.7) * step) * 0.22;
        const oy = (Math.cos(x * 6.9 + y * 9.1) * step) * 0.22;
        const p = tr(x + ox, y + oy);
        pts.push({ ...p, color, isOutline: false });
      }
    }
  };

  /* ─ A. Wheels (3 Konark Spoked Wheels) ───────────────────── */
  const R = 30; // wheel radius
  const wheels = [
    { cx: -160, cy: -R }, // Front Cab Wheel
    { cx:  105, cy: -R }, // Rear Trailer Wheel 1
    { cx:  175, cy: -R }, // Rear Trailer Wheel 2
  ];

  for (const w of wheels) {
    // Outer tyre ring & tread (dense solid ink)
    addArc(w.cx, w.cy, R, 0, Math.PI * 2, 1.8, COLORS.ink, true);
    addArc(w.cx, w.cy, R - 2.5, 0, Math.PI * 2, 1.8, COLORS.ink, true);

    // Rim circle (bright marigold)
    addArc(w.cx, w.cy, R * 0.70, 0, Math.PI * 2, 1.8, COLORS.marigold, true);

    // Central hub ring (vermilion)
    addArc(w.cx, w.cy, R * 0.22, 0, Math.PI * 2, 1.6, COLORS.red, true);
    pts.push({ ...tr(w.cx, w.cy), color: COLORS.red, isOutline: true });

    // 8 Konark spokes
    for (let k = 0; k < 8; k++) {
      const ang = (k * Math.PI) / 4;
      const cos = Math.cos(ang), sin = Math.sin(ang);
      addSeg(
        w.cx + cos * R * 0.22, w.cy + sin * R * 0.22,
        w.cx + cos * R * 0.70, w.cy + sin * R * 0.70,
        1.8, COLORS.marigold, true
      );
    }
  }

  /* ─ B. Chassis & Mudguards ───────────────────────────────── */
  // Front wheel arch mudguard
  addArc(-160, -R, R + 6, Math.PI * 0.82, Math.PI * 2.18, 2.6, COLORS.ink, true);
  // Rear dual wheel arch mudguard
  addArc(105, -R, R + 6, Math.PI * 0.82, Math.PI * 1.5, 2.6, COLORS.ink, true);
  addSeg(105, -R - R - 6, 175, -R - R - 6, 2.6, COLORS.ink, true);
  addArc(175, -R, R + 6, Math.PI * 1.5, Math.PI * 2.18, 2.6, COLORS.ink, true);

  // Chassis bottom rails
  addSeg(-228, -34, -196, -34, 2.6, COLORS.ink, true);
  addSeg(-124, -34,  -95, -34, 2.6, COLORS.ink, true);
  addSeg( -92, -34,   69, -34, 2.6, COLORS.ink, true);
  addSeg( 211, -34,  225, -34, 2.6, COLORS.ink, true);

  // Generator / Battery box under container
  addSeg(-65, -34, -65, -16, 2.8, COLORS.ink, true);
  addSeg(-65, -16,  40, -16, 2.8, COLORS.ink, true);
  addSeg( 40, -16,  40, -34, 2.8, COLORS.ink, true);
  addStipple(-64, -33, 103, 16, 5.0, COLORS.ink);

  /* ─ C. Truck Cab (Left Side) ─────────────────────────────── */
  // Front bumper & grille
  addSeg(-228, -14, -228, -42, 2.4, COLORS.ink, true); // bumper
  addSeg(-228, -42, -224, -72, 2.4, COLORS.ink, true); // vertical grille
  addSeg(-224, -72, -175, -72, 2.4, COLORS.ink, true); // hood line
  addSeg(-175, -72, -140, -148, 2.4, COLORS.ink, true); // slanted windshield
  addSeg(-140, -148, -105, -155, 2.4, COLORS.ink, true); // aerodynamic cab roof & spoiler
  addSeg(-105, -155, -105, -38, 2.4, COLORS.ink, true); // rear cab wall
  addSeg(-105, -38, -228, -38, 2.6, COLORS.ink, true); // cab floor

  // Headlight unit (bright marigold on front bumper)
  addSeg(-228, -30, -228, -40, 2.0, COLORS.marigold, true);
  addSeg(-224, -30, -224, -40, 2.0, COLORS.marigold, true);

  // Grille horizontal slats
  for (let gy = -48; gy >= -68; gy -= 6) {
    addSeg(-227, gy, -212, gy, 3.0, COLORS.ink, false);
  }

  // Clear Windshield & Side Window Frame
  addSeg(-172, -76, -140, -142, 2.5, COLORS.marigold, true); // windshield glass line
  addSeg(-140, -142, -112, -142, 2.5, COLORS.marigold, true); // window top
  addSeg(-112, -142, -112, -86, 2.5, COLORS.marigold, true); // window rear
  addSeg(-112, -86, -162, -86, 2.5, COLORS.marigold, true); // window sill
  addSeg(-162, -86, -140, -142, 2.5, COLORS.marigold, true); // A-pillar

  // Cab door line
  addSeg(-112, -86, -112, -38, 2.8, COLORS.ink, true);
  pts.push({ ...tr(-118, -78), color: COLORS.marigold, isOutline: true }); // door handle

  // Side mirror
  addSeg(-172, -96, -186, -100, 2.5, COLORS.ink, true); // bracket
  addSeg(-186, -106, -186, -92, 2.2, COLORS.marigold, true); // mirror

  // Cab interior stipple
  addStipple(-220, -70, 44, 30, 4.2, COLORS.ink);
  addStipple(-160, -84, 48, 44, 4.2, COLORS.ink);

  /* ─ D. Coupling Hitch (between Cab & Trailer) ────────────── */
  addSeg(-105, -36, -92, -36, 2.5, COLORS.ink, true);
  addSeg(-105, -42, -92, -42, 2.5, COLORS.ink, true);

  /* ─ E. 7D Cinema Container / Trailer ─────────────────────── */
  const cX = -92, cY = -172, cW = 317, cH = 134;
  const sX = -36, sY = -152, sW = 158, sH = 94;

  // Container outer perimeter
  addSeg(cX, cY, cX + cW, cY, 2.4, COLORS.ink, true); // top roof rail
  addSeg(cX + cW, cY, cX + cW, cY + cH, 2.4, COLORS.ink, true); // rear wall
  addSeg(cX + cW, cY + cH, cX, cY + cH, 2.4, COLORS.ink, true); // bottom rail
  addSeg(cX, cY + cH, cX, cY, 2.4, COLORS.ink, true); // front wall

  // Rear container double door divider & lock rods
  addSeg(cX + cW - 6, cY, cX + cW - 6, cY + cH, 2.8, COLORS.ink, true);
  pts.push({ ...tr(cX + cW - 6, cY + 68), color: COLORS.marigold, isOutline: true });

  // Container accent border stripe
  addSeg(cX + 2, cY + 12, cX + cW - 2, cY + 12, 2.8, COLORS.marigold, false);

  // Container body stipple (warm dense ink surrounding the screen completely)
  // Left side panel
  addStipple(cX + 4, cY + 4, (sX - cX) - 6, cH - 8, 3.8, COLORS.ink);
  // Right side panel behind screen
  addStipple(sX + sW + 4, cY + 4, (cX + cW) - (sX + sW) - 8, cH - 8, 3.8, COLORS.ink);
  // Top container strip above screen
  addStipple(sX - 2, cY + 4, sW + 4, (sY - cY) - 5, 3.8, COLORS.ink);
  // Bottom container strip below screen
  addStipple(sX - 2, sY + sH + 2, sW + 4, (cY + cH) - (sY + sH) - 5, 3.8, COLORS.ink);

  /* ─ F. The 7D Cinema Screen ──────────────────────────────── */
  // Screen outer bezel (dense teal)
  addSeg(sX, sY, sX + sW, sY, 2.2, COLORS.teal, true);
  addSeg(sX + sW, sY, sX + sW, sY + sH, 2.2, COLORS.teal, true);
  addSeg(sX + sW, sY + sH, sX, sY + sH, 2.2, COLORS.teal, true);
  addSeg(sX, sY + sH, sX, sY, 2.2, COLORS.teal, true);

  // Inner border
  addSeg(sX + 3, sY + 3, sX + sW - 3, sY + 3, 2.4, COLORS.teal, true);
  addSeg(sX + sW - 3, sY + 3, sX + sW - 3, sY + sH - 3, 2.4, COLORS.teal, true);
  addSeg(sX + sW - 3, sY + sH - 3, sX + 3, sY + sH - 3, 2.4, COLORS.teal, true);
  addSeg(sX + 3, sY + sH - 3, sX + 3, sY + 3, 2.4, COLORS.teal, true);

  // Screen interior glowing stipple (dense teal, keeping space clear around 7D emblem)
  for (let y = sY + 6; y < sY + sH - 6; y += 4.0) {
    for (let x = sX + 6; x < sX + sW - 6; x += 4.0) {
      // Keep clear zone around '7D' emblem (x: 16 to 72, y: -124 to -86)
      if (x >= 16 && x <= 72 && y >= -124 && y <= -86) continue;
      const ox = (Math.sin(x * 11.3 + y * 4.7) * 4.0) * 0.22;
      const oy = (Math.cos(x * 6.9 + y * 9.1) * 4.0) * 0.22;
      const p = tr(x + ox, y + oy);
      pts.push({ ...p, color: COLORS.teal, isOutline: false });
    }
  }

  // Screen Emblem: bold, centered "7D" in glowing vermilion & marigold
  // '7'
  addSeg(20, -120, 42, -120, 1.8, COLORS.marigold, true); // top bar
  addSeg(20, -118, 42, -118, 1.8, COLORS.red, true);      // top bar shadow
  addSeg(42, -120, 27, -88, 1.8, COLORS.marigold, true);  // diagonal stem
  addSeg(40, -120, 25, -88, 1.8, COLORS.red, true);       // stem shadow
  addSeg(28, -104, 38, -104, 1.8, COLORS.marigold, true); // crossbar
  // 'D'
  addSeg(50, -120, 50, -88, 1.8, COLORS.marigold, true);  // spine
  addSeg(52, -120, 52, -88, 1.8, COLORS.red, true);       // double spine
  addArc(50, -104, 16, -Math.PI / 2, Math.PI / 2, 1.8, COLORS.marigold, true); // outer loop
  addArc(50, -104, 13.5, -Math.PI / 2, Math.PI / 2, 1.8, COLORS.red, true);    // inner loop

  /* ─ G. Road Line (Surface level y = 0) ───────────────────── */
  addSeg(-260, 0, 260, 0, 2.4, COLORS.ink, true);

  return pts;
}

// ── Ease helpers ──────────────────────────────────────────────
const smoothstep = (a, b, t) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// ── Hardware & mobile capability profile ──────────────────────
function getDeviceSettings(portrait) {
  if (typeof window === 'undefined') return { count: 2000, maxDpr: 1.5, isLowEnd: false };
  const nav = window.navigator || {};
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const isLowEnd = cores <= 4 || memory <= 4;
  const isMobile = portrait || (window.innerWidth < 768);

  // Sufficient particle count so EVERY point of the truck is filled without gaps:
  let count;
  if (isMobile) {
    count = isLowEnd ? 1650 : 2000;
  } else {
    count = isLowEnd ? 2000 : PARTICLE_COUNT_DESKTOP;
  }

  // DPR capping: saving >50% fill-rate on high-DPI low-power screens
  let maxDpr = 1.75;
  if (isMobile) {
    maxDpr = isLowEnd ? 1.25 : 1.5;
  } else if (isLowEnd) {
    maxDpr = 1.5;
  }

  return { count, maxDpr, isLowEnd, isMobile };
}

// ── Main export ───────────────────────────────────────────────
export function createParticleEngine(canvas, opts = {}) {
  const {
    lang = 'en',
    portrait = false,
    onIntroComplete = () => {},
    getGreeting = () => 'Hare Kṛṣṇa',
  } = opts;

  let skipIntro = false;
  const profile = getDeviceSettings(portrait);

  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
  let W = 0, H = 0;
  const N = profile.count;

  let mx = -9999, my = -9999;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const rng = srand(42);

  let particles = [];
  let truckPts = null;
  let greetPts = null;
  let taglinePts = null;
  let currentTargetPhase = 'drift';

  let clock = 0;
  let lastT = null;
  let raf = null;
  let introComplete = false;
  let sunOpacity = 0;

  // ── Resize & init ─────────────────────────────────────────
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    truckPts   = null;
    greetPts   = null;
    taglinePts = null;
    initParticles();
  }

  function pickColor() {
    const r = rng();
    if (r < 0.45) return COLORS.red;
    if (r < 0.80) return COLORS.marigold;
    if (r < 0.92) return COLORS.magenta;
    return COLORS.ink;
  }

  // ── Initialise particle pool ──────────────────────────────
  function initParticles() {
    particles = [];
    for (let i = 0; i < N; i++) {
      const side = Math.floor(rng() * 4);
      let sx, sy;
      if (side === 0)      { sx = rng() * W; sy = -15; }
      else if (side === 1) { sx = W + 15;   sy = rng() * H; }
      else if (side === 2) { sx = rng() * W; sy = H + 15; }
      else                 { sx = -15;       sy = rng() * H; }

      particles.push({
        x:  sx, y:  sy,
        vx: 0,  vy: 0,
        tx: sx, ty: sy,
        r:  2.2 + rng() * 1.3, // prominent, crisp particle radius
        a:  0.90 + rng() * 0.10,
        color: pickColor(),
        ph: rng() * Math.PI * 2,
        noiseX: rng() * 1000,
        noiseY: rng() * 1000,
        delay: rng() * 0.8,
        isOutline: false,
        role: 'general',
      });
    }
  }

  // ── Assign targets to particles ───────────────────────────
  function assignTargets(pts, phase) {
    const plen = pts.length;
    if (plen === 0) return;
    const isText = (phase === 'greet' || phase === 'tagline');

    for (let i = 0; i < N; i++) {
      const p = particles[i];

      if (isText) {
        if (i < plen) {
          // Exactly 1 particle per target point: zero piling, crystal-clear glyphs!
          const tp = pts[i];
          p.tx = tp.x;
          p.ty = tp.y;
          p.delay = rng() * 0.15;
          p.isOutline = !!tp.isOutline;
          p.role = phase;

          if (phase === 'greet') {
            // Authentic festival colors: rich dark ink (88%) with sparkling vermilion (12%)
            p.color = rng() < 0.88 ? COLORS.ink : COLORS.red;
            p.r = portrait ? (1.30 + rng() * 0.25) : (1.45 + rng() * 0.30); // ~2.6px–3.1px diameter
            p.a = 0.98;
          } else {
            // Tagline
            p.color = tp.color || COLORS.ink;
            p.r = 1.35 + rng() * 0.25;
            p.a = 0.98;
          }
        } else {
          // Extra particles drift softly near outer canvas perimeter, keeping reading zone pristine
          const side = i % 4;
          if (side === 0)      { p.tx = rng() * W; p.ty = rng() * (H * 0.08); }
          else if (side === 1) { p.tx = W - rng() * (W * 0.08); p.ty = rng() * H; }
          else if (side === 2) { p.tx = rng() * W; p.ty = H - rng() * (H * 0.08); }
          else                 { p.tx = rng() * (W * 0.08); p.ty = rng() * H; }
          p.delay = rng() * 0.5;
          p.color = pickColor();
          p.r = 1.0 + rng() * 0.8;
          p.a = 0.08 + rng() * 0.08; // minimal ambient shimmer
          p.isOutline = false;
          p.role = 'ambient';
        }
      } else {
        // Truck phase: evenly distribute particles across all truck points
        const idx = Math.floor((i / N) * plen);
        const tp = pts[idx % plen];
        p.tx = tp.x;
        p.ty = tp.y;
        p.delay = rng() * 0.35;
        p.isOutline = !!tp.isOutline;
        p.role = phase;
        if (tp.color) p.color = tp.color;
        p.r = portrait ? (1.6 + rng() * 0.5) : (1.9 + rng() * 0.8);
        p.a = 0.94;
      }
    }
    currentTargetPhase = phase;
  }

  // ── Scatter outward (Holi powder burst phase) ─────────────
  function burstScatter() {
    const centerX = W * 0.50;
    const centerY = H * 0.46;
    for (const p of particles) {
      const dx = p.x - centerX, dy = p.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 180 + rng() * 260;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
      p.color = pickColor();
      p.isOutline = false;
    }
  }

  // ── Get / build greeting targets (in dead center of screen)
  function getGreetPts(customGreeting) {
    const greeting = customGreeting || getGreeting();
    const isHindi = greeting === 'हरे कृष्ण';
    const isOdia  = greeting === 'ହରେ କୃଷ୍ଣ';

    let greetText;
    let fsize;
    let letterSpacing;
    let lineHeight;

    if (portrait) {
      if (isHindi) {
        greetText = ['हरे', 'कृष्ण'];
        fsize = Math.min(W * 0.12, 54);
        letterSpacing = '3px';
        lineHeight = Math.round(fsize * 1.30);
      } else if (isOdia) {
        greetText = ['ହରେ', 'କୃଷ୍ଣ'];
        fsize = Math.min(W * 0.11, 50);
        letterSpacing = '2px';
        lineHeight = Math.round(fsize * 1.30);
      } else {
        // English / IAST: 2 lines on portrait for majestic, prominent, open counters
        greetText = ['Hare', 'Kṛṣṇa'];
        fsize = Math.min(W * 0.13, 58);
        letterSpacing = '5px'; // Generous tracking keeps letters distinctly separated!
        lineHeight = Math.round(fsize * 1.25);
      }
    } else {
      greetText = greeting;
      fsize = Math.min(W * 0.082, 105);
      letterSpacing = isHindi || isOdia ? '2px' : '5px';
      lineHeight = Math.round(fsize * 1.25);
    }

    let font;
    if (isHindi) {
      font = `600 ${fsize}px "Hind", "Tiro Devanagari Hindi", serif`;
    } else if (isOdia) {
      font = `600 ${fsize}px "Noto Sans Oriya", "Kalinga", serif`;
    } else {
      // 600 Semi-Bold Cormorant Garamond Roman (Upright, not italic!)
      // Upright forms prevent slanting overlap, keeping internal counters open and letters crisp!
      font = `600 ${fsize}px "Cormorant Garamond", Georgia, serif`;
    }

    return textTargets(greetText, font, COLORS.ink, W, H, dpr, {
      letterSpacing,
      lineHeight,
    });
  }

  // ── Get / build tagline targets (in dead center of screen)
  function getTaglinePts() {
    if (taglinePts) return taglinePts;

    // Prominent, large display sizing for maximum legibility and dramatic impact
    const fsize = portrait
      ? Math.min(W * 0.082, 38)
      : Math.min(W * 0.052, 74);

    let tagText;
    if (portrait) {
      tagText = lang === 'hi'
        ? ['एक दरवाज़ा।', 'कई दुनिया।']
        : lang === 'or'
        ? ['ଗୋଟିଏ କବାଟ।', 'ଅନେକ ଦୁନିଆ।']
        : ['One door.', 'Many worlds.'];
    } else {
      tagText = lang === 'hi'
        ? 'एक दरवाज़ा। कई दुनिया।'
        : lang === 'or'
        ? 'ଗୋଟିଏ କବାଟ। ଅନେକ ଦୁନିଆ।'
        : 'One door. Many worlds.';
    }

    let font;
    if (lang === 'hi') {
      font = `600 ${Math.round(fsize * 0.95)}px "Hind", "Tiro Devanagari Hindi", serif`;
    } else if (lang === 'or') {
      font = `600 ${Math.round(fsize * 0.90)}px "Noto Sans Oriya", "Kalinga", serif`;
    } else {
      // 600 semi-bold Cormorant Garamond Roman for crystal-clear letterforms and open counters
      font = `600 ${fsize}px "Cormorant Garamond", Georgia, serif`;
    }

    taglinePts = textTargets(tagText, font, COLORS.ink, W, H, dpr, {
      letterSpacing: lang === 'en' ? '3px' : '1px',
      lineHeight: Math.round(fsize * 1.35),
    });
    return taglinePts;
  }

  function getTruckPts() {
    if (truckPts) return truckPts;
    truckPts = truckTargets(W, H, dpr, portrait);
    return truckPts;
  }

  // ── Draw the soft morning sun behind the truck ────────────
  function drawSun(alpha) {
    if (alpha <= 0) return;
    const scale = portrait ? Math.min(W / 580, 0.58) : Math.min(W / 1250, 1.05);
    const sunX = portrait ? (W * 0.50 + 26 * scale) : (W * 0.72);
    const groundY = H * (portrait ? 0.31 : 0.62);
    const sunY = groundY - 80 * scale;
    const sunR = Math.min(W, H) * (portrait ? 0.34 : 0.32);

    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    g.addColorStop(0.0,  'rgba(255,159,28,0.32)'); // marigold core
    g.addColorStop(0.40, 'rgba(229,56,59,0.13)');   // vermilion mid
    g.addColorStop(1.0,  'rgba(255,244,230,0)');    // fade to cream
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Draw soft headlight beam projecting forward ───────────
  function drawHeadlight(alpha) {
    if (alpha <= 0) return;
    const scale = portrait ? Math.min(W / 580, 0.58) : Math.min(W / 1250, 1.05);
    const cx = portrait ? (W * 0.50 + 26 * scale) : (W * 0.72);
    const groundY = H * (portrait ? 0.31 : 0.62);

    const hx = cx - 228 * scale;
    const hy = groundY - 35 * scale;
    const beamLen = 220 * scale;

    ctx.save();
    ctx.globalAlpha = alpha * 0.25;
    const g = ctx.createLinearGradient(hx, hy, hx - beamLen, hy);
    g.addColorStop(0.0, 'rgba(255, 195, 45, 0.55)');
    g.addColorStop(0.5, 'rgba(255, 159, 28, 0.20)');
    g.addColorStop(1.0, 'rgba(255, 244, 230, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - beamLen, hy - 18 * scale);
    ctx.lineTo(hx - beamLen, groundY + 1 * scale);
    ctx.lineTo(hx, groundY + 1 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Draw 7D cinema screen ambient backglow ────────────────
  function drawScreenGlow(alpha) {
    if (alpha <= 0) return;
    const scale = portrait ? Math.min(W / 580, 0.58) : Math.min(W / 1250, 1.05);
    const cx = portrait ? (W * 0.50 + 26 * scale) : (W * 0.72);
    const groundY = H * (portrait ? 0.31 : 0.62);

    const sX = cx - 36 * scale;
    const sY = groundY - 152 * scale;
    const sW = 158 * scale;
    const sH = 94 * scale;

    ctx.save();
    ctx.globalAlpha = alpha * 0.32;
    const g = ctx.createRadialGradient(sX + sW / 2, sY + sH / 2, 8, sX + sW / 2, sY + sH / 2, sW * 0.65);
    g.addColorStop(0, 'rgba(15, 163, 163, 0.45)');
    g.addColorStop(0.7, 'rgba(15, 163, 163, 0.12)');
    g.addColorStop(1, 'rgba(255, 244, 230, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.rect(sX - 15, sY - 15, sW + 30, sH + 30);
    ctx.fill();
    ctx.restore();
  }

  // ── Draw road line ────────────────────────────────────────
  function drawRoad(alpha) {
    if (alpha <= 0) return;
    const groundY = H * (portrait ? 0.31 : 0.62);
    ctx.save();
    ctx.globalAlpha = alpha * 0.60;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    const roadLeft  = portrait ? W * 0.08 : W * 0.42;
    const roadRight = portrait ? W * 0.92 : W * 0.96;
    ctx.beginPath();
    ctx.moveTo(roadLeft, groundY);
    ctx.lineTo(roadRight, groundY);
    ctx.stroke();
    ctx.restore();
  }

  // ── Update & draw particles ───────────────────────────────
  function updateParticles(dt, t) {
    ctx.save();

    for (const p of particles) {
      const elapsed = t - p.delay;
      if (elapsed < 0) {
        p.vx += (rng() - 0.5) * 22 * dt;
        p.vy += (rng() - 0.5) * 22 * dt;
      } else {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * SPRING_K;
        p.vy += dy * SPRING_K;

        // Text reading phases: damp particles tightly once settled for razor-sharp typography
        if (p.role === 'greet' || p.role === 'tagline') {
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
            p.vx *= 0.88;
            p.vy *= 0.88;
          }
        } else if (p.isOutline) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
          p.noiseX += NOISE_SPEED * dt;
          p.noiseY += NOISE_SPEED * dt;
          p.vx += Math.sin(p.noiseX + p.ph) * (NOISE_AMT * 0.4);
          p.vy += Math.cos(p.noiseY + p.ph * 1.3) * (NOISE_AMT * 0.4);
        }
      }

      // Mouse repulsion (fine pointer only)
      if (hasFinePointer && mx > 0) {
        const ddx = p.x - mx, ddy = p.y - my;
        const dist2 = ddx * ddx + ddy * ddy;
        const mr2 = MOUSE_RADIUS * MOUSE_RADIUS;
        if (dist2 < mr2 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const f = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * dt;
          p.vx += (ddx / dist) * f;
          p.vy += (ddy / dist) * f;
        }
      }

      // Damping
      p.vx *= DAMPING;
      p.vy *= DAMPING;

      // Integrate
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      // Draw particle
      ctx.globalAlpha = p.a;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── Pattachitra border ────────────────────────────────────
  function drawBorder() {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 1.5;
    const bh = 6;
    const y  = H - bh;
    const seg = 8;
    ctx.beginPath();
    for (let x = 0; x < W; x += seg * 2) {
      ctx.moveTo(x, y + bh);
      ctx.lineTo(x + seg, y);
      ctx.lineTo(x + seg * 2, y + bh);
    }
    ctx.stroke();
    ctx.restore();
  }

  function completeIntro() {
    if (introComplete) return;
    introComplete = true;
    onIntroComplete();
  }

  let lastPhase = '';
  let burstDone = false;
  let greetMorphIndex = -1;

  // Language sequence: starts with active language, then explores the other two
  const getGreetingSequence = () => {
    if (lang === 'hi') return ['हरे कृष्ण', 'ହରେ କୃଷ୍ଣ', 'Hare Kṛṣṇa'];
    if (lang === 'or') return ['ହରେ କୃଷ୍ଣ', 'हरे कृष्ण', 'Hare Kṛṣṇa'];
    return ['Hare Kṛṣṇa', 'हरे कृष्ण', 'ହରେ କୃଷ୍ଣ'];
  };

  function tickPhase(t) {
    if (skipIntro) {
      if (currentTargetPhase !== 'truck') {
        const pts = getTruckPts();
        if (pts.length > 0) assignTargets(pts, 'truck');
        completeIntro();
      }
      return;
    }

    // Phase 1: petals drift in (0–1s)

    // Phase 2: Greeting held dignified & steady in screen center (1.0s to 4.4s)
    if (t >= PHASE_GREET_START && t < PHASE_GREET_END) {
      if (lastPhase !== 'greet') {
        lastPhase = 'greet';
        const word = getGreeting();
        const pts = getGreetPts(word);
        assignTargets(pts, 'greet');
      }
    }

    // Phase 3: Holi color powder burst (4.8s)
    if (t >= PHASE_BURST_PEAK && !burstDone) {
      burstDone = true;
      burstScatter();
    }

    // Phase 4: Tagline "One door. Many worlds." in screen center (5.3s to 7.8s)
    if (t >= PHASE_TAGLINE_START && t < PHASE_TAGLINE_END && lastPhase !== 'tagline') {
      lastPhase = 'tagline';
      burstDone = true;
      for (const p of particles) p.color = pickColor();
      const pts = getTaglinePts();
      if (pts.length) assignTargets(pts, 'tagline');
    }

    // Phase 5: Stream across into truck on the right side (7.8s to 10.2s)
    if (t >= PHASE_TRUCK_START && lastPhase !== 'truck') {
      lastPhase = 'truck';
      const pts = getTruckPts();
      if (pts.length) assignTargets(pts, 'truck');
    }

    // Intro complete at 10.2s: hero copy fades in on the left
    if (t >= PHASE_HERO_FADE && !introComplete) {
      completeIntro();
    }
  }

  // ── Main animation loop ───────────────────────────────────
  function loop(ts) {
    if (document.hidden) {
      lastT = null;
      raf = requestAnimationFrame(loop);
      return;
    }

    if (lastT === null) lastT = ts;
    const rawDt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;
    const isFrozen = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('freeze');
    if (!isFrozen) clock += rawDt;

    const t = clock;

    // Clear full screen
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Morning sunrise ascends behind truck
    sunOpacity = smoothstep(PHASE_TRUCK_START, PHASE_TRUCK_END, t);
    drawSun(sunOpacity);

    // Headlight beam
    const headlightAlpha = smoothstep(PHASE_TRUCK_START + 0.6, PHASE_TRUCK_END, t);
    drawHeadlight(headlightAlpha);

    // 7D Cinema screen glow
    const screenAlpha = smoothstep(PHASE_TRUCK_START + 0.3, PHASE_TRUCK_END, t);
    drawScreenGlow(screenAlpha);

    // Road surface
    const roadAlpha = smoothstep(PHASE_TRUCK_START + 0.4, PHASE_TRUCK_END, t);
    drawRoad(roadAlpha);

    // Phase transitions
    tickPhase(t);

    // Update + draw particles
    updateParticles(rawDt, t);

    // Pattachitra border
    drawBorder();

    raf = requestAnimationFrame(loop);
  }

  const onPointerMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  };
  const onPointerLeave = () => { mx = -9999; my = -9999; };

  function start() {
    resize();
    const urlT = typeof window !== 'undefined'
      ? parseFloat(new URLSearchParams(window.location.search).get('t') || '0')
      : 0;
    clock = Number.isFinite(urlT) && urlT > 0 ? urlT : 0;
    lastT = null;

    if (clock >= PHASE_TRUCK_START) {
      lastPhase = 'truck';
      const pts = getTruckPts();
      if (pts.length) assignTargets(pts, 'truck');
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
      if (clock >= PHASE_HERO_FADE) completeIntro();
    } else if (clock >= PHASE_TAGLINE_START) {
      lastPhase = 'tagline';
      const pts = getTaglinePts();
      if (pts.length) assignTargets(pts, 'tagline');
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
    } else if (clock >= PHASE_GREET_START) {
      lastPhase = 'greet';
      const pts = getGreetPts();
      if (pts.length) assignTargets(pts, 'greet');
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
    }

    document.fonts?.ready?.then(() => {
      greetPts = null;
      taglinePts = null;
      if (lastPhase === 'greet') {
        const pts = getGreetPts();
        assignTargets(pts, 'greet');
        if (urlT > 0) { for (const p of particles) { p.x = p.tx; p.y = p.ty; } }
      } else if (lastPhase === 'tagline') {
        const pts = getTaglinePts();
        assignTargets(pts, 'tagline');
        if (urlT > 0) { for (const p of particles) { p.x = p.tx; p.y = p.ty; } }
      }
    });
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    raf = requestAnimationFrame(loop);
  }

  function skip() {
    skipIntro = true;
    clock = PHASE_HERO_FADE + 0.1;
    const pts = getTruckPts();
    if (pts.length) assignTargets(pts, 'truck');
    completeIntro();
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
  }

  return { start, stop, resize, skip };
}
