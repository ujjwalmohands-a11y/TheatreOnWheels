import React, { useEffect, useRef, useState } from 'react';
import './NavBar.css';

const NAV_LINKS = [
  { href: '#hero',    label: 'Arrival' },
  { href: '#canvas',  label: 'Canvas' },
  { href: '#reserve', label: 'Journey Pass' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [soundOn, setSoundOn] = useState(false);
  const linksRef = useRef(null);
  const lampRef = useRef(null);
  const [activeHash, setActiveHash] = useState('#hero');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const moveLampTo = (element) => {
    if (!element || !linksRef.current || !lampRef.current) return;
    const l = linksRef.current.getBoundingClientRect();
    const r = element.getBoundingClientRect();
    lampRef.current.style.setProperty('--x', `${r.left - l.left + r.width / 2 - 13}px`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeEl = linksRef.current?.querySelector(`a[href="${activeHash}"]`);
      if (activeEl) moveLampTo(activeEl);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeHash]);

  useEffect(() => {
    const handleResize = () => {
      const activeEl = linksRef.current?.querySelector(`a[href="${activeHash}"]`);
      if (activeEl) moveLampTo(activeEl);
    };
    window.addEventListener('resize', handleResize);
    document.fonts?.ready?.then(handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeHash]);

  const handleLinkHover = (e) => moveLampTo(e.currentTarget);
  const handleLinkLeave = () => {
    const activeEl = linksRef.current?.querySelector(`a[href="${activeHash}"]`);
    if (activeEl) moveLampTo(activeEl);
  };

  return (
    <div className="nav-wrapper">
      <header className={`nav ${scrolled ? 'small' : ''}`}>
        <a className="brand" href="#" aria-label="TheatreOnWheels — home">
          <span className="mark"><span className="flame"></span></span>
          <span className="brand-text">
            <span className="brand-name">TheatreOnWheels</span>
          </span>
        </a>

        <ul className="links" ref={linksRef} onMouseLeave={handleLinkLeave}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={activeHash === link.href ? 'page' : undefined}
                onMouseEnter={handleLinkHover}
                onFocus={handleLinkHover}
                onClick={() => setActiveHash(link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <span className="lamp" ref={lampRef} aria-hidden="true"></span>
        </ul>

        <div className="tools">
          <div className="lang" role="group" aria-label="Language">
            {['EN', 'हिं', 'ଓଡ଼ི'].map(l => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
          <a className="ticket" href="#reserve">Reserve a Seat</a>
          <button
            type="button"
            className="burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-panel"
            aria-label="Open menu"
            onClick={() => {
              setMenuOpen(!menuOpen);
              document.body.style.overflow = !menuOpen ? 'hidden' : '';
            }}
          >
            <span></span><span></span>
          </button>
        </div>
      </header>

      <div className={`panel ${menuOpen ? 'open' : ''}`} id="mobile-panel">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            className="big"
            href={link.href}
            onClick={() => {
              setActiveHash(link.href);
              setMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            {link.label}
          </a>
        ))}
        <div className="row">
          <div className="lang" role="group" aria-label="Language">
            {['EN', 'हिं', 'ଓଡ଼ି'].map(l => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
          <a className="ticket" href="#reserve" onClick={() => {
            setMenuOpen(false);
            document.body.style.overflow = '';
          }}>Reserve a Seat</a>
        </div>
      </div>
    </div>
  );
}
