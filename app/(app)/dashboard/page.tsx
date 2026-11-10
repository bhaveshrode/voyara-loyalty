import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { ActivityList } from "@/components/app/activity-list";
import { BalancePanel } from "@/components/app/balance-panel";
import { ChainBadge } from "@/components/chain-badge";
import { EarningsChart } from "@/components/app/earnings-chart";
import { MembershipCard } from "@/components/membership-card";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getMemberChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { pointsThisWeek, weeklyEarnings } from "@/lib/activity";
import { formatNumber, greeting } from "@/lib/format";
import { getTier, tierProgress } from "@/lib/membership";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireRole("traveler");
  const db = readDb();
  const state = await getMemberChainState(user);
  const tier = getTier(state.tier);
  const progress = tierProgress(state.tier, state.lifetimeEarned);
  const series = weeklyEarnings(state.activity);
  const weekEarned = pointsThisWeek(state.activity);
  const firstName = user.name.split(" ")[0];

  const merchantsById = new Map(db.merchants.map((merchant) => [merchant.id, merchant]));
  const campaigns = db.campaigns
    .filter((campaign) => campaign.status === "active")
    .slice(0, 4);
  const featured = [...db.rewards]
    .filter((reward) => reward.status === "active")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Your world, in one balance."
        description="One membership across hotels, dining, wellness, shopping and travel. Earn with any partner, then spend wherever you wander."
        action={
          <>
            <ChainBadge connected={state.connected} />
            <Link href="/marketplace" className="btn btn-dark btn-sm">
              Explore rewards
              <ArrowUpRight className="size-3.5" />
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <BalancePanel
          balance={state.balance}
          address={state.address}
          lifetimeEarned={state.lifetimeEarned}
          lifetimeRedeemed={state.lifetimeRedeemed}
          connected={state.connected}
        />

        <div className="flex flex-col gap-4">
          <MembershipCard
            name={user.name}
            tier={state.tier}
            tokenId={state.tokenId}
            joinedAt={user.joinedAt}
            compact
            className="flex-1"
          />
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-muted">Membership progress</p>
              <span className="text-[11px] font-semibold text-forest">{progress.progress}%</span>
            </div>
            <p className="mt-2.5 text-[13px] font-semibold text-ink">
              {progress.next
                ? `${formatNumber(progress.remaining)} VYA to ${progress.next.name}`
                : "You have reached our highest tier"}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-parchment">
              <div
                style={{ width: `${progress.progress}%` }}
                className="h-full rounded-full bg-forest"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[9.5px] uppercase tracking-[0.12em] text-muted/70">
              <span>{tier.name}</span>
              <span>{progress.next?.name ?? "Luminary"}</span>
            </div>
            <Link href="/membership" className="link-line mt-4 text-forest">
              View membership
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="card card-padded">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">Earning rhythm</p>
              <h2 className="mt-2 font-display text-2xl text-forest">The last eight weeks</h2>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.14em] text-muted">This week</p>
              <p className="mt-1 font-display text-2xl text-forest-soft">+{formatNumber(weekEarned)}</p>
            </div>
          </div>
          <div className="mt-7">
            <EarningsChart series={series} />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-4 text-[10.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-gold" />
              Every bar is settled on-chain, transparently.
            </span>
            <Link href="/wallet" className="link-line text-forest">
              Full ledger
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </section>

        <section className="card card-padded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Live campaigns</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Earn with intention</h2>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-[#8a6c32]">
              <CalendarDays className="size-4" />
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line/70">
            {campaigns.map((campaign) => {
              const merchant = merchantsById.get(campaign.merchantId);
              return (
                <li key={campaign.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted/70">
                      {merchant?.name ?? "Voyara"} · {merchant?.category ?? "Partner"}
                    </p>
                    <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink">
                      {campaign.name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-moss/25 bg-moss/10 px-2.5 py-1 text-[10px] font-semibold text-forest-soft">
                    +{formatNumber(campaign.points)}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href="/marketplace" className="link-line mt-4 text-forest">
            See what you can redeem
            <ArrowUpRight className="size-3.5" />
          </Link>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
            <div>
              <p className="eyebrow text-muted">Recent activity</p>
              <h2 className="mt-1.5 font-display text-xl text-forest">Your latest movements</h2>
            </div>
            <Link href="/wallet" className="link-line text-forest">
              Ledger
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ActivityList activity={state.activity} limit={6} />
        </section>

        <section className="card card-padded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Member offers</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Curated for you</h2>
            </div>
            <Link href="/marketplace" className="link-line mt-1 text-forest">
              All
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {featured.map((reward) => {
              const merchant = merchantsById.get(reward.merchantId);
              return (
                <li key={reward.id}>
                  <Link
                    href="/marketplace"
                    className="group flex items-center gap-3.5 rounded-2xl border border-line/70 bg-ivory/50 p-2.5 transition hover:border-forest/25 hover:bg-ivory"
                  >
                    <img
                      src={reward.image}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted/70">
                        {merchant?.name ?? "Voyara"} · {reward.category}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink">
                        {reward.title}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        {formatNumber(reward.cost)} VYA
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted/40 transition group-hover:text-forest" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
