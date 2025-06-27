export interface User {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  ip: string;
  referrals: number;
}

export interface Giveaway {
  id: string;
  title: string;
  hostName: string;
  channelUrl: string;
  endDate: Date;
  createdAt: Date;
  creatorId: string;
  participants: User[];
  winner?: User;
  isActive: boolean;
}

export interface ReferralClick {
  id: string;
  giveawayId: string;
  referrerId: string;
  clickerIp: string;
  timestamp: Date;
  isValid: boolean;
}

export interface Database {
  giveaways: Giveaway[];
  users: User[];
  referralClicks: ReferralClick[];
  channelJoins: string[]; // IPs that have joined the channel
}