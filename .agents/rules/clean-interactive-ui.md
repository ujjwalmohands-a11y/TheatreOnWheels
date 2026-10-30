# Clean + Interactive UI Rule

Before designing, modifying, or implementing any user interface, component, styling, or interaction in this project, you **MUST** refer to and strictly follow the Clean + Interactive UI design system specified in:
- [SKILL.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/SKILL.md)
- [.agents/skills/clean-interactive-ui/SKILL.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/.agents/skills/clean-interactive-ui/SKILL.md)
- [.agents/skills/clean-interactive-ui/references/mouse-interactions.md](file:///d:/Projects/GDS-tOnWheels/TheatreOnWheels-Web/.agents/skills/clean-interactive-ui/references/mouse-interactions.md)

## Mandatory Requirements:
1. **Frame First**: State the subject, audience, and primary job of the screen/component.
2. **Token Plan**: Use CSS custom properties for colors, type, spacing (strictly 8px rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128), radius, and transitions.
3. **Restraint & Precision**: "Ultra clean" means every element earns its place. One accent color; neutrals do the rest. No gratuitous decorative clutter.
4. **Mouse Interaction Vocabulary**: Select 2–3 signature interactions (spotlight hover, magnetic button, tilt, cursor follower, etc.) and apply them consistently.
5. **Non-negotiable Pointer Rules**:
   - Always gate pointer effects with `matchMedia("(hover: hover) and (pointer: fine)").matches`. Touch devices receive static states with active feedback.
   - Always respect `prefers-reduced-motion: reduce`.
   - Animate only `transform` and `opacity` (and CSS variables feeding them).
   - Use `requestAnimationFrame` and passive listeners for pointer effects.
   - Keyboard parity: All hover states must have visible `:focus-visible` / `:focus-within` equivalents.
6. **Self-Critique & Checklist**: Validate against Section 8 Checklist of `SKILL.md` before finalizing any UI work.
