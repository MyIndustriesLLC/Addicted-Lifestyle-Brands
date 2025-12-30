# Repository Guidelines

## Project Structure & Module Organization
Repo splits into `client/` (Vite React UI), `server/` (Express API), and `shared/` (Drizzle schemas). Inside `client/src`, keep atoms in `components/`, hooks in `hooks/`, utilities in `lib/`, and route-level screens under `pages/<feature>`. The backend bootstraps from `server/index.ts`, keeps HTTP wiring inside `routes.ts`, and isolates business logic within the `*-service.ts` modules plus `storage.ts`. Update `shared/schema.ts` whenever entities change and rerun migrations so generated SQL in `migrations/` stays current.

## Build, Test, and Development Commands
- `npm install` – install root dependencies.
- `npm run dev` – run Express via `tsx server/index.ts` and mount the Vite dev client.
- `npm run build` – compile the client with Vite and bundle the server to `dist/` using esbuild.
- `npm run start` – boot the production bundle from `dist/index.js`.
- `npm run check` – execute `tsc --noEmit` across client, server, and shared sources.
- `npm run db:push` – push `shared/schema.ts` changes to Postgres through Drizzle.

## Coding Style & Naming Conventions
Write strict TypeScript with 2-space indentation; use `PascalCase` for components, `useFoo` for hooks, `camelCase` elsewhere, and uppercase env constants. Import through the aliases (`@/`, `@shared/`) instead of deep relative paths. Favor functional, Tailwind-first components with shared tokens in `client/src/index.css`, and keep server helpers focused so routing layers stay thin.

## Testing Guidelines
`npm run check` is the only required gate today, so treat type errors as blockers. Add client specs next to components as `Component.test.tsx` (Vitest + React Testing Library) and API specs under `server/__tests__` with Vitest/Supertest; `tsconfig.json` excludes `**/*.test.ts`, so they stay out of builds. Prioritize coverage for mnemonic generation, wallet conversions, and persistence adapters.

## Commit & Pull Request Guidelines
Follow the existing log style: short, imperative subjects without punctuation (e.g., `Update visual styling and wallet generation logic`). PRs must include a summary, linked issue, screenshots or recordings for UI deltas, and notes about required migrations (`npm run db:push`) or new env vars. Run `npm run check` and the relevant manual flows before requesting review.

## Security & Configuration Tips
Set `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `WALLET_ENCRYPTION_KEY`, and optionally `PORT` inside an untracked `.env` before running commands. Drizzle refuses to start without `DATABASE_URL`, and the server falls back to insecure defaults if the other keys are missing, so override them in every environment. Keep mnemonic phrases and wallet seeds server-side and never log sensitive payloads.
