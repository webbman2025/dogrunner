# Dog Runner Requirements

Derived from the game logic mockup (park runner, portrait mobile).

## Functional Requirements

### Core Gameplay

- The dog runs forward automatically along a ground path.
- The player uses tap input to jump over obstacles.
- The run continues until the dog collides with an obstacle or loses all health.
- The game supports restart after game over.

### Controls

- **1 tap** — single jump; used to clear normal obstacles.
- **2 taps** — double jump; required to clear higher or larger obstacles.
- Desktop debug controls (space / up arrow) may mirror tap behavior for testing.

### Obstacles

- Obstacles spawn on the ground path and scroll toward the dog.
- Obstacle types include at minimum:
  - Wooden sign (paw print)
  - Traffic cone
  - Tire swing / hanging tire
  - Hay bale
- **Normal obstacles** are cleared with a single jump (1 tap).
- **Higher / bigger obstacles** require a double jump (2 taps).
- Early levels use simpler obstacles; difficulty scales over time.

### Collectibles — Scoring

| Item | Points | Notes |
|------|--------|-------|
| Normal pet snack (bone) | +10 | Score only |
| Special snack | +20 | Score + size effect |

### Collectibles — Effects

- **Normal pet snacks** grant points only; no size change.
- **Special snacks** grant bonus points and apply a temporary size effect:
  - **Growth** (e.g. meat / steak with paw icon) — dog becomes larger; easier to avoid obstacles.
  - **Shrink** (e.g. cupcake with cherry) — dog becomes smaller; harder to avoid obstacles.
- Size effects must visibly change the dog sprite and affect collision / jump clearance.

### Health

- The player has multiple lives, shown as heart icons in the HUD (mockup shows 3 hearts).
- Colliding with an obstacle removes one life.
- The game ends when all hearts are lost.

### HUD / UI

- **Score** — top-left, star icon + numeric score (e.g. 1250).
- **Health** — heart icons beside score.
- **Timer** — top-right, elapsed run time (e.g. 00:36).
- **Pause** — top-right pause button; pauses gameplay and allows resume.

### Difficulty & Progression

- The game starts at a base speed with simple obstacles.
- **Every 40 seconds**, game speed increases by one step.
- Each speed increase also raises obstacle spawn frequency.
- Obstacle mix may include more higher / bigger obstacles as difficulty rises.

### Environment & Presentation

- Portrait outdoor park setting: sky, clouds, grass, trees, fence, city skyline, dirt path.
- Dog character wears a bandana (per mockup).
- Parallax or layered background supported.
- Trial / demo builds may use placeholder icons; final build uses branded assets.

## Non-Functional Requirements

- Runs smoothly on mobile WebView (iOS / Android).
- Portrait orientation enforced.
- Touch controls responsive with minimal input lag.
- Assets optimized for fast loading on mobile networks.
- Cross-platform via WebView embedding (`dist/` build).
- Base resolution 480×800 with responsive scaling (Phaser Scale Manager, FIT mode).

## Out of Scope (Trial / Phase 1 placeholders)

- Final branded art for all snacks, obstacles, and UI chrome.
- Audio (background music, SFX) — planned in design doc but not specified in mockup logic.
- Online leaderboards or accounts.

## Deliverables

- Source code in Phaser 3
- Asset pack (sprites, backgrounds, UI, collectibles, obstacles)
- Build folder (`dist/`) for WebView embedding
- Documentation (`design.md`, `agents.md`, `game.json`, `requirements.md`)

## Acceptance Criteria (Summary)

1. Player can single-jump normal obstacles and double-jump tall obstacles.
2. Bones award +10; special snacks award +20 and apply grow/shrink effect.
3. HUD shows score, hearts, timer, and pause.
4. Speed and obstacle rate increase every 40 seconds.
5. Game runs on localhost and LAN IP for mobile testing.
6. Portrait fullscreen layout with no clipped sprites at ground level.
