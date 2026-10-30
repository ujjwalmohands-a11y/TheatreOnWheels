/**
 * CustomCursor.jsx — Luxury Champagne Rings Trail (Lightweight & High-Performance)
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates an ultra-premium, delicate golden rings / champagne bubbles trail
 * that floats gently behind the cursor.
 *
 * Engineered for low-end hardware:
 * - Pre-allocated fixed particle pool (28 max, zero GC allocations)
 * - Auto-pausing RAF loop: 0% CPU/GPU usage when mouse is idle
 * - Spacing threshold: prevents particle clumping & redundant draws
 * - Balanced contrast: rich amber-gold borders stand out cleanly on both
 *   cream backgrounds (About section) and deep midnight themes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFine || isReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* ── HiDPI Sizing ────────────────────────────────────── */
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ── Pre-allocated Ring Particle Pool ─────────────────── */
    const MAX_PARTICLES = 28;
    const particles = [];

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 5,
        targetR: 10,
        life: 0,
        decay: 0.03,
        alive: false,
      });
    }

    let spawnIndex = 0;
    function spawnRing(x, y, speed) {
      const p = particles[spawnIndex % MAX_PARTICLES];
      spawnIndex++;

      // Subtle natural jitter
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 2.5;
      p.x = x + Math.cos(angle) * spread;
      p.y = y + Math.sin(angle) * spread;

      // Gentle upward buoyant drift (champagne float) + slight motion carry
      p.vx = (Math.random() - 0.5) * 0.35;
      p.vy = -0.35 - Math.random() * 0.45;

      // Elegant ring sizing
      p.r = 3.5 + Math.random() * 3.5;
      p.targetR = p.r + 4.5 + Math.random() * 4.0;
      p.life = 1.0;
      p.decay = 0.024 + Math.random() * 0.016; // ~35 frames lifespan
      p.alive = true;
    }

    /* ── Pointer Tracking & Intelligent Spacing ──────────── */
    let lastX = -100, lastY = -100;
    let rafId = null;
    let isMoving = false;
    let idleTimeout = null;

    function wakeLoop() {
      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    }

    function onPointerMove(e) {
      const x = e.clientX;
      const y = e.clientY;

      if (lastX < 0) {
        lastX = x;
        lastY = y;
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only spawn if mouse traveled enough distance (prevents pile-up & reduces CPU)
      const MIN_DIST = 9;
      if (dist >= MIN_DIST) {
        const steps = Math.min(Math.floor(dist / MIN_DIST), 2);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          spawnRing(lastX + dx * t, lastY + dy * t, dist);
        }
        lastX = x;
        lastY = y;
      }

      isMoving = true;
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => { isMoving = false; }, 90);

      wakeLoop();
    }

    function onPointerLeave() {
      lastX = -100;
      lastY = -100;
      isMoving = false;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    /* ── Render Loop with Auto-Pause ─────────────────────── */
    function render() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      let activeCount = 0;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (!p.alive) continue;

        p.life -= p.decay;
        if (p.life <= 0) {
          p.alive = false;
          continue;
        }

        activeCount++;

        // Physics: gentle floating and expanding
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.98;

        const progress = 1 - p.life;
        const currentR = p.r + (p.targetR - p.r) * progress;
        const alpha = p.life * p.life; // smooth quadratic fade

        // 1. Soft glowing outer halo (rich warm amber)
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR + 1.8, 0, Math.PI * 2);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = `rgba(198, 142, 50, ${alpha * 0.22})`;
        ctx.stroke();

        // 2. Translucent champagne center wash
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 186, 102, ${alpha * 0.12})`;
        ctx.fill();

        // 3. Crisp luxury golden ring edge (high clarity on both cream & dark bg)
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = `rgba(182, 124, 34, ${alpha * 0.72})`;
        ctx.stroke();

        // 4. Subtle luminous specular gleam on the top edge
        ctx.beginPath();
        ctx.arc(p.x - currentR * 0.22, p.y - currentR * 0.25, currentR * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 205, ${alpha * 0.55})`;
        ctx.fill();
      }

      // If all particles have faded and pointer is idle, PAUSE the loop to save 100% CPU/GPU
      if (activeCount === 0 && !isMoving) {
        ctx.clearRect(0, 0, w, h);
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(render);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(idleTimeout);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-trail-canvas"
      aria-hidden="true"
    />
  );
}
