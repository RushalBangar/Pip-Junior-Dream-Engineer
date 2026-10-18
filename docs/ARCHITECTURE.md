# System Architecture — Pip’s Midnight Nursery

This document describes the technical architecture, audio synthesis pipeline, 3D WebGL scene graph, and full-stack API endpoints powering **Pip’s Midnight Nursery**.

---

## 1. High-Level Architecture

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                        React 19 + Vite SPA (Client)                       │
├───────────────────────┬───────────────────────────┬───────────────────────┤
│   Hero & 3D Stage     │   Interactive Workshops   │  Story & Community    │
│ • InteractivePipAvatar│ • LullabyLab (Sequencer)  │ • StoryJourney (SVG)  │
│ • Pip3DStage (ThreeJS)│ • InteractiveWorkshops    │ • PipChatAndGuestbook │
│ • Framer Motion Reveal│ • DreamCatcherMiniGame    │ • BriefInspectorModal │
└───────────┬───────────┴─────────────┬─────────────┴───────────┬───────────┘
            │                         │                         │
            ▼                         ▼                         ▼
┌───────────────────────────────────────────┐     ┌─────────────────────────┐
│    Procedural Web Audio (`soundEngine`)   │     │  Express API (`server`) │
│ • 432 Hz Triangle/Sine Celesta Synth      │     │ • GET/POST /api/guestbook│
│ • Mechanical Winding Key Ratchet          │     │ • POST /api/odometer    │
│ • Pip Giggle & Easter Egg Arpeggiator     │     │ • POST /api/pip-chat    │
└───────────────────────────────────────────┘     └─────────────────────────┘
```

---

## 2. Procedural Web Audio Engine (`src/utils/soundEngine.ts`)

To guarantee zero broken audio links and instant response times, all sound effects and musical notes are synthesized in real time using the browser’s native `AudioContext`:

- **Celesta Music Box (`playMusicBoxNote`):** Combines a fundamental `sine` oscillator with a quiet octave-overtone `triangle` oscillator routed through a configurable `BiquadFilterNode` (low-pass warmth filter) and exponential decay gain envelope.
- **Winding Key Ratchet (`playWindKeyTick`):** Short, pitched `triangle` bursts that ascend in frequency with each turn of the brass key (`1–5 turns`).
- **Global Mute Contract:** Respects user mute state persisted in `localStorage` (`pip_sound_muted`) and never auto-plays audio before user gesture interaction.

---

## 3. 3D WebGL Character Stage (`src/components/Pip3DStage.tsx`)

Built with **Three.js** (`v0.186`):
- **Lighting & Environment:** Uses `PMREMGenerator` with `RoomEnvironment` for soft studio reflections, paired with warm amber point lights (`#FBBF24`) inside Pip’s eye sockets and crescent lantern.
- **Interactive Raycasting:** Pointer clicks raycast against Pip’s 3D pink nightcap bow (`bowMesh`), music box (`boxGroup`), and floating `h-a-X-♡` wooden blocks (`blocks`).
- **Performance & Cleanup:** Uses `InstancedMesh` for the 24 twinkling starlight motes, clamps `devicePixelRatio` to `2`, pauses rendering when scrolled off-screen via `IntersectionObserver`, and disposes all geometries, materials, textures, and renderers on unmount.

---

## 4. 60fps Canvas Arcade Loop (`src/components/DreamCatcherMiniGame.tsx`)

- **Fixed/Clamped Timestep:** Uses `requestAnimationFrame` with `dt = Math.min((now - lastTime) / 1000, 0.05)` so physics remain consistent across 60Hz, 120Hz, and backgrounded tabs.
- **Game Feel ("Juice"):**
  - **Hitstop:** `45–75ms` simulation freeze on honey-milk pickups and alarm collisions.
  - **Screen Shake:** Exponentially decaying trauma offset on noisy alarm collisions.
  - **Squash & Stretch:** Spring interpolation (`scaleX`, `scaleY`) when dashing (`Space`) or catching stars.
  - **Telegraphs:** Vertical warning lane beams (`0.48s` windup) before noisy alarm clocks drop.

---

## 5. Full-Stack API Endpoints (`server.ts`)

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/guestbook` | `GET` | Returns pinned guestbook wishes (with optional `attachedMelody` note arrays) and current odometer count. |
| `/api/guestbook` | `POST` | Validates and stores a new guestbook wish (`visitorName`, `creatureType`, `dreamWish`, `mood`, `attachedMelody`). |
| `/api/odometer` | `POST` | Increments and returns the 6-digit nursery visitor odometer. |
| `/api/pip-chat` | `POST` | Generates an in-character reply from Pip using `@google/genai` (`gemini-3-flash-preview`) when `GEMINI_API_KEY` is configured, or falls back to a deterministic canon rule responder. |
