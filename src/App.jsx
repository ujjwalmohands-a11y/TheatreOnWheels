import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './pass.css';
import Hero from './hero/Hero';
import PrebookModal from './components/PrebookModal';
import NavBar from './components/NavBar';

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

/* ── Loading screen ──────────────────────────────────────────── */
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="loading-screen" id="loading-screen">
      <div className="loading-wordmark">Gaudiya Darshan</div>
      <div className="loading-bar" />
    </div>
  );
}

/* ── Sidebar navigation dots ─────────────────────────────────── */
const SECTIONS = [
  { id: 'hero', label: 'Arrival' },
  { id: 'canvas', label: 'Canvas' },
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
  const [loading, setLoading] = useState(true);
  const [loadDone, setLoadDone] = useState(false);
  const [prebook, setPrebook] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('space');

  // Live ticket state
  const [liveForm, setLiveForm] = useState({ name: '', city: '', phone: '', email: '' });

  const handleLoadDone = useCallback(() => {
    const el = document.getElementById('loading-screen');
    if (el) el.classList.add('is-done');
    setTimeout(() => setLoadDone(true), 650);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPrebook({
      name: liveForm.name.trim() || 'Guest',
      city: liveForm.city.trim(),
      world: WORLDS.find(w => w.id === selectedWorld)?.title || selectedWorld,
    });
  };

  const handleConfirmed = (details) => {
    try {
      const all = JSON.parse(localStorage.getItem('tow_prebookings') || '[]');
      all.push({ ...details, at: new Date().toISOString() });
      localStorage.setItem('tow_prebookings', JSON.stringify(all));
    } catch { /* storage unavailable */ }
  };

  return (
    <>
      {/* Loading */}
      <LoadingScreen onDone={handleLoadDone} />

      {/* Sidebar nav dots */}
      <SideNav />

      <NavBar />

      {/* 1. Hero */}
      <div id="hero">
        <Hero />
      </div>

      <main>
        {/* Blank Canvas Section — Ready for new sections and concepts */}
        <section id="canvas" className="section canvas-section">
          <div className="container">
            <Reveal>
              <div className="blank-canvas-container">
                <span className="blank-canvas-tag">✦ Blank Canvas</span>
                <h3 className="blank-canvas-heading">Clean Slate</h3>
                <p className="blank-canvas-desc">
                  Previous sections cleared. Ready to craft fresh designs, stories, and experiences from scratch.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. Reserve — form ON the ticket */}
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
              <form className="live-ticket" onSubmit={handleSubmit} id="reserve-form" noValidate>
                {/* Physical Ticket Cutout Notches */}
                <span className="ticket-notch notch-tl" aria-hidden="true" />
                <span className="ticket-notch notch-tr" aria-hidden="true" />
                <span className="ticket-notch notch-bl" aria-hidden="true" />
                <span className="ticket-notch notch-br" aria-hidden="true" />
                <span className="ticket-notch notch-perf-top" aria-hidden="true" />
                <span className="ticket-notch notch-perf-bottom" aria-hidden="true" />

                <div className="ticket-perf">
                  {/* Main Ticket Body */}
                  <div className="ticket-main">
                    {/* Top Presenter & Event Header matching ticket component */}
                    <div className="ticket-header-strip">
                      <span className="ticket-presenter">Theatre on Wheels</span>
                      <span className="ticket-event-tag">
                        {WORLDS.find(w => w.id === selectedWorld)?.title || 'Space Odyssey'}
                      </span>
                    </div>

                    {/* Live Attendee Hero display matching Image 2's bold GUEST banner */}
                    <div className="ticket-name-hero">
                      <span className="ticket-name-hero__label">Ticket Holder</span>
                      <div className={`ticket-name-hero__value${!liveForm.name ? ' is-guest' : ''}`}>
                        {liveForm.name ? liveForm.name.toUpperCase() : 'GUEST'}
                      </div>
                    </div>

                    {/* Sub-meta strip matching Image 2 */}
                    <div className="ticket-sub-meta">
                      <span>{(liveForm.city || 'Your City').toUpperCase()}</span>
                      <span className="meta-dot">·</span>
                      <span>PRE-BOOKING 2026</span>
                    </div>

                    {/* Input fields living inside the ticket */}
                    <div className="ticket-fields">
                      <div className="ticket-field">
                        <label htmlFor="tf-name">Your Name</label>
                        <input
                          id="tf-name"
                          type="text"
                          name="name"
                          placeholder="e.g. Maya Roy"
                          required
                          value={liveForm.name}
                          onChange={e => setLiveForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="ticket-field">
                        <label htmlFor="tf-city">Your City</label>
                        <input
                          id="tf-city"
                          type="text"
                          name="city"
                          placeholder="Where are you?"
                          required
                          value={liveForm.city}
                          onChange={e => setLiveForm(f => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <div className="ticket-field">
                        <label htmlFor="tf-world">Destination</label>
                        <select
                          id="tf-world"
                          name="world"
                          value={selectedWorld}
                          onChange={e => setSelectedWorld(e.target.value)}
                        >
                          {WORLDS.map(w => (
                            <option key={w.id} value={w.id}>
                              {w.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ticket-field">
                        <label htmlFor="tf-phone">WhatsApp</label>
                        <input
                          id="tf-phone"
                          type="tel"
                          name="phone"
                          placeholder="+91 00000 00000"
                          value={liveForm.phone}
                          onChange={e => setLiveForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div className="ticket-field full">
                        <label htmlFor="tf-email">Email</label>
                        <input
                          id="tf-email"
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={liveForm.email}
                          onChange={e => setLiveForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="ticket-cta">
                      <button type="submit" className="btn-ticket-submit" id="submit-ticket">
                        Request Pass →
                      </button>
                      <span className="ticket-note">
                        No payment now. Private invitation when the travelling theatre arrives.
                      </span>
                    </div>
                  </div>

                  {/* Tear-off stub matching Image 2 */}
                  <div className="ticket-stub">
                    <span className="stub-watermark" aria-hidden="true">26</span>
                    <span className="stub-admit-text">ADMIT ONE</span>
                    <div className="stub-footer">
                      <span className="stub-serial">#TOW-2026</span>
                    </div>
                  </div>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
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
                <li><a href="#hero">Arrival</a></li>
                <li><a href="#canvas">Canvas</a></li>
                <li><a href="#reserve">Reserve Pass</a></li>
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
