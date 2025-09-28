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

### 提交信息（Commit Message）规范
- 标题行：`<type>(<scope>): <subject>`，建议中文描述，简洁明确。
- 空一行（必须换行）。
- 正文使用“无序列表”逐条描述改动点：每行以 `- ` 开头，使用真实换行，不要用 `\n` 拼接。
- 列表项尽量使用并列的动宾短语，必要时可继续拆分为多条；句末不强制标点。
- 若包含破坏性变更或迁移步骤，也以无序列表补充在正文中。

示例：

```
feat(admin-cdk): 显示使用者昵称并支持订阅策略与价格

- 列表新增策略、价格列，使用者显示昵称（回退ID）
- 创建表单新增 subscriptionStrategy、price 与联动校验
- 数量上限改为 1000，新增 code 筛选
- 类型对齐：CDKDTO/CreateCDKRequest/CDKQueryRequest
```

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:` (see `git log`).
- Example: `feat: add course drag‑and‑drop ordering`
- PRs should include: clear description, linked issue, screenshots for UI changes, and a checklist (builds, lints).
- Keep changes focused; update docs when changing public APIs or routes.

## Security & Configuration Tips
- API base is `/api`; Vite proxies to `http://127.0.0.1:8520` (edit `vite.config.ts`).
- Do not commit secrets; prefer `.env` files and configure the proxy target per environment.
- Auth token is read from `localStorage`; avoid logging sensitive data.


