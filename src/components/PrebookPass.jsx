import React, { useState, useEffect, useRef } from 'react';
import './PrebookPass.css';
import {
  saveBooking,
  exportBookingsToCSV,
} from '../services/bookingDatabase';

/**
 * Lightweight Web Audio synthesizer for paper tear sound.
 * Zero external files, zero CPU load when not triggered.
 */
function playTearSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const decay = Math.pow(1 - progress, 2);
      output[i] = (Math.random() * 2 - 1) * decay * 0.22;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);

    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Lightweight particle spark burst (only 8 particles on desktop, disabled on mobile for 0 frame drops)
 */
function burstSparks(el) {
  if (typeof window === 'undefined') return;
  if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el) {
    return;
  }

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#FFD3A6', '#FFF1DC', '#2B1409', '#F7A15B'];

  for (let i = 0; i < 8; i++) {
    const s = document.createElement('i');
    const angle = (i / 8) * Math.PI * 2;
    const dist = 50 + Math.random() * 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    s.className = 'po-spark';
    s.style.left = `${cx}px`;
    s.style.top = `${cy}px`;
    s.style.setProperty('--dx', `${dx}px`);
    s.style.setProperty('--dy', `${dy}px`);
    s.style.setProperty('--c', colors[i % colors.length]);

    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

export default function PrebookPass({
  initialCity = '',
  selectedWorld = '',
  selectedSeat = 'B4',
  worlds = [
    { id: 'space', title: 'Space Odyssey', tagline: 'Zero gravity. Infinite wonder.' },
    { id: 'ocean', title: 'Deep Ocean', tagline: 'Pressure. Darkness. Life.' },
    { id: 'history', title: 'Ancient India', tagline: 'Where time stands still.' },
    { id: 'micro', title: 'The Inner Universe', tagline: 'Smaller than light itself.' },
  ],
  onWorldChange,
  onPrebooked,
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: initialCity || '',
    destination: selectedWorld || '',
    whatsapp: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState('idle'); // 'idle' | 'tearing' | 'confirmed'
  const [refCode, setRefCode] = useState('');
  const [destOpen, setDestOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'synced' | 'local'

  const ticketRef = useRef(null);
  const destDropdownRef = useRef(null);
  const tearBadgeRef = useRef(null);

  // Sync destination if selectedWorld prop changes
  useEffect(() => {
    if (selectedWorld) {
      setFormData((prev) => ({ ...prev, destination: selectedWorld }));
    }
  }, [selectedWorld]);

  // Mouse spotlight glow tracking over the pass (Clean + Interactive UI recipe)
  useEffect(() => {
    const el = ticketRef.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const handlePointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
      el.style.setProperty('--spot-y', `${y.toFixed(1)}%`);
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => el.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Dropdown: close on click outside or Escape
  useEffect(() => {
    if (!destOpen) return;
    const handleClickOutside = (e) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setDestOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [destOpen]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = true;
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = true;
    }
    if (!formData.destination) {
      newErrors.destination = true;
    }
    const cleanWa = formData.whatsapp.replace(/\D/g, '');
    if (cleanWa.length < 8) {
      newErrors.whatsapp = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      newErrors.email = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (field === 'destination' && onWorldChange) {
      onWorldChange(value);
    }
  };

  // Trigger Tearing Animation & Pass Confirmation + Database Record
  const triggerTearAndReserve = async (e) => {
    if (e) e.preventDefault();
    if (stage !== 'idle') return;

    if (!validate()) {
      setTimeout(() => {
        const firstBad = document.querySelector('.po-field.is-err input');
        if (firstBad) firstBad.focus();
      }, 50);
      return;
    }

    setStage('tearing');
    burstSparks(tearBadgeRef.current || document.getElementById('po-stub'));
    playTearSound();

    const code = `TOW-${Math.random().toString(36).slice(2, 6).toUpperCase()}-26`;
    setRefCode(code);

    const bookingDetails = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      destination: formData.destination,
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim(),
      seat: selectedSeat || 'B4',
      reference: code,
      at: new Date().toISOString(),
    };

    if (onPrebooked) {
      onPrebooked(bookingDetails);
    }

    // Save to Database (Local storage + Google Sheets/Excel Webhook from .env)
    try {
      const result = await saveBooking(bookingDetails);
      setSyncStatus(result.synced ? 'synced' : 'local');
    } catch (err) {
      console.warn('[PrebookPass] Database save notification:', err);
      setSyncStatus('local');
    }

    // Complete tear and transition cleanly to confirmed state
    setTimeout(() => {
      setStage('confirmed');
    }, 700);
  };

  const handleReset = () => {
    setStage('idle');
    setFormData((prev) => ({
      ...prev,
      name: '',
      whatsapp: '',
      email: '',
    }));
    setErrors({});
  };

  // Optional Admin Keyboard Shortcut: Ctrl + Shift + E to download bookings backup
  useEffect(() => {
    const handleAdminKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        exportBookingsToCSV();
      }
    };
    window.addEventListener('keydown', handleAdminKey);
    return () => window.removeEventListener('keydown', handleAdminKey);
  }, []);

  const displayName = formData.name.trim().toUpperCase() || 'GUEST';

  return (
    <div className="po-wrap" id="po-wrap">
      <section
        className={`po-ticket ${stage === 'tearing' ? 'is-tearing' : ''} ${stage === 'confirmed' ? 'is-confirmed' : ''}`}
        id="po-ticket"
        ref={ticketRef}
        aria-label="Pre-booking pass"
      >
        {/* Subtle Static Cosmic Star Elements (Zero CPU) */}
        <span className="po-stars" aria-hidden="true" />

        {stage !== 'confirmed' ? (
          <>
            {/* ── Main Ticket Body ── */}
            <div className="po-main">
              {/* Header: Title & Selected World Pill */}
              <div className="po-top">
                <span className="po-kicker">Theatre on Wheels · 7D Mobile Cinema</span>
                <span className={`po-pill ${!formData.destination ? 'is-empty' : ''}`}>
                  <span className="po-pill-dot" aria-hidden="true" />
                  {formData.destination || 'Select World'}
                </span>
              </div>

              {/* Dynamic Attendee Hero */}
              <div className="po-hero">
                <span className="po-label">Seat Pre-booked For</span>
                <div
                  className={`po-holder ${formData.name.trim() ? 'filled' : ''}`}
                  id="po-holder"
                  aria-live="polite"
                >
                  {displayName}
                </div>
                <div className="po-route">
                  <span>{formData.city || 'Your City'}</span>
                  <i>·</i>
                  <span>2026 Tour</span>
                  <i>·</i>
                  <span className="po-seat-tag">Seat {selectedSeat || 'B4'} Pre-allocated</span>
                </div>
              </div>

              {/* Form: Clean, un-clustered inputs */}
              <form className="po-form" id="po-form" onSubmit={triggerTearAndReserve} noValidate>
                <div className="po-grid">
                  <div className={`po-field ${errors.name ? 'is-err' : ''}`}>
                    <label htmlFor="po-name">Your Full Name</label>
                    <input
                      id="po-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Maya Roy"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div className={`po-field ${errors.city ? 'is-err' : ''}`}>
                    <label htmlFor="po-city">Your City</label>
                    <input
                      id="po-city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Prayagraj, Puri, Mumbai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  {/* Clean Apple-Style Destination Selector */}
                  <div
                    className={`po-field po-apple-select-wrap ${errors.destination ? 'is-err' : ''}`}
                    ref={destDropdownRef}
                  >
                    <label id="po-dest-label" htmlFor="po-dest-btn">Destination World</label>
                    <button
                      type="button"
                      id="po-dest-btn"
                      className={`po-apple-select-btn ${destOpen ? 'is-open' : ''} ${!formData.destination ? 'is-placeholder' : ''}`}
                      onClick={() => setDestOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={destOpen}
                      aria-labelledby="po-dest-label po-dest-btn"
                    >
                      <span className="po-apple-select-val">
                        {formData.destination || 'Choose destination'}
                      </span>
                      <svg
                        className={`po-apple-select-icon ${destOpen ? 'is-open' : ''}`}
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {destOpen && (
                      <div
                        className="po-apple-menu"
                        role="listbox"
                        aria-labelledby="po-dest-label"
                      >
                        <div className="po-apple-menu-header">
                          <span>Available 7D Worlds</span>
                        </div>
                        <div className="po-apple-menu-list">
                          {worlds.map((w) => {
                            const isSelected = formData.destination === w.title;
                            return (
                              <button
                                key={w.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`po-apple-option ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => {
                                  handleInputChange('destination', w.title);
                                  setDestOpen(false);
                                }}
                              >
                                <div className="po-apple-option-info">
                                  <span className="po-apple-option-title">{w.title}</span>
                                  {w.tagline && (
                                    <span className="po-apple-option-sub">{w.tagline}</span>
                                  )}
                                </div>
                                {isSelected && (
                                  <svg
                                    className="po-apple-check"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M3 8.5L6.5 12L13 4"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`po-field ${errors.whatsapp ? 'is-err' : ''}`}>
                    <label htmlFor="po-wa">WhatsApp Number</label>
                    <input
                      id="po-wa"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    />
                  </div>

                  <div className={`po-field ${errors.email ? 'is-err' : ''}`}>
                    <label htmlFor="po-email">Email Address</label>
                    <input
                      id="po-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                {/* Bottom Guidance Strip */}
                <div className="po-actions">
                  <div className="po-tear-hint">
                    <span className="po-hint-dot" aria-hidden="true" />
                    <span>Tear stub to lock in your seat</span>
                    <span className="po-hint-arr" aria-hidden="true">→</span>
                  </div>
                  <span className="po-note">
                    Limited to 150 passes per tour stop · Zero payment required today
                  </span>
                  <button type="submit" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
                </div>
              </form>
            </div>

            {/* ── Vertical Perforation Seam & Die-Cut Notches ── */}
            <div className="po-perf-seam">
              <span className="po-notch notch-top" aria-hidden="true" />
              <div className="po-perf-line" />
              <span className="po-notch notch-bottom" aria-hidden="true" />
            </div>

            {/* ── Tear-off Stub: The Single Hero Action ── */}
            <div
              className="po-stub"
              id="po-stub"
              onClick={stage === 'idle' ? triggerTearAndReserve : undefined}
              title="Click to tear pass and pre-book your seat"
            >
              <div className="po-stub-admit">BOARDING PASS</div>

              <div className="po-stub-mid">
                <span className="po-stub-dest">{formData.destination || '2026 TOUR'}</span>
                <span className="po-stub-seat-number">SEAT {selectedSeat || 'B4'}</span>
                <div className="po-stub-barcode" aria-hidden="true" />
                <span className="po-stub-serial">#TOW-2026</span>
              </div>

              {/* High-Contrast "PRE-BOOK SEAT" Action Badge */}
              <button
                type="button"
                className="po-tear-badge"
                ref={tearBadgeRef}
                aria-label="Tear pass here to pre-book your seat"
                tabIndex={0}
              >
                <span className="po-tear-icon" aria-hidden="true">✂</span>
                <span className="po-tear-label">PRE-BOOK SEAT</span>
              </button>
            </div>
          </>
        ) : (
          /* ── Confirmed State ── */
          <div className="po-confirmed-view" id="po-done">
            {/* Background Watermark */}
            <span className="po-watermark-bg" aria-hidden="true">26</span>

            {/* Top Row: Check Seal & Destination Pill */}
            <div className="po-confirmed-header">
              <div className="po-check-seal">
                <svg className="po-check-svg" viewBox="0 0 52 52" aria-hidden="true">
                  <circle className="po-check-circle" cx="26" cy="26" r="23" fill="none" />
                  <path className="po-check-path" fill="none" d="M14.5 27.2l7.2 7.2 16.5-16.5" />
                </svg>
                <div className="po-check-text">
                  <span className="po-check-title">SEAT PRE-BOOKED</span>
                  <span className="po-check-sub">THEATRE ON WHEELS · 2026 TOUR</span>
                </div>
              </div>

              <span className="po-pill">
                <span className="po-pill-dot" aria-hidden="true" />
                {formData.destination}
              </span>
            </div>

            {/* Main Middle Row: Reference Code, Flow & Details */}
            <div className="po-confirmed-body">
              <div className="po-confirmed-info">
                {/* Big Reference Hero */}
                <div className="po-ref-wrap">
                  <span className="po-ref-label">PASS KEY · PRE-BOOKING REFERENCE</span>
                  <span className="po-ref">{refCode}</span>
                </div>

                {/* Animated Infinite Journey Flow Line */}
                <div className="po-route-flow">
                  <div className="po-route-node">
                    <span className="po-node-ring" />
                    <span className="po-node-name">{formData.city || 'Your City'}</span>
                  </div>

                  <div className="po-flow-track">
                    <svg className="po-flow-svg" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <line x1="0" y1="6" x2="200" y2="6" className="po-flow-track-base" />
                      <line x1="0" y1="6" x2="200" y2="6" className="po-flow-track-moving" />
                    </svg>
                    <div className="po-flow-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M18 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM19 8h-3V4H3v11h1.08a3 3 0 0 1 5.84 0h4.16a3 3 0 0 1 5.84 0H21v-4.5L19 8z" />
                      </svg>
                    </div>
                  </div>

                  <div className="po-route-node">
                    <span className="po-node-ring active" />
                    <span className="po-node-name">{formData.destination}</span>
                  </div>

                  <div className="po-flow-track">
                    <svg className="po-flow-svg" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <line x1="0" y1="6" x2="200" y2="6" className="po-flow-track-base" />
                      <line x1="0" y1="6" x2="200" y2="6" className="po-flow-track-moving" />
                    </svg>
                  </div>

                  <div className="po-route-node">
                    <span className="po-node-ring active" />
                    <span className="po-node-name">Seat {selectedSeat || 'B4'}</span>
                  </div>
                </div>

                {/* Graphic Status Chips */}
                <div className="po-meta-badges">
                  <span className="po-meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    {formData.name.split(/\s+/)[0] || 'Guest'}
                  </span>

                  <span className="po-meta-chip po-chip-wa">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z" />
                    </svg>
                    {formData.whatsapp}
                  </span>

                  <span className="po-meta-chip po-chip-db">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    {syncStatus === 'synced' ? 'Synced to Cloud Database' : 'Saved in Pre-booking Ledger'}
                  </span>
                </div>
              </div>

              {/* Right Side: Security Scanner & Audio Visualizer */}
              <div className="po-confirmed-stub">
                <div className="po-sound-lines" aria-hidden="true">
                  <span className="po-eq-line l1" />
                  <span className="po-eq-line l2" />
                  <span className="po-eq-line l3" />
                  <span className="po-eq-line l4" />
                  <span className="po-eq-line l5" />
                  <span className="po-eq-line l6" />
                  <span className="po-eq-line l7" />
                </div>

                <div className="po-scanner-wrap">
                  <div className="po-confirmed-barcode" aria-hidden="true" />
                  <div className="po-laser-line" aria-hidden="true" />
                </div>

                <span className="po-confirmed-serial">SEAT {selectedSeat || 'B4'} · VERIFIED</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="po-confirmed-footer">
              <button className="po-link" type="button" onClick={handleReset}>
                Pre-book another seat ↺
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
