import type { Metadata } from "next";
import { ChainBadge } from "@/components/chain-badge";
import { MarketplaceGrid } from "@/components/app/marketplace-grid";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getMemberChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const user = await requireRole("traveler");
  const db = readDb();
  const state = await getMemberChainState(user);
  const merchantsById = new Map(db.merchants.map((merchant) => [merchant.id, merchant]));

  const rewards = db.rewards
    .filter((reward) => reward.status === "active")
    .map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      category: reward.category,
      cost: reward.cost,
      valueUsd: reward.valueUsd,
      image: reward.image,
      inventory: reward.inventory,
      merchantName: merchantsById.get(reward.merchantId)?.name ?? "Voyara",
      location: reward.location,
      featured: reward.featured,
    }));

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Rewards marketplace"
        title="Spend it wherever you wander."
        description="A single balance unlocks stays, tables, rituals and experiences across the entire Voyara network. Every redemption is burned and recorded on-chain."
        action={
          <>
            <span className="tag border-forest/20 bg-cream/70 text-forest">
              {formatNumber(state.balance)} VYA available
            </span>
            <ChainBadge connected={state.connected} />
          </>
        }
      />

      <div className="mt-8">
        <MarketplaceGrid rewards={rewards} balance={state.balance} />
      </div>

      <p className="mt-8 max-w-3xl text-[10.5px] leading-5 text-muted/70">
        Rewards are fulfilled by each partner. Redemption reserves the reward and burns VYA
        immediately; a confirmation reference is written to your activity ledger for every partner to
        verify.
      </p>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[9px] uppercase tracking-[0.14em] text-muted/50">
        {db.merchants.map((merchant) => (
          <span key={merchant.id}>{merchant.name}</span>
        ))}
      </div>
    </div>
  );
}
