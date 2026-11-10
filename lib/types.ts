export type Role = "traveler" | "merchant" | "admin";
export type AccountStatus = "active" | "paused";
export type MembershipTier = 1 | 2 | 3;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  walletIndex: number;
  walletAddress: string;
  initials: string;
  homeCity: string;
  tier: number;
  joinedAt: string;
  status: AccountStatus;
  merchantId?: string;
}

export interface MerchantRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  description: string;
  image: string;
  walletIndex: number;
  walletAddress: string;
  chainMerchantId: number;
  status: AccountStatus;
  rating: number;
  memberSince: string;
  accent: string;
}

export interface CampaignRecord {
  id: string;
  slug: string;
  merchantId: string;
  name: string;
  description: string;
  points: number;
  status: "active" | "paused" | "draft";
  startsAt: string;
  endsAt: string;
  audience: string;
}

export interface RewardRecord {
  id: string;
  slug: string;
  merchantId: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  valueUsd: number;
  image: string;
  inventory: number;
  featured: boolean;
  status: "active" | "paused";
  location: string;
  terms: string;
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  rewardId: string;
  cost: number;
  status: "confirmed";
  createdAt: string;
  txHash: string;
}

export interface PlatformMeta {
  name: string;
  network: string;
  chainId: number;
  seededAt: string;
  tokenAddress?: string;
  membershipAddress?: string;
  managerAddress?: string;
}

export interface Database {
  meta: PlatformMeta;
  users: UserRecord[];
  merchants: MerchantRecord[];
  campaigns: CampaignRecord[];
  rewards: RewardRecord[];
  redemptions: RedemptionRecord[];
}

export type ActivityType = "earn" | "redeem" | "transfer-in" | "transfer-out";

export interface ChainActivity {
  id: string;
  type: ActivityType;
  userId?: string;
  userAddress?: string;
  points: number;
  timestamp: number;
  merchantId?: string;
  merchantName?: string;
  ref?: string;
  label: string;
  detail: string;
  category: string;
  txHash: string;
  counterparty?: string;
}

export interface MemberPosition {
  address: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: number;
  tokenId: string | null;
}

export interface MemberChainState extends MemberPosition {
  connected: boolean;
  activity: ChainActivity[];
}

export interface MerchantChainState {
  connected: boolean;
  issued: number;
  redeemed: number;
  transactions: number;
  uniqueMembers: number;
  activity: ChainActivity[];
}

export interface AdminChainState {
  connected: boolean;
  totalSupply: number;
  merchantCount: number;
  activeMerchantCount: number;
  memberCount: number;
  totalIssued: number;
  totalRedeemed: number;
  transactions: number;
  activity: ChainActivity[];
  members: Array<MemberPosition & { userId: string; name: string; email: string; tier: number; status: AccountStatus; joinedAt: string; }>;
}

export interface ChainSnapshot {
  generatedAt: string;
  network: string;
  totalSupply: string;
  merchantCount: number;
  memberCount: number;
  users: Record<
    string,
    {
      address: string;
      balance: string;
      lifetimeEarned: number;
      lifetimeRedeemed: number;
      tier: number;
      tokenId: string | null;
    }
  >;
  activity: ChainActivity[];
  merchantStats: Array<{
    merchantId: string;
    issued: number;
    redeemed: number;
    transactions: number;
  }>;
  contracts: {
    token: string;
    membership: string;
    manager: string;
  };
  accounts: Array<{ index: number; label: string; address: string }>;
}
