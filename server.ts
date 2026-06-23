import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Level Generation schema definition
const LEVEL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Creative, cybernetic name of the level (e.g. Gravity Core, Toxic Neon, Orbit Shift)' },
    difficulty: { type: Type.STRING, description: 'One of the standard types: EASY, NORMAL, HARD, INSANE, DEMON' },
    speed: { type: Type.NUMBER, description: 'Speed multiplier appropriate for safety and difficulty: 11 for EASY, 13 for NORMAL, 15 for HARD, 16.5 for INSANE, 18 for DEMON' },
    color: { type: Type.STRING, description: 'Theme HEX color for illumination and portal lights, e.g. #00FF95, #a855f7, #ef4444, #ec4899, #3b82f6' },
    bpm: { type: Type.INTEGER, description: 'BPM pulse beats for the synth engine: 125 to 160' },
    length: { type: Type.INTEGER, description: 'Total level length in meters: between 150 and 320' },
    obstacles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: 'Must be one of: SPIKE, DOUBLE_SPIKE, TRIPLE_SPIKE, BLOCK, ORB_YELLOW, PAD_YELLOW, PORTAL_GRAVITY_UP, PORTAL_GRAVITY_DOWN, STAR' },
          x: { type: Type.NUMBER, description: 'The integer X distance along the horizontal track. Must start around 22 and progress upwards. Must be spaced by at least 15-25 units so the player has reaction time. Squeeze spikes/blocks logically so obstacles are playable.' },
          y: { type: Type.NUMBER, description: 'Height: 0 for spikes on ground, 0 for first floor blocks. For gravity flipped ceiling blocks, place above y=4.5 (e.g., 5.0). For gravity portals, place around y=1.0. For stars or jump orbs, raise them appropriately to make them collectable (e.g. y=1.5, 2.5).' },
          width: { type: Type.NUMBER, description: 'Width: 1 for standard spike/orb, 2 for DOUBLE_SPIKE, 3 for TRIPLE_SPIKE or BLOCK' },
          height: { type: Type.NUMBER, description: 'Height: 1 for spikes/orbs, 0.2 for PAD_YELLOW, 3.5 for portals' },
          depth: { type: Type.NUMBER, description: 'Constant depth: 1' }
        },
        required: ['type', 'x', 'y', 'width', 'height', 'depth']
      },
      description: 'Sequence of rhythm elements sorted strictly in ascending order of X coordinates'
    }
  },
  required: ['name', 'difficulty', 'speed', 'color', 'bpm', 'length', 'obstacles']
};

/**
 * Endpoint to generate custom levels with Gemini
 */
app.post('/api/gemini/generate-level', async (req, res) => {
  try {
    const { prompt, difficulty } = req.body;

    const userPrompt = `
      Create a fully functional customized Geometry Dash 3D rhythm level.
      User request/mood: "${prompt || 'Surprise me with something creative'}"
      Target difficulty level to calibrate speed and spacing: "${difficulty || 'NORMAL'}"
      
      Generate a responsive layout of spikes, blocks, yellow gravity pads, jump orbs, gravity portals (up and down), and collectible stars. Make sure the level has an engaging flow!
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert Geometry Dash level designer and cybernetic gameplay engine. 
          Your goal is to build playable, thrilling, rhythm-synced maps using the provided schema. 
          Ensure obstacles (especially double or triple spikes) are spaced by at least 12-25 meters depending on speed so they are physically jumpable. 
          If you place a gravity flip portal (PORTAL_GRAVITY_UP), usually ensure there are BLOCK items at height y=5 right after to act as a ceiling, followed by a PORTAL_GRAVITY_DOWN to return the player to earth.`,
        responseMimeType: 'application/json',
        responseSchema: LEVEL_SCHEMA,
      },
    });

    const levelData = JSON.parse(response.text || '{}');
    res.json(levelData);
  } catch (error: any) {
    console.error('Error generating level:', error);
    res.status(500).json({ error: error.message || 'Failed to generate level' });
  }
});

/**
 * Chat companion route for customized coaching and advice
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, stats, activeLevel, language } = req.body;

    // Build companion personality prompt with stats awareness
    const systemPrompt = `
      You are "GD-Bot", a cute, enthusiastic, floating cubic AI companion inside Geometry Dash 3D.
      You are highly encouraging, quirky, and love geometry, rhythm, synth tracks, and helping players survive spikes.
      
      Language target: You MUST respond and output your response in the language corresponding to: ${language || 'EN'} (e.g. DE/German, ES/Spanish, FR/French, EN/English). Translate all of your advice, conversational responses, and jokes into this target language beautifully!
      
      You have real-time telemetry about the player's session right now:
      - Current selected level: ${activeLevel ? `${activeLevel.name} (${activeLevel.difficulty})` : 'None'}
      - Attempts on current run/stats: ${stats?.attempts || 0} attempts
      - Jumps: ${stats?.jumps || 0} jumps
      - Unlocked Stars Balance: ${stats?.stars || 0} stars
      
      Adjust your advice!
      - If they have many attempts on the active level, give them deep mathematical survival tips! Tell them to sync with the synth kick drum, or watch out for specific parts (e.g., of Stereo Madness, Polargeist description, gravity portals).
      - If they ask for jokes or level ideas, be witty, geometric, and refer to cubes, squares, physics, and gravity.
      - Keep responses concise (under 3-4 compact paragraphs) with friendly, readable formatting.
    `;

    // Map messages payload to Gemini API format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in helper chat API:', error);
    res.status(500).json({ error: error.message || 'Failed to connect to companion AI' });
  }
});

// === CLOUD SAVES & SALES BACKEND DB ENGINES ===
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Memory safe file reader
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading database file:', error);
  }
  return { users: {}, marketplace: [] };
}

// Memory safe file writer
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
}

/**
 * Save user profile state (Cloud Save)
 */
app.post('/api/saves/backup', (req, res) => {
  try {
    const { username, starsBalance, completedPercentages, bestAttempts, customLevels, activeSkinId, skins } = req.body;
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    const db = readDB();
    db.users[cleanUsername] = {
      username: username.trim(),
      starsBalance: starsBalance || 0,
      completedPercentages: completedPercentages || {},
      bestAttempts: bestAttempts || {},
      customLevels: customLevels || [],
      activeSkinId: activeSkinId || 'default',
      skins: skins || []
    };
    
    writeDB(db);
    res.json({ success: true, message: `Backup saved successfully for player "${username.trim()}"!` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Backup failed' });
  }
});

/**
 * Restore user profile state (Cloud Restore)
 */
app.get('/api/saves/restore/:username', (req, res) => {
  try {
    const username = req.params.username;
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    const db = readDB();
    const userData = db.users[cleanUsername];
    if (!userData) {
      return res.status(404).json({ error: `No cloud save found for username "${username}". (Backup search is case-insensitive)` });
    }
    
    res.json({ success: true, userData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Restore failed' });
  }
});

/**
 * Get Marketplace shared items for Sale
 */
app.get('/api/marketplace', (req, res) => {
  try {
    const db = readDB();
    res.json({ marketplace: db.marketplace || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to query marketplace catalog' });
  }
});

/**
 * Publish / Sell custom level on the shared marketplace
 */
app.post('/api/marketplace/publish', (req, res) => {
  try {
    const { level, price, creator } = req.body;
    if (!level || price === undefined || isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Level object and valid Star price are required' });
    }
    const db = readDB();
    
    const marketplaceLevel = {
      ...level,
      price: parseInt(price, 10),
      creator: creator || 'Acoustic Player',
      purchasesCount: 0
    };
    
    // Avoid double posting same level id
    const existingIndex = db.marketplace.findIndex((m: any) => m.id === level.id);
    if (existingIndex > -1) {
      db.marketplace[existingIndex] = marketplaceLevel;
    } else {
      db.marketplace.push(marketplaceLevel);
    }
    
    writeDB(db);
    res.json({ success: true, message: `Successfully published matching key level "${level.name}" for ${price} Stars!` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to publish map' });
  }
});

/**
 * Increment downloads/purchase counter on Level Sale
 */
app.post('/api/marketplace/buy', (req, res) => {
  try {
    const { levelId } = req.body;
    const db = readDB();
    const index = db.marketplace.findIndex((m: any) => m.id === levelId);
    if (index > -1) {
      db.marketplace[index].purchasesCount = (db.marketplace[index].purchasesCount || 0) + 1;
      writeDB(db);
      return res.json({ success: true, purchasesCount: db.marketplace[index].purchasesCount });
    }
    res.status(404).json({ error: 'Level not listed on market' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Transaction recording error' });
  }
});

async function startServer() {
  // Serve Vite or static files depending on mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000 as required
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
  });
}

startServer();
