---
name: refining-ui-ux
description: Review and implement premium mobile-first UI patterns, focusing on 'Dermo Care' aesthetics. Use when refining layouts, applying glassmorphism, or auditing mobile UX fluidity.
---

# Premium UI/UX Design (Dermo Care)

## When to use this skill
- When converting HTML wireframes to React components.
- When the user asks to "make it look premium" or "improve the design".
- When auditing mobile-first responsiveness and touch targets.

## Design Tokens
- **Palette**: Use `#F8C6B9` (Primary Peach), `#FDFCFB` (Soft BG), and `#1A1614` (Deep Dark BG).
- **Radius**: Default to `1.5rem` or `2rem` (Extra Rounded) for a modern, friendly feel.
- **Shadows**: Use `0 4px 20px -2px rgba(0, 0, 0, 0.05)` for the "iOS-shadow" effect.

## Guidelines
* **Glassmorphism**: Use `backdrop-blur-xl` and `bg-white/80` for fixed headers and navigation bars.
* **Micro-interactions**: Apply `active:scale-95` and `transition-transform` to buttons and interactive cards.
* **Accessibility**: Ensure tap targets are at least `44x44px`. Use semantic HTML (`nav`, `main`, `section`).
* **Visual Hierarchy**: Use uppercase tracking-widest text for small labels (e.g., tags, categories).

## Implementation Checklist
- [ ] Check if the palette matches the design system.
- [ ] Verify `safe-area-inset-bottom` is accounted for in fixed navigation.
- [ ] Ensure dark mode consistency using `dark:` utility classes.
- [ ] Audit scroll containers for `hide-scrollbar` where appropriate.
