import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Scene from './Scene';
import { COPY, LANG_FONTS, LANG_LABEL, SCENE_TIMES as S, detectTier, makeLayout } from './config';
import { toScene, truckGeom, makeLamps } from './geometry';
import { createParticles } from './particles';
import { createSound } from './sound';
import './hero.css';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const isPortrait = () => window.innerWidth < 720 || window.innerWidth / window.innerHeight < 0.85;

const SCROLL_INTRO = 0.26; // first 26% of the pinned scroll scrubs the intro (0 → 11s)
const SCROLL_HAND = 0.3;   // handoff to section 02 starts here

const BIT = { wm: 1, l1: 2, l2: 4, sub: 8, cue: 16, clar: 32 };

function loadLangFont(lang) {
  const href = LANG_FONTS[lang];
  if (!href || document.querySelector(`link[data-hero-font="${lang}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href; l.dataset.heroFont = lang;
  document.head.appendChild(l);
}

export default function Hero() {
  const [tier] = useState(detectTier);
  const live = tier === 'full';
  const [portrait, setPortrait] = useState(isPortrait);
  const [lang, setLang] = useState('en');
  const [soundOn, setSoundOn] = useState(false);
  const [mask, setMask] = useState(0);
  const [nudge, setNudge] = useState(false);

  const L = useMemo(() => makeLayout(portrait, tier), [portrait, tier]);
  const reg = useRef({}).current;
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const els = useRef({});
  const soundRef = useRef(null);
  const soundOnRef = useRef(false);
  const copy = COPY[lang];

  // ---------- language ----------
  useEffect(() => {
    loadLangFont(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // ---------- layout switch (portrait / landscape) ----------
  useEffect(() => {
    let id;
    const on = () => { clearTimeout(id); id = setTimeout(() => setPortrait(isPortrait()), 150); };
    window.addEventListener('resize', on);
    return () => { clearTimeout(id); window.removeEventListener('resize', on); };
  }, []);

  // ---------- sound ----------
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  const toggleSound = useCallback(() => {
    if (!soundRef.current) soundRef.current = createSound();
    const snd = soundRef.current;
    if (snd.on) { snd.stop(); setSoundOn(false); }
    else if (snd.start()) setSoundOn(true);
  }, []);
  useEffect(() => {
    const vis = () => { if (document.hidden && soundRef.current?.on) { soundRef.current.stop(); setSoundOn(false); } };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); soundRef.current?.stop(); };
  }, []);

  // ---------- the engine ----------
  useEffect(() => {
    const G = truckGeom(L);
    const lamps = makeLamps(L);
    const root = rootRef.current;
    const e = els.current;

    // screen-centre & zoom needed to fill the frame at the stop point
    const sc = toScene(L, L.sF, G.screenCentre);
    const q0 = toScene(L, L.sF, G.screen[0]);
    const q2 = toScene(L, L.sF, G.screen[2]);
    const scrW = Math.abs(q2.x - q0.x) || 60;
    const scrH = Math.abs(q2.y - q0.y) || 120;
    const SMAX = Math.max(L.W / scrW, L.H / scrH) * 1.25;

    const flags = { bell: false, flute: false };
    let lastLamp = -1;
    let lastMask = -1;

    const render = (T, h, dt) => {
      // lamps ignite one after another
      const lk = Math.round(Math.min(T, 3) * 50);
      if (lk !== lastLamp) {
        lastLamp = lk;
        for (const l of lamps) {
          const el = reg.lamps[l.id];
          if (el) el.style.opacity = clamp((T - l.t0) / 0.7).toFixed(3);
        }
      }

      // truck approach: eases out so it visibly slows into the stop
      const p = clamp((T - 1.8) / (S.stop - 1.8));
      const ease = 1 - Math.pow(1 - p, 2.3);
      const s = 0.035 + (L.sF - 0.035) * ease;
      const gx = L.vx + L.off * s;
      const gy = L.vy + (L.H - L.vy) * s;

      const hl = clamp((T - S.headlightsOn) / 1.2) * (1 - clamp(h * 3));
      if (reg.truck) {
        const truckTx = `translate(${gx.toFixed(2)} ${gy.toFixed(2)}) scale(${(s * L.q).toFixed(4)})`;
        if (reg._truckTx !== truckTx) { reg.truck.setAttribute('transform', truckTx); reg._truckTx = truckTx; }

        const truckOp = clamp((T - 2.0) / 0.8).toFixed(3);
        if (reg._truckOp !== truckOp) { reg.truck.style.opacity = truckOp; reg._truckOp = truckOp; }

        const poolOp = (hl * clamp((T - 3) / 2)).toFixed(3);
        if (reg._poolOp !== poolOp) { reg.pool.style.opacity = poolOp; reg._poolOp = poolOp; }

        const detOp = smooth(3.8, 7, T).toFixed(3);
        if (reg._detOp !== detOp) { reg.detail.style.opacity = detOp; reg._detOp = detOp; }

        // LED: ignites, flickers once, goes quiet
        let b = smooth(S.ledOn, S.ledOn + 0.7, T) * 0.8;
        const fl = T - S.flicker;
        if (fl > 0 && fl < 0.35) b *= 0.18 + 0.82 * Math.abs(Math.cos(fl * 22));
        if (T > S.flicker + 0.4) b *= 0.94 + 0.06 * Math.sin(T * 1.3);
        b = b + (1 - b) * smooth(0.05, 0.6, h);
        const ledOp = b.toFixed(3);
        if (reg._ledOp !== ledOp) { reg.led.style.opacity = ledOp; reg._ledOp = ledOp; }
      }
      if (reg.halos) {
        const q = L.q * s;
        const r = 7 + 150 * q;
        const d = 140 * q;
        const hy = gy - 132 * q;

        const hlOp = hl.toFixed(3);
        if (reg._halosOp !== hlOp) { reg.halos.style.opacity = hlOp; reg._halosOp = hlOp; }

        if (reg._hy !== hy || reg._gx !== gx || reg._r !== r) {
          reg.hl0.setAttribute('cx', gx - d); reg.hl0.setAttribute('cy', hy); reg.hl0.setAttribute('r', r);
          reg.hl1.setAttribute('cx', gx + d); reg.hl1.setAttribute('cy', hy); reg.hl1.setAttribute('r', r);
          reg.streak.setAttribute('cx', gx); reg.streak.setAttribute('cy', hy);
          reg.streak.setAttribute('rx', 20 + 360 * q);
          reg._hy = hy; reg._gx = gx; reg._r = r;
        }
      }

      // handoff: dive into the LED screen
      const he = h * h * (3 - 2 * h);
      
      // Removed camera zoom to prevent scroll lag
      /*
      if (reg.camera) {
        const Sz = Math.exp(Math.log(SMAX) * he);
        const tx = sc.x * (1 - Sz) + (L.W / 2 - sc.x) * he;
        const ty = sc.y * (1 - Sz) + (L.H / 2 - sc.y) * he;
        const camTx = `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${Sz.toFixed(4)})`;
        if (reg._camTx !== camTx) { reg.camera.setAttribute('transform', camTx); reg._camTx = camTx; }
      }
      */
      
      const floodOp = smooth(0.7, 0.98, he).toFixed(3);
      if (e.flood && reg._floodOp !== floodOp) { e.flood.style.opacity = floodOp; reg._floodOp = floodOp; }
      
      const fadeOp = (1 - clamp(h * 2.2)).toFixed(3);
      if (e.fade && reg._fadeOp !== fadeOp) { e.fade.style.opacity = fadeOp; reg._fadeOp = fadeOp; }
      
      const copyTx = `translate3d(0,${(-h * 60).toFixed(1)}px,0)`;
      if (e.copy && reg._copyTx !== copyTx) { e.copy.style.transform = copyTx; reg._copyTx = copyTx; }
      
      const trustOp = (smooth(0.85, 1, h) * 0.7).toFixed(3);
      if (e.trustM && reg._trustOp !== trustOp) { e.trustM.style.opacity = trustOp; reg._trustOp = trustOp; }
      
      const seamOp = smooth(0.35, 0.6, h).toFixed(3);
      if (e.seam && reg._seamOp !== seamOp) { e.seam.style.opacity = seamOp; reg._seamOp = seamOp; }
      
      const canvasOp = (1 - clamp(h * 2.5)).toFixed(3);
      if (e.canvas && reg._canvasOp !== canvasOp) { e.canvas.style.opacity = canvasOp; reg._canvasOp = canvasOp; }
      
      if (live && soundOnRef.current) soundRef.current?.level(1 - clamp(h * 1.6));

      // staged text
      let m = 0;
      if (T >= S.wordmark) m |= BIT.wm;
      if (T >= S.line1) m |= BIT.l1;
      if (T >= S.line2) m |= BIT.l2;
      if (T >= S.sub) m |= BIT.sub;
      if (T >= S.cue) m |= BIT.cue;
      if (T >= S.clarity) m |= BIT.clar;
      if (m !== lastMask) { lastMask = m; setMask(m); }

      // sound cues
      if (soundOnRef.current) {
        if (T >= S.flicker && !flags.bell) { flags.bell = true; soundRef.current.bell(); }
        if (T >= S.stop && !flags.flute) { flags.flute = true; soundRef.current.flute(); }
      }
      if (dt === 0) return;
    };

    // ---- static tiers: poster at the stop point, CSS does the rest ----
    if (!live) {
      render(S.clockEnd, 0, 0);
      const id = requestAnimationFrame(() => setMask(63));
      lastMask = 63;
      return () => cancelAnimationFrame(id);
    }

    // ---- live tier ----
    const particles = canvasRef.current ? createParticles(canvasRef.current, L) : null;
    const onResize = () => particles?.resize();
    window.addEventListener('resize', onResize);

    let clock = 0, T = 0, hS = 0, last = performance.now(), raf, nudgeT = 0, nudged = false;
    const scrollProgress = () => {
      const range = root.offsetHeight - window.innerHeight;
      return range > 0 ? clamp(window.scrollY / range) : 0;
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const sp = scrollProgress();
      clock = Math.min(S.clockEnd, clock + dt * 2.5); // 2.5x speed for non-scrolling intro
      const target = clock;
      T += (target - T) * Math.min(1, dt * 7);
      if (Math.abs(target - T) < 0.002) T = target;
      const hT = 0; // No scroll zoom or fade
      hS = 0;

      // gentle nudge if they pause at the stop point
      if (clock >= S.clockEnd && sp < 0.02) {
        nudgeT += dt;
        if (nudgeT > 2.5 && !nudged) { nudged = true; setNudge(true); }
      } else if (sp >= 0.02 && nudged) { nudged = false; nudgeT = 0; setNudge(false); }

      const offscreen = hS >= 0.995 || document.hidden || (window.scrollY > window.innerHeight * 1.2);
      if (!offscreen) { render(T, hS, dt); particles?.draw(dt, T, 1 - clamp(hS * 2.5)); }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [L, live, reg]);

  const goReserve = (ev) => {
    ev.preventDefault();
    document.getElementById('coming-soon')?.scrollIntoView({ behavior: 'smooth' });
  };
  const on = (bit) => ((mask & bit) ? 'is-on' : '');

  return (
    <section
      ref={rootRef}
      className={`hero tier-${tier} ${portrait ? 'is-portrait' : ''}`}
      data-lang={lang}
      aria-label="TheatreOnWheels"
    >
      <div className="hero__stage">
        <div className="hero__scene"><Scene L={L} reg={reg} /></div>
        {live && <canvas ref={(c) => { canvasRef.current = c; els.current.canvas = c; }} className="hero__canvas" aria-hidden="true" />}
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />
        <div className="hero__grain" aria-hidden="true" />
        <div ref={(x) => (els.current.flood = x)} className="hero__flood" aria-hidden="true" />

        <div ref={(x) => (els.current.fade = x)} className="hero__ui">
          <div ref={(x) => (els.current.copy = x)} className="hero__copy">
            <h1 className="hero__h1" aria-label={copy.h1}>
              <span className={`hero__line reveal ${on(BIT.l1)}`} aria-hidden="true">{copy.lines[0]}</span>
              <span className={`hero__line reveal ${on(BIT.l2)}`} aria-hidden="true">{copy.lines[1]}</span>
            </h1>
            <p className={`hero__sub reveal ${on(BIT.sub)}`}>{copy.sub}</p>
            <p className={`hero__clarity reveal ${on(BIT.clar)}`}>{copy.clarity}</p>
          </div>

          <div className={`hero__cue ${on(BIT.cue)} ${nudge ? 'is-nudge' : ''}`} aria-hidden="true">
            <span className="hero__cue-line"><i /></span>
            <span className="hero__cue-label">{nudge ? copy.nudge : copy.scroll}</span>
          </div>

          <div className={`hero__trust reveal ${on(BIT.clar)}`}>
            {copy.trust.map((t) => <span key={t}>{t}</span>)}
          </div>

          <div className={`hero__tag-render reveal ${on(BIT.sub)}`}>{copy.render}</div>
        </div>

        <div className={`hero__trust hero__trust--m`} ref={(x) => (els.current.trustM = x)} aria-hidden="true">
          {copy.trust.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* the light seam begins here and follows the visitor down the page */}
      <div ref={(x) => (els.current.seam = x)} className="light-seam" aria-hidden="true" />
    </section>
  );
}
