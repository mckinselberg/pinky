# Pinky: Code Health & Bug Fix Pass

## Context

The user asked for a plan to improve and expand the game, and prioritized **code health & bug fixes** as the primary focus (with new features/content/polish as secondary, lower-detail follow-ups). Two Explore agents surveyed all 10 level files and every shared `create*`/`handle*` helper. The game works, but ~10 levels were built by copy-pasting earlier levels forward, so real bugs, dead/unreachable code, and duplicated logic have accumulated. This plan fixes the concrete bugs first, removes dead weight, tightens types, then de-duplicates the biggest copy-paste offenders — in that order, so each phase is independently shippable and testable via `npm start`.

## Status

- **Phase A — done.** All four bugs fixed as described.
- **Phase B — done**, with two corrections to the original plan discovered while implementing:
  - `createPlatform.ts` / `createMovingPlatform.ts` are **both actually used** (level9 imports the former, levels 7–8 the latter) — neither could be deleted. Only removed the harmless duplicate `setCollideWorldBounds` call in `createMovingPlatform.ts`; left the `!moving` early-return difference alone since level7/8 callers never pass `moving: true` and rely on velocity always being applied — adding the guard would have silently stopped their platforms moving.
  - The "levels 7–9 dead power-up/trees wiring" item turned out to also affect **level10**, which was stripped the same way (no bonus coin or `createTrees` ever existed there). Levels 5 and 6 had the *opposite* problem — they already grant invincibility via a working bonus coin and had a fully-implemented `createTrees` function, just never called — so those got the missing `trees = createTrees(this)` call wired in instead of stripped.
  - Also cleaned up a related dead-`platforms`-variable bug in levels 7–9 (declared, never assigned, passed into `createSingleCoin` as a no-op) surfaced by `tsc` during verification — not in the original plan text but same category.
  - `npx tsc --noEmit` is fully clean (0 errors, down from 12 pre-existing) and `npm run build` succeeds.
- **Phase C — done.** `wasd` unified to a new `WASDKeys` type (`src/types.ts`), `setupWASD.js` converted to `.ts`; `timeout` retyped to `ReturnType<typeof setTimeout>` and all five `@ts-ignore`s removed; `enemies`/`enemies2`/`fireBalls` unified to `Phaser.Physics.Arcade.Group` (matching `createEnemies`'s actual `physics.add.group()` return — also caught and fixed a couple of pre-existing mistyped `trees: Phaser.GameObjects.Group` that should have been `StaticGroup`, surfaced by the same sed pass); `createEnemies.ts`'s dead `this: any` param dropped and its `iterate`/`overlap` callbacks typed (Phaser's own `Function`/union callback types don't accept a directly-typed `Sprite` param, so each callback takes the loose Phaser type and casts once to `Phaser.Physics.Arcade.Sprite` inside). `npx tsc --noEmit` and `npm run build` both clean.
- **Phase D — not started.**

## Phase A — Real bugs (fix first, highest value)

1. **`level7.ts` update() doesn't halt on game over.** The `gameOver.value` block has `// return;` commented out (mirrors a bug already present in `level10.ts`). Player/enemies keep updating after "death". Fix: uncomment the `return;` in both `level7.ts` and `level10.ts`.
2. **`level3.ts` overwrites its success text.** `successText = createSuccessText(this, level)` at create() start is correct, but a second call `successText = createSuccessText(this)` near the end of `create()` (no `level` arg) clobbers it. Remove the duplicate second call.
3. **`welcome.ts` passes an undefined `platforms` group into `createCoins`.** `platforms` (typed `Phaser.GameObjects.Group`) is never assigned in `welcome.ts` before being force-cast with `as Phaser.Physics.Arcade.StaticGroup` and passed to `createCoins`. Either build a real static group for the welcome screen's ground images, or remove the coins-on-welcome-screen call if they're not meant to be collectible there — check visually in-browser which behavior is intended before deciding.
4. **`level4.ts` coin-skip condition is a no-op.** `i !== 3` is checked inside a loop bounded by `initialNumberOfCoins = 3` (so `i` only ranges 0–2), meaning the skip never triggers — likely a copy-paste leftover from `level3.ts` (which validly uses `i !== 1` over a larger loop). Decide the intended skip index for level4's coin count and fix, or remove the dead conditional if no skip was actually intended.

## Phase B — Dead code removal

- Delete `src/debounce.ts` (confirmed unused anywhere; only referenced via commented-out imports in `handlePlayer.ts` and `handlePlayerWithWASD.WIP.ts` — remove those commented lines too).
- Remove unused imports: `enemy2` in `level1.ts`; `import { GameObjects } from 'phaser'` in `level7.ts` and `level9.ts`.
- Remove unused `activeEnemies` variable in `level5.ts` and `level6.ts`.
- Levels 7–9: `playerHasInvincibility`/`playerHasFireballs` are wired into `handlePlayer`/`createResetButton` but no bonus coin ever grants them (dead/unreachable state), and `trees`/`handleplayerIsHiding` are called with an always-`undefined` `trees` group (no-op hiding). For each of these three levels, either wire up the missing bonus coin + trees, or strip the unused wiring — flag as a per-level judgment call, default to stripping unless the level's design clearly intends the mechanic (confirm by playing the level).
- `src/createPlatform.ts` and `src/createMovingPlatform.ts` both export a function named `createMovingPlatform` with diverging behavior (one has an early `if (!moving) return`, the other doesn't; one has a duplicate `setCollideWorldBounds` call). Grep all level imports to find which file is actually used, delete the other, and rename the surviving file/export to match if needed.
- Confirm `handlePlayerWithWASD.WIP.ts` should stay as documented dead/WIP code (per CLAUDE.md) — leave it, but note its `wasd.down.isdown` typo (should be `isDown`) in a comment or fix it now since it's a one-line correction, for whenever this file is revived.

## Phase C — Type-safety cleanup

- Replace the ~11 duplicated `wasd: any` parameters (every level file, `welcome.ts`, `handlePlayer.ts`) with a single shared type matching `setupWASD.js`'s return shape (e.g. a `WASDKeys` type in `constants.ts` or a new small `types.ts`). Convert `setupWASD.js` to `setupWASD.ts` while at it for consistency with `setupCursors.ts`.
- Replace `@ts-ignore` + `timeout: number` with `timeout: ReturnType<typeof setTimeout>` in `level6.ts`, `level7.ts`, `level8.ts`, `level9.ts`, `level10.ts` — removes all five `@ts-ignore`s in one type fix.
- Unify `enemies` group typing: `level1.ts` uses `Phaser.Physics.Arcade.Group`, levels 2–9 use `Phaser.GameObjects.Group` for the same `createEnemies()` return value — pick the correct one (check `createEnemies.ts`'s actual return type) and standardize.
- `createEnemies.ts`: drop the unused `this: any` parameter; type the `Group.children.iterate` callback params (`platform`, `i`, `enemy`) instead of `any` where Phaser's typings allow it.

## Phase D — De-duplication (highest effort, do last)

- **Text helpers**: `createGameOverText.ts`, `createSuccessText.ts`, `createScoreText.ts`, `createLevelText.ts` are near-identical boilerplate with inconsistent color-setting (`'#000'` vs `'black'`, style-object vs `.setColor()`). Extract a shared `createStyledText(_this, x, y, text, opts)` and have all four call it.
- **Coin helpers**: in `createCoins.ts`, `collectCoin`/`collectBonusCoin` and the three spawn functions (`createSingleCoin`/`createCoins`/`createBonusCoin`) share large amounts of logic. Collapse into one parameterized implementation. Also fix the `collectBonusCoin` leak: a `setTimeout` hides the power-up text but never destroys it (`powerUpActiveText.destroy()` is commented out) — accumulates orphaned `Text` objects over a play session.
- **`createTrees`**: duplicated verbatim (including a dead commented-out `children.iterate` block) across `level3.ts`, `level5.ts`, `level6.ts`. Extract to a shared `src/createTrees.ts`.
- **Win/lose transition**: the winner-branch (show success text, fade out, `setTimeout` → `scene.stop`/`scene.start`, reset score) is copy-pasted with minor ordering variations across all 10 levels. Extract a shared helper (e.g. `handleLevelWin({ _this, level, successText, gameOverText, score, enemies })`) that all levels call from `update()`.
- Fix the repeated cosmetic issues while touching these files: stray `.setScale(...);;` double-semicolons (levels 2–5), redundant double `gameOver.value = true;` assignment in the fall-death check (levels 2–9), leftover `console.log` in `createSuccessText.ts` and `level10.ts`, and the apparent copy-paste duplication in `createSuccessText.ts`'s `successMessages` array (verify whether the repeated messages are intentional variety or a mistake before changing).

## Brief roadmap notes (secondary, not detailed here)

- **Features**: power-ups (fireballs/invincibility) only fully work in levels 3–6 and 10 — once Phase B/D land, extending them consistently to more levels becomes cheap.
- **Content**: `level10.ts`'s Tiled-tilemap approach is more scalable than the manual `platforms.create(x, y, ...)` calls in levels 1–9; future levels should probably follow the tilemap pattern.
- **Polish**: no level-select/menu beyond `welcome.ts`, no persistent high scores, sound is present but not consistently used across levels — worth a separate pass once the codebase is stable.

## Verification

- `npm start` after each phase; manually play through the levels touched in that phase (arrow keys + WASD), confirming: game-over halts play (Phase A.1), win transition still fires (Phase A.2, D), welcome-screen coins behave correctly (A.3), level4's coin count/skip is correct (A.4).
- `npx tsc --noEmit` after Phase C to confirm the type cleanup compiles with no new errors and no remaining relevant `@ts-ignore`s.
- `npx eslint src` (no lint script wired up, but config exists) to catch unused imports/vars from Phase B.
- Re-run the full 10-level playthrough once at the end to confirm no regressions were introduced by the Phase D extractions (win/lose transition and coin logic are the highest-risk shared-code changes).
