# Repository Guidelines

## Project Structure & Module Organization

Pinky is a Phaser 3 platformer written primarily in TypeScript. `src/index.ts` creates the game and registers the welcome scene plus `level1.ts` through `level10.ts`. Keep scene-specific setup and update logic in its `levelN.ts` file; place reusable construction in `src/create*.ts` and shared behavior in `src/handle*.ts`. Images, sprite sheets, audio, tilemaps, and source fonts live under `src/assets/`; global CSS is in `src/css/`. Asset module declarations belong in `types/`. Webpack configuration is split between `webpack/base.js` (development) and `webpack/prod.js` (production). Top-level `fonts/` are copied into build output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies. Node.js 16.16 or newer is required.
- `npm start` type-checks, starts webpack-dev-server with hot reload, and opens `http://localhost:8080`.
- `npm run build` runs TypeScript compilation and creates the production bundle in `dist/`.
- `npx tsc --noEmit` performs a fast type check without producing output.
- `npx eslint src --ext .ts,.js` applies the existing ESLint and TypeScript rules.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, ES modules, and trailing commas in multiline objects and argument lists. Preserve strict TypeScript settings; avoid introducing `any` or `@ts-ignore` unless a Phaser API cannot be modeled cleanly. Use `camelCase` for variables and functions, `PascalCase` for types, and existing descriptive file patterns such as `createPlayer.ts`, `handleEnemies.ts`, and `level10.ts`. Import shared dimensions, gravity, velocity, colors, and debug flags from `src/constants.ts` rather than duplicating literals. Import media as modules so declarations in `types/` remain effective.

## Testing Guidelines

There is currently no automated test framework or coverage threshold. Before submitting changes, run the type check, ESLint, and production build. Then play the affected scenes locally and verify movement with arrow keys and WASD, collisions, scoring, reset/game-over behavior, audio, and transitions to adjacent levels. If tests are introduced, colocate them as `*.test.ts` near the module and add a documented npm script.

## Commit & Pull Request Guidelines

Recent history uses short sentence-style subjects such as `Fixed reset button functionality.` Keep commits focused on one behavior and describe the observable change; no formal Conventional Commit prefix is required. Pull requests should summarize gameplay and technical changes, list validation commands and levels tested, and link relevant issues. Include screenshots or a short capture for visual, animation, layout, or level-design changes, and call out new or replaced assets.
