import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ShieldCheck, TriangleAlert } from "lucide-react";
import { ActivityList } from "@/components/app/activity-list";
import { ChainBadge } from "@/components/chain-badge";
import { CopyButton } from "@/components/app/copy-button";
import { IssuePointsForm } from "@/components/app/issue-points-form";
import { PageHeader } from "@/components/app/page-header";
import { merchantForUser, requireRole } from "@/lib/auth";
import { getMerchantChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatNumber, shortAddress } from "@/lib/format";

export const metadata: Metadata = { title: "Issue points" };

export default async function MerchantIssuePage() {
  const user = await requireRole("merchant");
  const merchant = merchantForUser(user);
  if (!merchant) notFound();

  const db = readDb();
  const state = await getMerchantChainState(merchant);
  const campaigns = db.campaigns
    .filter((campaign) => campaign.merchantId === merchant.id && campaign.status === "active")
    .map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      points: campaign.points,
      audience: campaign.audience,
    }));
  const members = db.users
    .filter((entry) => entry.role === "traveler" && entry.status === "active")
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      tier: entry.tier,
    }));

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Issuance desk"
        title="Reward the moment."
        description="Award points for a qualifying visit or stay. The merchant wallet signs the transaction and the LoyaltyManager mints VYA directly to the member."
        action={<ChainBadge connected={state.connected} />}
      />

      {merchant.status === "paused" ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-terracotta/25 bg-terracotta/10 px-4 py-3.5 text-[11.5px] leading-5 text-terracotta">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Issuance is paused.</p>
            <p className="mt-0.5">The network admin has paused your merchant account on-chain.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="card card-padded">
          <p className="eyebrow text-muted">New award</p>
          <h2 className="mt-2 font-display text-2xl text-forest">Issue points</h2>
          <p className="mt-2 text-[12px] leading-5 text-muted">
            Choose a campaign and a member. The contract enforces that the points match the campaign
            and that your merchant account is active.
          </p>
          <div className="mt-6">
            <IssuePointsForm
              campaigns={campaigns}
              members={members}
              disabled={merchant.status !== "active"}
            />
          </div>
          {campaigns.length === 0 ? (
            <Link href="/merchant/campaigns" className="link-line mt-5 text-forest">
              Create your first campaign
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : null}
        </section>

        <div className="space-y-5">
          <section className="relative isolate overflow-hidden rounded-[26px] bg-forest-deep p-6 text-ivory sm:p-7">
            <div className="card-shine absolute inset-0 -z-10" />
            <div className="grain absolute inset-0 -z-10 opacity-35" />
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full border border-ivory/20 bg-ivory/10">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="eyebrow text-ivory/40">Smart contract</p>
                <p className="mt-1 font-display text-xl text-ivory">LoyaltyManager</p>
              </div>
            </div>
            <p className="mt-4 text-[11.5px] leading-5 text-ivory/60">
              Awards call <span className="font-mono text-[10.5px] text-gold">award(member, campaignRef, points)</span>.
              Only a registered merchant wallet can mint, and every event carries a permanent
              timestamp and transaction hash.
            </p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-ivory/10 pt-4">
              <span className="font-mono text-[10px] text-ivory/40">
                {db.meta.managerAddress ? shortAddress(db.meta.managerAddress, 5) : "Not deployed"}
              </span>
              {db.meta.managerAddress ? (
                <CopyButton value={db.meta.managerAddress} className="text-ivory/45" label="Copy" />
              ) : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-ivory/35">Issued by you</p>
                <p className="mt-1 font-display text-xl">{formatNumber(state.issued)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-ivory/35">Members reached</p>
                <p className="mt-1 font-display text-xl">{formatNumber(state.uniqueMembers)}</p>
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
              <div>
                <p className="eyebrow text-muted">Recent awards</p>
                <h2 className="mt-1.5 font-display text-lg text-forest">Last five issues</h2>
              </div>
              <Link href="/merchant/activity" className="link-line text-forest">
                All
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <ActivityList
              activity={state.activity.filter((event) => event.type === "earn")}
              limit={5}
              empty="No awards issued yet."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
