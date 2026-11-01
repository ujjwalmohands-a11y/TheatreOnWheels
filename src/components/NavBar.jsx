import React, { useEffect, useRef, useState, useCallback } from 'react';
import './NavBar.css';

const DESKTOP_NAV_ITEMS = [
  { id: 'shows',        label: 'Home',         href: '#hero' },
  { id: 'experience',   label: 'Experience',   href: '/step-inside.html' },
  { id: 'about',        label: 'About',        href: '/about.html' },
  { id: 'achievements', label: 'Achievements', href: '/achievements.html' },
  { id: 'route',        label: 'Route',        href: '#places-of-launch' },
  { id: 'contact',      label: 'Contact',      href: '#contact' },
];

const MOBILE_NAV_ITEMS = [
  { id: 'shows',        label: 'Home',               subtitle: 'Main Stage',                href: '#hero',              icon: 'home' },
  { id: 'experience',   label: 'Experience',         subtitle: 'Step Inside 7D',            href: '/step-inside.html',  icon: 'spark' },
  { id: 'about',        label: 'About',              subtitle: 'Our Story & Genesis',       href: '/about.html',        icon: 'book' },
  { id: 'achievements', label: 'Achievements',       subtitle: 'Medals & Incubation Batches', href: '/achievements.html', icon: 'medal' },
  { id: 'route',        label: 'Route',              subtitle: 'Tour Dates & Stops',        href: '#places-of-launch',  icon: 'compass' },
  { id: 'reserve',      label: 'Reserve the ticket', subtitle: 'Admit One · Grab Seats',    href: '#reserve',           icon: 'ticket' },
];

const ICONS = {
  home: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  ),
  spark: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  ),
  book: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
      <path d="M6 6h10M6 10h10"/>
    </svg>
  ),
  medal: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  compass: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.4"/>
    </svg>
  ),
  ticket: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
      <line x1="9" y1="6" x2="9" y2="18" strokeDasharray="2 2"/>
    </svg>
  ),
};

const LANG_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'or', label: 'ଓଡ଼ି' },
];

export default function NavBar({ currentPage = 'home', onNavigate, lang: propLang, onLangChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState(currentPage === 'about' ? 'truck' : 'shows');
  const [animatingPill, setAnimatingPill] = useState(false);
  const [internalLang, setInternalLang] = useState('en');

  const activeLang = propLang || internalLang;

  const wrapRef = useRef(null);
  const linksRef = useRef(null);
  const pillRef = useRef(null);
  const menuRef = useRef(null);

  const handleLangSelect = (code) => {
    setInternalLang(code);
    if (onLangChange) onLangChange(code);
  };

  // ── Scroll detection ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 8;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Sliding pill calculation ──────────────────────────────
  const placePill = useCallback((element, animate = true) => {
    if (!element || !linksRef.current || !pillRef.current) return;
    const l = linksRef.current.getBoundingClientRect();
    const r = element.getBoundingClientRect();
    if (r.width === 0) return;
    setAnimatingPill(animate);
    pillRef.current.style.setProperty('--px', `${r.left - l.left}px`);
    pillRef.current.style.setProperty('--pw', `${r.width}px`);
  }, []);

  const restoreCurrentPill = useCallback((animate = true) => {
    if (!linksRef.current) return;
    const currentEl = linksRef.current.querySelector('a[aria-current="page"]');
    if (currentEl) placePill(currentEl, animate);
  }, [placePill]);

  // Update pill on active page change, resize, or font load
  useEffect(() => {
    const timer = setTimeout(() => restoreCurrentPill(false), 60);
    return () => clearTimeout(timer);
  }, [activePage, restoreCurrentPill]);

  useEffect(() => {
    const handleResize = () => {
      restoreCurrentPill(false);
      if (wrapRef.current && wrapRef.current.offsetWidth >= 820 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    document.fonts?.ready?.then(() => restoreCurrentPill(false));
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen, restoreCurrentPill]);

  // ── Keyboard & outside click handling ─────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    const onPointerDown = (e) => {
      if (menuOpen && wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  // Sync active page with currentPage prop
  useEffect(() => {
    if (currentPage === 'about') setActivePage('about');
    else if (currentPage === 'home') setActivePage('shows');
  }, [currentPage]);

  // ── Navigation routing ────────────────────────────────────
  const handleNav = (e, pageId) => {
    e.preventDefault();
    setActivePage(pageId);
    setMenuOpen(false);

    if (pageId === 'home' || pageId === 'shows') {
      if (currentPage !== 'home' && onNavigate) {
        onNavigate('home', 'hero');
      } else {
        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (pageId === 'experience') {
      if (onNavigate) {
        onNavigate('experience');
      } else {
        window.location.href = '/step-inside.html';
      }
    } else if (pageId === 'about' || pageId === 'truck') {
      if (onNavigate) {
        onNavigate('about');
      } else {
        window.location.href = '/about.html';
      }
    } else if (pageId === 'achievements') {
      if (onNavigate) {
        onNavigate('achievements');
      } else {
        window.location.href = '/achievements.html';
      }
    } else if (pageId === 'route') {
      if (currentPage !== 'home' && onNavigate) {
        onNavigate('home', 'places-of-launch');
      } else {
        document.getElementById('places-of-launch')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (pageId === 'contact') {
      document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
    } else if (pageId === 'reserve') {
      if (currentPage !== 'home' && onNavigate) {
        onNavigate('home', 'reserve');
      } else {
        document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`nav-wrap ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-open' : ''}`}
      id="navWrap"
      ref={wrapRef}
    >
      <nav className="nav" aria-label="Main">
        {/* Animated truck logo */}
        <a
          className="tow-logo"
          href="#home"
          aria-label="Theatre On Wheels, home"
          data-page="home"
          onClick={(e) => handleNav(e, 'home')}
        >
          <svg className="tow-mark" viewBox="0 0 64 46" aria-hidden="true">
            <path className="tow-road" d="M-2 43.6H66" />
            <g className="tow-body">
              <path className="tow-light" d="M16 34V20a7.5 7.5 0 0 1 15 0v14z" />
              <path className="tow-drape" d="M9 8c0 10 2.5 19 6 26" />
              <path className="tow-drape" d="M38 8c0 10-2.5 19-6 26" style={{ transformOrigin: '100% 0' }} />
              <rect className="tow-line" x="3" y="7" width="41" height="27" rx="2.5" />
              <circle className="tow-bulb" style={{ '--i': 0 }} cx="9" cy="3.6" r="1.05" />
              <circle className="tow-bulb" style={{ '--i': 1 }} cx="16" cy="3.6" r="1.05" />
              <circle className="tow-bulb" style={{ '--i': 2 }} cx="23" cy="3.6" r="1.05" />
              <circle className="tow-bulb" style={{ '--i': 3 }} cx="30" cy="3.6" r="1.05" />
              <circle className="tow-bulb" style={{ '--i': 4 }} cx="37" cy="3.6" r="1.05" />
              <path className="tow-line" d="M44 15h7.2c.9 0 1.7.4 2.3 1l6.5 7.4V34H44z" />
              <path className="tow-light" d="M48 18.6h3l4.8 5.2H48z" />
              <path className="tow-beam" d="M61.5 28.5 69 25v7z" />
              <circle className="tow-hub" cx="59" cy="29" r="1.3" />
            </g>
            <circle className="tow-tire" cx="14" cy="37" r="5.4" />
            <circle className="tow-tire" cx="50" cy="37" r="5.4" />
            <path className="tow-spokes" d="M14 33.6v6.8M10.6 37h6.8" />
            <path className="tow-spokes" d="M50 33.6v6.8M46.6 37h6.8" />
            <circle className="tow-hub" cx="14" cy="37" r="1.5" />
            <circle className="tow-hub" cx="50" cy="37" r="1.5" />
          </svg>
          <span className="tow-word">
            <span>Theatre</span>
            <em className="tow-on">on</em>
            <span>Wheels</span>
          </span>
        </a>

        {/* Desktop links with sliding pill */}
        <div
          className="links"
          id="links"
          ref={linksRef}
          onMouseLeave={() => restoreCurrentPill(true)}
        >
          <span
            className={`pill ${animatingPill ? '' : 'no-anim'}`}
            ref={pillRef}
            aria-hidden="true"
          />
          <ul>
            {DESKTOP_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  data-page={item.id}
                  aria-current={activePage === item.id ? 'page' : undefined}
                  onMouseEnter={(e) => placePill(e.currentTarget, true)}
                  onFocus={(e) => placePill(e.currentTarget, true)}
                  onClick={(e) => handleNav(e, item.id)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions: Language Toggle, Ticket Stub, Burger */}
        <div className="actions">
          <div className="tow-lang" role="group" aria-label="Language">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                className="tow-lang-btn"
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
            data-reserve
            onClick={(e) => handleNav(e, 'reserve')}
          >
            <span className="t-label">
              Reserve<span className="t-long">&nbsp;a Seat</span>
            </span>
            <span className="t-arrow">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h9M8.5 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>

          <button
            className="burger"
            id="burger"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile Card Menu: 4 items (Home, Experience, Route, Reserve the ticket) */}
      <div
        className="menu"
        id="menu"
        ref={menuRef}
        inert={!menuOpen ? true : undefined}
      >
        <div className="menu-header">
          <span className="menu-header__beacon" aria-hidden="true" />
          <span className="menu-header__text">7D THEATRE ON WHEELS</span>
          <span className="menu-header__tag">LIVE</span>
        </div>
        <ul className="menu-list">
          {MOBILE_NAV_ITEMS.map((item, idx) => (
            <li key={item.id}>
              <a
                className={`m-link ${item.id === 'reserve' ? 'm-link--reserve' : ''}`}
                style={{ '--i': idx }}
                href={item.href}
                data-page={item.id}
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={(e) => handleNav(e, item.id)}
              >
                <span className="m-link__left">
                  <span className="m-link__icon-box" aria-hidden="true">
                    {ICONS[item.icon]}
                  </span>
                  <span className="m-link__titles">
                    <span className="m-link__label">{item.label}</span>
                    <span className="m-link__sub">{item.subtitle}</span>
                  </span>
                </span>
                <span className="m-link__arrow" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h9M8.5 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
