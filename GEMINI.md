# Project AI Guidelines & Rules

## Clean + Interactive UI Standard (Mandatory)
For all UI/UX design, component creation, front-end styling, and interaction development in this project, **refer first to the Clean + Interactive UI skill specification**:
- Main skill file: [SKILL.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/SKILL.md) / [.agents/skills/clean-interactive-ui/SKILL.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/.agents/skills/clean-interactive-ui/SKILL.md)
- Interaction recipes: [.agents/skills/clean-interactive-ui/references/mouse-interactions.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/.agents/skills/clean-interactive-ui/references/mouse-interactions.md)

### Core Directives:
1. **Always refer to `SKILL.md` before coding any UI component**:
   - Establish a 4–6 color token system + 1 accent color.
   - Strictly follow the 8px spacing rhythm: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
   - Pick 2–3 signature interactions max (e.g. spotlight glow, magnetic button, tilt, cursor follower).
2. **Interaction Integrity**:
   - Gate all pointer effects behind `matchMedia("(hover: hover) and (pointer: fine)").matches`.
   - Never run unnecessary animations if `prefers-reduced-motion: reduce` is active.
   - Never animate layout geometry (`width`, `height`, `top`, `left`). Animate only `transform` and `opacity`.
   - Ensure full keyboard accessibility (`:focus-visible` parity).
3. **Verify against the Section 8 Checklist** in `SKILL.md` before delivering any UI changes.
