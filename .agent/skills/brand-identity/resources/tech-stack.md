# Preferred Tech Stack & Implementation Rules

When generating code or UI components for Dermo Care, you **MUST** strictly adhere to the following technology choices.

## Core Stack
* **Framework:** Next.js (TypeScript)
* **Styling Engine:** Tailwind CSS 4+ (Mandatory. No plain CSS files).
* **Component Library:** shadcn/ui (Radix Primitives)
* **Icons:** Lucide React & Google Material Icons (Outlined)
* **State Management:** React Context or Zustand

## Implementation Guidelines

### 1. Tailwind Usage
* Use utility classes directly in JSX.
* Utilize the color tokens defined in `design-tokens.json`. 
* **Custom Shadow:** Use the `.ios-shadow` utility defined in `globals.css`.
* **Dark Mode:** Always implement `dark:` variants.

### 2. Component Patterns
* **Buttons:** Primary actions must use the solid Peach (`#F8C6B9`).
* **Cards:** Use `rounded-[1.5rem]` or `rounded-[2rem]` with `.ios-shadow`.
* **Mobile First:** All views must be optimized for mobile (max-width: 448px) first.

### 3. Forbidden Patterns
* Do NOT use Bootstrap.
* Do NOT create separate `.css` files for components.
* Do NOT use generic rounded corners; always use the brand's large radii.
