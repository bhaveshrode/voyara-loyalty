"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, merchantForUser } from "@/lib/auth";
import { readDb, updateDb, writeDb } from "@/lib/db";
import { awardPointsOnChain, chainErrorMessage, setMerchantActiveOnChain } from "@/lib/chain/write";
import type { FormState } from "@/lib/action-state";
import type { CampaignRecord } from "@/lib/types";

function revalidateMerchantViews() {
  revalidatePath("/merchant");
  revalidatePath("/merchant/campaigns");
  revalidatePath("/merchant/activity");
  revalidatePath("/admin");
  revalidatePath("/admin/merchants");
  revalidatePath("/admin/network");
}

export async function createCampaignAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  const merchant = merchantForUser(user);
  if (!merchant) return { error: "This account is not linked to a merchant." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const points = Number(formData.get("points"));
  const audience = String(formData.get("audience") || "All members");

  if (name.length < 3) return { error: "Give the campaign a name of at least three characters." };
  if (description.length < 12) return { error: "Add a short description of at least 12 characters." };
  if (!Number.isInteger(points) || points < 10 || points > 10000) {
    return { error: "Points must be a whole number between 10 and 10,000." };
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + 90 * 86_400_000);
  const suffix = randomUUID().slice(0, 8);
  const campaign: CampaignRecord = {
    id: `cmp_${suffix}`,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42)}-${suffix}`,
    merchantId: merchant.id,
    name,
    description,
    points,
    status: "active",
    startsAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    audience,
  };

  updateDb((database) => {
    database.campaigns.push(campaign);
  });

  revalidateMerchantViews();
  return { success: `“${name}” is live. Members will earn ${points.toLocaleString("en-US")} VYA per qualifying transaction.` };
}

export async function awardPointsAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  const merchant = merchantForUser(user);
  if (!merchant) return { error: "This account is not linked to a merchant." };

  const campaignId = String(formData.get("campaignId") || "");
  const customerId = String(formData.get("customerId") || "");
  const database = readDb();
  const campaign = database.campaigns.find(
    (entry) => entry.id === campaignId && entry.merchantId === merchant.id
  );
  const customer = database.users.find((entry) => entry.id === customerId && entry.role === "traveler");

  if (!campaign) return { error: "Choose one of your active campaigns." };
  if (!customer) return { error: "Choose a Voyara member to reward." };

  try {
    const result = await awardPointsOnChain(user, merchant, campaign, customer);
    revalidateMerchantViews();
    revalidatePath("/dashboard");
    revalidatePath("/wallet");
    revalidatePath("/admin/members");
    return {
      success: `${result.points.toLocaleString("en-US")} VYA issued to ${customer.name}. Transaction ${result.txHash.slice(0, 10)}…`,
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "MERCHANT_INACTIVE") return { error: "Your merchant account is paused on-chain." };
    if (code === "CAMPAIGN_UNAVAILABLE") return { error: "That campaign is no longer active." };
    if (code === "CUSTOMER_UNAVAILABLE") return { error: "That member cannot receive points right now." };
    return { error: chainErrorMessage(error) };
  }
}

export async function setMerchantStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const merchantId = String(formData.get("merchantId") || "");
  const active = String(formData.get("active") || "") === "true";
  const merchant = readDb().merchants.find((entry) => entry.id === merchantId);
  if (!merchant) redirect("/admin/merchants");

  try {
    await setMerchantActiveOnChain(merchant, active);
  } catch {
    redirect("/admin/merchants?error=chain");
  }

  revalidateMerchantViews();
  redirect("/admin/merchants");
}

export async function setMemberStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const userId = String(formData.get("userId") || "");
  const active = String(formData.get("active") || "") === "true";
  const database = readDb();
  const member = database.users.find((entry) => entry.id === userId && entry.role === "traveler");
  if (!member) redirect("/admin/members");

  const next = structuredClone(database);
  const stored = next.users.find((entry) => entry.id === userId);
  if (stored) stored.status = active ? "active" : "paused";
  writeDb(next);

  revalidatePath("/admin/members");
  redirect("/admin/members");
}
