---
name: creating-skills
description: Generates high-quality, predictable, and efficient .agent/skills/ directories based on user requirements. Use when building new agent capabilities or automating specific workflows.
---

# AntiGravity Skill Creator

This skill enables the agent to architect and generate new skills for the Antigravity environment, ensuring they follow strict structural and quality standards.

## Workflow
- [ ] **Analyze Requirements**: Define the exact task or domain the skill will cover.
- [ ] **Define Triggers**: Identify keywords and scenarios where the skill should activate.
- [ ] **Structure Directory**: Map out the `<skill-name>/`, `SKILL.md`, and optional subdirectories.
- [ ] **Author Instructions**: Write the logic following "The Claude Way" (Conciseness, Progressive Disclosure).
- [ ] **Validate**: Ensure YAML frontmatter is valid and paths use forward slashes.

## Core Structural Requirements
Every skill generated must follow this folder hierarchy:
- `<skill-name>/`
    - `SKILL.md` (Required: Main logic and instructions)
    - `scripts/` (Optional: Helper scripts)
    - `examples/` (Optional: Reference implementations)
    - `resources/` (Optional: Templates or assets)

## YAML Frontmatter Standards
- **name**: Gerund form (e.g., `testing-code`, `managing-databases`). Max 64 chars. Lowercase, numbers, and hyphens only.
- **description**: Third-person description including specific triggers/keywords. Max 1024 chars.

## Writing Principles
* **Conciseness**: Assume the agent is smart. Focus only on the unique logic.
* **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Link to secondary files for deep detail.
* **Forward Slashes**: Always use `/` for paths.
* **Degrees of Freedom**: Use Bullet Points (heuristics), Code Blocks (templates), or Bash Commands (low-freedom).

## Workflow Tags
- Use `// turbo` above run_command steps in workflows for auto-run capability (if applicable to the environment).
- Use `// turbo-all` at the top of a workflow for full automation.
