# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains application source code. Keep features grouped by domain (for example, `src/modules/` or `src/features/`).
- `tests/` (or `src/**/__tests__/`) holds automated tests alongside the code they cover.
- `public/` or `assets/` contains static files such as images, icons, and configuration templates.
- `docs/` is for architecture notes, API references, and onboarding material.

## Build, Test, and Development Commands
Add the exact commands for this repo once they exist. Typical examples:
- `npm run dev` starts the local dev server.
- `npm run build` builds production assets.
- `npm test` runs the test suite.
- `make lint` runs formatting and lint checks.

## Coding Style & Naming Conventions
- Use 2-space indentation for web files and 4-space indentation for backend code unless a formatter is configured.
- Prefer PascalCase for components/classes (for example, `UserProfile.tsx`) and kebab-case for directories (for example, `user-profile/`).
- Run the project formatter or linter before committing (add the exact tool once configured).

## Testing Guidelines
- Add tests for new features and bug fixes.
- Follow the existing test naming pattern (for example, `*.test.ts`, `test_*.py`).
- Document the test runner and coverage expectations once decided.

## Commit & Pull Request Guidelines
- Use short, imperative commit messages (for example, "Add audit log export").
- PRs should include a concise summary, steps to verify, and screenshots for UI changes.
- Link related issues or tickets when available.

## Configuration & Secrets
- Store environment-specific settings in `.env` files.
- Never commit secrets; add sensitive files to `.gitignore`.
