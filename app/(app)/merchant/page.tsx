import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Coins,
  Megaphone,
  Send,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";
import { ActivityList } from "@/components/app/activity-list";
import { ChainBadge } from "@/components/chain-badge";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { merchantForUser, requireRole } from "@/lib/auth";
import { getMerchantChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Merchant overview" };

export default async function MerchantPage() {
  const user = await requireRole("merchant");
  const merchant = merchantForUser(user);
  if (!merchant) notFound();

  const db = readDb();
  const state = await getMerchantChainState(merchant);
  const campaigns = db.campaigns
    .filter((campaign) => campaign.merchantId === merchant.id)
    .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Merchant portal"
        title={merchant.name}
        description="Manage your presence in the Voyara network, issue points on-chain and watch members return."
        action={
          <>
            <ChainBadge connected={state.connected} />
            <Link href="/merchant/issue" className="btn btn-dark btn-sm">
              <Send className="size-3.5" />
              Issue points
            </Link>
          </>
        }
      />

      {merchant.status === "paused" ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-terracotta/25 bg-terracotta/10 px-4 py-3.5 text-[11.5px] leading-5 text-terracotta">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Your merchant account is paused on-chain.</p>
            <p className="mt-0.5">Point issuance is blocked until the network admin reactivates you.</p>
          </div>
        </div>
      ) : null}

      <section className="relative isolate mt-8 min-h-[230px] overflow-hidden rounded-[26px] bg-forest-deep text-ivory shadow-card">
        <img
          src={merchant.image}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-deep/92 via-forest-deep/55 to-forest-deep/15" />
        <div className="grain absolute inset-0 -z-10 opacity-30" />
        <div className="flex min-h-[230px] flex-col justify-between gap-8 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-ivory/25 bg-forest-deep/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ivory/80 backdrop-blur">
              {merchant.category}
            </span>
            <StatusPill status={merchant.status} />
          </div>
          <div>
            <p className="eyebrow text-ivory/45">
              Partner since {merchant.memberSince} · {merchant.city}, {merchant.country}
            </p>
            <h2 className="display mt-2 text-[clamp(2rem,4vw,3rem)]">{merchant.name}</h2>
            <p className="mt-2 max-w-lg text-[12px] leading-5 text-ivory/65">
              {merchant.description}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-gold">
              Rated {merchant.rating} by members
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Points issued"
          value={formatNumber(state.issued)}
          hint="Lifetime VYA minted for members"
          icon={<Coins />}
        />
        <StatCard
          label="Points redeemed"
          value={formatNumber(state.redeemed)}
          hint="Value members have spent with you"
          icon={<Ticket />}
          tone="terracotta"
        />
        <StatCard
          label="Transactions"
          value={formatNumber(state.transactions)}
          hint="Awards and redemptions combined"
          icon={<Megaphone />}
          tone="gold"
        />
        <StatCard
          label="Members reached"
          value={formatNumber(state.uniqueMembers)}
          hint="Unique wallets that earned with you"
          icon={<Users />}
          tone="clay"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
            <div>
              <p className="eyebrow text-muted">Partner ledger</p>
              <h2 className="mt-1.5 font-display text-xl text-forest">Recent settlements</h2>
            </div>
            <Link href="/merchant/activity" className="link-line text-forest">
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ActivityList
            activity={state.activity}
            limit={7}
            empty="No activity yet. Issue your first points to open the ledger."
          />
        </section>

        <section className="card card-padded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Campaigns</p>
              <h2 className="mt-2 font-display text-2xl text-forest">How members earn</h2>
            </div>
            <Link href="/merchant/campaigns" className="link-line mt-1 text-forest">
              Manage
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line/70">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{campaign.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {campaign.audience} · ends {formatDate(campaign.endsAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full border border-moss/25 bg-moss/10 px-2.5 py-1 text-[10px] font-semibold text-forest-soft">
                      +{formatNumber(campaign.points)}
                    </span>
                    <StatusPill status={campaign.status} />
                  </div>
                </div>
              </li>
            ))}
            {campaigns.length === 0 ? (
              <li className="py-6 text-center text-[12px] text-muted">
                No campaigns yet. Create one to start rewarding members.
              </li>
            ) : null}
          </ul>
          <Link href="/merchant/campaigns" className="link-line mt-4 text-forest">
            Create a campaign
            <ArrowUpRight className="size-3.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
