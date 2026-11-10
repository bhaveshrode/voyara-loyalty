import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Send } from "lucide-react";
import { CampaignForm } from "@/components/app/campaign-form";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { ChainBadge } from "@/components/chain-badge";
import { merchantForUser, requireRole } from "@/lib/auth";
import { getMerchantChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Campaigns" };

export default async function MerchantCampaignsPage() {
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
        eyebrow="Campaigns"
        title="Shape how members earn."
        description="Each campaign fixes a points value for a qualifying transaction. Campaign metadata is managed by the merchant portal; the awards themselves settle on-chain."
        action={
          <>
            <ChainBadge connected={state.connected} />
            <Link href="/merchant/issue" className="btn btn-outline btn-sm">
              <Send className="size-3.5" />
              Issue points
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="card card-padded h-fit lg:sticky lg:top-8">
          <p className="eyebrow text-muted">New campaign</p>
          <h2 className="mt-2 font-display text-2xl text-forest">Create an earning moment</h2>
          <p className="mt-2 text-[12px] leading-5 text-muted">
            Launch in seconds. The campaign becomes available immediately in the issuance desk.
          </p>
          <div className="mt-6">
            <CampaignForm />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-forest">
              {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"}
            </h2>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted/65">
              {formatNumber(state.issued)} VYA issued overall
            </span>
          </div>
          <div className="mt-4 space-y-3.5">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={campaign.status} />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted/65">
                        {campaign.audience}
                      </span>
                    </div>
                    <h3 className="mt-2.5 font-display text-xl text-forest">{campaign.name}</h3>
                    <p className="mt-1.5 text-[11.5px] leading-5 text-muted">
                      {campaign.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-muted">Per visit</p>
                    <p className="mt-1 font-display text-2xl text-forest">
                      {formatNumber(campaign.points)}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-muted/60">VYA</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3.5 text-[10px] text-muted">
                  <span>
                    {formatDate(campaign.startsAt)} → {formatDate(campaign.endsAt)}
                  </span>
                  <span className="font-mono text-[9px] text-muted/50">{campaign.slug}</span>
                </div>
              </article>
            ))}
            {campaigns.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-line bg-cream/60 px-6 py-12 text-center">
                <p className="font-display text-xl text-forest">No campaigns yet</p>
                <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-muted">
                  Use the form to create your first earning moment. Members will see it in their
                  dashboard straight away.
                </p>
              </div>
            ) : null}
          </div>
          <Link href="/merchant/issue" className="link-line mt-5 text-forest">
            Go to the issuance desk
            <ArrowUpRight className="size-3.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
