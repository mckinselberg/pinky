# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Mario-style platformer built with Phaser 3, TypeScript, and Webpack, based on the official Phaser 3 project template. Levels are the core content unit — the game has 10 levels (`level1.ts` through `level10.ts`) wired up as Phaser scenes.

Demo: https://pinky-ypr7.onrender.com

## Commands

- `npm install` — install dependencies
- `npm start` — type-check (`tsc`) then launch webpack-dev-server at `http://localhost:8080` with hot reload (opens browser automatically)
- `npm run build` — type-check then build a production bundle to `dist/bundle.min.js` via `webpack/prod.js`

There is no test suite and no lint script defined in `package.json` (eslint config exists at `eslintrc.json` but isn't wired to an npm script — run via `npx eslint src` if needed).

## Architecture

**Scene/level model**: `src/index.ts` builds the Phaser game config and registers scenes in order: `welcome`, then `level1`–`level10`. Each `levelN.ts` file exports a Phaser scene object (`{ key, preload, create, update }`). Levels are largely self-contained but share a common structure:
- `preload` loads level-specific assets (backgrounds, spritesheets)
- `create` builds platforms, player, coins, trees/obstacles, enemies, and UI text, then wires up colliders/overlaps
- `update` runs the win/lose condition checks and per-frame input/enemy handling, and transitions to `scene.start('level${n+1}')` on win

Progression between levels is done via `this.scene.stop`/`this.scene.start` inside `update`, not via a central level manager.

**Shared builder functions** (`src/create*.ts`): each encapsulates construction of one game element and is called from every level's `create()`:
- `createPlayer`, `createPlayerAnimations`, `createPlayerPlatformCollider` — player sprite/physics/animations
- `createEnemies`, `createOverlapPlayerEnemies` — enemy groups and player/enemy collision handling
- `createCoins` (also exports `createSingleCoin`), `createBonusCoinBlinkAnimation` — collectibles and scoring
- `createPlatform`, `createMovingPlatform` — static and moving platform groups
- `createGameOverText`, `createSuccessText`, `createScoreText`, `createLevelText`, `createResetButton` — HUD/UI elements

**Shared behavior/update functions** (`src/handle*.ts`): called from each level's `update()` loop:
- `handlePlayer` — reads cursors/WASD and applies velocity/animation state to the player
- `handleEnemies` — moves enemy groups each frame
- `handleplayerIsHiding` — tree-overlap logic that lets the player hide from enemies (mutates the shared `playerIsHiding` state object)

**Input**: `setupCursors.ts` and `setupWASD.js` both wire up input mappings; levels use both concurrently so movement works via arrow keys or WASD. `handlePlayerWithWASD.WIP.ts` is an in-progress/unused variant — don't treat it as live code.

**Constants**: `src/constants.ts` centralizes canvas size, gravity, player velocity, enemy position enum, and colors. Import from here rather than hardcoding these values in level files.

**Mutable state pattern**: Levels use plain mutable objects (e.g. `score = { value: 0 }`, `gameOver = { value: false }`, `playerIsHiding = { value: false, cursorIsDown: false }`) rather than classes, so state can be passed by reference into helper functions and mutated there. Follow this pattern when adding new cross-function state in a level.

**Assets**: images live under `src/assets` and are imported directly as JS modules (`import enemy from './assets/sprites/enemy.png'`); typed via `types/images.d.ts` and `types/sounds.d.ts`. Fonts are loaded separately from the top-level `fonts/` directory (copied by webpack) and via `FontFaceObserver`.

**Debug**: `constants.debug` toggles Arcade Physics debug rendering; `constants.debugStartLevel` is referenced for jumping straight to a specific level during development (check current usage in `index.ts`/level files before relying on it, as wiring may be partial).
