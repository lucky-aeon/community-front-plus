# Repository Guidelines
始终用中文和我对话
## Project Structure & Module Organization
- Source lives in `src/` and is organized by apps and shared modules.
- Apps: `src/apps/{marketing,user-portal,user-backend,admin-backend}` contain page‑level components.
- Shared: `src/shared/{components,services,constants,types,utils,routes}` holds reusable UI, API clients, and helpers.
- UI: local primitives in `src/components/ui` (shadcn‑style) and app‑specific UI in `src/shared/components`.
- Cross‑cutting: `src/context`, `src/hooks`, `src/lib`, `src/config`, `src/router`.
- Static assets: `public/`. Build output: `dist/`.
- Path aliases: `@`, `@shared`, `@apps`, etc. (see `vite.config.ts`).

## Build, Test, and Development Commands
- Install deps: `npm install`
- Start dev server: `npm run dev` (Vite + proxy at `/api`)
- Build production bundle: `npm run build`
- Preview built app: `npm run preview`
- Lint code: `npm run lint` (ESLint rules for JS/TS/React)

## Coding Style & Naming Conventions
- Language: React + TypeScript (strict mode enabled in `tsconfig.*`).
- Components: PascalCase files (e.g., `ProfilePage.tsx`), hooks start with `use`.
- Services: kebab‑case files in `src/shared/services/api/*.service.ts` using Axios instance.
- Variables/functions: camelCase; constants UPPER_SNAKE_CASE.
- Indentation: 2 spaces; keep imports ordered (aliases first, then relative).
- Styling: Tailwind CSS; compose classes with `clsx`/`cn` (`src/shared/utils/cn.ts`).

## Testing Guidelines
- No test runner is configured yet. Recommended: Vitest + React Testing Library.
- When added, co‑locate tests as `*.test.tsx` near components or under `src/__tests__/`.
- Aim for coverage on shared utilities, hooks, and critical screens.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:` (see `git log`).
- Example: `feat: add course drag‑and‑drop ordering`
- PRs should include: clear description, linked issue, screenshots for UI changes, and a checklist (builds, lints).
- Keep changes focused; update docs when changing public APIs or routes.

## Security & Configuration Tips
- API base is `/api`; Vite proxies to `http://127.0.0.1:8520` (edit `vite.config.ts`).
- Do not commit secrets; prefer `.env` files and configure the proxy target per environment.
- Auth token is read from `localStorage`; avoid logging sensitive data.
