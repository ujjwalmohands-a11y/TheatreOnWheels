import React, { useEffect, useRef, useState } from 'react';
import './NavBar.css';

const NAV_LINKS = [
  { href: '#hero',             label: 'Arrival' },
  { href: '#places-of-launch', label: 'Places of Launch' },
  { href: '#reserve',          label: 'Journey Pass' },
  { href: '/about.html',       label: 'About' },
];

const LANG_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'or', label: 'ଓଡ଼ି' },
];

export default function NavBar({ currentPage = 'home', onNavigate, lang: propLang, onLangChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalLang, setInternalLang] = useState('en');
  const [isOverHero, setIsOverHero] = useState(true);
  const activeLang = propLang || internalLang;

  const handleLangSelect = (code) => {
    setInternalLang(code);
    if (onLangChange) onLangChange(code);
  };

  const linksRef = useRef(null);
  const lampRef = useRef(null);
  const [activeHash, setActiveHash] = useState(currentPage === 'about' ? '#about' : '#hero');

  useEffect(() => {
    if (currentPage !== 'home') {
      setIsOverHero(false);
      return;
    }
    const updateHeroState = () => {
      const heroEl = document.getElementById('hero');
      if (!heroEl) {
        setIsOverHero(window.scrollY < 650);
        return;
      }
      const rect = heroEl.getBoundingClientRect();
      setIsOverHero(rect.bottom > 80);
    };

    updateHeroState();
    window.addEventListener('scroll', updateHeroState, { passive: true });
    window.addEventListener('resize', updateHeroState);
    return () => {
      window.removeEventListener('scroll', updateHeroState);
      window.removeEventListener('resize', updateHeroState);
    };
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'about') {
      setActiveHash('#about');
    }
  }, [currentPage]);

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

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setActiveHash(href);
    if (href === '#about' || href === '/about.html') {
      window.location.href = '/about.html';
      return;
    } else {
      const targetId = href.replace('#', '');
      if (onNavigate) onNavigate('home', targetId);
      else {
        window.location.hash = targetId;
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`nav-wrapper ${isOverHero ? 'is-hero-light' : ''}`}>
      <header className={`nav ${scrolled ? 'small' : ''} ${isOverHero ? 'is-hero-light' : ''}`}>
        <a
          className="brand"
          href="#hero"
          aria-label="TheatreOnWheels — home"
          onClick={(e) => handleLinkClick(e, '#hero')}
        >
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
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <span className="lamp" ref={lampRef} aria-hidden="true"></span>
        </ul>

        <div className="tools">
          <div className="lang" role="group" aria-label="Language">
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                type="button"
                aria-pressed={activeLang === opt.code}
                onClick={() => handleLangSelect(opt.code)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <a
            className="ticket"
            href="#reserve"
            onClick={(e) => handleLinkClick(e, '#reserve')}
          >
            Reserve a Seat
          </a>
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
            onClick={(e) => {
              handleLinkClick(e, link.href);
              setMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            {link.label}
          </a>
        ))}
        <div className="row">
          <div className="lang" role="group" aria-label="Language">
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                type="button"
                aria-pressed={activeLang === opt.code}
                onClick={() => {
                  handleLangSelect(opt.code);
                  setMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <a
            className="ticket"
            href="#reserve"
            onClick={(e) => {
              handleLinkClick(e, '#reserve');
              setMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Reserve a Seat
          </a>
        </div>
      </div>
    </div>
  );
}
