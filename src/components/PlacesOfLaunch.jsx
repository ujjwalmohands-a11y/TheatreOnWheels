import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PlacesOfLaunch.css';

import { STATES, MAP_BOUNDS, projectLatLon } from './indiaMapData';

// Regions – East first so it appears at the top of the list
const R = ['East', 'North & Central', 'West', 'South'];
// Region index mapping (CITIES[i][3] still stores original 0-3 index)
const REGION_ORDER = [2, 0, 1, 3]; // East=2, North&Central=0, West=1, South=3

// Cities that have already been launched (index in CITIES array)
const LAUNCHED_INDICES = new Set([18]); // Puri = index 18
const PURI_INDEX = 18;

// [name, lat, lon, region, nudge x, nudge y (px)]
const CITIES = [
  ['Vrindavan', 27.58, 77.7, 0, -3, -2],
  ['Agra', 27.18, 78.01, 0, 3, 2],
  ['Jaipur', 26.91, 75.79, 0],
  ['Ayodhya', 26.8, 82.2, 0],
  ['Prayagraj', 25.43, 81.85, 0],
  ['Varanasi', 25.32, 83.0, 0],
  ['Ujjain', 23.18, 75.78, 0],
  ['Indore', 22.72, 75.86, 0],
  ['Jaisalmer', 26.92, 70.9, 1],
  ['Udaipur', 24.59, 73.71, 1],
  ['Dwarka', 22.24, 68.97, 1],
  ['Somnath', 20.89, 70.4, 1],
  ['Surat', 21.17, 72.83, 1],
  ['Nashik', 20.0, 73.79, 1],
  ['Pune', 18.52, 73.86, 1],
  ['Deoghar', 24.49, 86.7, 2],
  ['Mayapur', 23.42, 88.39, 2],
  ['Digha', 21.63, 87.55, 2],
  ['Puri', 19.81, 85.83, 2, -3, 2],
  ['Konark', 19.89, 86.09, 2, 3, -2],
  ['Visakhapatnam', 17.69, 83.22, 2],
  ['Hyderabad', 17.39, 78.49, 3],
  ['Srisailam', 16.07, 78.87, 3],
  ['Hampi', 15.34, 76.46, 3],
  ['Tirupati', 13.63, 79.42, 3],
  ['Mysuru', 12.3, 76.64, 3],
  ['Madurai', 9.93, 78.12, 3],
  ['Rameswaram', 9.29, 79.31, 3],
  ['Thiruvananthapuram', 8.52, 76.94, 3],
  ['Kanyakumari', 8.08, 77.54, 3, 2, 2],
];

const ST = [
  'Uttar Pradesh',
  'Uttar Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'Uttar Pradesh',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Rajasthan',
  'Gujarat',
  'Gujarat',
  'Gujarat',
  'Maharashtra',
  'Maharashtra',
  'Jharkhand',
  'West Bengal',
  'West Bengal',
  'Odisha',
  'Odisha',
  'Andhra Pradesh',
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Andhra Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Tamil Nadu',
  'Kerala',
  'Tamil Nadu',
];

// Precise state-level outline (simplemaps India SVG) shared by every state.
const INDIA_PATH_D = STATES.map((st) => st[2]).join('');
const MAP_PAD = 6; // px breathing room inside the stage

export default function PlacesOfLaunch({ onSelectCityForPass }) {
  const puriDebutDoneRef = useRef(false);
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const tagRef = useRef(null);
  const pinsContainerRef = useRef(null);

  const [activeCity, setActiveCity] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Internal mutable state for canvas loop & animation
  const animRef = useRef({
    typer: null,
    act: -1,
    paused: false,
    W: 0,
    H: 0,
    dpr: 1,
    dots: [],
    cpx: [],
    accRGB: '255, 106, 43',
    launchedRGB: '45, 212, 191',
    dotCol: 'rgba(255, 255, 255, 0.17)',
    scale: 1,
    ox: 0,
    oy: 0,
    indiaPath: null,
    pinEls: [],
    chipEls: [],
    rafId: null,
    intervalId: null,
  });

  const onSelectCityRef = useRef(onSelectCityForPass);
  useEffect(() => {
    onSelectCityRef.current = onSelectCityForPass;
  }, [onSelectCityForPass]);

  const getCss = useCallback((prop) => {
    if (!sectionRef.current) return '';
    return getComputedStyle(sectionRef.current).getPropertyValue(prop).trim();
  }, []);

  const placeTag = useCallback(() => {
    const s = animRef.current;
    if (s.act < 0 || !s.W || !tagRef.current) return;
    const c = CITIES[s.act];
    const card = tagRef.current.querySelector('.card');
    if (!card || !s.cpx[s.act]) return;

    const x = s.cpx[s.act][0] + (c[4] || 0);
    const y = s.cpx[s.act][1] + (c[5] || 0);
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;

    card.style.left =
      Math.max(4 - x, Math.min(s.W - x - cw - 4, -cw / 2)) + 'px';
    tagRef.current.classList.toggle('below', y < ch + 32);
    tagRef.current.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }, []);

  const setCity = useCallback(
    (i, isUserAction = false) => {
      const s = animRef.current;
      if (i === null || i === undefined || i < 0) {
        s.act = -1;
        setActiveCity(null);
        s.pinEls.forEach((el) => el && el.classList.remove('on'));
        s.chipEls.forEach((el) => el && el.classList.remove('on'));
        if (tagRef.current) tagRef.current.innerHTML = '';
        return;
      }

      s.act = i;
      setActiveCity(i);

      if (isUserAction && onSelectCityRef.current) {
        onSelectCityRef.current(CITIES[i][0]);
      }

      s.pinEls.forEach((el, k) => el && el.classList.toggle('on', k === i));
      s.chipEls.forEach((el, k) => el && el.classList.toggle('on', k === i));

      const c = CITIES[i];
      if (!tagRef.current) return;

      tagRef.current.innerHTML =
        '<span class="ln"></span><div class="card"><span class="pr">&gt;</span><span class="tx"></span><span class="cur"></span></div>';
      const full =
        '<b>' + c[0] + '</b><span class="st">, ' + ST[i].toLowerCase() + '</span>';
      const tx = tagRef.current.querySelector('.tx');
      const card = tagRef.current.querySelector('.card');
      if (!tx || !card) return;

      tx.innerHTML = full;
      placeTag();
      card.style.width = card.offsetWidth + 'px';
      card.style.textAlign = 'left';

      const plain = c[0] + ', ' + ST[i].toLowerCase();
      let n = 0;
      clearInterval(s.typer);
      tx.textContent = '';
      s.typer = setInterval(() => {
        n++;
        const ct = Math.min(n, c[0].length);
        tx.innerHTML =
          '<b>' +
          c[0].slice(0, ct) +
          '</b>' +
          (n > c[0].length
            ? '<span class="st">' + plain.slice(c[0].length, n) + '</span>'
            : '');
        if (n >= plain.length) clearInterval(s.typer);
      }, 22);
    },
    [placeTag]
  );

  const paintBase = useCallback(() => {
    const s = animRef.current;
    if (!baseCanvasRef.current) return;
    s.dotCol = getCss('--dot') || 'rgba(255, 255, 255, 0.17)';
    s.accRGB = getCss('--acc-rgb') || '255, 106, 43';

    const g = baseCanvasRef.current.getContext('2d');
    if (!g) return;
    g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    g.clearRect(0, 0, s.W, s.H);

    const path = s.indiaPath;
    if (path) {
      // 1a. Faint internal state borders, clipped to the landmass
      g.save();
      g.setTransform(s.dpr * s.scale, 0, 0, s.dpr * s.scale, s.dpr * s.ox, s.dpr * s.oy);
      g.clip(path);
      g.strokeStyle = 'rgba(255, 255, 255, 0.085)';
      g.lineWidth = 0.7 / s.scale;
      g.lineJoin = 'round';
      g.stroke(path);
      g.restore();

      // 1b. Outer coastline / border only: stroke, then knock out the interior
      const off = document.createElement('canvas');
      off.width = baseCanvasRef.current.width;
      off.height = baseCanvasRef.current.height;
      const o = off.getContext('2d');
      if (o) {
        o.setTransform(s.dpr * s.scale, 0, 0, s.dpr * s.scale, s.dpr * s.ox, s.dpr * s.oy);
        o.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        o.lineWidth = 2.4 / s.scale;
        o.lineJoin = 'round';
        o.stroke(path);
        o.globalCompositeOperation = 'destination-out';
        o.fill(path);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(off, 0, 0);
        g.restore();
      }
    }

    // 2. Draw matrix dots
    g.fillStyle = s.dotCol;
    const r = s.dots.s * 0.21;
    g.beginPath();
    for (const d of s.dots) {
      g.moveTo(d[0] + r, d[1]);
      g.arc(d[0], d[1], r, 0, 6.283);
    }
    g.fill();
  }, [getCss]);

  const build = useCallback(() => {
    const stage = stageRef.current;
    const base = baseCanvasRef.current;
    const fx = fxCanvasRef.current;
    if (!stage || !base || !fx) return;

    const s = animRef.current;
    s.dpr = Math.min(window.devicePixelRatio || 1, 2);
    s.W = stage.clientWidth;
    s.H = stage.clientHeight;

    for (const c of [base, fx]) {
      c.width = s.W * s.dpr;
      c.height = s.H * s.dpr;
    }

    // Fit the SVG map bounds into the stage, preserving aspect ratio
    const bw = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
    const bh = MAP_BOUNDS.maxY - MAP_BOUNDS.minY;
    s.scale = Math.min((s.W - MAP_PAD * 2) / bw, (s.H - MAP_PAD * 2) / bh);
    s.ox = (s.W - bw * s.scale) / 2 - MAP_BOUNDS.minX * s.scale;
    s.oy = (s.H - bh * s.scale) / 2 - MAP_BOUNDS.minY * s.scale;
    if (!s.indiaPath) s.indiaPath = new Path2D(INDIA_PATH_D);

    s.cpx = CITIES.map((c) => {
      const [mx, my] = projectLatLon(c[1], c[2]);
      return [s.ox + mx * s.scale, s.oy + my * s.scale];
    });

    // Position the DOM pins in px so they match the canvas exactly
    s.pinEls.forEach((el, i) => {
      if (!el || !s.cpx[i]) return;
      el.style.left = s.cpx[i][0] + (CITIES[i][4] || 0) + 'px';
      el.style.top = s.cpx[i][1] + (CITIES[i][5] || 0) + 'px';
    });

    const hit = base.getContext('2d');
    if (hit) hit.setTransform(1, 0, 0, 1, 0, 0);
    const step = s.W / 78;
    const newDots = [];
    for (let y = step / 2; y < s.H; y += step) {
      for (let x = step / 2; x < s.W; x += step) {
        if (
          !hit ||
          !hit.isPointInPath(s.indiaPath, (x - s.ox) / s.scale, (y - s.oy) / s.scale)
        )
          continue;
        let bi = 0,
          bd = 1e9;
        for (let k = 0; k < s.cpx.length; k++) {
          const d = Math.hypot(x - s.cpx[k][0], y - s.cpx[k][1]);
          if (d < bd) {
            bd = d;
            bi = k;
          }
        }
        newDots.push([x, y, bi, bd]);
      }
    }
    newDots.s = step;
    s.dots = newDots;

    paintBase();
    placeTag();
  }, [paintBase, placeTag]);

  // Main canvas animation and pins initialization
  useEffect(() => {
    const s = animRef.current;
    const pinsContainer = pinsContainerRef.current;
    if (!pinsContainer) return;

    // Create pins elements
    pinsContainer.innerHTML = '';
    s.pinEls = CITIES.map((c, i) => {
      const isLaunched = LAUNCHED_INDICES.has(i);
      const d = document.createElement('div');
      d.className = 'c' + (isLaunched ? ' launched' : '');
      d.style.setProperty('--dl', ((i * 0.41) % 3.6).toFixed(2) + 's');
      // Puri gets a star marker; others get the regular dot
      if (isLaunched) {
        d.innerHTML =
          '<span class="ring"></span><span class="d star-pin"></span><span class="hit"></span>';
      } else {
        d.innerHTML =
          '<span class="ring"></span><span class="d"></span><span class="hit"></span>';
      }

      const hit = d.querySelector('.hit');
      if (hit) {
        hit.onmouseenter = () => {
          s.paused = true;
          setCity(i, true);
        };
        hit.onmouseleave = () => {
          s.paused = false;
        };
        hit.onclick = (e) => {
          e.stopPropagation();
          setCity(i, true);
        };
      }
      pinsContainer.appendChild(d);
      return d;
    });

    // Auto-select Puri on first mount with debut animation
    if (!puriDebutDoneRef.current) {
      puriDebutDoneRef.current = true;
      setTimeout(() => {
        setCity(PURI_INDEX, false);
        // Trigger debut class on Puri pin
        const puriPin = s.pinEls[PURI_INDEX];
        if (puriPin) {
          puriPin.classList.add('debut');
          setTimeout(() => puriPin.classList.remove('debut'), 2400);
        }
      }, 600);
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Pulse animation frame
    function frame(t) {
      if (!fxCanvasRef.current) return;
      const g = fxCanvasRef.current.getContext('2d');
      if (!g) return;

      g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      g.clearRect(0, 0, s.W, s.H);

      const maxR = s.W * 0.085;
      const sig = s.W * 0.007;
      const r0 = s.dots.s * 0.21;

      for (const d of s.dots) {
        if (d[3] > maxR + sig * 3) continue;
        const ph = (t / 3800 + d[2] * 0.137) % 1;
        const k = (d[3] - ph * maxR) / sig;
        const a =
          Math.exp(-k * k) *
          Math.min(1, ph * 8) *
          Math.pow(1 - ph, 1.5) *
          (d[2] === s.act ? 0.9 : 0.5);
        if (a < 0.06) continue;

        // Launched cities (Puri) use teal; upcoming use orange
        const rgb = LAUNCHED_INDICES.has(d[2]) ? s.launchedRGB : s.accRGB;
        g.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(2) + ')';
        g.beginPath();
        g.arc(d[0], d[1], r0 * (1 + a * 0.35), 0, 6.283);
        g.fill();
      }
      s.rafId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      build();
    });
    if (stageRef.current) {
      ro.observe(stageRef.current);
    }

    build();

    if (!reduce) {
      s.rafId = requestAnimationFrame(frame);
    }

    return () => {
      ro.disconnect();
      if (s.rafId) cancelAnimationFrame(s.rafId);
      if (s.intervalId) clearInterval(s.intervalId);
      if (s.typer) clearInterval(s.typer);
    };
  }, [build, setCity]);

  // Handle previous and next navigation (ideal for mobile pixelated arrows)
  const handlePrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      animRef.current.paused = true;
      const nextIndex = (animRef.current.act - 1 + CITIES.length) % CITIES.length;
      setCity(nextIndex, true);
      setTimeout(() => {
        animRef.current.paused = false;
      }, 3500);
    },
    [setCity]
  );

  const handleNext = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      animRef.current.paused = true;
      const nextIndex = (animRef.current.act + 1) % CITIES.length;
      setCity(nextIndex, true);
      setTimeout(() => {
        animRef.current.paused = false;
      }, 3500);
    },
    [setCity]
  );

  // Toggle theme button
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setTimeout(() => {
      paintBase();
    }, 40);
  };

  return (
    <section
      id="places-of-launch"
      className="launch-map-section"
      ref={sectionRef}
      data-theme={theme}
    >
      <div className="wrap">
        <header>
          <div>
            <h1>Launching across India</h1>
            <p className="sub" id="sub">
              {CITIES.length} cities across {R.length} regions
            </p>
          </div>
        </header>

        {/* Color legend */}
        <div className="launch-legend">
          <span className="legend-item legend-launched">
            <span className="legend-dot" />
            Already Launched
          </span>
          <span className="legend-item legend-upcoming">
            <span className="legend-dot" />
            Upcoming Launch
          </span>
        </div>

        <div className="grid">
          {/* Map Stage & Mobile Controls */}
          <div className="stage-column">
            <div className="stage" id="stage" ref={stageRef}>
              <canvas id="base" ref={baseCanvasRef} />
              <canvas id="fx" ref={fxCanvasRef} />
              <div className="pins" id="pins" ref={pinsContainerRef} />
              <div className="tag" id="tag" ref={tagRef} />
            </div>

            {/* Dedicated Mobile Pixelated Controller Toolbar */}
            <div className="mobile-pixel-toolbar" aria-label="Mobile Location Stepper">
              <button
                type="button"
                className="pixel-btn-stepper prev"
                onClick={handlePrev}
                aria-label="Previous City"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  shapeRendering="crispEdges"
                >
                  <rect x="7" y="1" width="2" height="2" fill="currentColor" />
                  <rect x="5" y="3" width="2" height="2" fill="currentColor" />
                  <rect x="3" y="5" width="2" height="2" fill="currentColor" />
                  <rect x="1" y="7" width="2" height="2" fill="currentColor" />
                  <rect x="3" y="9" width="2" height="2" fill="currentColor" />
                  <rect x="5" y="11" width="2" height="2" fill="currentColor" />
                  <rect x="7" y="13" width="2" height="2" fill="currentColor" />
                  <rect x="3" y="7" width="10" height="2" fill="currentColor" />
                </svg>
                <span>PREV</span>
              </button>

              <div className="pixel-counter-display">
                <span className="pixel-counter-current">
                  {String(activeCity + 1).padStart(2, '0')}
                </span>
                <span className="pixel-counter-sep">/</span>
                <span>{String(CITIES.length).padStart(2, '0')}</span>
              </div>

              <button
                type="button"
                className="pixel-btn-stepper next"
                onClick={handleNext}
                aria-label="Next City"
              >
                <span>NEXT</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  shapeRendering="crispEdges"
                >
                  <rect x="7" y="1" width="2" height="2" fill="currentColor" />
                  <rect x="9" y="3" width="2" height="2" fill="currentColor" />
                  <rect x="11" y="5" width="2" height="2" fill="currentColor" />
                  <rect x="13" y="7" width="2" height="2" fill="currentColor" />
                  <rect x="11" y="9" width="2" height="2" fill="currentColor" />
                  <rect x="9" y="11" width="2" height="2" fill="currentColor" />
                  <rect x="7" y="13" width="2" height="2" fill="currentColor" />
                  <rect x="3" y="7" width="10" height="2" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Region Grouped City Chips – East first */}
          <div className="list" id="list">
            {REGION_ORDER.map((regionIdx) => {
              const regionName = ['North & Central', 'West', 'East', 'South'][regionIdx];
              return (
                <div className="reg" key={regionName}>
                  <h3>{regionName}</h3>
                  <div className="chips">
                    {CITIES.map((c, i) => {
                      if (c[3] !== regionIdx) return null;
                      const isSelected = activeCity === i;
                      const isLaunched = LAUNCHED_INDICES.has(i);
                      return (
                        <button
                          key={c[0]}
                          type="button"
                          className={`chip ${isSelected ? 'on' : ''} ${isLaunched ? 'launched' : ''}`}
                          title={ST[i]}
                          ref={(el) => {
                            animRef.current.chipEls[i] = el;
                          }}
                          onMouseEnter={() => {
                            animRef.current.paused = true;
                            setCity(i, true);
                          }}
                          onMouseLeave={() => {
                            animRef.current.paused = false;
                          }}
                          onFocus={() => {
                            animRef.current.paused = true;
                            setCity(i, true);
                          }}
                          onBlur={() => {
                            animRef.current.paused = false;
                          }}
                          onClick={() => {
                            animRef.current.paused = true;
                            setCity(i, true);
                          }}
                        >
                          {c[0]}
                          {isLaunched && <span className="launched-badge">✦ Live</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
