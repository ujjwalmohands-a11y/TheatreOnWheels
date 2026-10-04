import React, { useEffect, useRef, useState } from 'react';
import './NavBar.css';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [soundOn, setSoundOn] = useState(false);
  
  const navRef = useRef(null);
  const linksRef = useRef(null);
  const lampRef = useRef(null);
  const [activeHash, setActiveHash] = useState('#what-is-it');
  
  // scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // lamp movement logic
  const moveLampTo = (element) => {
    if (!element || !linksRef.current || !lampRef.current) return;
    const l = linksRef.current.getBoundingClientRect();
    const r = element.getBoundingClientRect();
    lampRef.current.style.setProperty('--x', `${r.left - l.left + r.width / 2 - 13}px`);
  };

  useEffect(() => {
    // Small delay to ensure DOM is painted
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

  const navLinks = [
    { href: '#what-is-it', label: 'The theatre' },
    { href: '#worlds', label: 'The journey' },
    { href: '#experience', label: 'Stories' },
    { href: '#truck', label: 'About us' }
  ];

  return (
    <div className="nav-wrapper">
      <header className={`nav ${scrolled ? 'small' : ''}`} ref={navRef}>
        <a className="brand" href="#" aria-label="Gaudiya Darshan, home">
          <span className="mark"><span className="flame"></span></span>
          <span className="brand-text">
            <span className="brand-name">Gaudiya Darshan</span>
            <span className="brand-sub">Theatre on wheels</span>
          </span>
        </a>

        <ul className="links" ref={linksRef} onMouseLeave={handleLinkLeave}>
          {navLinks.map((link) => (
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
            {['EN', 'हिं', 'ଓଡ଼ି'].map(l => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
          <button 
            type="button"
            className="sound" 
            aria-pressed={soundOn} 
            aria-label={soundOn ? 'Sound on' : 'Sound off'}
            onClick={() => setSoundOn(!soundOn)}
          >
            <i></i><i></i><i></i><i></i>
          </button>
          <a className="ticket" href="#coming-soon">Reserve a seat</a>
          <button 
            type="button"
            className="burger" 
            aria-expanded={menuOpen} 
            aria-controls="panel" 
            aria-label="Menu"
            onClick={() => {
              setMenuOpen(!menuOpen);
              document.body.style.overflow = !menuOpen ? 'hidden' : '';
            }}
          >
            <span></span><span></span>
          </button>
        </div>
      </header>

      <div className={`panel ${menuOpen ? 'open' : ''}`} id="panel">
        {navLinks.map((link) => (
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
          <a className="ticket" href="#coming-soon" onClick={() => {
              setMenuOpen(false);
              document.body.style.overflow = '';
          }}>Reserve a seat</a>
        </div>
      </div>
    </div>
  );
}
