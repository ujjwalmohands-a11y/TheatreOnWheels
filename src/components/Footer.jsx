import React, { useEffect, useRef, useState } from 'react';
import './Footer.css';

export default function Footer({ onNavigate }) {
  const footerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Pure React ember particles config (stable across re-renders)
  const embers = useRef(
    Array.from({ length: 8 }, () => ({
      left: 6 + Math.random() * 88,
      dx: Math.random() * 60 - 30,
      dur: 7 + Math.random() * 7,
      delay: -Math.random() * 9,
    }))
  ).current;

  useEffect(() => {
    const f = footerRef.current;
    if (!f) return;

    const triggerIn = () => {
      setIsInView(true);
    };

    const handleScroll = () => {
      const rect = f.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 150) {
        triggerIn();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (entries[0].isIntersecting) {
            triggerIn();
            obs.disconnect();
            window.removeEventListener('scroll', handleScroll);
          }
        },
        { threshold: 0.01, rootMargin: '0px 0px 150px 0px' }
      );
      observer.observe(f);
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      triggerIn();
    }
  }, []);

  const handleLinkClick = (e, page, sectionId) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page, sectionId);
    }
  };

  return (
    <footer
      className={`tow-footer${isInView ? ' tf-in' : ''}`}
      id="contact"
      ref={footerRef}
    >
      <div className="tf-fx" aria-hidden="true">
        <div className="tf-beam" />
        <div className="tf-glow" />
        {embers.map((emb, idx) => (
          <i
            key={idx}
            style={{
              left: `${emb.left}%`,
              '--dx': `${emb.dx}px`,
              animationDuration: `${emb.dur}s`,
              animationDelay: `${emb.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="tf-strip" aria-hidden="true">
        <div className="tf-track">
          <div className="tf-grp">
            <span>The show must go on</span><b>●</b>
            <span>The show must go on</span><b>●</b>
            <span>The show must go on</span><b>●</b>
          </div>
          <div className="tf-grp">
            <span>The show must go on</span><b>●</b>
            <span>The show must go on</span><b>●</b>
            <span>The show must go on</span><b>●</b>
          </div>
        </div>
      </div>

      <div className="tf-wrap">
        <h2 className="tf-brand" aria-label="Theater on Wheels">
          <span className="tf-t" aria-hidden="true">
            <span className="tf-t-line">
              <span style={{ '--d': '0.05s' }}>Theater</span>
            </span>
            <span className="tf-t-line">
              <span style={{ '--d': '0.2s' }}>On Wheels</span>
            </span>
          </span>

          {/* Redesigned film reel */}
          <svg className="tf-reel" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="tf-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffb066" />
                <stop offset="0.55" stopColor="#ff5a2c" />
                <stop offset="1" stopColor="#c4231b" />
              </linearGradient>
              <mask id="tf-holes-mask">
                <rect width="100" height="100" fill="#fff" />
                <g fill="#000">
                  <circle cx="50" cy="23" r="10" />
                  <circle cx="73.4" cy="36.5" r="10" />
                  <circle cx="73.4" cy="63.5" r="10" />
                  <circle cx="50" cy="77" r="10" />
                  <circle cx="26.6" cy="63.5" r="10" />
                  <circle cx="26.6" cy="36.5" r="10" />
                </g>
              </mask>
            </defs>
            <circle
              className="tf-ticks"
              cx="50"
              cy="50"
              r="47.2"
              fill="none"
              stroke="url(#tf-grad)"
              strokeWidth="1.4"
              strokeDasharray="1.3 4.1"
              strokeLinecap="round"
            />
            <g className="tf-disc">
              <circle cx="50" cy="50" r="43" fill="url(#tf-grad)" mask="url(#tf-holes-mask)" />
              <circle
                cx="50"
                cy="50"
                r="40.5"
                fill="none"
                stroke="rgba(255,255,255,.28)"
                strokeWidth="0.6"
                mask="url(#tf-holes-mask)"
              />
            </g>
            <g className="tf-hub">
              <circle cx="50" cy="50" r="13" fill="#0b0a0a" />
              <circle cx="50" cy="50" r="13" fill="none" stroke="url(#tf-grad)" strokeWidth="1.6" />
              <path
                d="M50 50V40M50 50l8.7 5M50 50l-8.7 5"
                stroke="url(#tf-grad)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="3.2" fill="#0b0a0a" stroke="url(#tf-grad)" strokeWidth="1.2" />
            </g>
          </svg>
        </h2>

        <p className="tf-lead">
          <strong>Cinema without boundaries.</strong> Let’s make your next experience unforgettable.
        </p>

        <div className="tf-actions">
          <a
            className="tf-btn tf-book"
            href="#reserve"
            onClick={(e) => handleLinkClick(e, 'home', 'reserve')}
          >
            Book Your Experience
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            className="tf-btn tf-soc"
            href="https://www.instagram.com/_theatreonwheels/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.3" cy="6.7" r="0.6" />
            </svg>
          </a>
          <a
            className="tf-btn tf-soc"
            href="https://facebook.com"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" />
            </svg>
          </a>
          <a
            className="tf-btn tf-soc"
            href="https://youtube.com/@theatreonwheels?si=hi06OgmjC7YuEDMM"
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
              <path d="M10 9.5v5l4.5-2.5z" />
            </svg>
          </a>
        </div>

        <nav className="tf-nav" aria-label="Footer">
          <ul>
            <li>
              <a href="#hero" onClick={(e) => handleLinkClick(e, 'home', 'hero')}>
                Home
              </a>
            </li>
            <li>
              <a href="/about.html" onClick={(e) => handleLinkClick(e, 'about')}>
                About Us
              </a>
            </li>
            <li>
              <a href="#experience" onClick={(e) => handleLinkClick(e, 'experience')}>
                Our Experience
              </a>
            </li>
            <li>
              <a href="/achievements.html" onClick={(e) => handleLinkClick(e, 'achievements')}>
                Gallery
              </a>
            </li>
            <li>
              <a href="#reserve" onClick={(e) => handleLinkClick(e, 'home', 'reserve')}>
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="tf-bar">
          <span>© 2026 Theater on Wheels. All Rights Reserved.</span>
          <span>
            <a href="#privacy">Privacy Policy</a> &nbsp;·&nbsp;{' '}
            <a href="#terms">Terms &amp; Conditions</a>
          </span>
          <div className="tf-legal-note">
            TheatreOnWheels is a trademark of Gaudya Darshan Solutions Private Limited.
          </div>
          <span className="tf-live">
            <i className="tf-dot" aria-hidden="true" />
            MADE FOR THE LOVE OF CINEMA.
          </span>
        </div>
      </div>
    </footer>
  );
}
