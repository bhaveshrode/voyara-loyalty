import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Coins, Radio, Ticket } from "lucide-react";
import { ActivityList } from "@/components/app/activity-list";
import { CopyButton } from "@/components/app/copy-button";
import { ChainBadge } from "@/components/chain-badge";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { requireRole } from "@/lib/auth";
import { getAdminChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatNumber, shortAddress } from "@/lib/format";
import { getTier } from "@/lib/membership";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminPage() {
  await requireRole("admin");
  const db = readDb();
  const state = await getAdminChainState();

  const merchantStats = db.merchants
    .map((merchant) => {
      const events = state.activity.filter((event) => event.merchantId === merchant.id);
      return {
        merchant,
        issued: events.filter((event) => event.type === "earn").reduce((sum, event) => sum + event.points, 0),
        redeemed: events.filter((event) => event.type === "redeem").reduce((sum, event) => sum + event.points, 0),
        transactions: events.length,
      };
    })
    .sort((a, b) => b.issued - a.issued);
  const topPartners = merchantStats.slice(0, 4);
  const maxIssued = Math.max(...topPartners.map((entry) => entry.issued), 1);
  const newestMembers = [...state.members]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 4);

  const contracts = [
    { label: "Voyara Points", address: db.meta.tokenAddress },
    { label: "Membership NFT", address: db.meta.membershipAddress },
    { label: "Loyalty Manager", address: db.meta.managerAddress },
  ];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Network admin"
        title="The health of the network."
        description="Monitor supply, partners and members across the Voyara loyalty network. Every figure below is read from the local Hardhat chain."
        action={
          <>
            <ChainBadge connected={state.connected} />
            <Link href="/admin/network" className="btn btn-dark btn-sm">
              Network detail
              <ArrowUpRight className="size-3.5" />
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Circulating VYA"
          value={formatNumber(state.totalSupply)}
          hint={`Across ${state.memberCount} member wallets`}
          icon={<CircleDollarSign />}
        />
        <StatCard
          label="Lifetime issued"
          value={formatNumber(state.totalIssued)}
          hint={`Minted by ${state.activeMerchantCount} active partners`}
          icon={<Coins />}
          tone="gold"
        />
        <StatCard
          label="Burned on redemption"
          value={formatNumber(state.totalRedeemed)}
          hint="Removed from supply permanently"
          icon={<Ticket />}
          tone="terracotta"
        />
        <StatCard
          label="Settled transactions"
          value={formatNumber(state.transactions)}
          hint="Earns, redemptions and transfers"
          icon={<Radio />}
          tone="clay"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
            <div>
              <p className="eyebrow text-muted">Network activity</p>
              <h2 className="mt-1.5 font-display text-xl text-forest">Latest settlements</h2>
            </div>
            <Link href="/admin/network" className="link-line text-forest">
              Full ledger
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ActivityList activity={state.activity} limit={8} empty="No network activity recorded yet." />
        </section>

        <div className="space-y-5">
          <section className="relative isolate overflow-hidden rounded-[26px] bg-forest-deep p-6 text-ivory">
            <div className="card-shine absolute inset-0 -z-10" />
            <div className="grain absolute inset-0 -z-10 opacity-35" />
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-ivory/40">Deployed contracts</p>
              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-ivory/40">
                <span className="size-1.5 rounded-full bg-[#7fb08d]" />
                Chain {db.meta.chainId}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-ivory/10">
              {contracts.map((contract) => (
                <li key={contract.label} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-[11.5px] text-ivory/65">{contract.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ivory/45">
                      {contract.address ? shortAddress(contract.address, 4) : "—"}
                    </span>
                    {contract.address ? (
                      <CopyButton value={contract.address} className="text-ivory/40" label="Copy" />
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ivory/10 pt-4 text-[10px] text-ivory/40">
              <span>{db.merchants.length} partner brands</span>
              <span>{state.memberCount} soulbound memberships</span>
            </div>
          </section>

          <section className="card card-padded">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Top partners</p>
                <h2 className="mt-2 font-display text-xl text-forest">Issuance leaders</h2>
              </div>
              <Link href="/admin/merchants" className="link-line mt-1 text-forest">
                All
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <ul className="mt-4 space-y-3.5">
              {topPartners.map((entry) => (
                <li key={entry.merchant.id}>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-medium text-ink">{entry.merchant.name}</span>
                    <span className="text-muted">{formatNumber(entry.issued)} VYA</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-parchment">
                    <div
                      className="h-full rounded-full bg-forest/75"
                      style={{ width: `${Math.max(4, Math.round((entry.issued / maxIssued) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="card card-padded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Membership base</p>
              <h2 className="mt-2 font-display text-xl text-forest">Newest members</h2>
            </div>
            <Link href="/admin/members" className="link-line mt-1 text-forest">
              Directory
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line/70">
            {newestMembers.map((member) => {
              const tier = getTier(member.tier);
              return (
                <li key={member.userId} className="flex items-center gap-3 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-ivory font-display text-xs text-forest">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-ink">{member.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{member.email}</p>
                  </div>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      borderColor: `${tier.accent}66`,
                      backgroundColor: `${tier.accent}1a`,
                      color: "#112a22",
                    }}
                  >
                    {tier.name}
                  </span>
                  <span className="w-16 shrink-0 text-right text-[11px] font-medium text-forest">
                    {formatNumber(member.balance)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card card-padded">
          <p className="eyebrow text-muted">Merchant spotlights</p>
          <h2 className="mt-2 font-display text-xl text-forest">Partner mix</h2>
          <ul className="mt-4 space-y-2.5">
            {merchantStats.slice(0, 5).map((entry) => (
              <li
                key={entry.merchant.id}
                className="flex items-center gap-3 rounded-2xl border border-line/70 bg-ivory/50 p-2.5"
              >
                <img
                  src={entry.merchant.image}
                  alt=""
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">{entry.merchant.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {entry.merchant.category} · {entry.transactions} txns
                  </p>
                </div>
                <StatusPill status={entry.merchant.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
