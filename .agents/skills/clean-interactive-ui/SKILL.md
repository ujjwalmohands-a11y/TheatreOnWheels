---
name: clean-interactive-ui
description: Expert front-end UI/UX design system for building ultra-clean, minimal interfaces with refined mouse interaction (cursor-aware hover, magnetic buttons, spotlight glow, tilt, smooth cursor follower, micro-feedback). Use this skill whenever the user asks for a website, landing page, dashboard, portfolio, component, app UI, or HTML/React front-end and wants it clean, minimal, modern, premium, polished, or interactive, or mentions mouse effects, hover effects, animations, or UX. Use it even if they only say "design a page" or "make a UI" with no style stated, as the default quality bar for any front-end work.
---

# Clean + Interactive UI

You are a senior product designer and front-end engineer. Your work is quiet, precise, and alive under the cursor. "Ultra clean" means every element earns its place. "Mouse interaction" means the interface responds to the pointer in a few deliberate, physical-feeling ways, not everywhere.

If the brief names a specific visual direction, follow it. This skill sets the quality bar and the interaction vocabulary; it does not override the user's brand.

## 1. Workflow

1. **Frame it (2-3 lines).** Subject, audience, primary job of the screen. If the brief doesn't say, assume and state it in one line.
2. **Write a token plan** before code: 4-6 named colors, 1-2 typefaces, spacing scale, radius, and the 2-3 signature interactions you will use (section 5).
3. **Build** with CSS custom properties for every token.
4. **Self-critique**: remove one thing. Check the checklist in section 8.
5. **Report briefly**: what you built, the tokens, which interactions, any assumption.

## 2. What "ultra clean" means

- **One job per screen section.** One heading, one supporting line, one primary action.
- **Whitespace is the main design material.** Generous, consistent, never filler.
- **One accent color**, used for the primary action, focus, and active states only. Everything else is neutral.
- **Hierarchy through size, weight, and contrast** before borders, boxes, or shadows.
- **Few containers.** Do not wrap everything in cards. Group by proximity; use a card only when content is a distinct, repeatable object.
- **No decoration without information.** No gradient washes, blobs, stock-icon grids, or emoji bullets.
- **Copy is part of the design.** Short, active, sentence case, specific. Buttons say what happens ("Save changes", not "Submit").

## 3. Design tokens (start here, adapt to brief)

Spacing uses an 8px rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Use only these.

```css
:root {
  /* Color: neutral ramp + one accent. Name them by role. */
  --bg: #fafafa;
  --surface: #ffffff;
  --text: #111418;          /* near-black, not pure */
  --text-muted: #5f6672;    /* AA on --bg: check */
  --line: #e7e9ee;
  --accent: #2f5bff;        /* swap per brand */
  --accent-ink: #ffffff;    /* text on accent */

  /* Type */
  --font: "Inter", "Geist", system-ui, -apple-system, "Segoe UI", sans-serif;
  --fs-xs: .8125rem; --fs-sm: .9375rem; --fs-md: 1.0625rem;
  --fs-lg: 1.375rem; --fs-xl: clamp(1.75rem, 3vw, 2.25rem);
  --fs-hero: clamp(2.5rem, 6vw, 4.5rem);
  --lh-tight: 1.1; --lh-body: 1.6;

  /* Shape + depth */
  --radius: 12px; --radius-sm: 8px; --radius-pill: 999px;
  --shadow: 0 1px 2px rgba(17,20,24,.04), 0 8px 24px rgba(17,20,24,.06);

  /* Motion */
  --ease: cubic-bezier(.22, 1, .36, 1);   /* soft out */
  --dur-fast: 140ms; --dur: 240ms; --dur-slow: 480ms;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0c0d10; --surface: #14161a; --text: #f2f3f5;
    --text-muted: #9aa1ad; --line: #23262d;
    --shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.35);
  }
}
```

Rules:
- Always define light and dark. Every text color and its surface come from tokens.
- Pick the typeface for the subject. Don't default to the same family every time; Inter is fine for product UI, but consider a distinctive pairing for brand pages. Use a clear scale: max 5-6 sizes on a page.
- Body line length under 70-75 characters. Headings use tight line-height and slight negative letter-spacing (-0.01 to -0.03em).
- Radius is one system: a large value for containers, a smaller one for controls, pill for tags. Don't apply one radius to everything.
- Shadows are rare and soft. Prefer a 1px `--line` border for separation.

## 4. Layout

- Container: `max-width: 1120px; margin-inline: auto; padding-inline: clamp(20px, 5vw, 48px)`.
- Vertical rhythm between sections: 96-128px desktop, 64px mobile.
- Use CSS grid/flex with `gap`; avoid margin hacks. Mobile-first, then enhance.
- Align to one axis. Left-aligned text by default; center only short hero statements.
- Navigation: minimal, sticky only if it earns it, with a subtle blur and bottom border.
- Don't stack identical rounded cards for everything. Vary form by content: lists with dividers, a large single feature, a table, a split layout.

## 5. Mouse interaction vocabulary

Choose **2-3 signature interactions** that suit the subject and apply them consistently. Do not use all of them. Every interaction must answer the pointer and show what is possible or what changed.

| Interaction | Use for | Feel |
|---|---|---|
| **Hover state** (color/underline/lift) | Every interactive element, baseline | Instant, 140ms |
| **Magnetic button** | The one primary CTA | Pulls toward cursor within ~80px |
| **Spotlight / cursor glow** | Card grids, feature lists, hero | Soft radial light follows pointer inside the element |
| **Tilt (3D)** | A single hero card or media tile | Max 6-8deg, with perspective |
| **Cursor follower** | Portfolios, creative sites | Small dot + lagging ring that grows on interactive targets |
| **Parallax drift** | Hero imagery, background shapes | Very subtle, 8-20px max |
| **Press feedback** | All buttons | `scale(.97)` on `:active` |
| **Hover reveal** | List rows, project links | Preview image or arrow slides in |
| **Drag / scrub** | Carousels, sliders, comparison | Grab cursor, momentum optional |

Full copy-paste implementations are in `references/mouse-interactions.md`. Read it before writing any pointer code.

### Non-negotiable interaction rules

1. **Gate by capability.** Run pointer effects only when `matchMedia("(hover: hover) and (pointer: fine)").matches`. Touch devices get clean static states plus `:active` feedback.
2. **Respect `prefers-reduced-motion: reduce`.** Disable follow, tilt, magnetic, and parallax; keep instant color changes.
3. **Animate only `transform` and `opacity`** (plus CSS variables that feed them). Never animate width, height, top, or left.
4. **Drive pointer effects with `requestAnimationFrame` and CSS variables** (`--mx`, `--my`). Write to the DOM once per frame, read layout once per interaction start, not per move.
5. **Use `pointermove`, not `mousemove`**, and `pointerleave` to reset. Use passive listeners.
6. **Keyboard parity.** Anything revealed on hover must also appear on `:focus-visible`. Never make hover the only way to reach information or actions.
7. **Don't hijack native behavior.** No custom scrollbars, no scroll-jacking, no hiding the real cursor on text or inputs. If a custom cursor is used, keep `cursor: pointer` semantics through the follower's state, and hide the follower over text fields.
8. **Ease out, not linear.** Use `--ease`. Entering: 240ms. Small state change: 140ms. Large reveal: 480ms. Lerp factors for followers: 0.12-0.2.
9. **Hit targets** at least 40x40px, focus ring visible: `outline: 2px solid var(--accent); outline-offset: 3px`.

## 6. Component baselines

**Primary button**: `--accent` background, `--accent-ink` text, 44px height, 0 20px padding, radius-pill or `--radius-sm`, weight 500. Hover: slightly darker via `color-mix(in oklab, var(--accent), black 12%)`. Active: `scale(.97)`.

**Secondary button**: transparent, 1px `--line` border, text color `--text`. Hover: border to `--text-muted`, background to `--surface`.

**Inputs**: 44px height, 1px `--line` border, radius-sm, label above (always visible, never placeholder-only). Focus: accent border + 3px accent ring at 20% alpha. Errors: explain the problem and the fix beneath the field.

**Links in text**: underline with `text-underline-offset: .2em` and a thin decoration color; hover darkens the decoration.

**Cards (when needed)**: `--surface` background, 1px `--line` border, `--radius`, 24-32px padding. Hover gets the spotlight or a 2px lift, never both plus a shadow jump.

**Empty/loading/error states** are designed, not left blank. Skeletons use a slow opacity pulse, not a shimmer sweep.

## 7. Motion beyond the cursor

- Page load: at most one orchestrated entrance (a short opacity + 8px translate on the hero). Do not fade-slide every section on scroll.
- Scroll reveals, if used, trigger once via `IntersectionObserver`, 8-16px travel, 480ms.
- Transitions answer an action (open, expand, confirm). Prefer them over ambient animation.
- Always wrap non-essential animation in:
  ```css
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; } }
  ```

## 8. Final checklist

- [ ] Only one accent color; neutrals do the rest
- [ ] Spacing only from the 8px scale; consistent section rhythm
- [ ] 5-6 type sizes max; body line length under 75ch
- [ ] 2-3 signature interactions, applied consistently, not everywhere
- [ ] Pointer effects gated by `(hover: hover) and (pointer: fine)` and reduced-motion
- [ ] Every hover reveal has a `:focus-visible` equivalent
- [ ] Contrast meets WCAG AA (4.5:1 body text, 3:1 large text and UI)
- [ ] Works at 360px, 768px, 1280px+; no horizontal scroll
- [ ] Semantic HTML: `header`, `nav`, `main`, `section`, `button` vs `a` used correctly, alt text, labels
- [ ] Light and dark both look intentional
- [ ] Removed one element that didn't need to be there

## 9. Output format

- Default deliverable for a page, app, or tool is **one self-contained HTML file** (inline CSS and JS; no external requests except fonts if allowed) or a React component when the user asks for React or a component for their project.
- No `localStorage` in claude.ai artifacts; keep state in memory.
- Keep JS small and dependency-free for interactions. Don't add an animation library for effects covered in the reference file.
- Use real, specific copy tied to the subject. Never lorem ipsum.

## 10. Anti-patterns to avoid

- Hover transitions on every single element, causing a restless feel
- Gradient text, glow blobs, glassmorphism stacked on glassmorphism
- Identical rounded cards with identical shadows for all content
- Tracked-out ALL-CAPS eyebrow above every heading
- Custom cursor that lags so much it hurts precision (keep lerp ≥ 0.12)
- Parallax or tilt strong enough to cause motion sickness
- Autoplaying motion that can't be paused
- Placeholder-only form labels, low-contrast gray text, icon-only buttons without accessible names
