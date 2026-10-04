import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './index.css';
import './pass.css';
import Hero from './hero/Hero';
import PrebookModal from './components/PrebookModal';

import NavBar from './components/NavBar';

// Reusable component to handle the scroll-in animation for each content box
const AnimatedSection = ({ children, id, variant }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <section id={id} className={`scaffold-section${variant ? ` ${variant}-section` : ''}`}>
      <motion.div
        ref={ref}
        className={`content-box container${variant ? ` ${variant}-box` : ''}`}
        initial="hidden"
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
          hidden: { opacity: 0, y: 40 }
        }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default function App() {
  const [prebook, setPrebook] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPrebook({
      name: (f.get('name') || '').toString().trim() || 'Guest',
      city: (f.get('city') || '').toString().trim(),
      world: (f.get('world') || '').toString(),
    });
  };

  const handleConfirmed = (details) => {
    // Pre-booking is only confirmed once the ticket is ripped.
    try {
      const all = JSON.parse(localStorage.getItem('tow_prebookings') || '[]');
      all.push({ ...details, at: new Date().toISOString() });
      localStorage.setItem('tow_prebookings', JSON.stringify(all));
    } catch { /* storage unavailable */ }
  };

  return (
    <>
      <div className="blueprint-overlay"></div>
      
      <NavBar />

      {/* 1. Hero — "Arrival" */}
      <Hero />

      <main>

        {/* 2. What Is It? */}
        <AnimatedSection id="what-is-it">
          <span className="section-label">SEC_02 // WHAT_IS</span>
          <div className="status-badge"><span className="dot"></span> Vision Draft</div>
          <h2>The Travelling Theatre</h2>
          <ul className="blueprint-list">
            <li>An immersive theatre inside a truck</li>
            <li>One door. Many worlds.</li>
            <li>Premium cinematic experience</li>
            <li>Bringing the story to your city</li>
          </ul>
        </AnimatedSection>

        {/* 3. The Worlds */}
        <AnimatedSection id="worlds">
          <span className="section-label">SEC_03 // THE_WORLDS</span>
          <div className="status-badge"><span className="dot"></span> Concept Art Phase</div>
          <h2>Explore The Worlds</h2>
          <p>A shifting ambient bed and a new reality behind the door.</p>
          <div className="worlds-grid">
            {[
              { title: 'Space Exploration', img: '/images/space.jpg' },
              { title: 'Deep Ocean Expedition', img: '/images/ocean.jpg' },
              { title: 'Inside the Human Body', img: '/images/space.jpg' },
              { title: 'Time Travel Through History', img: '/images/ocean.jpg' },
              { title: 'Journey to the Earth\'s Core', img: '/images/space.jpg' },
              { title: 'Microscopic Universe', img: '/images/ocean.jpg' },
              { title: 'Zero Gravity Adventure', img: '/images/space.jpg' },
              { title: 'Climate Simulator', img: '/images/ocean.jpg' }
            ].map((world, i) => (
              <div key={i} className="world-tile">
                <div className="world-art" style={{ backgroundImage: `url(${world.img})` }}></div>
                <div className="world-label-bar">{world.title}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* 4. The Experience */}
        <AnimatedSection id="experience">
          <span className="section-label">SEC_04 // EXPERIENCE</span>
          <div className="status-badge"><span className="dot"></span> Core Loop</div>
          <h2>The Experience</h2>
          <div className="journey-map">
            <span>Arrive</span> &rarr; <span>Enter</span> &rarr; <span>Sit</span> &rarr; <span className="highlight-beat">Begin (World Reveals)</span> &rarr; <span>Step out</span>
          </div>
        </AnimatedSection>

        {/* 5. The Truck */}
        <AnimatedSection id="truck">
          <span className="section-label">SEC_05 // TRUCK</span>
          <div className="status-badge"><span className="dot"></span> Engineering In Progress</div>
          <h2>The Truck</h2>
          <div className="placeholder-image lg">
            [ Basic Truck Visual/Render Placeholder ]
          </div>
          <ul className="blueprint-list grid-list">
            <li>Exterior profile</li>
            <li>Interior acoustic treatment</li>
            <li>16-seat premium arrangement</li>
            <li>Projection mapping setup</li>
          </ul>
        </AnimatedSection>

        {/* 8. Coming Soon / Stay Updated */}
        <AnimatedSection id="coming-soon" variant="pass">
          <div className="pass-head">
            <span className="pass-eyebrow"><i></i> Early access</span>
            <h2>Reserve your journey pass</h2>
            <p>Be among the first to step through the door when the theatre arrives.</p>
          </div>
          <form className="pass-form" onSubmit={handleSubmit}>
            <label className="pass-field">
              <span>Name</span>
              <div className="pass-control">
                <svg className="pass-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <input name="name" type="text" placeholder="Your name" required />
              </div>
            </label>
            <label className="pass-field">
              <span>City</span>
              <div className="pass-control">
                <svg className="pass-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
                <input name="city" type="text" placeholder="Your city" required />
              </div>
            </label>
            <label className="pass-field">
              <span>WhatsApp</span>
              <div className="pass-control">
                <svg className="pass-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>
                <input name="phone" type="tel" placeholder="+91 00000 00000" />
              </div>
            </label>
            <label className="pass-field">
              <span>Email</span>
              <div className="pass-control">
                <svg className="pass-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                <input name="email" type="email" placeholder="you@example.com" />
              </div>
            </label>
            <label className="pass-field wide">
              <span>Preferred world</span>
              <div className="pass-control">
                <svg className="pass-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>
                <select name="world" defaultValue="Space Exploration">
                  <option>Space Exploration</option>
                  <option>Deep Ocean Expedition</option>
                  <option>Time Travel</option>
                  <option>Surprise Me</option>
                </select>
              </div>
            </label>
            <button type="submit" className="pass-submit">Request pass <b>→</b></button>
            <p className="pass-note">No payment now. We'll only message you when the doors open.</p>
          </form>
        </AnimatedSection>

        {/* 9. Share / Follow */}
        <AnimatedSection id="social">
          <span className="section-label">SEC_09 // SOCIAL</span>
          <div className="status-badge"><span className="dot"></span> Live</div>
          <h2>Share / Follow</h2>
          <p>Follow the journey.</p>
          <div className="social-links">
            <a href="#" className="btn-outline">Instagram</a>
            <a href="#" className="btn-outline">WhatsApp</a>
          </div>
        </AnimatedSection>
      </main>

      {/* 10. Footer */}
      <footer id="footer" className="scaffold-section footer">
        <div className="content-box">
          <div className="footer-links">
            <a href="#">Gaudiya Darshan</a>
            <a href="#">Contact</a>
            <a href="#">Instagram</a>
            <a href="#">Host Us</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>

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
