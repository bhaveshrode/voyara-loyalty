import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { ZeroAddress, ethers } from "ethers";
import { readDb } from "@/lib/db";
import { getContracts, getProvider } from "@/lib/chain/config";
import type {
  AdminChainState,
  ChainActivity,
  ChainSnapshot,
  MemberChainState,
  MemberPosition,
  MerchantChainState,
  MerchantRecord,
  UserRecord,
} from "@/lib/types";

interface ChainOverview {
  connected: boolean;
  totalSupply: number;
  merchantCount: number;
  activeMerchantCount: number;
  memberCount: number;
  totalIssued: number;
  totalRedeemed: number;
  activity: ChainActivity[];
  members: Array<MemberPosition & { userId: string }>;
}

function loadSnapshot(): ChainSnapshot | null {
  try {
    const snapshotPath = path.join(process.cwd(), "data", "chain-snapshot.json");
    return JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as ChainSnapshot;
  } catch {
    return null;
  }
}

function snapshotOverview(): ChainOverview {
  const db = readDb();
  const snapshot = loadSnapshot();
  const travelers = db.users.filter((user) => user.role === "traveler");

  const members = travelers.map((user) => {
    const entry = snapshot?.users[user.id];
    return {
      userId: user.id,
      address: entry?.address || user.walletAddress,
      balance: Number(entry?.balance || 0),
      lifetimeEarned: entry?.lifetimeEarned || 0,
      lifetimeRedeemed: entry?.lifetimeRedeemed || 0,
      tier: entry?.tier || user.tier,
      tokenId: entry?.tokenId ?? null,
    };
  });

  const activity = (snapshot?.activity || []).slice().sort((a, b) => b.timestamp - a.timestamp);

  return {
    connected: false,
    totalSupply: Number(snapshot?.totalSupply || 0),
    merchantCount: snapshot?.merchantCount || db.merchants.length,
    activeMerchantCount: db.merchants.filter((merchant) => merchant.status === "active").length,
    memberCount: snapshot?.memberCount || members.filter((member) => member.tokenId).length,
    totalIssued: activity.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
    totalRedeemed: activity.filter((event) => event.type === "redeem").reduce((sum, event) => sum + event.points, 0),
    activity,
    members,
  };
}

async function readLiveOverview(): Promise<ChainOverview> {
  const db = readDb();
  const provider = getProvider();
  const { token, manager, membership } = getContracts();

  const [totalSupplyRaw, merchantCountRaw, earnLogs, redeemLogs, transferLogs] = await Promise.all([
    token.totalSupply(),
    manager.merchantCount(),
    manager.queryFilter(manager.filters.RewardEarned(), 0, "latest"),
    manager.queryFilter(manager.filters.RewardRedeemed(), 0, "latest"),
    token.queryFilter(token.filters.Transfer(), 0, "latest"),
  ]);

  const merchantCount = Number(merchantCountRaw);
  const merchantRecords = await Promise.all(
    Array.from({ length: merchantCount }, (_, index) =>
      manager.merchants(index + 1) as Promise<{ active: boolean }>
    )
  );
  const activeMerchantCount = merchantRecords.filter((record) => record.active).length;

  const usersByAddress = new Map(db.users.map((user) => [user.walletAddress.toLowerCase(), user]));
  const merchantsByChainId = new Map(db.merchants.map((merchant) => [merchant.chainMerchantId, merchant]));
  const campaignsByRef = new Map(db.campaigns.map((campaign) => [ethers.id(campaign.slug).toLowerCase(), campaign]));
  const rewardsByRef = new Map(db.rewards.map((reward) => [ethers.id(reward.slug).toLowerCase(), reward]));

  const activity: ChainActivity[] = [];

  for (const log of earnLogs) {
    if (!("args" in log)) continue;
    const args = log.args as unknown as {
      user: string;
      merchantId: bigint;
      campaignRef: string;
      points: bigint;
      timestamp: bigint;
    };
    const user = usersByAddress.get(args.user.toLowerCase());
    const merchant = merchantsByChainId.get(Number(args.merchantId));
    const campaign = campaignsByRef.get(args.campaignRef.toLowerCase());
    activity.push({
      id: `earn-${log.transactionHash}-${log.index}`,
      type: "earn",
      userId: user?.id,
      userAddress: args.user,
      points: Number(args.points),
      timestamp: Number(args.timestamp) * 1000,
      merchantId: merchant?.id,
      merchantName: merchant?.name || `Merchant #${args.merchantId}`,
      ref: campaign?.slug,
      label: campaign?.name || "Reward earned",
      detail: merchant?.name || "Voyara network",
      category: merchant?.category || "Rewards",
      txHash: log.transactionHash,
    });
  }

  for (const log of redeemLogs) {
    if (!("args" in log)) continue;
    const args = log.args as unknown as {
      user: string;
      rewardRef: string;
      points: bigint;
      timestamp: bigint;
    };
    const user = usersByAddress.get(args.user.toLowerCase());
    const reward = rewardsByRef.get(args.rewardRef.toLowerCase());
    const merchant = reward ? db.merchants.find((entry) => entry.id === reward.merchantId) : undefined;
    activity.push({
      id: `redeem-${log.transactionHash}-${log.index}`,
      type: "redeem",
      userId: user?.id,
      userAddress: args.user,
      points: Number(args.points),
      timestamp: Number(args.timestamp) * 1000,
      merchantId: merchant?.id,
      merchantName: merchant?.name || "Voyara",
      ref: reward?.slug,
      label: reward?.title || "Reward redeemed",
      detail: merchant?.name || "Voyara",
      category: reward?.category || "Rewards",
      txHash: log.transactionHash,
    });
  }

  const blockTimestamps = new Map<number, number>();
  for (const log of transferLogs) {
    if (!("args" in log)) continue;
    const args = log.args as unknown as { from: string; to: string; value: bigint };
    if (
      args.from.toLowerCase() === ZeroAddress.toLowerCase() ||
      args.to.toLowerCase() === ZeroAddress.toLowerCase()
    ) {
      continue;
    }

    let timestamp = blockTimestamps.get(log.blockNumber);
    if (!timestamp) {
      const block = await provider.getBlock(log.blockNumber);
      timestamp = (block?.timestamp || Math.floor(Date.now() / 1000)) * 1000;
      blockTimestamps.set(log.blockNumber, timestamp);
    }

    const from = usersByAddress.get(args.from.toLowerCase());
    const to = usersByAddress.get(args.to.toLowerCase());
    const points = Number(args.value);

    if (from) {
      activity.push({
        id: `transfer-out-${log.transactionHash}-${log.index}`,
        type: "transfer-out",
        userId: from.id,
        userAddress: from.walletAddress,
        points,
        timestamp,
        counterparty: to?.name || `${args.to.slice(0, 6)}…${args.to.slice(-4)}`,
        label: "Points transfer",
        detail: `To ${to?.name || "member"}`,
        category: "Transfer",
        txHash: log.transactionHash,
      });
    }

    if (to) {
      activity.push({
        id: `transfer-in-${log.transactionHash}-${log.index}`,
        type: "transfer-in",
        userId: to.id,
        userAddress: to.walletAddress,
        points,
        timestamp,
        counterparty: from?.name || `${args.from.slice(0, 6)}…${args.from.slice(-4)}`,
        label: "Points transfer",
        detail: `From ${from?.name || "member"}`,
        category: "Transfer",
        txHash: log.transactionHash,
      });
    }
  }

  const travelerRecords = db.users.filter((user) => user.role === "traveler");
  const members = await Promise.all(
    travelerRecords.map(async (user) => {
      const address = user.walletAddress;
      const [balance, tokenIdRaw, tierRaw] = await Promise.all([
        token.balanceOf(address),
        membership.tokenOf(address),
        membership.tierOfAddress(address),
      ]);
      const tokenId = Number(tokenIdRaw) > 0 ? tokenIdRaw.toString() : null;
      const userActivity = activity.filter((event) => event.userId === user.id);
      return {
        userId: user.id,
        address,
        balance: Number(balance),
        lifetimeEarned: userActivity.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
        lifetimeRedeemed: userActivity
          .filter((event) => event.type === "redeem")
          .reduce((sum, event) => sum + event.points, 0),
        tier: Number(tierRaw) || user.tier,
        tokenId,
      };
    })
  );

  activity.sort((a, b) => b.timestamp - a.timestamp);

  return {
    connected: true,
    totalSupply: Number(totalSupplyRaw),
    merchantCount,
    activeMerchantCount,
    memberCount: members.filter((member) => member.tokenId).length,
    totalIssued: activity.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
    totalRedeemed: activity
      .filter((event) => event.type === "redeem")
      .reduce((sum, event) => sum + event.points, 0),
    activity,
    members,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("CHAIN_TIMEOUT")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export const getChainOverview = cache(async (): Promise<ChainOverview> => {
  try {
    return await withTimeout(readLiveOverview(), 5000);
  } catch {
    return snapshotOverview();
  }
});

export async function getMemberChainState(user: UserRecord): Promise<MemberChainState> {
  const overview = await getChainOverview();
  const position = overview.members.find((member) => member.userId === user.id);
  return {
    connected: overview.connected,
    address: position?.address || user.walletAddress,
    balance: position?.balance || 0,
    lifetimeEarned: position?.lifetimeEarned || 0,
    lifetimeRedeemed: position?.lifetimeRedeemed || 0,
    tier: position?.tier || user.tier,
    tokenId: position?.tokenId || null,
    activity: overview.activity.filter((event) => event.userId === user.id),
  };
}

export async function getMerchantChainState(merchant: MerchantRecord): Promise<MerchantChainState> {
  const overview = await getChainOverview();
  const activity = overview.activity.filter((event) => event.merchantId === merchant.id);
  const uniqueMembers = new Set(
    activity.filter((event) => event.userId && event.type === "earn").map((event) => event.userId)
  );
  return {
    connected: overview.connected,
    issued: activity.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
    redeemed: activity.filter((event) => event.type === "redeem").reduce((sum, event) => sum + event.points, 0),
    transactions: activity.length,
    uniqueMembers: uniqueMembers.size,
    activity,
  };
}

export async function getAdminChainState(): Promise<AdminChainState> {
  const db = readDb();
  const overview = await getChainOverview();
  return {
    connected: overview.connected,
    totalSupply: overview.totalSupply,
    merchantCount: overview.merchantCount,
    activeMerchantCount: overview.activeMerchantCount,
    memberCount: overview.memberCount,
    totalIssued: overview.totalIssued,
    totalRedeemed: overview.totalRedeemed,
    transactions: overview.activity.length,
    activity: overview.activity,
    members: db.users
      .filter((user) => user.role === "traveler")
      .map((user) => {
        const position = overview.members.find((member) => member.userId === user.id);
        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          tier: position?.tier || user.tier,
          status: user.status,
          joinedAt: user.joinedAt,
          address: position?.address || user.walletAddress,
          balance: position?.balance || 0,
          lifetimeEarned: position?.lifetimeEarned || 0,
          lifetimeRedeemed: position?.lifetimeRedeemed || 0,
          tokenId: position?.tokenId || null,
        };
      }),
  };
}

export async function getMembershipMetadata(tokenId: string) {
  const { membership } = getContracts();
  return (await membership.tokenURI(tokenId)) as string;
}
