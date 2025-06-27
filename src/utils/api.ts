const API_BASE_URL = 'https://luminor.onrender.com/api';

// API utility functions for backend communication
export const api = {
  // Giveaways
  async getGiveaways() {
    const response = await fetch(`${API_BASE_URL}/giveaways`);
    if (!response.ok) throw new Error('Failed to fetch giveaways');
    return response.json();
  },

  async getGiveaway(id: string) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}`);
    if (!response.ok) throw new Error('Failed to fetch giveaway');
    return response.json();
  },

  async createGiveaway(data: {
    title: string;
    hostName: string;
    channelUrl: string;
    endDate: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/giveaways`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create giveaway');
    return response.json();
  },

  async joinGiveaway(id: string, data: { name: string; avatar?: string }) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join giveaway');
    }
    return response.json();
  },

  async trackReferral(id: string, referrerId: string) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}/referral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referrerId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to track referral');
    }
    return response.json();
  },

  async getLeaderboard(id: string) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  async endGiveaway(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Failed to end giveaway');
    return response.json();
  },

  async deleteGiveaway(id: string, creatorId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/giveaways/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId, token }),
    });
    if (!response.ok) throw new Error('Failed to delete giveaway');
    return response.ok;
  },

  // Channel tracking
  async markChannelJoined() {
    const response = await fetch(`${API_BASE_URL}/channel/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to mark channel joined');
    return response.json();
  },

  async checkChannelStatus() {
    const response = await fetch(`${API_BASE_URL}/channel/status`);
    if (!response.ok) throw new Error('Failed to check channel status');
    return response.json();
  },

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Backend not available');
    return response.json();
  }
};
