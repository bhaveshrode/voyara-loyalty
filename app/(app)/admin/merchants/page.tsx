import type { Metadata } from "next";
import { setMerchantStatusAction } from "@/app/actions/merchant";
import { ChainBadge } from "@/components/chain-badge";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { SubmitButton } from "@/components/submit-button";
import { requireRole } from "@/lib/auth";
import { getAdminChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { TriangleAlert } from "lucide-react";

export const metadata: Metadata = { title: "Merchants" };

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("admin");
  const { error } = await searchParams;
  const db = readDb();
  const state = await getAdminChainState();

  const stats = db.merchants.map((merchant) => {
    const events = state.activity.filter((event) => event.merchantId === merchant.id);
    return {
      merchant,
      issued: events.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
      redeemed: events.filter((event) => event.type === "redeem").reduce((sum, event) => sum + event.points, 0),
      transactions: events.length,
    };
  });

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Merchant partners"
        title="The brands behind the balance."
        description="Each partner is registered in the LoyaltyManager contract. Pausing a merchant blocks new on-chain point issuance until reactivated."
        action={<ChainBadge connected={state.connected} />}
      />

      {error === "chain" ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-terracotta/25 bg-terracotta/10 px-4 py-3.5 text-[11.5px] leading-5 text-terracotta">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          The chain could not be reached, so the merchant status was not changed. Start the local
          chain and try again.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-muted/70">
        <span>{db.merchants.length} registered partners</span>
        <span>
          {state.activeMerchantCount} of {state.merchantCount} active on-chain
        </span>
        <span>{formatNumber(state.totalIssued)} VYA issued lifetime</span>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {stats.map((entry) => (
          <article key={entry.merchant.id} className="card overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <img src={entry.merchant.image} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-forest-deep/20 to-transparent" />
              <div className="absolute inset-x-4 top-3.5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-ivory/25 bg-forest-deep/45 px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-ivory/85 backdrop-blur">
                  {entry.merchant.category}
                </span>
                <StatusPill status={entry.merchant.status} />
              </div>
              <div className="absolute inset-x-4 bottom-3">
                <p className="font-display text-xl text-ivory">{entry.merchant.name}</p>
                <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-ivory/55">
                  {entry.merchant.city}, {entry.merchant.country} · Chain ID{" "}
                  {entry.merchant.chainMerchantId}
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="line-clamp-2 text-[11.5px] leading-5 text-muted">
                {entry.merchant.description}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line/70 py-3.5">
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.12em] text-muted/70">Issued</dt>
                  <dd className="mt-1 font-display text-lg text-forest">{formatNumber(entry.issued)}</dd>
                </div>
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.12em] text-muted/70">Redeemed</dt>
                  <dd className="mt-1 font-display text-lg text-forest">{formatNumber(entry.redeemed)}</dd>
                </div>
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.12em] text-muted/70">Txns</dt>
                  <dd className="mt-1 font-display text-lg text-forest">{formatNumber(entry.transactions)}</dd>
                </div>
              </dl>

              <form action={setMerchantStatusAction} className="mt-4 flex items-center justify-between gap-3">
                <input type="hidden" name="merchantId" value={entry.merchant.id} />
                <input
                  type="hidden"
                  name="active"
                  value={entry.merchant.status === "active" ? "false" : "true"}
                />
                <span className="text-[10px] leading-4 text-muted/70">
                  {entry.merchant.status === "active"
                    ? "Awards enabled on-chain"
                    : "Awards blocked on-chain"}
                </span>
                <SubmitButton
                  className={
                    entry.merchant.status === "active"
                      ? "btn-sm btn-outline whitespace-nowrap px-3.5 text-[10px]"
                      : "btn-sm btn-dark whitespace-nowrap px-3.5 text-[10px]"
                  }
                  pendingLabel="Settling…"
                >
                  {entry.merchant.status === "active" ? "Pause partner" : "Reactivate"}
                </SubmitButton>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
