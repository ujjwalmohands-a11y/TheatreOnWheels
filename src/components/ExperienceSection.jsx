import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ExperienceSection.css';

export default function ExperienceSection() {
  const getInitialHeight = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 700) {
      return 590;
    }
    return 720;
  };

  const [iframeHeight, setIframeHeight] = useState(getInitialHeight);
  const iframeRef = useRef(null);

  const measureIframe = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const isMobile = (iframe.contentWindow?.innerWidth || window.innerWidth) <= 700;
        let trueH;
        if (isMobile) {
          const hall = doc.querySelector('.hall');
          if (hall) {
            trueH = Math.ceil(hall.getBoundingClientRect().bottom + 10);
          } else {
            const wrap = doc.querySelector('.wrap');
            trueH = wrap ? Math.ceil(wrap.getBoundingClientRect().height + 8) : 580;
          }
        } else {
          const wrap = doc.querySelector('.wrap');
          trueH = wrap ? Math.ceil(wrap.getBoundingClientRect().height + 20) : 720;
        }
        if (trueH > 250) {
          setIframeHeight(trueH);
        }
      }
    } catch {
      // Cross-origin fallback relies on postMessage
    }
  }, []);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'TOW_RESIZE' && typeof e.data.height === 'number') {
        setIframeHeight(Math.ceil(e.data.height));
      } else if (e.data?.type === 'TOW_NAVIGATE') {
        const targetEl = document.getElementById(e.data.target);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('resize', measureIframe);

    const t1 = setTimeout(measureIframe, 100);
    const t2 = setTimeout(measureIframe, 400);
    const t3 = setTimeout(measureIframe, 1200);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', measureIframe);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [measureIframe]);

  return (
    <section id="experience" className="experience-embed-section" aria-label="7D Theatre Experience">
      <div className="container experience-embed-container">
        <iframe
          ref={iframeRef}
          src="/step-inside.html"
          title="7D Theatre Experience — Step Inside"
          className="experience-embed-iframe"
          scrolling="no"
          onLoad={measureIframe}
          style={{ height: `${iframeHeight}px`, overflow: 'hidden' }}
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
}
