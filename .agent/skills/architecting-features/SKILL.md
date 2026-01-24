---
name: architecting-features
description: Organizes software components into a feature-based modular structure. Use when planning new modules, refactoring large components, or defining folder structures for scalable applications.
---

# Feature-Based Architecture

## When to use this skill
- When starting a new development phase or feature.
- When the codebase grows and needs better organization (Senior Architect workflow).
- When a developer asks about "next steps" or "fragmentation".

## Folder Pattern
Organize code by business value, not by technical type:
```text
src/features/<feature-name>/
├── components/    # Feature-specific UI
├── hooks/         # Feature-specific logic
├── services/      # API calls/Data fetching
└── index.ts       # Public API for the feature
```

## Architect Rules
* **Strict Isolation**: Features should rarely import from other features directly. Use a `shared/` directory for common items.
* **Public API**: Only export necessary components from the feature’s `index.ts`.
* **State Management**: Keep state as local as possible within the feature.
* **Layering**: Distinguish between "UI Components" (dumb) and "Feature Containers" (smart).

## Feature Mapping Checklist
- [ ] Define the feature's primary responsibility.
- [ ] Identify shared components vs. feature-specific ones.
- [ ] Map Next.js routes to the corresponding feature modules.
- [ ] Plan the data flow (Server Components for data, Client Components for interaction).
