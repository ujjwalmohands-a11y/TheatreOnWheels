import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './pass.css';
import HeroLight from './hero/HeroLight';
import PrebookModal from './components/PrebookModal';
import NavBar from './components/NavBar';
import PlacesOfLaunch from './components/PlacesOfLaunch';
import PrebookPass from './components/PrebookPass';
import AboutPage from './components/AboutPage';
import RecognitionBadges from './components/RecognitionBadges';
import CustomCursor from './components/CustomCursor';


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

/* ── Sidebar navigation dots ─────────────────────────────────── */
const SECTIONS = [
  { id: 'hero', label: 'Arrival' },
  { id: 'places-of-launch', label: 'Places of Launch' },
  { id: 'reserve', label: 'Reserve Pass' },
];

function SideNav() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { threshold: 0.4 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <nav className="side-nav" aria-label="Section navigation">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          className={`side-nav__dot${active === s.id ? ' is-active' : ''}`}
          data-label={s.label}
          aria-label={`Go to ${s.label}`}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
        />
      ))}
    </nav>
  );
}

/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  const [prebook, setPrebook] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#about') {
        window.location.href = '/about.html';
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

  const handleSelectCityForPass = useCallback((cityName) => {
    setSelectedCity(cityName);
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

      {/* Sidebar nav dots (home only) */}
      {currentPage === 'home' && <SideNav />}

      <NavBar currentPage={currentPage} onNavigate={handleNavigate} lang={lang} onLangChange={setLang} />

      {currentPage === 'about' ? (
        <AboutPage
          onNavigateHome={() => handleNavigate('home', 'hero')}
          onNavigateToReserve={() => handleNavigate('home', 'reserve')}
        />
      ) : (
        <>
          {/* 1. Hero / Shows */}
          <div id="hero">
            <span id="shows" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />
            <HeroLight lang={lang} onLangChange={setLang} />
          </div>

          <main>
            {/* 2. Places of Launch Section — Route Map & Demand Ballot */}
            <div id="route">
              <Reveal>
                <PlacesOfLaunch onSelectCityForPass={handleSelectCityForPass} />
              </Reveal>
            </div>

            {/* 3. Reserve — form ON the ticket */}
            <section id="reserve" className="section ticket-section">
              <div className="container">
                <Reveal>
                  <span className="eyebrow">Early Access</span>
                  <h2 style={{ marginBottom: '12px' }}>Reserve your journey pass.</h2>
                  <p style={{ maxWidth: '44ch', marginBottom: '48px' }}>
                    No payment now. Fill in the fields below — your name appears on the ticket live as you type.
                    Tear the stub to confirm.
                  </p>
                </Reveal>

                <Reveal delay={1}>
                  <PrebookPass
                    initialCity={selectedCity}
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

      {/* Recognition Badges */}
      <RecognitionBadges />

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">TheatreOnWheels</div>
              <p style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.7' }}>
                A travelling immersive theatre. One truck, many worlds.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Navigation</div>
              <ul className="footer-links">
                <li>
                  <a
                    href="#hero"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('home', 'hero');
                    }}
                  >
                    Arrival
                  </a>
                </li>
                <li>
                  <a
                    href="#places-of-launch"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('home', 'places-of-launch');
                    }}
                  >
                    Places of Launch
                  </a>
                </li>
                <li>
                  <a
                    href="#reserve"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('home', 'reserve');
                    }}
                  >
                    Reserve Pass
                  </a>
                </li>
                <li>
                  <a
                    href="/about.html"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('about');
                    }}
                  >
                    About The Theatre
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Connect</div>
              <ul className="footer-links">
                <li><a href="#">Instagram</a></li>
                <li><a href="#">WhatsApp</a></li>
                <li><a href="#">YouTube</a></li>
                <li><a href="#">Host Us</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Trust</div>
              <ul className="footer-links">
                <li><a href="#">IIT Bhubaneswar</a></li>
                <li><a href="#">Startup India</a></li>
                <li><a href="#">Startup Odisha</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal">
              <span className="footer-trademark">
                TheatreOnWheels is a trademark of Gaudya Darshan Solutions Private Limited.
              </span>
              <span className="footer-copy">© 2026 Gaudya Darshan. All rights reserved.</span>
            </div>
            <div className="footer-links" style={{ flexDirection: 'row', gap: '24px' }}>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>

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
