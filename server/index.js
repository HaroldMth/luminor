import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

// --- Config ---
const PORT = process.env.PORT || 3001;
const DB_FILE = './server/db.json';
const SECRET_TOKEN = '789865452211zàjejebeh';

const app = express();
app.use(cors());
app.use(express.json());

// --- Helpers ---
const loadDB = async () => {
  if (!(await fs.pathExists(DB_FILE))) {
    await fs.writeJson(DB_FILE, { giveaways: [], users: [], referralClicks: [], channelJoins: [] });
  }
  return fs.readJson(DB_FILE);
};

const saveDB = async (data) => fs.writeJson(DB_FILE, data, { spaces: 2 });
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// Get client IP helper
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// --- Endpoints ---

// Get all giveaways
app.get('/api/giveaways', async (req, res) => {
  try {
    const db = await loadDB();
    res.json(db.giveaways);
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific giveaway
app.get('/api/giveaways/:id', async (req, res) => {
  try {
    const db = await loadDB();
    const g = db.giveaways.find(g => g.id === req.params.id);
    if (!g) return res.status(404).json({ error: 'Giveaway not found' });
    res.json(g);
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a giveaway
app.post('/api/giveaways', async (req, res) => {
  try {
    const { title, hostName, channelUrl, endDate } = req.body;
    
    if (!title || !hostName || !channelUrl || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await loadDB();
    const giveaway = {
      id: generateId(),
      title,
      hostName,
      channelUrl,
      endDate: new Date(endDate),
      createdAt: new Date(),
      creatorId: generateId(),
      participants: [],
      isActive: true
    };
    
    db.giveaways.push(giveaway);
    await saveDB(db);
    res.json(giveaway);
  } catch (error) {
    console.error('Error creating giveaway:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join giveaway
app.post('/api/giveaways/:id/join', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const ip = getClientIP(req);
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = await loadDB();
    const giveaway = db.giveaways.find(g => g.id === req.params.id);
    
    if (!giveaway || !giveaway.isActive) {
      return res.status(400).json({ error: 'Giveaway inactive or not found' });
    }

    // Check if user already joined from this IP
    const existingParticipant = giveaway.participants.find(p => p.ip === ip);
    if (existingParticipant) {
      return res.status(409).json({ error: 'Already joined from this IP' });
    }

    // Random anime avatars if none provided
    const animeAvatars = avatarSeeds.map(seed => 
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
);


    const user = {
      id: generateId(),
      name,
      avatar: avatar || animeAvatars[Math.floor(Math.random() * animeAvatars.length)],
      joinedAt: new Date(),
      ip,
      referrals: 0
    };

    giveaway.participants.push(user);
    db.users.push(user);
    await saveDB(db);
    res.json(user);
  } catch (error) {
    console.error('Error joining giveaway:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Referral tracking
app.post('/api/giveaways/:id/referral', async (req, res) => {
  try {
    const { referrerId } = req.body;
    const ip = getClientIP(req);
    
    const db = await loadDB();
    const giveaway = db.giveaways.find(g => g.id === req.params.id);
    
    if (!giveaway || !giveaway.isActive) {
      return res.status(404).json({ error: 'Giveaway not active' });
    }

    // Check if this IP already referred this giveaway
    const already = db.referralClicks.find(r => r.giveawayId === giveaway.id && r.clickerIp === ip);
    if (already) {
      return res.status(409).json({ error: 'Referral already tracked' });
    }

    const referral = {
      id: generateId(),
      giveawayId: giveaway.id,
      referrerId,
      clickerIp: ip,
      timestamp: new Date(),
      isValid: true
    };

    // Find and update referrer
    const referrer = giveaway.participants.find(p => p.id === referrerId);
    if (referrer) {
      referrer.referrals += 1;
    }

    db.referralClicks.push(referral);
    await saveDB(db);
    res.json(referral);
  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End giveaway & pick winner
app.post('/api/giveaways/:id/end', async (req, res) => {
  try {
    const { token } = req.body;
    if (token !== SECRET_TOKEN) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const db = await loadDB();
    const g = db.giveaways.find(g => g.id === req.params.id);
    
    if (!g || !g.isActive) {
      return res.status(400).json({ error: 'Giveaway already ended or not found' });
    }

    if (g.participants.length === 0) {
      return res.status(400).json({ error: 'No participants' });
    }

    const winner = g.participants[Math.floor(Math.random() * g.participants.length)];
    g.winner = winner;
    g.isActive = false;

    await saveDB(db);
    res.json({ winner });
  } catch (error) {
    console.error('Error ending giveaway:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete giveaway (requires creatorId)
app.delete('/api/giveaways/:id', async (req, res) => {
  try {
    const { creatorId, token } = req.body;
    if (token !== SECRET_TOKEN) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const db = await loadDB();
    const index = db.giveaways.findIndex(g => g.id === req.params.id && g.creatorId === creatorId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Not found or wrong creator' });
    }

    db.giveaways.splice(index, 1);
    db.referralClicks = db.referralClicks.filter(r => r.giveawayId !== req.params.id);
    await saveDB(db);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard
app.get('/api/giveaways/:id/leaderboard', async (req, res) => {
  try {
    const db = await loadDB();
    const g = db.giveaways.find(g => g.id === req.params.id);
    
    if (!g) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    const top = [...g.participants].sort((a, b) => b.referrals - a.referrals).slice(0, 10);
    res.json(top);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Channel join tracking
app.post('/api/channel/join', async (req, res) => {
  try {
    const ip = getClientIP(req);
    const db = await loadDB();
    
    if (!db.channelJoins.includes(ip)) {
      db.channelJoins.push(ip);
      await saveDB(db);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking channel join:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if IP has joined channel
app.get('/api/channel/status', async (req, res) => {
  try {
    const ip = getClientIP(req);
    const db = await loadDB();
    const hasJoined = db.channelJoins.includes(ip);
    
    res.json({ hasJoined });
  } catch (error) {
    console.error('Error checking channel status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎉 Luminora backend running at http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});