import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Coins, Megaphone, Ticket, Users } from "lucide-react";
import { ActivityLedger } from "@/components/app/activity-ledger";
import { ChainBadge } from "@/components/chain-badge";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { merchantForUser, requireRole } from "@/lib/auth";
import { getMerchantChainState } from "@/lib/chain/read";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Merchant activity" };

export default async function MerchantActivityPage() {
  const user = await requireRole("merchant");
  const merchant = merchantForUser(user);
  if (!merchant) notFound();

  const state = await getMerchantChainState(merchant);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Partner activity"
        title="Every settlement, in order."
        description="A transparent ledger of awards and redemptions tied to your merchant account. Each row is an on-chain event from the Voyara contracts."
        action={<ChainBadge connected={state.connected} />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Points issued" value={formatNumber(state.issued)} icon={<Coins />} />
        <StatCard
          label="Points redeemed"
          value={formatNumber(state.redeemed)}
          icon={<Ticket />}
          tone="terracotta"
        />
        <StatCard
          label="Transactions"
          value={formatNumber(state.transactions)}
          icon={<Megaphone />}
          tone="gold"
        />
        <StatCard
          label="Members reached"
          value={formatNumber(state.uniqueMembers)}
          icon={<Users />}
          tone="clay"
        />
      </div>

      <section className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div>
            <p className="eyebrow text-muted">Ledger</p>
            <h2 className="mt-1.5 font-display text-xl text-forest">
              {state.transactions} settled transactions
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted/65">
            Newest first
          </span>
        </div>
        <ActivityLedger
          activity={state.activity}
          empty="No settlements yet. Issue points to a member to begin."
        />
      </section>
    </div>
  );
}
