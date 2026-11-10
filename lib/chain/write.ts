import "server-only";

import { ethers } from "ethers";
import { getContracts, getSignerByLabel, getSignerForAddress } from "@/lib/chain/config";
import { readDb, updateDb } from "@/lib/db";
import type { CampaignRecord, MerchantRecord, RewardRecord, UserRecord } from "@/lib/types";

export function chainErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("insufficient") ||
    message.includes("ERC20InsufficientBalance") ||
    message.includes("exceeds balance")
  ) {
    return "Your balance is too low for this transaction.";
  }
  if (message.includes("MERCHANT_INACTIVE")) {
    return "This merchant is not currently active on the network.";
  }
  if (message.includes("CALL_EXCEPTION") || message.includes("reverted")) {
    return "The smart contract rejected this transaction. Please review the details and try again.";
  }
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("failed to fetch") ||
    message.includes("CHAIN_TIMEOUT") ||
    message.includes("network")
  ) {
    return "The local Voyara chain is offline. Start it with npm run dev.";
  }
  return "The transaction could not be completed. Please try again.";
}

export async function redeemRewardOnChain(user: UserRecord, reward: RewardRecord) {
  const db = readDb();
  const current = db.rewards.find((entry) => entry.id === reward.id);
  if (!current || current.status !== "active") throw new Error("REWARD_UNAVAILABLE");
  if (current.inventory <= 0) throw new Error("SOLD_OUT");
  if (user.status !== "active") throw new Error("ACCOUNT_PAUSED");

  const signer = getSignerForAddress(user.walletAddress);
  const { token, manager } = getContracts(signer);
  const balance = (await token.balanceOf(user.walletAddress)) as bigint;
  if (balance < BigInt(current.cost)) throw new Error("INSUFFICIENT_BALANCE");

  const tx = await manager.redeem(ethers.id(current.slug), current.cost);
  const receipt = await tx.wait();

  updateDb((database) => {
    const storedReward = database.rewards.find((entry) => entry.id === current.id);
    if (storedReward && storedReward.inventory > 0) storedReward.inventory -= 1;
    database.redemptions.unshift({
      id: `red_${receipt.hash}`,
      userId: user.id,
      rewardId: current.id,
      cost: current.cost,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      txHash: receipt.hash,
    });
  });

  return { txHash: receipt.hash as string };
}

export async function transferPointsOnChain(user: UserRecord, recipientWallet: string, amount: number) {
  if (!ethers.isAddress(recipientWallet)) throw new Error("INVALID_RECIPIENT");
  if (recipientWallet.toLowerCase() === user.walletAddress.toLowerCase()) throw new Error("SELF_TRANSFER");
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("INVALID_AMOUNT");

  const recipient = readDb().users.find(
    (entry) => entry.walletAddress.toLowerCase() === recipientWallet.toLowerCase()
  );
  if (!recipient) throw new Error("UNKNOWN_RECIPIENT");

  const signer = getSignerForAddress(user.walletAddress);
  const { token } = getContracts(signer);
  const balance = (await token.balanceOf(user.walletAddress)) as bigint;
  if (balance < BigInt(amount)) throw new Error("INSUFFICIENT_BALANCE");

  const tx = await token.transfer(recipientWallet, amount);
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string, recipient };
}

export async function awardPointsOnChain(
  merchantUser: UserRecord,
  merchant: MerchantRecord,
  campaign: CampaignRecord,
  customer: UserRecord
) {
  if (merchant.status !== "active") throw new Error("MERCHANT_INACTIVE");
  if (campaign.merchantId !== merchant.id || campaign.status !== "active") throw new Error("CAMPAIGN_UNAVAILABLE");
  if (customer.role !== "traveler" || customer.status !== "active") throw new Error("CUSTOMER_UNAVAILABLE");

  const signer = getSignerForAddress(merchantUser.walletAddress);
  const { manager } = getContracts(signer);
  const tx = await manager.award(customer.walletAddress, ethers.id(campaign.slug), campaign.points);
  const receipt = await tx.wait();
  return { txHash: receipt.hash as string, points: campaign.points };
}

export async function setMerchantActiveOnChain(merchant: MerchantRecord, active: boolean) {
  if (!merchant.chainMerchantId) throw new Error("MERCHANT_NOT_ONCHAIN");
  const signer = getSignerByLabel("admin");
  const { manager } = getContracts(signer);
  const tx = await manager.setMerchantActive(merchant.chainMerchantId, active);
  const receipt = await tx.wait();

  updateDb((database) => {
    const stored = database.merchants.find((entry) => entry.id === merchant.id);
    if (stored) stored.status = active ? "active" : "paused";
  });

  return { txHash: receipt.hash as string };
}
