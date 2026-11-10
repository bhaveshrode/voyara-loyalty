"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { chainErrorMessage, redeemRewardOnChain, transferPointsOnChain } from "@/lib/chain/write";
import type { FormState } from "@/lib/action-state";

function revalidateMemberViews() {
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/marketplace");
  revalidatePath("/membership");
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/network");
}

export async function redeemRewardAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  if (user.role !== "traveler") return { error: "Only members can redeem rewards." };

  const rewardId = String(formData.get("rewardId") || "");
  const reward = readDb().rewards.find((entry) => entry.id === rewardId);
  if (!reward) return { error: "That reward is no longer available." };

  try {
    const result = await redeemRewardOnChain(user, reward);
    revalidateMemberViews();
    return {
      success: `${reward.title} is confirmed. Your certificate reference is ${result.txHash.slice(0, 10)}…`,
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "SOLD_OUT") return { error: "This reward has just sold out." };
    if (code === "INSUFFICIENT_BALANCE") return { error: "You need more VYA to redeem this reward." };
    if (code === "ACCOUNT_PAUSED") return { error: "Your membership is currently paused." };
    return { error: chainErrorMessage(error) };
  }
}

export async function transferPointsAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  if (user.role !== "traveler") return { error: "Only members can transfer points." };

  const recipientWallet = String(formData.get("recipient") || "").trim();
  const amount = Number(formData.get("amount"));

  try {
    const result = await transferPointsOnChain(user, recipientWallet, amount);
    revalidateMemberViews();
    revalidatePath("/admin/network");
    return {
      success: `${amount.toLocaleString("en-US")} VYA sent to ${result.recipient.name}. Transaction ${result.txHash.slice(0, 10)}…`,
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "INVALID_RECIPIENT") return { error: "Enter a valid wallet address." };
    if (code === "SELF_TRANSFER") return { error: "You cannot transfer points to your own wallet." };
    if (code === "INVALID_AMOUNT") return { error: "Enter a whole number greater than zero." };
    if (code === "UNKNOWN_RECIPIENT") return { error: "That wallet does not belong to a Voyara member." };
    if (code === "INSUFFICIENT_BALANCE") return { error: "You do not have enough VYA for this transfer." };
    return { error: chainErrorMessage(error) };
  }
}
