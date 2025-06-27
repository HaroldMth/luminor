import { Database, Giveaway, User, ReferralClick } from '../types';
import { api } from './api';

const STORAGE_KEY = 'luminora_database';
const SECRET_TOKEN = '789865452211zàjejebeh';

// Anime avatar URLs for random assignment
const ANIME_AVATARS = [
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150',
];

// Initialize database
const initDatabase = (): Database => ({
  giveaways: [],
  users: [],
  referralClicks: [],
  channelJoins: []
});

// Get database from localStorage (fallback for offline mode)
export const getDatabase = (): Database => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      parsed.giveaways = parsed.giveaways?.map((g: any) => ({
        ...g,
        endDate: new Date(g.endDate),
        createdAt: new Date(g.createdAt),
        participants: g.participants?.map((p: any) => ({
          ...p,
          joinedAt: new Date(p.joinedAt)
        })) || []
      })) || [];
      parsed.users = parsed.users?.map((u: any) => ({
        ...u,
        joinedAt: new Date(u.joinedAt)
      })) || [];
      parsed.referralClicks = parsed.referralClicks?.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      })) || [];
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load database:', error);
  }
  return initDatabase();
};

// Save database to localStorage (fallback for offline mode)
export const saveDatabase = (db: Database): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Get user IP (simulated for demo)
export const getUserIP = (): string => {
  return '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
};

// Get random anime avatar
export const getRandomAvatar = (): string => {
  return ANIME_AVATARS[Math.floor(Math.random() * ANIME_AVATARS.length)];
};

// Check if IP has joined channel (try API first, fallback to localStorage)
export const hasJoinedChannel = async (ip?: string): Promise<boolean> => {
  try {
    const result = await api.checkChannelStatus();
    return result.hasJoined;
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    return db.channelJoins.includes(ip || getUserIP());
  }
};

// Mark IP as joined channel (try API first, fallback to localStorage)
export const markChannelJoined = async (ip?: string): Promise<void> => {
  try {
    await api.markChannelJoined();
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const userIp = ip || getUserIP();
    if (!db.channelJoins.includes(userIp)) {
      db.channelJoins.push(userIp);
      saveDatabase(db);
    }
  }
};

// Create giveaway (try API first, fallback to localStorage)
export const createGiveaway = async (title: string, hostName: string, channelUrl: string, endDate: Date): Promise<Giveaway> => {
  try {
    const giveaway = await api.createGiveaway({
      title,
      hostName,
      channelUrl,
      endDate: endDate.toISOString()
    });
    return {
      ...giveaway,
      endDate: new Date(giveaway.endDate),
      createdAt: new Date(giveaway.createdAt)
    };
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const giveaway: Giveaway = {
      id: generateId(),
      title,
      hostName,
      channelUrl,
      endDate,
      createdAt: new Date(),
      creatorId: generateId(),
      participants: [],
      isActive: true
    };
    
    db.giveaways.push(giveaway);
    saveDatabase(db);
    return giveaway;
  }
};

// Join giveaway (try API first, fallback to localStorage)
export const joinGiveaway = async (giveawayId: string, name: string, avatar?: string): Promise<User> => {
  try {
    const user = await api.joinGiveaway(giveawayId, { name, avatar });
    return {
      ...user,
      joinedAt: new Date(user.joinedAt)
    };
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const ip = getUserIP();
    
    const user: User = {
      id: generateId(),
      name,
      avatar: avatar || getRandomAvatar(),
      joinedAt: new Date(),
      ip,
      referrals: 0
    };
    
    const giveaway = db.giveaways.find(g => g.id === giveawayId);
    if (giveaway && giveaway.isActive) {
      giveaway.participants.push(user);
      db.users.push(user);
      saveDatabase(db);
    }
    
    return user;
  }
};

// Track referral click (try API first, fallback to localStorage)
export const trackReferralClick = async (giveawayId: string, referrerId: string): Promise<boolean> => {
  try {
    await api.trackReferral(giveawayId, referrerId);
    return true;
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const clickerIp = getUserIP();
    
    // Check if this IP has already referred this giveaway
    const existingClick = db.referralClicks.find(
      r => r.giveawayId === giveawayId && r.clickerIp === clickerIp
    );
    
    if (existingClick) {
      return false; // Already tracked
    }
    
    const giveaway = db.giveaways.find(g => g.id === giveawayId);
    if (!giveaway || !giveaway.isActive) {
      return false;
    }
    
    const referralClick: ReferralClick = {
      id: generateId(),
      giveawayId,
      referrerId,
      clickerIp,
      timestamp: new Date(),
      isValid: true
    };
    
    db.referralClicks.push(referralClick);
    
    // Increment referrer's count
    const referrer = giveaway.participants.find(p => p.id === referrerId);
    if (referrer) {
      referrer.referrals += 1;
    }
    
    saveDatabase(db);
    return true;
  }
};

// Get giveaway by ID (try API first, fallback to localStorage)
export const getGiveaway = async (id: string): Promise<Giveaway | undefined> => {
  try {
    const giveaway = await api.getGiveaway(id);
    return {
      ...giveaway,
      endDate: new Date(giveaway.endDate),
      createdAt: new Date(giveaway.createdAt),
      participants: giveaway.participants?.map((p: any) => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      })) || []
    };
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    return db.giveaways.find(g => g.id === id);
  }
};

// Get all giveaways (try API first, fallback to localStorage)
export const getAllGiveaways = async (): Promise<Giveaway[]> => {
  try {
    const giveaways = await api.getGiveaways();
    return giveaways.map((g: any) => ({
      ...g,
      endDate: new Date(g.endDate),
      createdAt: new Date(g.createdAt),
      participants: g.participants?.map((p: any) => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      })) || []
    }));
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    return db.giveaways;
  }
};

// Delete giveaway
export const deleteGiveaway = async (id: string, creatorId: string): Promise<boolean> => {
  try {
    await api.deleteGiveaway(id, creatorId, SECRET_TOKEN);
    return true;
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const index = db.giveaways.findIndex(g => g.id === id && g.creatorId === creatorId);
    
    if (index !== -1) {
      db.giveaways.splice(index, 1);
      // Remove related referral clicks
      db.referralClicks = db.referralClicks.filter(r => r.giveawayId !== id);
      saveDatabase(db);
      return true;
    }
    
    return false;
  }
};

// End giveaway and select winner
export const endGiveaway = async (id: string): Promise<User | null> => {
  try {
    const result = await api.endGiveaway(id, SECRET_TOKEN);
    return result.winner;
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const giveaway = db.giveaways.find(g => g.id === id);
    
    if (giveaway && giveaway.participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * giveaway.participants.length);
      giveaway.winner = giveaway.participants[randomIndex];
      giveaway.isActive = false;
      saveDatabase(db);
      return giveaway.winner;
    }
    
    return null;
  }
};

// Get leaderboard for giveaway (try API first, fallback to localStorage)
export const getLeaderboard = async (giveawayId: string): Promise<User[]> => {
  try {
    const leaderboard = await api.getLeaderboard(giveawayId);
    return leaderboard.map((u: any) => ({
      ...u,
      joinedAt: new Date(u.joinedAt)
    }));
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    const db = getDatabase();
    const giveaway = db.giveaways.find(g => g.id === giveawayId);
    
    if (!giveaway) return [];
    
    return giveaway.participants
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 10);
  }
};

// Validate token (for internal API security)
export const validateToken = (token: string): boolean => {
  return token === SECRET_TOKEN;
};