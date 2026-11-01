import React from 'react';
import './RecognitionBadges.css';

export default function RecognitionBadges() {
  return (
    <section className="recognition" id="recognition">
      <span id="achievements" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />
      <div className="head">
        <h2>ACCREDITATION & ACHIEVEMENTS</h2>
        <i />
      </div>

      <div className="badges">
        {/* Badge 1: IIT Bhubaneswar */}
        <div className="badge-item gold">
          <svg className="badge gold" viewBox="0 0 200 200" role="img" aria-label="IIT Bhubaneswar">
            <defs>
              <radialGradient id="ga" cx=".5" cy=".3" r=".8">
                <stop offset="0" stopColor="var(--c)" stopOpacity=".22" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".02" />
              </radialGradient>
              <linearGradient id="sa" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--c)" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".15" />
              </linearGradient>
              <path id="pa" d="M20,100 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
            </defs>
            <circle className="aura" cx="100" cy="100" r="70" fill="var(--c)" />
            <g className="tick">
              <line x1="188.00" y1="100.00" x2="193.00" y2="100.00" />
              <line x1="187.52" y1="109.20" x2="190.50" y2="109.51" />
              <line x1="186.08" y1="118.30" x2="189.01" y2="118.92" />
              <line x1="183.69" y1="127.19" x2="186.55" y2="128.12" />
              <line x1="180.39" y1="135.79" x2="183.13" y2="137.01" />
              <line x1="176.21" y1="144.00" x2="180.54" y2="146.50" />
              <line x1="171.19" y1="151.73" x2="173.62" y2="153.49" />
              <line x1="165.40" y1="158.88" x2="167.63" y2="160.89" />
              <line x1="158.88" y1="165.40" x2="160.89" y2="167.63" />
              <line x1="151.73" y1="171.19" x2="153.49" y2="173.62" />
              <line x1="144.00" y1="176.21" x2="146.50" y2="180.54" />
              <line x1="135.79" y1="180.39" x2="137.01" y2="183.13" />
              <line x1="127.19" y1="183.69" x2="128.12" y2="186.55" />
              <line x1="118.30" y1="186.08" x2="118.92" y2="189.01" />
              <line x1="109.20" y1="187.52" x2="109.51" y2="190.50" />
              <line x1="100.00" y1="188.00" x2="100.00" y2="193.00" />
              <line x1="90.80" y1="187.52" x2="90.49" y2="190.50" />
              <line x1="81.70" y1="186.08" x2="81.08" y2="189.01" />
              <line x1="72.81" y1="183.69" x2="71.88" y2="186.55" />
              <line x1="64.21" y1="180.39" x2="62.99" y2="183.13" />
              <line x1="56.00" y1="176.21" x2="53.50" y2="180.54" />
              <line x1="48.27" y1="171.19" x2="46.51" y2="173.62" />
              <line x1="41.12" y1="165.40" x2="39.11" y2="167.63" />
              <line x1="34.60" y1="158.88" x2="32.37" y2="160.89" />
              <line x1="28.81" y1="151.73" x2="26.38" y2="153.49" />
              <line x1="23.79" y1="144.00" x2="19.46" y2="146.50" />
              <line x1="19.61" y1="135.79" x2="16.87" y2="137.01" />
              <line x1="16.31" y1="127.19" x2="13.45" y2="128.12" />
              <line x1="13.92" y1="118.30" x2="10.99" y2="118.92" />
              <line x1="12.48" y1="109.20" x2="9.50" y2="109.51" />
              <line x1="12.00" y1="100.00" x2="7.00" y2="100.00" />
              <line x1="12.48" y1="90.80" x2="9.50" y2="90.49" />
              <line x1="13.92" y1="81.70" x2="10.99" y2="81.08" />
              <line x1="16.31" y1="72.81" x2="13.45" y2="71.88" />
              <line x1="19.61" y1="64.21" x2="16.87" y2="62.99" />
              <line x1="23.79" y1="56.00" x2="19.46" y2="53.50" />
              <line x1="28.81" y1="48.27" x2="26.38" y2="46.51" />
              <line x1="34.60" y1="41.12" x2="32.37" y2="39.11" />
              <line x1="41.12" y1="34.60" x2="39.11" y2="32.37" />
              <line x1="48.27" y1="28.81" x2="46.51" y2="26.38" />
              <line x1="56.00" y1="23.79" x2="53.50" y2="19.46" />
              <line x1="64.21" y1="19.61" x2="62.99" y2="16.87" />
              <line x1="72.81" y1="16.31" x2="71.88" y2="13.45" />
              <line x1="81.70" y1="13.92" x2="81.08" y2="10.99" />
              <line x1="90.80" y1="12.48" x2="90.49" y2="9.50" />
              <line x1="100.00" y1="12.00" x2="100.00" y2="7.00" />
              <line x1="109.20" y1="12.48" x2="109.51" y2="9.50" />
              <line x1="118.30" y1="13.92" x2="118.92" y2="10.99" />
              <line x1="127.19" y1="16.31" x2="128.12" y2="13.45" />
              <line x1="135.79" y1="19.61" x2="137.01" y2="16.87" />
              <line x1="144.00" y1="23.79" x2="146.50" y2="19.46" />
              <line x1="151.73" y1="28.81" x2="153.49" y2="26.38" />
              <line x1="158.88" y1="34.60" x2="160.89" y2="32.37" />
              <line x1="165.40" y1="41.12" x2="167.63" y2="39.11" />
              <line x1="171.19" y1="48.27" x2="173.62" y2="46.51" />
              <line x1="176.21" y1="56.00" x2="180.54" y2="53.50" />
              <line x1="180.39" y1="64.21" x2="183.13" y2="62.99" />
              <line x1="183.69" y1="72.81" x2="186.55" y2="71.88" />
              <line x1="186.08" y1="81.70" x2="189.01" y2="81.08" />
              <line x1="187.52" y1="90.80" x2="190.50" y2="90.49" />
            </g>
            <circle cx="100" cy="100" r="96" className="hair" />
            <g className="spin rev" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="100" r="96" className="sweep" />
            </g>
            <g className="spin orbit" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="4" r="2.6" className="dot" />
            </g>
            <g className="spin ring" style={{ transformOrigin: '100px 100px' }}>
              <text className="rtxt" textLength="496" lengthAdjust="spacing">
                <textPath href="#pa" startOffset="0">
                  IIT BHUBANESWAR · INCUBATED · IIT BHUBANESWAR · INCUBATED ·{' '}
                </textPath>
              </text>
            </g>
            <circle cx="100" cy="100" r="64" fill="url(#ga)" stroke="url(#sa)" strokeWidth="1" />
            <g className="icon">
              <g className="breathe" style={{ transformOrigin: '100px 78px' }}>
                {/* Official IIT Bhubaneswar Kalinga Temple Emblem */}
                <circle cx="100" cy="78" r="17" fill="none" stroke="var(--c)" strokeWidth="0.8" strokeDasharray="2 2.5" opacity="0.45" />

                {/* Sacred Kalasa & Amalaka Crown Finial */}
                <circle cx="100" cy="62.5" r="1.5" className="fill" />
                <line x1="100" y1="60.5" x2="100" y2="63.5" strokeWidth="1.2" />
                <ellipse cx="100" cy="65" rx="3.2" ry="1.2" className="fill" opacity="0.85" />

                {/* Kalinga Rekha Deula (Temple Spire Body) */}
                <path
                  d="M97.5 66 C97 70, 95.5 76, 94.5 86 L105.5 86 C104.5 76, 103 70, 102.5 66 Z"
                  className="fillsoft"
                  strokeWidth="1.3"
                />

                {/* Horizontal Temple Tier Rhythms (Pidha Mouldings) */}
                <line x1="97" y1="69.5" x2="103" y2="69.5" strokeWidth="1" />
                <line x1="96.2" y1="73.5" x2="103.8" y2="73.5" strokeWidth="1" />
                <line x1="95.5" y1="77.5" x2="104.5" y2="77.5" strokeWidth="1" />
                <line x1="95" y1="81.5" x2="105" y2="81.5" strokeWidth="1" />

                {/* Sanctum Portal Entrance / Inner Sanctum */}
                <path d="M98 86 L98 81 C98 79.5 102 79.5 102 81 L102 86 Z" className="fill" />

                {/* Foundation Plinth Base */}
                <line x1="91" y1="86" x2="109" y2="86" strokeWidth="1.4" />
                <line x1="93" y1="88.5" x2="107" y2="88.5" strokeWidth="1" opacity="0.75" />

                {/* Radiating Wisdom & Science Flares */}
                <line x1="91" y1="67" x2="88" y2="64" strokeWidth="1" opacity="0.6" />
                <line x1="88" y1="73" x2="84" y2="72" strokeWidth="1" opacity="0.6" />
                <line x1="109" y1="67" x2="112" y2="64" strokeWidth="1" opacity="0.6" />
                <line x1="112" y1="73" x2="116" y2="72" strokeWidth="1" opacity="0.6" />
              </g>
            </g>
            <text x="100" y="118" textAnchor="middle" className="l1">
              IIT
            </text>
            <text x="100" y="131" textAnchor="middle" className="l2">
              BHUBANESWAR
            </text>
            <line x1="88" y1="141" x2="112" y2="141" className="hair2" />
          </svg>
          <p>
            <span className="cap-dot" />
            <b>Incubated at</b>IIT Bhubaneswar
            <span className="badge-batch">Cohort 2023–24</span>
          </p>
        </div>

        {/* Badge 2: Startup India */}
        <div className="badge-item saffron">
          <svg className="badge saffron" viewBox="0 0 200 200" role="img" aria-label="Startup India">
            <defs>
              <radialGradient id="gb" cx=".5" cy=".3" r=".8">
                <stop offset="0" stopColor="var(--c)" stopOpacity=".22" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".02" />
              </radialGradient>
              <linearGradient id="sb" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--c)" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".15" />
              </linearGradient>
              <path id="pb" d="M20,100 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
            </defs>
            <circle className="aura" cx="100" cy="100" r="70" fill="var(--c)" />
            <g className="tick">
              <line x1="188.00" y1="100.00" x2="193.00" y2="100.00" />
              <line x1="187.52" y1="109.20" x2="190.50" y2="109.51" />
              <line x1="186.08" y1="118.30" x2="189.01" y2="118.92" />
              <line x1="183.69" y1="127.19" x2="186.55" y2="128.12" />
              <line x1="180.39" y1="135.79" x2="183.13" y2="137.01" />
              <line x1="176.21" y1="144.00" x2="180.54" y2="146.50" />
              <line x1="171.19" y1="151.73" x2="173.62" y2="153.49" />
              <line x1="165.40" y1="158.88" x2="167.63" y2="160.89" />
              <line x1="158.88" y1="165.40" x2="160.89" y2="167.63" />
              <line x1="151.73" y1="171.19" x2="153.49" y2="173.62" />
              <line x1="144.00" y1="176.21" x2="146.50" y2="180.54" />
              <line x1="135.79" y1="180.39" x2="137.01" y2="183.13" />
              <line x1="127.19" y1="183.69" x2="128.12" y2="186.55" />
              <line x1="118.30" y1="186.08" x2="118.92" y2="189.01" />
              <line x1="109.20" y1="187.52" x2="109.51" y2="190.50" />
              <line x1="100.00" y1="188.00" x2="100.00" y2="193.00" />
              <line x1="90.80" y1="187.52" x2="90.49" y2="190.50" />
              <line x1="81.70" y1="186.08" x2="81.08" y2="189.01" />
              <line x1="72.81" y1="183.69" x2="71.88" y2="186.55" />
              <line x1="64.21" y1="180.39" x2="62.99" y2="183.13" />
              <line x1="56.00" y1="176.21" x2="53.50" y2="180.54" />
              <line x1="48.27" y1="171.19" x2="46.51" y2="173.62" />
              <line x1="41.12" y1="165.40" x2="39.11" y2="167.63" />
              <line x1="34.60" y1="158.88" x2="32.37" y2="160.89" />
              <line x1="28.81" y1="151.73" x2="26.38" y2="153.49" />
              <line x1="23.79" y1="144.00" x2="19.46" y2="146.50" />
              <line x1="19.61" y1="135.79" x2="16.87" y2="137.01" />
              <line x1="16.31" y1="127.19" x2="13.45" y2="128.12" />
              <line x1="13.92" y1="118.30" x2="10.99" y2="118.92" />
              <line x1="12.48" y1="109.20" x2="9.50" y2="109.51" />
              <line x1="12.00" y1="100.00" x2="7.00" y2="100.00" />
              <line x1="12.48" y1="90.80" x2="9.50" y2="90.49" />
              <line x1="13.92" y1="81.70" x2="10.99" y2="81.08" />
              <line x1="16.31" y1="72.81" x2="13.45" y2="71.88" />
              <line x1="19.61" y1="64.21" x2="16.87" y2="62.99" />
              <line x1="23.79" y1="56.00" x2="19.46" y2="53.50" />
              <line x1="28.81" y1="48.27" x2="26.38" y2="46.51" />
              <line x1="34.60" y1="41.12" x2="32.37" y2="39.11" />
              <line x1="41.12" y1="34.60" x2="39.11" y2="32.37" />
              <line x1="48.27" y1="28.81" x2="46.51" y2="26.38" />
              <line x1="56.00" y1="23.79" x2="53.50" y2="19.46" />
              <line x1="64.21" y1="19.61" x2="62.99" y2="16.87" />
              <line x1="72.81" y1="16.31" x2="71.88" y2="13.45" />
              <line x1="81.70" y1="13.92" x2="81.08" y2="10.99" />
              <line x1="90.80" y1="12.48" x2="90.49" y2="9.50" />
              <line x1="100.00" y1="12.00" x2="100.00" y2="7.00" />
              <line x1="109.20" y1="12.48" x2="109.51" y2="9.50" />
              <line x1="118.30" y1="13.92" x2="118.92" y2="10.99" />
              <line x1="127.19" y1="16.31" x2="128.12" y2="13.45" />
              <line x1="135.79" y1="19.61" x2="137.01" y2="16.87" />
              <line x1="144.00" y1="23.79" x2="146.50" y2="19.46" />
              <line x1="151.73" y1="28.81" x2="153.49" y2="26.38" />
              <line x1="158.88" y1="34.60" x2="160.89" y2="32.37" />
              <line x1="165.40" y1="41.12" x2="167.63" y2="39.11" />
              <line x1="171.19" y1="48.27" x2="173.62" y2="46.51" />
              <line x1="176.21" y1="56.00" x2="180.54" y2="53.50" />
              <line x1="180.39" y1="64.21" x2="183.13" y2="62.99" />
              <line x1="183.69" y1="72.81" x2="186.55" y2="71.88" />
              <line x1="186.08" y1="81.70" x2="189.01" y2="81.08" />
              <line x1="187.52" y1="90.80" x2="190.50" y2="90.49" />
            </g>
            <circle cx="100" cy="100" r="96" className="hair" />
            <g className="spin rev" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="100" r="96" className="sweep" />
            </g>
            <g className="spin orbit" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="4" r="2.6" className="dot" />
            </g>
            <g className="spin ring" style={{ transformOrigin: '100px 100px' }}>
              <text className="rtxt" textLength="496" lengthAdjust="spacing">
                <textPath href="#pb" startOffset="0">
                  STARTUP INDIA · RECOGNISED · STARTUP INDIA · RECOGNISED ·{' '}
                </textPath>
              </text>
            </g>
            <circle cx="100" cy="100" r="64" fill="url(#gb)" stroke="url(#sb)" strokeWidth="1" />
            <g className="icon">
              <g className="breathe" style={{ transformOrigin: '100px 78px' }}>
                {/* Official Startup India Mark: Hashtag + Ascending Flight Arrow */}
                {/* Official Hashtag '#' Symbol */}
                <g opacity="0.95" strokeWidth="1.6">
                  <line x1="85" y1="74" x2="94" y2="74" />
                  <line x1="84" y1="80" x2="93" y2="80" />
                  <line x1="88" y1="69" x2="86" y2="85" />
                  <line x1="92" y1="69" x2="90" y2="85" />
                </g>

                {/* Startup India Ascending Arrowhead / Growth Chevron */}
                <path
                  d="M102 63 L115 74 L110 74 L110 83 L104 83 L104 77 L98 77 L98 74 L102 74 Z"
                  className="fill"
                />
                {/* Stepped Scale Chevron Accent */}
                <path
                  d="M102 67.5 L109 73.5 L106.5 73.5 L102 69.5 L97.5 73.5 L95 73.5 Z"
                  fill="#ffffff"
                  stroke="none"
                  opacity="0.85"
                />

                {/* Horizon Launch Line & Dynamic Node */}
                <line x1="83" y1="87" x2="117" y2="87" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
                <circle cx="114" cy="87" r="1.5" className="fill" />
              </g>
            </g>
            <text x="100" y="118" textAnchor="middle" className="l1">
              STARTUP
            </text>
            <text x="100" y="131" textAnchor="middle" className="l2">
              INDIA
            </text>
            <line x1="88" y1="141" x2="112" y2="141" className="hair2" />
          </svg>
          <p>
            <span className="cap-dot" />
            <b>Recognised by</b>Startup India
            <span className="badge-batch">DPIIT National</span>
          </p>
        </div>

        {/* Badge 3: Startup Odisha */}
        <div className="badge-item teal">
          <svg className="badge teal" viewBox="0 0 200 200" role="img" aria-label="Startup Odisha">
            <defs>
              <radialGradient id="gc" cx=".5" cy=".3" r=".8">
                <stop offset="0" stopColor="var(--c)" stopOpacity=".22" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".02" />
              </radialGradient>
              <linearGradient id="sc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--c)" />
                <stop offset="1" stopColor="var(--c)" stopOpacity=".15" />
              </linearGradient>
              <path id="pc" d="M20,100 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
            </defs>
            <circle className="aura" cx="100" cy="100" r="70" fill="var(--c)" />
            <g className="tick">
              <line x1="188.00" y1="100.00" x2="193.00" y2="100.00" />
              <line x1="187.52" y1="109.20" x2="190.50" y2="109.51" />
              <line x1="186.08" y1="118.30" x2="189.01" y2="118.92" />
              <line x1="183.69" y1="127.19" x2="186.55" y2="128.12" />
              <line x1="180.39" y1="135.79" x2="183.13" y2="137.01" />
              <line x1="176.21" y1="144.00" x2="180.54" y2="146.50" />
              <line x1="171.19" y1="151.73" x2="173.62" y2="153.49" />
              <line x1="165.40" y1="158.88" x2="167.63" y2="160.89" />
              <line x1="158.88" y1="165.40" x2="160.89" y2="167.63" />
              <line x1="151.73" y1="171.19" x2="153.49" y2="173.62" />
              <line x1="144.00" y1="176.21" x2="146.50" y2="180.54" />
              <line x1="135.79" y1="180.39" x2="137.01" y2="183.13" />
              <line x1="127.19" y1="183.69" x2="128.12" y2="186.55" />
              <line x1="118.30" y1="186.08" x2="118.92" y2="189.01" />
              <line x1="109.20" y1="187.52" x2="109.51" y2="190.50" />
              <line x1="100.00" y1="188.00" x2="100.00" y2="193.00" />
              <line x1="90.80" y1="187.52" x2="90.49" y2="190.50" />
              <line x1="81.70" y1="186.08" x2="81.08" y2="189.01" />
              <line x1="72.81" y1="183.69" x2="71.88" y2="186.55" />
              <line x1="64.21" y1="180.39" x2="62.99" y2="183.13" />
              <line x1="56.00" y1="176.21" x2="53.50" y2="180.54" />
              <line x1="48.27" y1="171.19" x2="46.51" y2="173.62" />
              <line x1="41.12" y1="165.40" x2="39.11" y2="167.63" />
              <line x1="34.60" y1="158.88" x2="32.37" y2="160.89" />
              <line x1="28.81" y1="151.73" x2="26.38" y2="153.49" />
              <line x1="23.79" y1="144.00" x2="19.46" y2="146.50" />
              <line x1="19.61" y1="135.79" x2="16.87" y2="137.01" />
              <line x1="16.31" y1="127.19" x2="13.45" y2="128.12" />
              <line x1="13.92" y1="118.30" x2="10.99" y2="118.92" />
              <line x1="12.48" y1="109.20" x2="9.50" y2="109.51" />
              <line x1="12.00" y1="100.00" x2="7.00" y2="100.00" />
              <line x1="12.48" y1="90.80" x2="9.50" y2="90.49" />
              <line x1="13.92" y1="81.70" x2="10.99" y2="81.08" />
              <line x1="16.31" y1="72.81" x2="13.45" y2="71.88" />
              <line x1="19.61" y1="64.21" x2="16.87" y2="62.99" />
              <line x1="23.79" y1="56.00" x2="19.46" y2="53.50" />
              <line x1="28.81" y1="48.27" x2="26.38" y2="46.51" />
              <line x1="34.60" y1="41.12" x2="32.37" y2="39.11" />
              <line x1="41.12" y1="34.60" x2="39.11" y2="32.37" />
              <line x1="48.27" y1="28.81" x2="46.51" y2="26.38" />
              <line x1="56.00" y1="23.79" x2="53.50" y2="19.46" />
              <line x1="64.21" y1="19.61" x2="62.99" y2="16.87" />
              <line x1="72.81" y1="16.31" x2="71.88" y2="13.45" />
              <line x1="81.70" y1="13.92" x2="81.08" y2="10.99" />
              <line x1="90.80" y1="12.48" x2="90.49" y2="9.50" />
              <line x1="100.00" y1="12.00" x2="100.00" y2="7.00" />
              <line x1="109.20" y1="12.48" x2="109.51" y2="9.50" />
              <line x1="118.30" y1="13.92" x2="118.92" y2="10.99" />
              <line x1="127.19" y1="16.31" x2="128.12" y2="13.45" />
              <line x1="135.79" y1="19.61" x2="137.01" y2="16.87" />
              <line x1="144.00" y1="23.79" x2="146.50" y2="19.46" />
              <line x1="151.73" y1="28.81" x2="153.49" y2="26.38" />
              <line x1="158.88" y1="34.60" x2="160.89" y2="32.37" />
              <line x1="165.40" y1="41.12" x2="167.63" y2="39.11" />
              <line x1="171.19" y1="48.27" x2="173.62" y2="46.51" />
              <line x1="176.21" y1="56.00" x2="180.54" y2="53.50" />
              <line x1="180.39" y1="64.21" x2="183.13" y2="62.99" />
              <line x1="183.69" y1="72.81" x2="186.55" y2="71.88" />
              <line x1="186.08" y1="81.70" x2="189.01" y2="81.08" />
              <line x1="187.52" y1="90.80" x2="190.50" y2="90.49" />
            </g>
            <circle cx="100" cy="100" r="96" className="hair" />
            <g className="spin rev" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="100" r="96" className="sweep" />
            </g>
            <g className="spin orbit" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="4" r="2.6" className="dot" />
            </g>
            <g className="spin ring" style={{ transformOrigin: '100px 100px' }}>
              <text className="rtxt" textLength="496" lengthAdjust="spacing">
                <textPath href="#pc" startOffset="0">
                  STARTUP ODISHA · RECOGNISED · STARTUP ODISHA · RECOGNISED ·{' '}
                </textPath>
              </text>
            </g>
            <circle cx="100" cy="100" r="64" fill="url(#gc)" stroke="url(#sc)" strokeWidth="1" />
            <g className="icon">
              <g className="breathe" style={{ transformOrigin: '100px 78px' }}>
                {/* Official Startup Odisha Mark: Konark Solar Chakra + Wave Flight Arrow */}
                {/* Konark Solar Chakra / Innovation Wheel Hub */}
                <circle cx="93" cy="82" r="5.2" strokeWidth="1.2" opacity="0.65" />
                <circle cx="93" cy="82" r="1.8" className="fill" />
                <line x1="93" y1="75.5" x2="93" y2="77.5" strokeWidth="1" />
                <line x1="93" y1="86.5" x2="93" y2="88.5" strokeWidth="1" />
                <line x1="86.5" y1="82" x2="88.5" y2="82" strokeWidth="1" />
                <line x1="97.5" y1="82" x2="99.5" y2="82" strokeWidth="1" />

                {/* Dynamic Soaring Rocket / Flight Wing of Innovation */}
                <path
                  d="M96 80 L112 63 L110 76 L116 79 L102 82 Z"
                  className="fill"
                  opacity="0.9"
                />
                <path
                  d="M103 72 L112 63 L104 66 Z"
                  fill="#ffffff"
                  stroke="none"
                  opacity="0.8"
                />

                {/* "Wave of Innovation" Dynamic Sweep */}
                <path
                  d="M83 85 C89 89, 98 88, 107 83 C111 81, 114 79, 117 75"
                  fill="none"
                  strokeWidth="1.4"
                />
                <path
                  d="M85 88 C91 91, 100 90, 108 85"
                  fill="none"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              </g>
            </g>
            <text x="100" y="118" textAnchor="middle" className="l1">
              STARTUP
            </text>
            <text x="100" y="131" textAnchor="middle" className="l2">
              ODISHA
            </text>
            <line x1="88" y1="141" x2="112" y2="141" className="hair2" />
          </svg>
          <p>
            <span className="cap-dot" />
            <b>Recognised by</b>Startup Odisha
            <span className="badge-batch">Incubated in Bhubaneswar</span>
          </p>
        </div>
      </div>
    </section>
  );
}
