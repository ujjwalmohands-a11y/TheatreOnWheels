import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import './pass.css';
import Hero from './hero/Hero';
import PrebookModal from './components/PrebookModal';
import NavBar from './components/NavBar';
import PlacesOfLaunch from './components/PlacesOfLaunch';
import PrebookPass from './components/PrebookPass';
import AboutPage from './components/AboutPage';
import CustomCursor from './components/CustomCursor';
import ExperienceSection from './components/ExperienceSection';
import Footer from './components/Footer';


/* ── Intersection-observer reveal ─────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Section wrapper with reveal ─────────────────────────────── */
function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-block${visible ? ' is-visible' : ''}${delay ? ` delay-${delay}` : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Worlds data ─────────────────────────────────────────────── */
const WORLDS = [
  {
    id: 'space',
    title: 'Space Odyssey',
    tagline: 'Zero gravity. Infinite wonder.',
    img: '/images/world-space.jpg',
    desc: 'Float through nebulae, witness a supernova, land on alien worlds without leaving your seat.',
  },
  {
    id: 'ocean',
    title: 'Deep Ocean',
    tagline: 'Pressure. Darkness. Life.',
    img: '/images/world-ocean.jpg',
    desc: 'Descend into bioluminescent depths alongside creatures no human eye has ever seen.',
  },
  {
    id: 'history',
    title: 'Ancient India',
    tagline: 'Where time stands still.',
    img: '/images/world-history.jpg',
    desc: 'Walk through golden temples, witness epic processions and feel the pulse of a civilisation.',
  },
  {
    id: 'micro',
    title: 'The Inner Universe',
    tagline: 'Smaller than a thought.',
    img: '/images/world-micro.jpg',
    desc: 'Shrink to the scale of neurons, ride a heartbeat, witness the code of life unfold.',
  },
];


/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  const [prebook, setPrebook] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('B4');
  const [currentPage, setCurrentPage] = useState('home');
  const [lang, setLang] = useState('en');


  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#about') {
        window.location.href = '/about.html';
        return;
      }
      if (hash === '#achievements') {
        window.location.href = '/achievements.html';
        return;
      }
      if (hash === '#experience') {
        setCurrentPage('home');
        setTimeout(() => {
          document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return;
      }
      if (hash === '#step-inside') {
        window.location.href = '/step-inside.html';
        return;
      }
      setCurrentPage('home');
      const targetId = hash.replace('#', '');
      if (targetId && targetId !== 'hero') {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = useCallback((page, sectionId) => {
    if (page === 'about') {
      window.location.href = '/about.html';
      return;
    } else if (page === 'achievements') {
      window.location.href = '/achievements.html';
      return;
    } else if (page === 'experience') {
      setCurrentPage('home');
      window.location.hash = 'experience';
      setTimeout(() => {
        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    } else if (page === 'step-inside') {
      window.location.href = '/step-inside.html';
      return;
    } else {
      setCurrentPage('home');
      if (sectionId) {
        window.location.hash = sectionId;
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        window.location.hash = 'hero';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  const handleConfirmed = (details) => {
    try {
      const all = JSON.parse(localStorage.getItem('tow_prebookings') || '[]');
      all.push({ ...details, at: new Date().toISOString() });
      localStorage.setItem('tow_prebookings', JSON.stringify(all));
    } catch { /* storage unavailable */ }
  };

  return (
    <>
      {/* Custom cursor trail (canvas) — .cur files applied via CSS */}
      <CustomCursor />

      <NavBar currentPage={currentPage} onNavigate={handleNavigate} lang={lang} onLangChange={setLang} />

      {currentPage === 'about' ? (
        <AboutPage
          onNavigateHome={() => handleNavigate('home', 'hero')}
          onNavigateToReserve={() => handleNavigate('home', 'reserve')}
        />
      ) : (
        <>
          {/* 1. The landing page hero section */}
          <div id="hero">
            <span id="shows" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />
            <Hero lang={lang} onLangChange={setLang} />
          </div>

          <main>
            {/* 2. The route or the India map section */}
            <div id="route">
              <span id="places-of-launch" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />
              <Reveal>
                <PlacesOfLaunch />
              </Reveal>
            </div>

            {/* 3. The experience section */}
            <div id="experience">
              <Reveal>
                <ExperienceSection />
              </Reveal>
            </div>

            {/* 4. Reserve — Reserve a Ticket */}
            <section id="reserve" className="section ticket-section">
              <div className="container">
                <Reveal>
                  <span className="eyebrow">Early Access Pass</span>
                  <h2 style={{ marginBottom: '12px' }}>Reserve a Ticket.</h2>
                  <p style={{ maxWidth: '48ch', marginBottom: '48px' }}>
                    No payment now. Fill in the fields below — your name appears on the ticket live as you type.
                    {selectedSeat ? ` Seat ${selectedSeat} pre-allocated.` : ''} Tear the stub to confirm your place.
                  </p>
                </Reveal>

                <Reveal delay={1}>
                  <PrebookPass
                    initialCity=""
                    selectedWorld={WORLDS.find((w) => w.id === selectedWorld)?.title || ''}
                    worlds={WORLDS}
                    onWorldChange={(worldTitle) => {
                      const match = WORLDS.find((w) => w.title === worldTitle);
                      if (match) setSelectedWorld(match.id);
                      else setSelectedWorld('');
                    }}
                    onPrebooked={handleConfirmed}
                  />
                </Reveal>
              </div>
            </section>
          </main>
        </>
      )}

      {/* Theater on Wheels Footer */}
      <Footer onNavigate={handleNavigate} />


      {/* Ticket confirmation modal */}
      <AnimatePresence>
        {prebook && (
          <PrebookModal
            key="prebook"
            {...prebook}
            onConfirmed={handleConfirmed}
            onClose={() => setPrebook(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
