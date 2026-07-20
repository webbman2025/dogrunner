# Dog Runner — Game Design

Design reference for the current mobile portrait build. Complements `requirements.md` with UX, visual, and systems detail.

**Figma:** [Jumping Dog](https://www.figma.com/design/SB4sPBWkIsvJA16IZOBBa2/Jumping-Dog)  
**Live:** https://dogrunner-nine.vercel.app

---

## Concept

A casual 2D endless runner where the player guides a **dog or cat** along a scrolling path. The pet runs automatically; the player jumps over hazards, collects hearts, and tries to beat their personal best **distance** — optionally racing a ghost replay of that best run.

**Core drive:** go farther. Distance is the only run metric (not a separate collectible score). Long-term variety comes from **biome backgrounds that change every 5000 m**.

Tone: bright, glossy, pet-themed UI with Figma-exported buttons and wooden/parchment menu panels.

---

## Player Experience

### Session loop

```
Title → Select Pet → Loading → Run → (Pause | Game Over) → Retry or Home
```

- **Start Game** — standard endless run.
- **Beat Distance** — same run, but a translucent ghost replays the saved best attempt beside the player.
- **How to Play** — short rules overlay on the title screen (tap to jump, hearts, ghost PB).

### Emotional beats

| Moment | Feel | Presentation |
|--------|------|----------------|
| Title | Inviting, playful | Logo, park background, glossy CTAs |
| Pet select | Choice & personality | Split green (dog) / pink (cat) panels |
| Loading | Anticipation | Pet runs in place on loading bar |
| Gameplay | Flow + tension | Speed ramps, hearts deplete, weather shifts |
| Biome milestone | Curiosity / reward | New background every 5000 m — “what’s next?” |
| Hit | Punishment without instant end | Bump, heart lost, brief invulnerability |
| Game over | Soft failure | Sleep animation on dimmed backdrop, wooden “Game Over” panel |

---

## Screens & UI

All Figma layouts use a **375×812** reference frame, scaled to the game canvas (480×800) via `sx()` / `sy()`.

### Title screen (`TitleScene`)

| Element | Asset / notes |
|---------|----------------|
| Background | `title-background.png` — park scene; Y offset via `BG_Y_OFFSET` |
| Logo | `title-logo.png` — native pixel size, top-aligned |
| Start Game | `title-cta-start.png` — green, paw icon |
| Beat Distance | `title-cta-beat.png` — orange, bone icon |
| How to Play | `title-cta-howto.png` — blue, house icon |
| How to Play modal | Procedural white panel + Close button |

CTAs are image buttons with invisible zone hit areas (~48px min touch height).

### Select pet (`SelectPetScene`)

| Element | Figma node | Asset |
|---------|------------|-------|
| Full layout | 43:841 | `select-pet-background.png` |
| Dog art | — | `select-pet-dog.png` |
| Cat art | — | `select-pet-cat.png` |
| Select Dog | — | `select-pet-dog-btn.png` |
| Select Cat | — | `select-pet-cat-btn.png` |
| Back to Home | — | `select-pet-home-btn.png` |

Black letterbox fills top/bottom; panel and buttons positioned from Figma coordinates (`BG`, `DOG_IMG`, `CAT_IMG`, `HOME_BTN`, etc. in `SelectPetScene.js`).

### Loading (`LoadingScene`)

- Sky-blue background (`#53a4fd`).
- Selected pet runs on a red progress bar.
- Pet-specific game assets preloaded before `GameScene`.

### Pause menu (DOM overlay)

| Element | Notes |
|---------|-------|
| Backdrop | `rgba(0,0,0,0.8)` + 4px blur; safe-area aware |
| Panel | `pause-panel.png` (784×918); `min(80vw, 300px)` width |
| Actions | Resume, Try Again, Back to Home — percentage hit zones on panel art |

### Game over (DOM overlay)

| Element | Notes |
|---------|-------|
| Backdrop | Same 80% black + blur as pause |
| Panel | `game-over-panel.png` (779×775) |
| Sleeping pet | DOM layer above backdrop; cycles pet sleep frames at 8 fps |
| Actions | Try Again → Loading; Back to Home → Title |

---

## Gameplay Design

### Movement & jump

The pet is **fixed on the X axis**; the world scrolls. Jump is **hold-based**, not double-tap:

| Input | Effect |
|-------|--------|
| Tap | Launch jump |
| Hold | Higher arc (reduced rise gravity, optional air boost) |
| Release early | Jump cut — shorter arc |
| Coyote time | Jump shortly after leaving ground |
| Fall jump | One extra jump while descending |

Desktop mirrors with Space / Up; Esc pauses.

### Hazards

| Hazard | Visual | Gameplay |
|--------|--------|----------|
| Poop pile | Ground sprite (rock / cone / bush variants) | −1 heart; destroyed on hit; 1.4s hit cooldown |
| Mud | Brown patch | Slows effective scroll speed while overlapping |

Spawn timing uses a deterministic course simulator so ghost replays stay consistent.

### Collectibles

| Item | Pet | Visual | Effect |
|------|-----|--------|--------|
| Heart | Both | Same heart sprite | +1 heart (max 3); score-based spawns |
| Snack | **Dog** | **Biscuit** | **5 s invincibility** — poop cannot remove hearts |
| Snack | **Cat** | **Fish** | Same as dog snack |

**Pet snack rules**

- Same spawn logic and pickup size for both pets (**50 × 50** on screen).
- Only the **image** changes — configured in `petConfig.js`, loaded per selected pet.
- **On collect:** **5 seconds invincibility** — ignore poop collisions for heart loss (refresh timer to 5 s if collected again while active).
- **Mud** does not slow the pet while invincible (mud never costs hearts).
- **Distance** stays the main drive; snacks are a survival power-up, not a second score.
- **Player feedback:** SMW star-style rainbow tint on the pet + brief white flash on collect.
- Ghost / Beat Distance: shared spawn schedule; ghost replay does not need snack/invinc state in v1.

**Asset paths**

| Pet | File |
|-----|------|
| Dog | `public/assets/dog/snacks/biscuit.png` |
| Cat | `public/assets/cat/snacks/fish.png` |

### Health & failure

- Start with **3 hearts**.
- Losing the last heart triggers **game over** (not instant death on first hit).
- Pet plays **sleep** animation; ghost recording finalized and saved if it beats PB.

### Distance (single metric)

- The HUD number **is distance** (meters). Internally this is still `score` in code; display should read as meters (e.g. `4,280 m`).
- Distance increases with scroll speed × time — surviving farther is the only way to raise it.
- **No second score currency**. Snacks grant **5 s invincibility** (biscuit / fish), not extra points.
- Hearts keep you alive long-term; snacks give a short safe window through poop.
- Ghost / Beat Distance PB = **furthest distance**.

### Difficulty

- **Scroll speed** rises with distance (capped); no fixed 40-second tiers.
- **Day/night** overlay advances with distance milestones.
- **Weather** from Hong Kong Observatory API: dry, rain, storm variants affect sky color and rain particles.

### Biome backgrounds every 5000 m (planned)

**Player intent:** “I want to see the next place” — distance as exploration, not just a number.

| Tier | Distance | Biome (example) |
|------|----------|-----------------|
| 0 | 0 – 4,999 m | Park (current sky + ground) |
| 1 | 5,000 – 9,999 m | Town / street |
| 2 | 10,000 – 14,999 m | Beach / waterfront |
| 3 | 15,000 m+ | Night city (or cycle / extend) |

**Rules**

- Swap **sky + ground** parallax textures when distance crosses each 5000 m threshold.
- Gameplay unchanged (same jump, poop, mud, hearts) — biomes are visual milestones.
- Short transition (crossfade ~1s) so the swap doesn’t feel like a glitch.
- Optional toast: “5,000 m!” when a new biome unlocks.
- Weather and day/night may still tint the active biome; biomes are the big intentional change.

**Asset need:** 3–4 sky/ground pairs. Start with 3 if art is limited; threshold stays 5000 m (tune later if runs feel short).

### Ghost racing (“Beat Distance”)

Design intent: race your past self, not other players.

- During a run, samples record pet pose, hearts, and distance every ~150ms.
- Best run stored locally (`dogrunner-ghost-best-v4`) by furthest distance.
- Ghost renders semi-transparent blue-tinted, slightly smaller, behind the live pet.
- Ghost fades when the player pulls ahead; reappears when behind.

---

## Characters

### Dog

- 8 run frames, 5 jump frames, sleep frames `[0, 1, 3]`
- Assets: `public/assets/dog/`
- Snack: **biscuit** (`snacks/biscuit.png`)
- Default pet if none saved

### Cat

- 8 run frames, 6 jump frames, sleep frames `[0, 1, 3]`
- Assets: `public/assets/cat/`
- Snack: **fish** (`snacks/fish.png`)
- Distinct shadow Y offset in gameplay

Both share the same hitbox and scale (`DOG_SCALE`); only art and animation frame counts differ (`petConfig.js`).

---

## HUD Layout (in-game)

```
┌─────────────────────────────┐
│      ♥ ♥ ♥   (hearts pill)  │
│         4,280 m             │  ← distance (centered)
│                      [⏸]    │  ← pause (top-right)
│                             │
│   🐕  ~~path~~  💩  🫀       │
│                             │
└─────────────────────────────┘


- Hearts: cream pill (`#f3ddcd`), brown border, 32×27 icons.
- Distance: white text, black stroke, below hearts (planned `m` label).
- No timer in current build.
- Biome change is background-only; HUD layout stays the same.

---

## Visual & Technical Style

| Choice | Rationale |
|--------|-----------|
| Pixel art pets | Crisp at mobile DPI; `antialias: false`, `roundPixels: true` |
| Figma UI raster exports | Glossy buttons and panels match marketing mockups |
| Phaser canvas + DOM overlays | Menus above canvas with reliable touch hit zones |
| FIT scale 480×800 | Consistent layout; Figma coords mapped via 375×812 reference |
| Parallax sky/ground | Depth without heavy 3D |
| Pet shadow ellipse | Grounding; scales with jump height |

---

## Architecture (design-relevant)

```
src/
├── scenes/
│   ├── TitleScene.js       # Home + how-to overlay
│   ├── SelectPetScene.js   # Figma pet picker
│   ├── LoadingScene.js     # Asset gate per pet
│   └── GameScene.js        # Runner + HUD + atmosphere
├── ui/figmaButton.js       # Image buttons + touch zones
├── pauseMenuDom.js         # Pause DOM overlay
├── gameOverMenuDom.js      # Game over DOM + sleep pet anim
├── petConfig.js            # Dog/cat asset paths & shadows
└── services/hkWeather.js   # Live weather → mood
```

Scene transitions always reset pause/game-over DOM state (`resetPauseOverlay`).

---

## Audio (planned)

Design doc originally specified music and SFX. Current build has `noAudio: true`. Planned sounds:

- Jump / land
- Heart collect
- Hit / heart lost
- Game over sting
- Optional looped park ambience

---

## Future Design Targets

### Priority: distance biomes

1. Export 3–4 sky/ground biome pairs.
2. Threshold switch at 5000 / 10000 / 15000 m in `GameScene`.
3. Label HUD distance with `m`.
4. Optional milestone toast + short crossfade.

### Next: distance biomes

1. Export 3–4 sky/ground biome pairs.
2. Threshold switch at 5000 / 10000 / 15000 m in `GameScene`.
3. Label HUD distance with `m`.
4. Optional milestone toast + short crossfade.

### Obstacle art (implemented)

Shared ground hazards for both pets — same hitbox as poop (`rock.png`):

| Variant | File |
|---------|------|
| Poop | `public/assets/rock.png` |
| Cone | `public/assets/ui/cone.png` |
| Bush | `public/assets/ui/bush.png` |

Course schedule picks variant deterministically (no back-to-back repeats).

### Lower priority / not current focus
- Grow / shrink temporary power-ups
- Elapsed timer in HUD
- Ghost library UI (browse/save multiple replays)
- Separate collectible score currency — **out of scope**
- Audio (music / SFX) — include snack collect + invincibility start/end when added

---

## Key Files for Designers

| Area | File |
|------|------|
| Title layout | `src/scenes/TitleScene.js` |
| Select pet layout | `src/scenes/SelectPetScene.js` |
| Pause hit zones | `index.html` (`.pause-hit-*`) |
| Game over hit zones | `index.html` (`.game-over-hit-*`) |
| UI assets | `public/assets/ui/` |
| Pet art & snacks | `public/assets/dog/`, `public/assets/cat/` (`snacks/` subfolder) |
| Obstacle variants | `public/assets/ui/cone.png`, `public/assets/ui/bush.png` |
| Biome sky/ground (planned) | `public/assets/` + `GameScene` parallax layers |

When updating Figma, re-export PNGs and adjust position constants (`BG`, `HOME_BTN`, etc.) or CSS percentage hit zones to match.
