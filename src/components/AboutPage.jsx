import React, { useEffect, useState, useRef } from 'react';
import './AboutPage.css';
import {
  Volume2,
  Eye,
  Wind,
  ArrowRight,
  ArrowLeft,
  Activity,
} from 'lucide-react';

/* ── Sensory Modes for Interactive Lab ──────────────────────────── */
const SENSORY_MODES = [
  {
    id: 'space',
    name: 'Space Odyssey',
    tag: 'Zero-G Acoustic Vacuum',
    sub: 'Sub-bass drone · Stereoscopic starlight · Infrasonic pulse',
    haptics: '18 Hz resonance',
    audio: '64-channel spatial dome',
    optics: 'Curved 4K HDR at 120fps',
    atmosphere: 'Cryo-mist pulse (18°C)',
    bars: [60, 85, 45, 95, 70, 80, 50, 90, 75, 65, 88, 55],
  },
  {
    id: 'ocean',
    name: 'Abyssal Depths',
    tag: 'Bioluminescent Pressure',
    sub: 'Hydrophone acoustics · Subterranean tremors · Blue glow',
    haptics: '32 Hz rolling waves',
    audio: 'Binaural water-displacement',
    optics: 'High-contrast black-level gamut',
    atmosphere: 'Gentle marine humidity breeze',
    bars: [40, 65, 90, 55, 75, 45, 85, 60, 95, 70, 50, 80],
  },
  {
    id: 'history',
    name: 'Ancient India',
    tag: 'Sacred Temple Resonance',
    sub: 'Temple bell overtones · Chanted harmonic echoes',
    haptics: 'Chariot wheel vibration sync',
    audio: 'Acoustic stone hall reverb',
    optics: 'Golden temple specular reflections',
    atmosphere: 'Subtle sandalwood aura infusion',
    bars: [80, 50, 70, 90, 60, 85, 40, 75, 95, 65, 80, 70],
  },
  {
    id: 'micro',
    name: 'Inner Microcosm',
    tag: 'Cellular Synaptic Pulse',
    sub: 'Cardiovascular rhythm · High-frequency neural sparks',
    haptics: 'Exact human heartbeat cadence (72 bpm)',
    audio: 'Micro-tonal granular synthesis',
    optics: 'Microscopic depth-of-field lens',
    atmosphere: 'Clean purified ionization breeze',
    bars: [55, 90, 40, 80, 65, 95, 50, 85, 60, 90, 45, 75],
  },
];

/* ── Engineering Innovations ────────────────────────────────────── */
const TECH_INNOVATIONS = [
  {
    tag: 'Acoustic Architecture',
    title: 'Decoupled Floating Cocoon',
    desc: 'The internal theatre sits on tuned elastomeric dampers isolated entirely from the vehicle chassis. Highway engine roar and ambient traffic (85dB+) drop to a tranquil 28dB recording studio sanctuary.',
    specs: [
      { key: 'Noise Reduction', val: '57 dB Attenuation' },
      { key: 'Chamber Rating', val: 'NC-25 Broadcast Standard' },
      { key: 'Isolation', val: 'Double-Walled Composite' },
    ],
  },
  {
    tag: 'Pneumatic Motion',
    title: 'Full-Spectrum Haptic Seats',
    desc: 'Each ergonomic seat is integrated with dual tactile exciter arrays. Rather than mere rattling, they transmit micro-frequencies — from the subtle purr of a spaceship engine to the deep rumble of an tectonic earthquake.',
    specs: [
      { key: 'Frequency Band', val: '5 Hz – 250 Hz Low Band' },
      { key: 'Response Latency', val: '< 2 Milliseconds' },
      { key: 'Seat Matrix', val: '24 Synchronized Pods' },
    ],
  },
  {
    tag: 'Atmospheric Synthesis',
    title: '4D Environmental Module',
    desc: 'High-speed micro-nozzles and directional thermal blowers synthesize real-world physics: sudden mountain cold fronts, warm desert breezes, gentle morning rain mist, and scent-matched scene transitions.',
    specs: [
      { key: 'Thermal Delta', val: '±6°C Instantaneous Shift' },
      { key: 'Aroma Diffusers', val: '12 Organic Essences' },
      { key: 'Air Purification', val: 'Medical HEPA Stage 4' },
    ],
  },
  {
    tag: 'Optics & Projection',
    title: 'Curved Ultra-Wide Horizon',
    desc: 'Custom short-throw dual laser projectors bounce off a seamless parabolic dome. The human visual perimeter is enveloped edge-to-edge, erasing peripheral distractions and transporting the mind fully.',
    specs: [
      { key: 'Field of View', val: '180° Curved Horizon' },
      { key: 'Resolution', val: 'Dual 4K HDR Laser' },
      { key: 'Frame Timing', val: '120 Hz Motion Fluidity' },
    ],
  },
];

/* ── Timeline Milestones ─────────────────────────────────────────── */
const TIMELINE = [
  {
    date: '2023 — The Genesis at IIT Bhubaneswar',
    title: 'Born in the Acoustic Physics Lab',
    desc: 'A team of passionate engineers and filmmakers at IIT Bhubaneswar asked why world-class immersive cinema remained locked in tier-1 metro complexes. The mathematical foundation for a mobile decoupled acoustic capsule was drafted and patented.',
  },
  {
    date: '2024 — Fabrication of the Heavy Rig',
    title: 'Forging the Travelling Sanctuary',
    desc: 'Partnered with certified aerospace coachbuilders to engineer the custom expandable hydraulic rig. Integrated 24 pneumatic haptic seats, multichannel surround arrays, and independent auxiliary power banks.',
  },
  {
    date: '2025 — Maiden Voyage Across Odisha',
    title: '40,000 Spectators & 100% Wonder',
    desc: 'First test deployments across state universities, heritage temples, coastal towns, and cultural festivals. Audiences from children to elders experienced cosmic voyages and historical recreations with standing ovations.',
  },
  {
    date: '2026 — The Pan-India Circuit',
    title: 'The National Odyssey Begins',
    desc: 'Expanding routes to over 100 cities across India. Launching demand-driven community ballots, school educational modules, and festival residencies.',
  },
];

export default function AboutPage({ onNavigateHome, onNavigateToReserve }) {
  const [activeMode, setActiveMode] = useState(SENSORY_MODES[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('story');

  /* ── Track Scroll Progress & Active Chapter ─────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }

      // Track active section for pill subnav
      const sections = ['story', 'specs', 'sensory', 'odyssey', 'trust'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Staggered Reveal Observer ──────────────────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const blocks = document.querySelectorAll('.reveal-block');
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <article className="about-page">
      {/* Scroll Progress Bar */}
      <div className="about-progress-track" aria-hidden="true">
        <div className="about-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Ambient Glows */}
      <div className="about-glow-orb about-glow-orb--top" aria-hidden="true" />
      <div className="about-glow-orb about-glow-orb--middle" aria-hidden="true" />
      <div className="about-glow-orb about-glow-orb--bottom" aria-hidden="true" />

      {/* Floating Subnav Pills */}
      <div className="about-subnav">
        <nav className="about-subnav__pill" aria-label="About Page Chapters">
          <button
            type="button"
            className="about-subnav__link"
            onClick={onNavigateHome}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>
          <span style={{ color: 'rgba(243, 230, 200, 0.2)' }}>|</span>
          <button
            type="button"
            className={`about-subnav__link ${activeSection === 'story' ? 'is-active' : ''}`}
            onClick={() => scrollTo('story')}
          >
            The Genesis
          </button>
          <button
            type="button"
            className={`about-subnav__link ${activeSection === 'specs' ? 'is-active' : ''}`}
            onClick={() => scrollTo('specs')}
          >
            Engineering
          </button>
          <button
            type="button"
            className={`about-subnav__link ${activeSection === 'sensory' ? 'is-active' : ''}`}
            onClick={() => scrollTo('sensory')}
          >
            Sensory Lab
          </button>
          <button
            type="button"
            className={`about-subnav__link ${activeSection === 'odyssey' ? 'is-active' : ''}`}
            onClick={() => scrollTo('odyssey')}
          >
            Odyssey
          </button>
          <button
            type="button"
            className={`about-subnav__link ${activeSection === 'trust' ? 'is-active' : ''}`}
            onClick={() => scrollTo('trust')}
          >
            Incubation
          </button>
        </nav>
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero__badge">
            <span className="about-hero__badge-dot" />
            <span>Gaudiya Darshan Solutions · Deep-Tech Immersion</span>
          </div>

          <h1 className="about-hero__title">
            The story of a theatre that <br />
            <span className="about-hero__title-shimmer">never stays still.</span>
          </h1>

          <p className="about-hero__subtitle">
            An impossible cinema built inside a 40-foot chassis. Engineered to dissolve the boundary between storytelling and reality — bringing planetary wonders directly to your city.
          </p>

          {/* Quick Stats Grid */}
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="about-stat-card__num">
                360<span className="about-stat-card__unit">°</span>
              </div>
              <div className="about-stat-card__label">Curved Horizon</div>
              <div className="about-stat-card__desc">
                Seamless parabolic optical wrap with zero peripheral edge bleed.
              </div>
            </div>

            <div className="about-stat-card">
              <div className="about-stat-card__num">
                24<span className="about-stat-card__unit">seats</span>
              </div>
              <div className="about-stat-card__label">Haptic Motion Pods</div>
              <div className="about-stat-card__desc">
                Individual low-frequency exciters responsive down to 5 Hz infrasonics.
              </div>
            </div>

            <div className="about-stat-card">
              <div className="about-stat-card__num">
                28<span className="about-stat-card__unit">dB</span>
              </div>
              <div className="about-stat-card__label">Acoustic Isolation</div>
              <div className="about-stat-card__desc">
                Chamber-grade silence inside, even amidst roaring highway traffic.
              </div>
            </div>

            <div className="about-stat-card">
              <div className="about-stat-card__num">
                100<span className="about-stat-card__unit">+</span>
              </div>
              <div className="about-stat-card__label">Cities on Route</div>
              <div className="about-stat-card__desc">
                Travelling through universities, cultural centers, and town squares.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH MARQUEE RIBBON ─────────────────────────────────── */}
      <div className="about-marquee-wrap" aria-hidden="true">
        <div className="about-marquee-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="about-marquee-item">Decoupled Acoustic Cocoon</span>
              <span className="about-marquee-item">Dolby Atmos Spatial Soundfield</span>
              <span className="about-marquee-item">Sub-Bass Tactile Transducers</span>
              <span className="about-marquee-item">4D Atmospheric Mist & Scent</span>
              <span className="about-marquee-item">Incubated at IIT Bhubaneswar</span>
              <span className="about-marquee-item">Startup India Recognised</span>
              <span className="about-marquee-item">High-Framerate 4K HDR Laser</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── CHAPTER 1: THE GENESIS & MISSION ────────────────────── */}
      <section id="story" className="about-section">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-body reveal-block">
              <span className="eyebrow">Chapter I — Genesis & Mission</span>
              <h2>Why should wonder stay locked in a metropolis?</h2>
              <p className="about-story-lead">
                For over a century, cinema required audiences to migrate to massive brick-and-mortar auditoriums. If you lived in a secondary city, a university township, or a coastal district, state-of-the-art 4D sensory immersion remained something you only heard about.
              </p>
              <p className="about-story-lead">
                In 2023, the founders of <strong>Gaudiya Darshan Solutions</strong> at IIT Bhubaneswar asked an audacious engineering question:
                <em> "What if the theatre didn't wait for the audience? What if the universe drove straight to your doorstep?"</em>
              </p>
              <p className="about-story-lead">
                <strong>TheatreOnWheels</strong> is not a projector in a bus. It is an aerospace-engineered travelling acoustic capsule that opens its doors to transport 24 voyagers into ancient worlds, cosmic nebulae, and ocean trenches simultaneously.
              </p>

              <div className="about-quote-box">
                <blockquote>
                  "Great stories shouldn't demand that you travel hundreds of miles to feel them. We built wheels under the sanctuary so that awe is accessible to every community."
                </blockquote>
                <cite>— Gaudiya Darshan Founding Engineering Team · IIT Bhubaneswar</cite>
              </div>

              {/* 4 Core Mission Pillars with pure inline SVGs */}
              <div className="about-pillars-grid" role="list">
                {/* Pillar 1: Acoustic Sanctuary */}
                <div className="about-pillar-card" role="listitem">
                  <div className="about-pillar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 4.97 0 9-4.03 9-9" />
                      <path d="M12 7a5 5 0 0 0-5 5c0 2.76 2.24 5 5 5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <div className="about-pillar-content">
                    <h4>Decoupled Cocoon</h4>
                    <p>28 dB studio silence isolated from 85dB+ road noise.</p>
                  </div>
                </div>

                {/* Pillar 2: 180° Curved Horizon */}
                <div className="about-pillar-card" role="listitem">
                  <div className="about-pillar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18C4.5 9 12 5 21 18" />
                      <circle cx="12" cy="11" r="3" />
                      <line x1="12" y1="4" x2="12" y2="6" />
                      <line x1="6" y1="8" x2="7.5" y2="9.5" />
                      <line x1="18" y1="8" x2="16.5" y2="9.5" />
                    </svg>
                  </div>
                  <div className="about-pillar-content">
                    <h4>180° Curved Horizon</h4>
                    <p>Dual 4K HDR laser wrap with zero peripheral edge bleed.</p>
                  </div>
                </div>

                {/* Pillar 3: Infrasonic Haptics */}
                <div className="about-pillar-card" role="listitem">
                  <div className="about-pillar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 5-5 7.5 0" />
                      <line x1="2" y1="19" x2="22" y2="19" opacity="0.5" />
                      <circle cx="9.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="17" cy="12" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <div className="about-pillar-content">
                    <h4>Infrasonic Pods</h4>
                    <p>Sub-bass tactile resonance down to 5 Hz bodily pulse.</p>
                  </div>
                </div>

                {/* Pillar 4: 4D Atmospheres */}
                <div className="about-pillar-card" role="listitem">
                  <div className="about-pillar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14.5C6 11.5 9 11.5 11 14.5C13 17.5 16 17.5 18 14.5" />
                      <path d="M7 8.5C9 5.5 12 5.5 14 8.5C16 11.5 19 11.5 21 8.5" />
                      <circle cx="5" cy="8" r="1" fill="currentColor" stroke="none" />
                      <circle cx="19" cy="15" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <div className="about-pillar-content">
                    <h4>4D Atmospheres</h4>
                    <p>Instant thermal deltas, directional mist, and native aromas.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="about-narrative-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onNavigateToReserve}
                >
                  <span>Reserve Journey Pass</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="about-editorial-link"
                  onClick={() => scrollTo('specs')}
                >
                  <span>Explore Technical Blueprint</span>
                  <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="2" y1="8" x2="13" y2="8" />
                    <polyline points="9 4 13 8 9 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Column: Abstract Capsule Schematic Line Art */}
            <div className="about-visual-column reveal-block delay-1">
              <div className="about-capsule-wrapper">
                <div className="about-capsule-halo" aria-hidden="true" />
                <svg
                  className="about-capsule-svg"
                  viewBox="0 0 460 520"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Schematic line-art illustration of TheatreOnWheels acoustic and optical capsule"
                >
                  <defs>
                    <radialGradient id="ambientCapsuleGrad" cx="50%" cy="45%" r="50%">
                      <stop offset="0%" stopColor="var(--c-brass)" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="var(--c-teal)" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="var(--c-brass-hi)" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="var(--c-brass)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Soft atmospheric gradient backdrop blob */}
                  <path
                    d="M130 90C230 65 370 120 380 240C390 360 280 440 170 430C70 420 50 330 60 210C70 100 100 95 130 90Z"
                    fill="url(#ambientCapsuleGrad)"
                  />

                  {/* Ground Navigation & Road Trajectory Line */}
                  <line
                    className="stroke-draw"
                    x1="40"
                    y1="450"
                    x2="420"
                    y2="450"
                    stroke="var(--c-brass)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity="0.4"
                  />
                  <circle cx="80" cy="450" r="3" fill="var(--c-brass-hi)" />
                  <circle cx="230" cy="450" r="4" fill="var(--c-teal)" />
                  <circle cx="380" cy="450" r="3" fill="var(--c-brass-hi)" />

                  {/* Concentric Acoustic Resonance Waves */}
                  <ellipse
                    className="stroke-draw stroke-draw--delayed"
                    cx="230"
                    cy="250"
                    rx="190"
                    ry="140"
                    stroke="var(--c-teal)"
                    strokeWidth="1.2"
                    strokeDasharray="5 7"
                    opacity="0.32"
                  />
                  <ellipse
                    className="stroke-draw stroke-draw--delayed"
                    cx="230"
                    cy="250"
                    rx="145"
                    ry="105"
                    stroke="var(--c-brass)"
                    strokeWidth="1.2"
                    opacity="0.25"
                  />

                  {/* Aerodynamic Mobile Capsule Silhouette */}
                  <rect
                    className="stroke-draw"
                    x="70"
                    y="140"
                    width="320"
                    height="270"
                    rx="40"
                    stroke="var(--c-cream)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  />

                  {/* 180° Parabolic Optical Horizon Dome */}
                  <path
                    className="stroke-draw stroke-draw--accent"
                    d="M100 370 C100 210, 160 160, 230 160 C300 160, 360 210, 360 370"
                    stroke="var(--c-brass-hi)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Spatial Soundfield Lattice Nodes */}
                  <line className="stroke-draw" x1="100" y1="370" x2="360" y2="370" stroke="var(--c-brass)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <line className="stroke-draw" x1="230" y1="160" x2="230" y2="370" stroke="var(--c-teal)" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

                  {/* Focal Lens / Projection Core (Pulsing Star) */}
                  <circle
                    className="capsule-core-glow"
                    cx="230"
                    cy="265"
                    r="28"
                    fill="url(#coreGradient)"
                  />
                  <circle
                    className="stroke-draw"
                    cx="230"
                    cy="265"
                    r="38"
                    stroke="var(--c-brass-hi)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="230"
                    cy="265"
                    r="4"
                    fill="#ffffff"
                  />

                  {/* Floating Orbital Sensor Rings */}
                  <path
                    className="stroke-draw stroke-draw--delayed"
                    d="M170 215 Q230 185 290 215"
                    stroke="var(--c-teal)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    className="stroke-draw stroke-draw--delayed"
                    d="M150 315 Q230 345 310 315"
                    stroke="var(--c-rust)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* Technical Reticle Calibrations */}
                  <line x1="222" y1="140" x2="238" y2="140" stroke="var(--c-brass)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="230" y1="132" x2="230" y2="148" stroke="var(--c-brass)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="62" y1="275" x2="78" y2="275" stroke="var(--c-brass)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="382" y1="275" x2="398" y2="275" stroke="var(--c-brass)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Micro Spec Label */}
                  <text x="230" y="425" textAnchor="middle" fill="var(--c-brass-hi)" fontSize="9" fontFamily="var(--f-clean)" letterSpacing="0.25em" opacity="0.85">
                    DECOUPLED 4D SANCTUARY · IIT BBS INCUBATED
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 2: ENGINEERING & ARCHITECTURE ───────────────── */}
      <section id="specs" className="about-section about-section--alt">
        <div className="container">
          <div className="about-section-header text-center reveal-block">
            <span className="eyebrow">Chapter II — Engineering</span>
            <h2>Forging the Impossible Capsule</h2>
            <p>
              How do you fit an IMAX-grade acoustic dome into a rolling road rig? It required custom vibration isolation, aerospace insulation, and sub-millimeter precision.
            </p>
          </div>

          <div className="about-tech-grid">
            {TECH_INNOVATIONS.map((tech, idx) => (
              <div key={tech.title} className={`about-tech-card reveal-block delay-${(idx % 3) + 1}`}>
                <span className="about-tech-tag">{tech.tag}</span>
                <h3>{tech.title}</h3>
                <p>{tech.desc}</p>
                <div className="about-tech-specs">
                  {tech.specs.map((s) => (
                    <div key={s.key} className="about-tech-spec-row">
                      <span className="about-tech-spec-key">{s.key}</span>
                      <span className="about-tech-spec-val">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAPTER 3: INTERACTIVE SENSORY LAB ──────────────────── */}
      <section id="sensory" className="about-section">
        <div className="container">
          <div className="about-section-header reveal-block">
            <span className="eyebrow">Chapter III — Sensory Synthesis</span>
            <h2>Interactive Acoustic & Haptic Chamber</h2>
            <p>
              Experience how our multi-sensory processor recalibrates lighting, haptic frequencies, and acoustic reverberation for each journey realm. Click a realm below to test the parameters:
            </p>
          </div>

          <div className="about-sensory-lab reveal-block">
            {/* Mode selection buttons */}
            <div className="about-sensory-modes">
              {SENSORY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`about-mode-btn ${activeMode.id === mode.id ? 'is-active' : ''}`}
                  onClick={() => setActiveMode(mode)}
                >
                  <Activity size={14} />
                  <span>{mode.name}</span>
                </button>
              ))}
            </div>

            <div className="about-sensory-display">
              {/* Animated Equalizer Visualizer */}
              <div className="about-eq-panel">
                <div className="about-eq-header">
                  <span className="about-eq-status">
                    <span className="about-eq-blinker" />
                    Spatial Channel Live Feed
                  </span>
                  <span style={{ fontFamily: 'var(--f-clean)', fontSize: '11px', color: 'var(--c-muted)' }}>
                    48kHz / 24-Bit Linear
                  </span>
                </div>

                <div className="about-eq-bars">
                  {activeMode.bars.map((ht, i) => (
                    <div
                      key={i}
                      className="about-eq-bar"
                      style={{
                        animationDuration: `${0.8 + (i % 5) * 0.25}s`,
                        animationDelay: `${i * 0.08}s`,
                        height: `${ht}%`,
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', color: 'rgba(243, 230, 200, 0.4)', fontFamily: 'var(--f-clean)' }}>
                  <span>20 Hz</span>
                  <span>100 Hz</span>
                  <span>1 kHz</span>
                  <span>8 kHz</span>
                  <span>20 kHz</span>
                </div>
              </div>

              {/* Mode Specifications */}
              <div className="about-sensory-meta">
                <span className="label" style={{ color: 'var(--c-teal)', marginBottom: '8px', display: 'block' }}>
                  {activeMode.tag}
                </span>
                <h3>{activeMode.name}</h3>
                <p>{activeMode.sub}</p>

                <div className="about-sensory-badges">
                  <div className="about-sensory-badge">
                    <Volume2 size={14} color="var(--c-brass)" />
                    <span>{activeMode.audio}</span>
                  </div>
                  <div className="about-sensory-badge">
                    <Activity size={14} color="var(--c-teal)" />
                    <span>{activeMode.haptics}</span>
                  </div>
                  <div className="about-sensory-badge">
                    <Eye size={14} color="var(--c-brass-hi)" />
                    <span>{activeMode.optics}</span>
                  </div>
                  <div className="about-sensory-badge">
                    <Wind size={14} color="var(--c-rust)" />
                    <span>{activeMode.atmosphere}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 4: THE ODYSSEY TIMELINE ─────────────────────── */}
      <section id="odyssey" className="about-section about-section--alt">
        <div className="container">
          <div className="about-section-header text-center reveal-block">
            <span className="eyebrow">Chapter IV — The Odyssey</span>
            <h2>From Blueprint to National Highway</h2>
            <p>
              A timeline of engineering breakthroughs, test trials, and the journey toward democratizing awe across India.
            </p>
          </div>

          <div className="about-timeline-wrap">
            <div className="about-timeline-laser" aria-hidden="true" />
            {TIMELINE.map((item, idx) => (
              <div key={item.title} className={`about-timeline-node reveal-block delay-${idx + 1}`}>
                <div className="about-timeline-dot" aria-hidden="true" />
                <div className="about-timeline-content">
                  <span className="about-timeline-date">{item.date}</span>
                  <h3 className="about-timeline-title">{item.title}</h3>
                  <p className="about-timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAPTER 5: TRUST & INCUBATION ───────────────────────── */}
      <section id="trust" className="about-section">
        <div className="container">
          <div className="about-section-header text-center reveal-block">
            <span className="eyebrow">Chapter V — Backing & Pedigree</span>
            <h2>Incubated by National Institutions</h2>
            <p>
              TheatreOnWheels is backed by India’s premier technical institutes and government innovation programs.
            </p>
          </div>

          <div className="about-trust-grid">
            {/* Trust Card 1: IIT Bhubaneswar */}
            <div className="about-trust-card reveal-block">
              <div className="about-trust-icon-ring" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  {/* IIT Bhubaneswar Official Kalinga Temple Emblem */}
                  <circle cx="16" cy="16" r="14" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.45" />
                  <circle cx="16" cy="7.5" r="1.2" fill="currentColor" />
                  <line x1="16" y1="5.5" x2="16" y2="8" strokeWidth="1" />
                  <ellipse cx="16" cy="9.5" rx="2.5" ry="0.9" fill="currentColor" opacity="0.8" />
                  <path d="M14 10.5 C13.5 13.5, 12.5 18, 11.5 24 L20.5 24 C19.5 18, 18.5 13.5, 18 10.5 Z" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
                  <line x1="13.8" y1="13" x2="18.2" y2="13" strokeWidth="0.9" />
                  <line x1="13.2" y1="16" x2="18.8" y2="16" strokeWidth="0.9" />
                  <line x1="12.6" y1="19" x2="19.4" y2="19" strokeWidth="0.9" />
                  <line x1="12.2" y1="22" x2="19.8" y2="22" strokeWidth="0.9" />
                  <path d="M14.5 24 L14.5 20 C14.5 19 17.5 19 17.5 20 L17.5 24 Z" fill="currentColor" />
                  <line x1="9" y1="24" x2="23" y2="24" strokeWidth="1.2" />
                  <line x1="10.5" y1="26" x2="21.5" y2="26" strokeWidth="0.9" opacity="0.7" />
                </svg>
              </div>
              <h3>IIT Bhubaneswar</h3>
              <div className="about-trust-role">Academic & Technology Incubation</div>
              <p>
                Engineered in collaboration with technical faculty. Structural dynamics, CFD airflow analysis, and acoustic reverberation modeling were perfected at the research center.
              </p>
            </div>

            {/* Trust Card 2: Startup India */}
            <div className="about-trust-card reveal-block delay-1">
              <div className="about-trust-icon-ring" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  {/* Startup India Official Hashtag & Ascending Arrow */}
                  <g strokeWidth="1.3" opacity="0.9">
                    <line x1="6" y1="13" x2="12" y2="13" />
                    <line x1="5.5" y1="17" x2="11.5" y2="17" />
                    <line x1="8" y1="10" x2="6.5" y2="20" />
                    <line x1="11" y1="10" x2="9.5" y2="20" />
                  </g>
                  <path d="M18 7 L27 15 L23.5 15 L23.5 22 L18.5 22 L18.5 17 L14 17 L14 15 L18 15 Z" fill="currentColor" strokeWidth="1.2" />
                  <path d="M18 10.5 L23 15 L21 15 L18 12 L15 15 L13.5 15 Z" fill="#ffffff" stroke="none" opacity="0.8" />
                  <line x1="5" y1="25" x2="27" y2="25" strokeWidth="0.9" strokeDasharray="2 2" opacity="0.5" />
                  <circle cx="25" cy="25" r="1.2" fill="currentColor" />
                </svg>
              </div>
              <h3>Startup India</h3>
              <div className="about-trust-role">Department for Promotion of Industry</div>
              <p>
                Recognized under the Government of India's flagship initiative for groundbreaking experiential technology and grassroots entertainment delivery models.
              </p>
            </div>

            {/* Trust Card 3: Startup Odisha */}
            <div className="about-trust-card reveal-block delay-2">
              <div className="about-trust-icon-ring" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  {/* Startup Odisha Official Konark Solar Chakra & Wave Flight Arrow */}
                  <circle cx="11" cy="19" r="4.2" strokeWidth="1" opacity="0.7" />
                  <circle cx="11" cy="19" r="1.5" fill="currentColor" />
                  <line x1="11" y1="14" x2="11" y2="15.5" strokeWidth="0.9" />
                  <line x1="11" y1="22.5" x2="11" y2="24" strokeWidth="0.9" />
                  <line x1="6" y1="19" x2="7.5" y2="19" strokeWidth="0.9" />
                  <line x1="14.5" y1="19" x2="16" y2="19" strokeWidth="0.9" />
                  <path d="M13 18 L25 6 L23 16 L27 18 L17 21 Z" fill="currentColor" strokeWidth="1.2" opacity="0.9" />
                  <path d="M19 12 L25 6 L20 8.5 Z" fill="#ffffff" stroke="none" opacity="0.8" />
                  <path d="M5 22 C9 25, 16 24, 23 20 C25.5 18.5, 27.5 17, 29 14" strokeWidth="1.2" />
                </svg>
              </div>
              <h3>Startup Odisha</h3>
              <div className="about-trust-role">State Strategic Innovation Grant</div>
              <p>
                Supported by the Government of Odisha to spearhead mobile cultural immersion, heritage storytelling, and educational outreach to youth throughout eastern India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION FINALE ───────────────────────────────── */}
      <section className="about-section" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <div className="about-cta-card reveal-block">
            <span className="eyebrow">Step Inside</span>
            <h2>Experience the world before anyone else.</h2>
            <p>
              Reserve your journey pass for upcoming tour stops in your city or vote for TheatreOnWheels to park at your campus or cultural center.
            </p>
            <div className="about-cta-buttons">
              <button
                type="button"
                className="btn-primary"
                onClick={onNavigateToReserve}
              >
                <span>Reserve Journey Pass</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={onNavigateHome}
              >
                <span>Return to Arrival Experience</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
