import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PlacesOfLaunch.css';

const LON0 = 67.5,
  LON1 = 97.5,
  LAT0 = 7.2,
  LAT1 = 37.2;

// Regions
const R = ['North & Central', 'West', 'East', 'South'];

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

const P = [
  [68.2, 23.7],
  [68.8, 24.3],
  [70.1, 24.4],
  [70.2, 25.6],
  [69.5, 26.6],
  [70.3, 27.8],
  [71.9, 27.95],
  [73, 29.2],
  [74.3, 30.1],
  [74.9, 31],
  [74.6, 31.9],
  [75.4, 32.5],
  [74.2, 33.4],
  [73.9, 34.5],
  [74.2, 36],
  [75.1, 37],
  [77.8, 35.5],
  [79.3, 34.9],
  [80.2, 35.4],
  [79.6, 33],
  [78.8, 32.6],
  [78.7, 32.2],
  [79, 31.2],
  [80.2, 30.5],
  [80.5, 30.2],
  [80.1, 29.2],
  [80.1, 28.8],
  [81, 28.2],
  [82.7, 27.5],
  [84, 27.4],
  [85, 26.8],
  [86.5, 26.4],
  [88.1, 26.5],
  [88.1, 27.1],
  [88, 27.9],
  [88.7, 28.1],
  [88.9, 27.3],
  [88.9, 26.9],
  [89.8, 26.7],
  [91.7, 26.8],
  [92.1, 27.8],
  [93, 28.3],
  [94.2, 29],
  [95.4, 29.2],
  [96.2, 29],
  [97, 28.3],
  [96.9, 27.5],
  [97, 27],
  [96, 27.2],
  [95.2, 26.7],
  [95, 26],
  [94.6, 25.2],
  [94.6, 24],
  [93.4, 23],
  [93.2, 22.2],
  [92.6, 22.1],
  [92.3, 23.2],
  [91.7, 22.9],
  [91.2, 23.1],
  [91.5, 24.1],
  [92.3, 24.9],
  [91.9, 25.2],
  [90.5, 25.15],
  [89.9, 25.3],
  [89.8, 26],
  [89, 26.3],
  [88.4, 26.5],
  [88.4, 25.8],
  [88.1, 25.2],
  [88, 24.7],
  [88.7, 24.2],
  [88.9, 23.3],
  [88.7, 22.6],
  [89, 22],
  [88.9, 21.6],
  [88.2, 21.7],
  [87, 21.5],
  [86.9, 20.8],
  [86.7, 20],
  [85.8, 19.7],
  [84.8, 19.1],
  [83.5, 18],
  [82.3, 16.7],
  [81.2, 16],
  [80.3, 15.5],
  [80.1, 14],
  [80.3, 13.1],
  [79.9, 11.7],
  [79.8, 10.4],
  [79.2, 9.2],
  [78.4, 9],
  [78.2, 8.8],
  [77.55, 8.08],
  [76.9, 8.5],
  [76.4, 9.5],
  [75.9, 11],
  [75, 12.3],
  [74.6, 13.5],
  [74.3, 14.8],
  [73.7, 16],
  [73.3, 17.5],
  [72.9, 19],
  [72.7, 20.4],
  [72.7, 21],
  [72.5, 21.7],
  [72.6, 22.3],
  [72.2, 21.9],
  [71, 20.7],
  [70.4, 20.9],
  [69.6, 21.6],
  [69, 22.2],
  [69.8, 22.6],
  [70.4, 22.95],
  [69.5, 22.9],
  [68.8, 23.2],
];

function inside(x, y) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i],
      b = P[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    ) {
      c = !c;
    }
  }
  return c;
}

export default function PlacesOfLaunch({ onSelectCityForPass }) {
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
    dotCol: 'rgba(255, 255, 255, 0.17)',
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

    // 1. Draw light white outline around India map to improve visibility
    g.beginPath();
    for (let i = 0; i < P.length; i++) {
      const px = ((P[i][0] - LON0) / (LON1 - LON0)) * s.W;
      const py = ((LAT1 - P[i][1]) / (LAT1 - LAT0)) * s.H;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    g.lineWidth = 1.2;
    g.lineJoin = 'round';
    g.stroke();

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

    s.cpx = CITIES.map((c) => [
      ((c[2] - LON0) / (LON1 - LON0)) * s.W,
      ((LAT1 - c[1]) / (LAT1 - LAT0)) * s.H,
    ]);

    const step = s.W / 78;
    const newDots = [];
    for (let y = step / 2; y < s.H; y += step) {
      for (let x = step / 2; x < s.W; x += step) {
        if (
          !inside(
            LON0 + (x / s.W) * (LON1 - LON0),
            LAT1 - (y / s.H) * (LAT1 - LAT0)
          )
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
      const d = document.createElement('div');
      d.className = 'c';
      d.style.left =
        'calc(' +
        ((c[2] - LON0) / (LON1 - LON0)) * 100 +
        '% + ' +
        (c[4] || 0) +
        'px)';
      d.style.top =
        'calc(' +
        ((LAT1 - c[1]) / (LAT1 - LAT0)) * 100 +
        '% + ' +
        (c[5] || 0) +
        'px)';
      d.style.setProperty('--dl', ((i * 0.41) % 3.6).toFixed(2) + 's');
      d.innerHTML =
        '<span class="ring"></span><span class="d"></span><span class="hit"></span>';

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

        g.fillStyle = 'rgba(' + s.accRGB + ',' + a.toFixed(2) + ')';
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

          {/* Region Grouped City Chips */}
          <div className="list" id="list">
            {R.map((regionName, ri) => (
              <div className="reg" key={regionName}>
                <h3>{regionName}</h3>
                <div className="chips">
                  {CITIES.map((c, i) => {
                    if (c[3] !== ri) return null;
                    const isSelected = activeCity === i;
                    return (
                      <button
                        key={c[0]}
                        type="button"
                        className={`chip ${isSelected ? 'on' : ''}`}
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
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
