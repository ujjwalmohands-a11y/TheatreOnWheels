# Mouse Interaction Recipes

Dependency-free, copy-paste. All recipes assume the tokens from SKILL.md and share one gate.

## Contents
1. Shared setup (gate + reduced motion)
2. Spotlight hover
3. Magnetic button
4. 3D tilt card
5. Cursor follower
6. Parallax drift
7. Press feedback + ripple-free states
8. Hover reveal rows
9. Scroll reveal (once)

---

## 1. Shared setup

```js
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FX = FINE && !REDUCED;       // enable pointer effects only if true
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
```

Wrap every recipe in `if (FX) { ... }`. When false, the UI must still look finished.

---

## 2. Spotlight hover

A soft light follows the cursor inside each element. Great for card grids and feature lists.

```html
<div class="spot">...</div>
```
```css
.spot { position: relative; overflow: hidden; border: 1px solid var(--line);
  border-radius: var(--radius); background: var(--surface); }
.spot::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  opacity: 0; transition: opacity var(--dur) var(--ease);
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%); }
.spot:hover::before, .spot:focus-within::before { opacity: 1; }
.spot > * { position: relative; }
```
```js
if (FX) document.querySelectorAll(".spot").forEach(el => {
  let raf = 0;
  el.addEventListener("pointermove", e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }, { passive: true });
});
```
Keyboard: `:focus-within` shows the light at its default center position.

---

## 3. Magnetic button

Use on one primary CTA only.

```html
<button class="btn magnetic"><span>Get started</span></button>
```
```css
.magnetic { transition: transform var(--dur) var(--ease); will-change: transform; }
.magnetic:active { transform: scale(.97) !important; }
```
```js
if (FX) document.querySelectorAll(".magnetic").forEach(btn => {
  const strength = 0.25, reach = 80;
  let raf = 0;
  addEventListener("pointermove", e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = btn.getBoundingClientRect();           // one read per frame
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) / 2 + reach;
      btn.style.transform = near ? `translate(${dx * strength}px, ${dy * strength}px)` : "";
    });
  }, { passive: true });
  document.addEventListener("pointerleave", () => { btn.style.transform = ""; });
});
```
Keep strength between 0.2 and 0.35. Reset on leave so it settles back with the CSS transition.

---

## 4. 3D tilt card

One hero element, max 6-8deg.

```css
.tilt-wrap { perspective: 900px; }
.tilt { transform-style: preserve-3d; transition: transform var(--dur) var(--ease);
  will-change: transform; }
```
```js
if (FX) document.querySelectorAll(".tilt").forEach(el => {
  const max = 7; let raf = 0;
  el.addEventListener("pointermove", e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      el.style.transition = "transform 80ms linear";
      el.style.transform = `rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(0)`;
    });
  }, { passive: true });
  el.addEventListener("pointerleave", () => {
    el.style.transition = ""; el.style.transform = "";
  });
});
```
Pair with a spotlight for a premium feel; don't also add a shadow jump.

---

## 5. Cursor follower

Small dot (exact) + ring (lagging). Grows over interactive targets, hides over text fields.

```html
<div class="cursor-dot" aria-hidden="true"></div>
<div class="cursor-ring" aria-hidden="true"></div>
```
```css
.cursor-dot, .cursor-ring { position: fixed; top: 0; left: 0; pointer-events: none;
  z-index: 9999; border-radius: 50%; opacity: 0; transition: opacity var(--dur) var(--ease); }
.cursor-dot { width: 6px; height: 6px; margin: -3px 0 0 -3px; background: var(--text); }
.cursor-ring { width: 36px; height: 36px; margin: -18px 0 0 -18px;
  border: 1px solid color-mix(in oklab, var(--text) 40%, transparent);
  transition: opacity var(--dur) var(--ease), width var(--dur) var(--ease),
              height var(--dur) var(--ease), margin var(--dur) var(--ease),
              background var(--dur) var(--ease); }
.cursor-ring.is-active { width: 56px; height: 56px; margin: -28px 0 0 -28px;
  background: color-mix(in oklab, var(--accent) 12%, transparent); border-color: var(--accent); }
.cursor-on .cursor-dot, .cursor-on .cursor-ring { opacity: 1; }
.cursor-hide .cursor-dot, .cursor-hide .cursor-ring { opacity: 0; }
```
```js
if (FX) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener("pointermove", e => {
    x = e.clientX; y = e.clientY;
    document.documentElement.classList.add("cursor-on");
    const t = e.target;
    ring.classList.toggle("is-active", !!t.closest("a, button, [role=button], .spot, .tilt"));
    document.documentElement.classList.toggle("cursor-hide",
      !!t.closest("input, textarea, select, [contenteditable]"));
  }, { passive: true });
  document.addEventListener("pointerleave", () =>
    document.documentElement.classList.remove("cursor-on"));
  (function loop() {
    rx = lerp(rx, x, .16); ry = lerp(ry, y, .16);
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
}
```
Do NOT hide the system cursor with `cursor: none` unless the dot is always present and accurate; a safe default is to keep the native cursor and treat the follower as an accent.

---

## 6. Parallax drift

```html
<div class="drift" data-depth="12"></div>
```
```js
if (FX) {
  const items = [...document.querySelectorAll(".drift")];
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener("pointermove", e => {
    tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
  }, { passive: true });
  (function loop() {
    cx = lerp(cx, tx, .06); cy = lerp(cy, ty, .06);
    items.forEach(el => {
      const d = +el.dataset.depth || 10;
      el.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
    });
    requestAnimationFrame(loop);
  })();
}
```
Depth 8-20px. Anything larger starts to feel gimmicky.

---

## 7. Press feedback (works on touch too)

```css
.btn { transition: transform var(--dur-fast) var(--ease),
  background-color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
.btn:active { transform: scale(.97); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (hover: hover) { .btn:hover { background: color-mix(in oklab, var(--accent), black 12%); } }
```
Wrap `:hover` styles in `@media (hover: hover)` so touch devices don't get stuck hover states.

---

## 8. Hover-reveal rows

Project/list rows where an arrow or preview slides in.

```css
.row { display: flex; align-items: center; justify-content: space-between;
  padding: 24px 0; border-top: 1px solid var(--line); }
.row .arrow { opacity: 0; transform: translateX(-8px);
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease); }
.row:hover .arrow, .row:focus-visible .arrow { opacity: 1; transform: none; }
.row:hover .title, .row:focus-visible .title { transform: translateX(8px); }
.row .title { transition: transform var(--dur) var(--ease); }
```
Inline the arrow as SVG. Keep the row a real `<a>` so it's keyboard-reachable.

---

## 9. Scroll reveal (once)

Use sparingly: hero or one key section, not every block.

```css
.reveal { opacity: 0; transform: translateY(12px);
  transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease); }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; } }
```
```js
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
```
Add `<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>` so content never stays hidden.

---

## Pairing guide

| Site type | Pick |
|---|---|
| SaaS / product landing | Spotlight cards + magnetic primary CTA |
| Portfolio / studio | Cursor follower + hover-reveal rows |
| Dashboard / tool | Press feedback + subtle row hover only |
| Product showcase | Tilt hero + parallax drift |
| Docs / content | Hover states and focus only; no flourishes |
