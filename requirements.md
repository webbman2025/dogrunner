# Dog Runner Requirements

Living requirements document for the current Phaser 3 build. Updated to reflect implemented features as of the Figma UI pass, pet selection, ghost racing, and DOM overlay menus.

**Live:** https://dogrunner-nine.vercel.app  
**Stack:** Phaser 3 + Vite, portrait 480×800 (FIT scaling), mobile WebView target

---

## Scene Flow

| Scene | Purpose |
|-------|---------|
| **TitleScene** | Home screen with logo, Figma CTA buttons (Start Game, Beat Distance, How to Play) |
| **SelectPetScene** | Choose dog or cat; Back to Home |
| **LoadingScene** | Pet-specific asset load + animated loading bar |
| **GameScene** | Endless runner gameplay |

**Navigation**

- **Start Game** → Select Pet → Loading → Game (normal run)
- **Beat Distance** → Select Pet → Loading → Game (ghost race enabled)
- **How to Play** → overlay on title; dismiss with Close
- **Pause** → Resume / Try Again / Back to Home
- **Game Over** → Try Again / Back to Home

---

## Functional Requirements

### Core Gameplay

- The selected pet (dog or cat) runs forward automatically along a scrolling ground path.
- The player uses tap (or hold) input to jump over hazards.
- **Distance** is the primary run metric (HUD score ≈ meters survived). One number drives PB, ghost race, and progression.
- Scroll speed ramps up as distance increases (not fixed 40-second steps).
- The run ends when the pet loses all hearts (3 max).
- On game over, the pet plays a sleep animation and the game-over menu appears.

### Distance progression (planned)

- Every **5000 m**, the run switches to a **different background biome** (sky + ground parallax pair).
- Biomes are visual milestones only — jump rules, hazards, and hearts stay the same.
- Ghost / Beat Distance PB continues to use **furthest distance** (not a separate score currency).
- Optional short transition (crossfade or wipe) and a brief “5,000 m” toast when a biome unlocks.

### Pet Selection

- Player chooses **Dog** or **Cat** on the select-pet screen before each run.
- Selection is persisted in `localStorage` (`dogrunner-selected-pet`).
- Each pet has its own run, jump, and sleep sprite sets and shadow offsets.
- Pet-specific assets are loaded in `LoadingScene` and `GameScene`.

### Controls

- **Tap / pointer down** — start jump
- **Hold** — variable-height jump (hold gravity, air boost, jump cut on release)
- **Coyote time** — brief window to jump after leaving ground
- **Fall jump** — one mid-air jump when descending (if not already used)
- Desktop: **Space / Up** mirror jump; **Esc** toggles pause

### Hazards & Collectibles

| Type | Behavior |
|------|----------|
| **Poop obstacle** (`rock` in code) | Ground hazard; **rock / cone / bush** variants share mechanics; collision costs 1 heart unless invincible |
| **Mud patch** | Slows scroll speed while pet overlaps; no direct heart loss |
| **Heart pickup** | Restores 1 heart up to max (3); spawned on a score-based schedule |
| **Pet snack** | Dog: **biscuit**; Cat: **fish** — **5 s invincibility** (no heart loss from poop) |

### Pet snacks

- **Dog** collects **biscuits**; **cat** collects **fish** — different sprites, **same gameplay**.
- **Effect:** **5 seconds invincibility** — poop obstacles do not remove hearts while active.
- Invincibility **refreshes to 5 s** if another snack is collected during the buff (no stacking beyond reset).
- Mud does **not** slow movement during invincibility (mud does not cost hearts today).
- Snacks do **not** add a second score currency; **distance** remains the only run metric and ghost PB.
- Same spawn schedule for both pets (shared course simulator); only the texture swaps via `petConfig.js`.
- Asset paths:
  - `public/assets/dog/snacks/biscuit.png`
  - `public/assets/cat/snacks/fish.png`
- Display size matches heart pickup: **~50 × 50 px** on canvas; native export **~96 × 81** (Figma **2×**).
- Load **only the selected pet’s** snack in `LoadingScene` / `queueGameAssets` (same pattern as run frames).

### Health

- **3 hearts** shown in a top HUD pill (full / empty heart icons).
- Obstacle collision removes 1 heart with a brief hit cooldown and bump feedback.
- Game over when hearts reach 0.

### Ghost Racing (“Beat Distance”)

- Optional mode enabled from title **Beat Distance** CTA.
- Records position, animation, hearts, and score samples during the run.
- Best run saved to `localStorage` (`dogrunner-ghost-best-v4`).
- On a ghost-race run, a semi-transparent ghost replays the saved best run alongside the player.
- Ghost fades when the player is ahead; ghost position shifts based on score lead.

### HUD / UI

| Element | Position / notes |
|---------|------------------|
| **Hearts** | Top center pill, 3 heart icons |
| **Distance** | Below hearts, centered numeric meters (score ≈ distance) |
| **Pause** | Top-right Figma-positioned pause icon |
| **Pause menu** | DOM overlay: 80% black + blur; Figma panel; Resume / Try Again / Back to Home |
| **Game over** | DOM overlay: same backdrop style; Figma panel; sleeping pet above backdrop; Try Again / Back to Home |

### Title & Select Pet UI

- **Title:** Figma image CTAs (`title-cta-*.png`), native-size logo, background with adjustable Y offset.
- **Select Pet:** Figma composite layout — background banner, dog/cat art, Select Dog / Select Cat / Back to Home image buttons.
- Buttons use zone-based hit areas (`figmaButton.js`) for reliable mobile taps.

### Environment & Atmosphere

- Parallax **sky** and **ground** tile layers (starting biome: park).
- **Hong Kong Observatory** weather API drives rain/storm effects and sky tint.
- **Day/night cycle** overlay based on in-run distance progression.
- Rain particles during wet weather modes.
- **Planned:** swap sky/ground asset pairs every 5000 m (see Distance progression).

### Pause Behavior

- Pauses physics, tweens, and per-sprite animations (not global `anims.pauseAll()`).
- DOM pause overlay with percentage-positioned hit zones on panel art.
- Pause state released on all exit paths (resume, retry, home, scene change).

---

## Non-Functional Requirements

- Runs in mobile browsers and WebView (iOS / Android); portrait enforced.
- Safe-area aware DOM overlays (`env(safe-area-inset-*)`).
- Touch-friendly CTA and menu hit targets (min ~48px touch height, extra padding).
- `antialias: false`, `roundPixels: true` for crisp pixel art.
- Build output in `dist/` for static hosting (Vercel).
- Dev server: `npm run dev` with `--host` for LAN mobile testing.

---

## Planned / Not Yet Implemented

Items from the original park-runner mockup or design doc that are **not** in the current build:

| Feature | Spec | Status |
|---------|------|--------|
| **Biome backgrounds every 5000 m** | New sky/ground pair per tier | Planned — primary progression hook |
| **Pet snacks** | Dog biscuit / cat fish; **5 s invincibility** | Implemented |
| **Obstacle variants** | Cone + bush share poop mechanics | Implemented |
| Distance labeled as meters | HUD shows e.g. `4280 m` | Planned (value already tracks distance) |
| Double jump (2 taps) | Tall obstacles | Not planned; hold-jump used instead |
| Obstacle variety | Signs, tires, hay bales | Poop + mud + cone + bush |
| Separate snack score currency | +10 bone points etc. | Not planned; distance stays the single metric |
| Grow / shrink power-ups | Special snacks | Not implemented |
| Timer HUD | Top-right elapsed time | Not implemented |
| Fixed 40s speed steps | Speed + spawn every 40s | Distance-based ramp instead |
| Ghost library UI (10 replays) | v4 library storage key exists | Best-run only; no library modal |
| Audio | Music / SFX | `noAudio: true` in Phaser config |
| Online leaderboards | Accounts / cloud | Out of scope |

---

## Deliverables

- Source: Phaser 3 scenes in `src/scenes/`
- Shared UI helpers: `src/ui/figmaButton.js`
- DOM overlays: `src/pauseMenuDom.js`, `src/gameOverMenuDom.js`
- Pet config: `src/petConfig.js`
- Assets: `public/assets/` (dog, cat, UI panels, Figma exports)
- Build: `npm run build` → `dist/`
- Docs: `requirements.md`, `design.md`, `agents.md`, `game.json`

---

## Acceptance Criteria (Current Build)

1. Title screen shows Figma CTAs; Start Game and Beat Distance reach pet select.
2. Select pet screen matches Figma layout; dog and cat load correct sprites in game.
3. Player can jump (tap/hold) over poop obstacles; mud slows movement.
4. Hearts HUD shows 3 lives; heart pickups restore health; game over at 0 hearts.
5. Pause menu uses Figma panel with working Resume, Try Again, and Back to Home.
6. Game over shows Figma panel, 80% backdrop, and sleeping pet for selected character.
7. Beat Distance mode replays ghost of personal best run.
8. Game runs at 480×800 FIT on localhost and production (Vercel).
9. Portrait layout with no clipped pet sprites at ground level.

## Acceptance Criteria (Pet Snacks)

13. Dog runs show **biscuit** pickups; cat runs show **fish** pickups (no cross-pet art).
14. Snack spawn timing and hitbox match between pets; only sprite differs.
15. Collecting a snack grants **5 s invincibility** (poop does not cost hearts); timer refreshes on re-collect.
16. Invincibility does not add a second HUD score — distance remains primary.
17. Poop hazards rotate **rock / cone / bush** art with shared hitbox and spawn rules.

## Acceptance Criteria (Planned — Distance Biomes)

10. HUD distance is the single progression metric; ghost PB uses furthest distance.
11. At 5000 m, 10000 m, 15000 m, … the sky/ground background switches to the next biome.
12. Biome change does not alter jump rules or heart rules; transition is readable (fade/toast optional).
