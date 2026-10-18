import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

interface StoredWish {
  id: string;
  visitorName: string;
  creatureType: string;
  dreamWish: string;
  timestamp: string;
  mood: 'Cozy Cream' | 'Starlight Indigo';
  attachedMelody?: {
    label: string;
    bpm: number;
    notes: number[];
  };
}

interface StoreData {
  odometer: number;
  wishes: StoredWish[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'nursery-store.json');

const DEFAULT_STORE: StoreData = {
  odometer: 10482,
  wishes: [
    {
      id: 'wish-1',
      visitorName: 'Sai Ram (haX.baby)',
      creatureType: 'Cloud Bunny',
      dreamWish:
        'Wishing every first-time builder a joyful 48 hours of shipping cute things. Start small, build together!',
      timestamp: '17 Oct · 17:17 IST',
      mood: 'Cozy Cream',
    },
    {
      id: 'wish-2',
      visitorName: 'Milo & Barnaby',
      creatureType: 'Sleepy Hedgehog',
      dreamWish:
        'Pip, please send a dream where all our CSS grids align on the first try and the warm milk never cools down.',
      timestamp: '17 Oct · 21:04 IST',
      mood: 'Starlight Indigo',
    },
    {
      id: 'wish-3',
      visitorName: 'Clara from Studio 9',
      creatureType: 'Night-Owl',
      dreamWish:
        'The Lullaby Lab music box actually made me yawn in the best way. Keep that pink nightcap bow straight, Pip!',
      timestamp: '18 Oct · 01:12 IST',
      mood: 'Cozy Cream',
      attachedMelody: {
        label: 'Cloud Nine Waltz (88 BPM)',
        bpm: 88,
        notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880.0, 1046.5],
      },
    },
  ],
};

function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
      return { ...DEFAULT_STORE };
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw) as StoreData;
  } catch {
    return { ...DEFAULT_STORE };
  }
}

function saveStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore write errors in read-only sandboxes
  }
}

function ruleBasedPipReply(
  input: string,
  visitorName: string,
  visitCount: number,
  isNightMode: boolean
): string {
  const q = input.toLowerCase();
  const who = visitorName ? `, ${visitorName}` : '';
  if (q.includes('skull') || q.includes('face') || q.includes('bone') || q.includes('scary')) {
    return `“Hic—giggle! People sometimes think skulls are spooky${who}, but mine is smooth warm porcelain! It holds my two cozy 1850K amber eye-lights and never gets tired of smiling at you.”`;
  }
  if (q.includes('dream') || q.includes('engineer') || q.includes('make') || q.includes('job')) {
    return `“First, I catch a stray cumulus tuft on the balcony${who}. Then I mix in 3 turns of my brass celesta music box, a pinch of cinnamon-bun steam from Owl Post Bakery, and tie it with a pink ribbon!”`;
  }
  if (q.includes('secret') || q.includes('easter') || q.includes('bow')) {
    return `“Ooh, a secret${who}! If you tap the little pink bow on my starry nightcap 3 times in the hero stage (or in 3D WebGL mode), I’ll throw a Midnight Milk & Starlight confetti party!”`;
  }
  if (q.includes('3d') || q.includes('webgl') || q.includes('spin') || q.includes('model')) {
    return `“Switch the Hero Stage to 3D WebGL mode${who}! You can orbit around my cloud cushion, click my floating h-a-X-♡ maple blocks to chime them, or tap my 3D pink bow!”`;
  }
  if (q.includes('lullaby') || q.includes('music') || q.includes('song')) {
    return `“My favorite is Cloud Nine Waltz at 88 BPM${who}! I hate silence—even a tiny wooden block click makes the nursery feel safer.”`;
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return visitCount > 1
      ? `“Welcome back for visit #${visitCount}${who}! I kept your cloud cushion fluffed and the porcelain lantern glowing at 1850K!”`
      : `“Hello${who}! I’m Pip, Junior Dream Engineer at Midnight Nursery. Want some warm honey milk?”`;
  }
  return isNightMode
    ? `“*Yawns happily* That sounds like a wonderful midnight thought${who}! I just wrote "${input.slice(
        0,
        40
      )}" onto a gold star note and tucked it into tonight’s cloud parcel bag!”`
    : `“Giggle! I love when visitors tell me things like that${who}! I’ll tune my music box to 432 Hz tonight just for you.”`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/guestbook', (_req, res) => {
    const store = loadStore();
    res.json({ wishes: store.wishes, odometer: store.odometer });
  });

  app.post('/api/guestbook', (req, res) => {
    const { visitorName, creatureType, dreamWish, mood, attachedMelody } = req.body || {};
    if (!visitorName || !dreamWish) {
      res.status(400).json({ error: 'Name and dream wish are required.' });
      return;
    }
    const store = loadStore();
    const validMelody =
      attachedMelody &&
      typeof attachedMelody.label === 'string' &&
      Array.isArray(attachedMelody.notes)
        ? {
            label: String(attachedMelody.label).slice(0, 48),
            bpm: Number(attachedMelody.bpm) || 88,
            notes: attachedMelody.notes.slice(0, 8).map((n: unknown) => Number(n) || 0),
          }
        : undefined;

    const newWish: StoredWish = {
      id: `wish-${Date.now()}`,
      visitorName: String(visitorName).slice(0, 40),
      creatureType: String(creatureType || 'Cloud Bunny').slice(0, 32),
      dreamWish: String(dreamWish).slice(0, 160),
      timestamp:
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' · Cloud-Crib Post',
      mood: mood === 'Starlight Indigo' ? 'Starlight Indigo' : 'Cozy Cream',
      ...(validMelody ? { attachedMelody: validMelody } : {}),
    };
    store.wishes = [newWish, ...store.wishes.slice(0, 49)];
    saveStore(store);
    res.json({ wish: newWish, wishes: store.wishes });
  });

  app.post('/api/odometer', (_req, res) => {
    const store = loadStore();
    store.odometer += 1;
    saveStore(store);
    res.json({ odometer: store.odometer });
  });

  // Tier 3 Legendary: AI or Rule-Based Dialogue in Pip's Character Voice
  app.post('/api/pip-chat', async (req, res) => {
    const { message, visitorName = '', visitCount = 1, isNightMode = false } = req.body || {};
    const promptText = String(message || '').trim();
    if (!promptText) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Visitor (${visitorName || 'Friend'}, Visit #${visitCount}, Mode: ${
            isNightMode ? 'Midnight Slumber' : 'Cozy Day'
          }) says: "${promptText}"`,
          config: {
            systemInstruction:
              'You are Pip, the canon Track 1 character from haX.baby Baby\'s First Website hackathon. You are a cute, sleepy, gentle baby with a smooth round porcelain skull face, huge soft eye sockets with glowing warm-amber pinpricks, a tiny crooked smile, and a bedtime nightcap with stars and a pink bow. You work as Junior Dream Engineer at Midnight Nursery. You design lullabies (432 Hz brass music box), porcelain nightlights (1850K warm glow), dream delivery routes on a cloud cushion, maple blocks (h-a-X-♡), and bedtime storybooks. Always reply in 2-3 short, adorable, cozy sentences wrapped in quotation marks. Never be scary, creepy, or gory.',
            temperature: 0.7,
            maxOutputTokens: 140,
          },
        });

        const aiText = response.text?.trim();
        if (aiText) {
          res.json({ reply: aiText, source: 'Gemini AI · Pip Voice' });
          return;
        }
      } catch {
        // Gracefully fall back to rule-based engine if quota or key error occurs
      }
    }

    const fallback = ruleBasedPipReply(promptText, visitorName, visitCount, isNightMode);
    res.json({ reply: fallback, source: 'Canon Voice Engine' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pip's Midnight Nursery server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
