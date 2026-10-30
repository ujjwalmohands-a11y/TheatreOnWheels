/**
 * TheatreOnWheels — Light-Theme Hero
 * ===================================
 * Architecture:
 *  • Canvas fills the right ~55% (desktop) / full width (portrait)
 *    and runs the particle intro engine.
 *  • Hero copy lives on the left, fades in after intro completes.
 *  • NavBar-integrated lang state is lifted into a context-like prop
 *    chain (Hero receives `lang`/`setLang` from App or manages its own).
 *
 * Tweaks live in:
 *  • src/hero/particleEngine.js  — particle counts, timings, colours
 *  • src/hero/hero-light.css     — visual design tokens
 *  • src/hero/config.js          — copy strings
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createParticleEngine } from './particleEngine';
import './hero-light.css';

// ── Multilingual copy ──────────────────────────────────────────────────────
// Single source of truth. Edit here for all languages.
const COPY = {
  en: {
    greeting:   'Hare Kṛṣṇa',
    h1_line1:   'Something is',
    h1_line2:   'on its way.',
    h1_aria:    'Something is on its way.',
    tagline:    'A theatre that travels, with worlds inside.',
    cta_primary:'Reserve a Seat',
    cta_secondary: 'See where we launch next',
    partners:   ['IIT Bhubaneswar', 'Startup India', 'Startup Odisha'],
    scroll:     'Scroll',
    skip:       'Skip intro',
  },
  hi: {
    greeting:   'हरे कृष्ण',
    h1_line1:   'कुछ',
    h1_line2:   'आ रहा है।',
    h1_aria:    'कुछ आ रहा है।',
    tagline:    'एक रंगमंच जो यात्रा करता है, जिसके भीतर कई दुनिया हैं।',
    cta_primary:'सीट आरक्षित करें',
    cta_secondary: 'देखें हम कहाँ लॉन्च करते हैं',
    partners:   ['आईआईटी भुवनेश्वर', 'स्टार्टअप इंडिया', 'स्टार्टअप ओडिशा'],
    scroll:     'स्क्रॉल',
    skip:       'इंट्रो छोड़ें',
  },
  or: {
    greeting:   'ହରେ କୃଷ୍ଣ',
    h1_line1:   'କିଛି',
    h1_line2:   'ଆସୁଛି।',
    h1_aria:    'କିଛି ଆସୁଛି।',
    tagline:    'ଏକ ରଙ୍ଗମଞ୍ଚ ଯାହା ଯାତ୍ରା କରେ, ଭିତରେ ଅନେକ ଦୁନିଆ।',
    cta_primary:'ଆସନ ଆରକ୍ଷଣ',
    cta_secondary: 'ଆମେ କେଉଁଠି ଆସୁଛୁ ଦେଖନ୍ତୁ',
    partners:   ['ଆଇଆଇଟି ଭୁବନେଶ୍ୱର', 'ଷ୍ଟାର୍ଟଅପ୍ ଇଣ୍ଡିଆ', 'ଷ୍ଟାର୍ଟଅପ୍ ଓଡ଼ିଶା'],
    scroll:     'ସ୍କ୍ରୋଲ୍',
    skip:       'ଇଣ୍ଟ୍ରୋ ଛାଡ଼ନ୍ତୁ',
  },
};

const isPortrait = () =>
  typeof window !== 'undefined' &&
  (window.innerWidth < 720 || window.innerWidth / window.innerHeight < 0.85);

export default function HeroLight({ lang = 'en', onLangChange }) {
  const canvasRef     = useRef(null);
  const engineRef     = useRef(null);
  const copyRef       = useRef(null);
  const [portrait, setPortrait]     = useState(isPortrait);
  const [introOk, setIntroOk]       = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const copy = COPY[lang] || COPY.en;

  // ── Responsive portrait detection ────────────────────────
  useEffect(() => {
    let id;
    const on = () => {
      clearTimeout(id);
      id = setTimeout(() => setPortrait(isPortrait()), 150);
    };
    window.addEventListener('resize', on);
    return () => { clearTimeout(id); window.removeEventListener('resize', on); };
  }, []);

  // ── Scroll indicator ─────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const locationSearch = typeof window !== 'undefined' ? window.location.search : '';

  // ── Particle engine lifecycle ─────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset intro visibility when engine restarts
    const initT = parseFloat(new URLSearchParams(window.location.search).get('t') || '0');
    setIntroOk(initT >= 10.2);

    // Destroy old engine on re-init (lang/portrait change)
    engineRef.current?.stop();

    const engine = createParticleEngine(canvas, {
      lang,
      portrait,
      onIntroComplete: () => setIntroOk(true),
      getGreeting: () => copy.greeting,
    });
    engineRef.current = engine;
    engine.start();

    // Resize on window resize
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // Pause when tab hidden
    const onVis = () => { /* engine loop already guards document.hidden */ };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      engine.stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [lang, portrait, locationSearch]); // Reinit when lang, layout, or search params change

  const goReserve = useCallback((e) => {
    e.preventDefault();
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const goLaunch = useCallback((e) => {
    e.preventDefault();
    document.getElementById('places-of-launch')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const skipIntro = useCallback(() => {
    sessionStorage.setItem('tow_intro_done', '1');
    setIntroOk(true);
    engineRef.current?.skip();
  }, []);

  // ── Language class for CJK/script adjustments ────────────
  const langClass = lang === 'hi' ? 'is-hi' : lang === 'or' ? 'is-or' : '';

  return (
    <section
      className={`hero-light ${portrait ? 'is-portrait' : ''} ${langClass}`}
      aria-label="TheatreOnWheels hero"
    >
      {/* Paper grain overlay */}
      <div className="hl__grain" aria-hidden="true" />

      {/* Full-bleed canvas (intro + living truck) */}
      <canvas
        ref={canvasRef}
        className="hl__canvas"
        aria-hidden="true"
      />

      {/* Skip intro link */}
      {!introOk && (
        <button
          className="hl__skip"
          onClick={skipIntro}
          type="button"
          aria-label={copy.skip}
        >
          {copy.skip} ↓
        </button>
      )}

      {/* Hero content — fades in after intro */}
      <div
        ref={copyRef}
        className={`hl__content ${introOk ? 'is-visible' : ''}`}
      >
        <div className="hl__copy">
          {/* Real semantic h1 always in DOM for SEO */}
          <h1 className="hl__h1" aria-label={copy.h1_aria}>
            <span className="hl__h1-line1">{copy.h1_line1}</span>
            {' '}
            <em className="hl__h1-line2">{copy.h1_line2}</em>
          </h1>

          <p className="hl__tagline">{copy.tagline}</p>

          <div className="hl__ctas">
            <a
              href="#reserve"
              id="hero-cta-reserve"
              className="hl__btn-primary"
              onClick={goReserve}
            >
              {copy.cta_primary}
            </a>

            <a
              href="#places-of-launch"
              id="hero-cta-launch"
              className="hl__btn-secondary"
              onClick={goLaunch}
            >
              {copy.cta_secondary}
              <span className="hl__arrow" aria-hidden="true">→</span>
            </a>
          </div>

          {/* Partners row */}
          <div className="hl__partners" aria-label="Supported by">
            {copy.partners.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`hl__scroll-cue ${scrolled ? 'is-hidden' : ''}`} aria-hidden="true">
          <span className="hl__scroll-line"><i /></span>
          <span className="hl__scroll-label">{copy.scroll}</span>
        </div>
      </div>
    </section>
  );
}
