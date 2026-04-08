# AGENTS.md

## High-signal repo facts

- Dev entrypoint is the example app; run from repo root: `bun install` then
  `bun run dev` (starts Convex dev, Vite, and codegen/build watcher).
- Codegen/build pipeline is `bun run build:codegen` (runs
  `convex codegen --component-dir ./src/component` then `bun run build`).
- CI order is build -> test -> typecheck -> lint; build step is `bun run build`
  (not `build:codegen`).
- Tests run with Vitest `edge-runtime` and include `src/**/*.test.ts` and
  `example/**/*.test.ts`.
- Generated files live under `src/component/_generated/` and
  `example/convex/_generated/`; don’t hand-edit them.
- `dist/` is generated build output; `build:clean` deletes `dist/` and
  `*.tsbuildinfo`.
- Component name is `convexEcommerce` (see `src/component/convex.config.ts`);
  example app uses the component via `example/convex/convex.config.ts`.
- `predev` runs an initial build + `convex dev --once` unless `.env.local` or
  `dist/` already exists; backend dev uses `convex dev --typecheck-components`.

## Useful commands

- Dev: `bun run dev`
- Build (component): `bun run build`
- Codegen + build: `bun run build:codegen`
- Tests: `bun run test`
- Typecheck: `bun run typecheck` (runs root, `example/`, and `example/convex`
  tsconfig)
- Lint: `bun run lint`

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `example/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
