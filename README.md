# Pip’s Midnight Nursery — Interactive Dream Engineering Lab & Character Portfolio

> **Official Entry for haX.baby’s “Baby’s First Website” 48-Hour Hackathon**  
> **Track 1:** *Pip, The Skull Baby ("Same Baby, 1,000 Websites")*  
> **Studio Identity:** *Pip · Junior Dream Engineer at Midnight Nursery (Studio 04, Cloud-Crib District)*

![Pip Hero Preview](./public/baby/assets/pip_avatar_cloud.png)

---

## 🌙 Overview

**Pip’s Midnight Nursery** is an interactive story-world, playable instrument lab, and character portfolio built for **Pip, the Skull Baby**—a gentle, sleepy Junior Dream Engineer who crafts soothing lullabies, warm 1,850K porcelain nightlights, and cloud-delivered bedtime dreams so no creature in the valley ever has to sleep in the dark.

The application answers the three core questions of the **haX.baby “Meet the Baby”** brief through tactile, zero-dependency Web Audio synthesis, 3D WebGL character staging, a 60fps arcade mini-game, and a full-stack community guestbook:

1. **What Pip Is (`#identity`):** A friendly, sleepy baby with a smooth warm porcelain skull face, huge soft eye sockets with glowing 1,850K amber pinpricks, a tiny crooked smile, and a star-patterned bedtime nightcap with a pink bow.
2. **What Pip Does (`#inventions` & `#workshop`):** Junior Dream Engineer at Midnight Nursery, showcasing **6 interactive inventions** plus a **7th playable arcade game & certificate bottler**.
3. **What Pip’s Story Is (`#story`):** A 4-chapter interactive bedtime origin story (*How Pip Floated Down to Midnight Nursery*) with live SVG dioramas, chapter-specific celesta chords, and under-150-word nocturnal scenes.

---

## ✨ Hackathon Tier & Side-Quest Coverage

### Tier 1 — Baseline Essentials
- [x] **Character Identity & Dossier:** Full canon trait table, downloadable press cutouts, and studio reference sketch.
- [x] **6 Showcase Inventions (Bento Grid + Blueprint Lightbox):** Complete specs, engineering notes, and 1-click interactive workshop launchers.
- [x] **Interactive Scroll & Chapter Story Journey:** 4 illustrated nocturnal chapters (< 150 words per scene) with interactive SVG dioramas.
- [x] **2D Cursor Eye-Tracking & Hover Reactions:** Smooth spring-damped amber eye-lights that follow the visitor’s cursor across the screen.
- [x] **Cozy Cream Day / Midnight Slumber Night Toggle:** Instant palette transition between warm cream (`#FFF8F1`) and nocturnal indigo (`#0B0E18`).
- [x] **Mobile-First Responsive Layout:** Sticky mobile section scroll-spy bar (`< 768px`) and touch-ready controls.
- [x] **Hidden Easter Eggs:**
  1. Tap Pip’s **pink nightcap bow 3 times** (in 2D or 3D WebGL mode) for a celebratory music-box arpeggio, star confetti, and the *Honorary Midnight Milk & Starlight Inspector* badge.
  2. Type **`milk`** or **`pip`** anywhere on your keyboard to trigger Pip’s secret chime.

### Tier 2 — Standout Interactive Engineering
- [x] **01 · The Lullaby Lab (Web Audio API Synthesizer):** 6-note × 8-step polyphonic celesta sequencer tuned to 432 Hz with golden winding key mechanics, BPM tempo & low-pass warmth filters, preset melodies, *Cozy Random* generator, and *Pin Melody to Guestbook*.
- [x] **02 · Nightlight Collection Studio:** Interactive Kelvin warmth (`1,850K–3,200K`) and dimmer calibration with real-time *Shadow Softener Status* and a full-page **Nightlight Torch** radial mask that reveals hidden margin notes.
- [x] **03 · Dream Delivery Flight Routes:** Interactive rooftop SVG map across 5 valley stops with parcel inspection and **Auto-Fly Route** mode.
- [x] **04 · Rattle & Block Nursery Toybox:** Stackable `h-a-X-♡-★-☾` maple blocks with **Play Tower Arpeggio** and a shakeable starlight rattle.
- [x] **05 · Illustrated Bedtime Storybook:** 4-page interactive flipbook with **Read-Aloud Chime** and **Auto-Turn Pages** mode.
- [x] **06 · Nursery Doorframe Growth Chart:** Interactive height & skill notch inspector (`12.0 in` to `28.5 in`).
- [x] **07 · Starlight Dream Catcher (60fps Canvas Arcade Game + PNG Certificate):** Full-viewport or embedded arcade game with `A/D` / `←/→` movement, `Space` cloud-dash, `Esc` pause, hitstop, screen shake, hazard lane telegraphs, and a downloadable **Official Dream Parcel Certificate (`.PNG`)**.

### Tier 3 — Boss-Level Features
- [x] **Interactive 3D WebGL Character Stage (`Three.js`):** Real-time 3D procedural model of Pip on a cloud cushion with `OrbitControls`, `RoomEnvironment` PBR lighting, clickable 3D maple blocks (`h-a-X-♡`), 24 instanced starlight motes, smooth camera presets (`Front`, `Close-Up`, `Top Cloud`), and raycasted 3D pink bow Easter egg.
- [x] **Talk to Pip (AI + Rule-Based Character Intercom):** Full-stack `/api/pip-chat` endpoint powered by `@google/genai` (`gemini-3-flash-preview`) with an instant deterministic canon fallback so Pip always replies in character.
- [x] **Persistent Visitor Memory:** Remembers the visitor’s name and visit count (`Visit #N`) across sessions on Pip’s hero badge and intercom.

### Bonus Side Quests (+13 Pts)
- [x] **Live Guestbook (`+2 pts`):** Real-time wall backed by `/api/guestbook` where visitors can pin bedtime wishes, attach custom 8-step melodies from the Lullaby Lab, and send **Starlight Applause (`★`)** chimes.
- [x] **Sparkle Cursor Trail (`+2 pts`):** Toggleable `★ ✦ ♡ ☾` cursor trail.
- [x] **Hit Counter Odometer (`+1 pt`):** 6-digit vintage nursery visitor odometer backed by `/api/odometer`.
- [x] **Click Sounds + Mute Toggle (`+3 pts`):** Procedural Web Audio API chimes on every interaction with a persistent global mute switch.
- [x] **90s Whimsy / Responsive Chaos Mode (`+5 pts`):** Toggle **`90s Whimsy Mode`** (`PIP_OS v1.99`) for a nostalgic marquee banner, classic `C:\NURSERY\*.EXE` window title bars, hard-offset borders, and clickable `88×31` retro web-ring stamps.

---

## 🗂️ Repository Structure

```text
pips-midnight-nursery/
├── public/
│   └── baby/
│       ├── pip.jpg                           # Official character reference sketch
│       └── assets/                           # Official haX.baby PNG renders & studio SVGs
│           ├── pip_avatar_cloud.png          # Hero cloud cutout
│           ├── pip_portrait.png              # Character dossier portrait
│           ├── pip_lullaby_box.png           # Lullaby Lab music box render
│           ├── pip_dream_lantern.png         # Porcelain nightlight lantern render
│           ├── midnight_nursery_observatory.png
│           ├── storybook_moon_scene.png
│           ├── pip_toybox_blocks.svg         # Custom studio vector illustration
│           └── pip_growth_chart.svg          # Custom studio vector illustration
├── src/
│   ├── components/
│   │   ├── InteractivePipAvatar.tsx          # 2D cursor eye-tracking + 3D WebGL stage switcher
│   │   ├── Pip3DStage.tsx                    # Three.js WebGL 3D character & cloud diorama
│   │   ├── LullabyLab.tsx                    # 432 Hz Web Audio polyphonic music box sequencer
│   │   ├── InteractiveWorkshops.tsx          # Workshops 02–06 (Nightlights, Map, Blocks, Book, Growth)
│   │   ├── DreamCatcherMiniGame.tsx          # 60fps canvas arcade game + PNG certificate exporter
│   │   ├── StoryJourney.tsx                  # 4-chapter interactive bedtime origin story
│   │   ├── PipChatAndGuestbook.tsx           # Character intercom + Live Dream Guestbook wall
│   │   ├── ProjectDetailModal.tsx            # Invention blueprint lightbox modal
│   │   └── BriefInspectorModal.tsx           # Studio Dossier, Feature Index & Track 2 Passport Maker
│   ├── data/
│   │   └── pipCanon.ts                       # Canon character profile, 6 inventions, story chapters
│   ├── utils/
│   │   └── soundEngine.ts                    # Zero-dependency Web Audio API procedural sound engine
│   ├── App.tsx                               # Main application layout, scroll-spy & sensory controls
│   ├── index.css                             # Tailwind v4 typography, theme tokens & marquee keyframes
│   └── main.tsx                              # React 19 entry point
├── docs/
│   ├── HACKATHON_SUBMISSION.md               # Ready-to-use Unstop pitch, demo script & rubric checklist
│   └── ARCHITECTURE.md                       # System architecture, audio graph & API documentation
├── server.ts                                 # Express full-stack server (/api/guestbook, /api/pip-chat)
├── index.html                                # SEO & OpenGraph metadata + Google Fonts (Fraunces, Plus Jakarta, Fredoka)
├── package.json                              # Scripts and dependencies
├── tsconfig.json                             # TypeScript configuration
└── vite.config.ts                            # Vite bundler configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** `>= 18.x` (or **Bun** `>= 1.1`)
- **npm** `>= 9.x`

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd pips-midnight-nursery
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- `GEMINI_API_KEY` *(Optional)*: Powers dynamic AI responses in the **Talk to Pip** intercom (`/api/pip-chat`). If omitted, the server automatically uses a rich, deterministic in-character canon responder so the app works 100% offline/without keys.

### 3. Run the Full-Stack Development Server
```bash
npm run dev
```
The Express + Vite server will start on **`http://localhost:3000`**.

### 4. Type-Check & Build for Production
```bash
npm run lint
npm run build
```

---

## 🕵️‍♂️ Quick Judge’s Cheat-Sheet

| Feature to Test | Where to Find It |
| :--- | :--- |
| **2D Eye-Tracking & 3D WebGL Toggle** | Hero Right Column → Click **`3D WebGL Stage`** to orbit Pip in 3D |
| **Pink Bow Easter Egg (#1)** | Tap Pip’s **pink nightcap bow 3 times** in either 2D or 3D mode |
| **Keyboard Easter Egg (#2)** | Type **`milk`** or **`pip`** anywhere on the page |
| **Nightlight Torch Secret Reveal** | Top Control Bar → Click **`Nightlight Torch`**, then inspect the *Character Identity* margin note |
| **90s Whimsy Mode (`PIP_OS v1.99`)** | Top Control Bar → Click **`90s Whimsy Mode`** (or footer `88×31` stamp) |
| **Pin Custom Melody to Guestbook** | Section 03 (`Lullaby Lab`) → Click **`Pin Melody to Guestbook`** → Sign wall & press **`Play`** |
| **Full-Viewport Arcade Game & PNG Cert** | Section 03 → Tab **`07. Dream Catcher & Cert`** → Play or export `.PNG` certificate |

---

## 📜 Credits & License

- **Character & Official Cutout Assets:** *Pip, The Skull Baby* created by **[haX.baby](https://hax.baby/baby-problem)** for the *Baby’s First Website* hackathon.
- **License:** Released under the [Apache-2.0 / MIT License](./LICENSE).
