# Dog Runner Game Design (Mobile Portrait)

## Concept

2D endless runner where a dog runs forward automatically and the player taps to jump over obstacles.

## Orientation & Resolution

Portrait mode only, base resolution 480x800, responsive scaling with Phaser Scale Manager (FIT mode).

## Core Mechanics

- Auto-scrolling ground
- Tap to jump
- Collisions end the run
- Score increases with distance/time survived

## Assets

- Dog sprite (running + jump animation)
- Obstacle sprites (rocks, fences, bushes)
- Background layers (sky, ground, parallax trees)
- UI (score counter top center, restart button bottom)

## Controls

- Mobile tap
- Desktop debug with space/up arrow

## Progression

- Speed increases gradually
- Obstacles spawn more frequently
- Optional power-ups (bones, shield)

## Audio

- Background loop
- Jump sound
- Collision sound

## Mobile-Specific Requirements

- Touch input only
- Portrait layout for one-handed play
- Lightweight assets
- WebView packaging for iOS/Android
