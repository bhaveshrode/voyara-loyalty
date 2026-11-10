import type { Metadata } from "next";
import { ActivityLedger } from "@/components/app/activity-ledger";
import { ChainBadge } from "@/components/chain-badge";
import { CopyButton } from "@/components/app/copy-button";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getAdminChainState } from "@/lib/chain/read";
import { readDb } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Network" };

export default async function AdminNetworkPage() {
  await requireRole("admin");
  const db = readDb();
  const state = await getAdminChainState();

  const contracts = [
    {
      label: "Voyara Points",
      address: db.meta.tokenAddress,
      standard: "ERC-20 · 0 decimals",
      description: "The unified loyalty token. Minted by partners, burned on redemption.",
    },
    {
      label: "Voyara Membership",
      address: db.meta.membershipAddress,
      standard: "ERC-721 · soulbound",
      description: "Non-transferable membership cards with tier data and on-chain artwork.",
    },
    {
      label: "Loyalty Manager",
      address: db.meta.managerAddress,
      standard: "Registry · events",
      description: "Registers merchants and records every award and redemption event.",
    },
  ];

  const parameters = [
    { label: "Network", value: db.meta.network },
    { label: "Chain ID", value: String(db.meta.chainId) },
    { label: "JSON-RPC", value: "http://127.0.0.1:8545" },
    { label: "Consensus", value: "Hardhat · instant finality" },
    { label: "Seeded", value: formatDate(db.meta.seededAt) },
    { label: "Members on-chain", value: String(state.memberCount) },
  ];

  const circulating = state.totalSupply;
  const burned = state.totalRedeemed;
  const issued = Math.max(state.totalIssued, circulating + burned, 1);
  const circulatingShare = Math.round((circulating / issued) * 100);
  const burnedShare = Math.max(0, Math.round((burned / issued) * 100));

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Chain detail"
        title="Everything settles here."
        description="The local Voyara chain is the source of truth for balances, memberships and every reward movement. The platform database only enriches these events with names and imagery."
        action={<ChainBadge connected={state.connected} />}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {contracts.map((contract) => (
          <article
            key={contract.label}
            className="relative isolate overflow-hidden rounded-[24px] bg-forest-deep p-5 text-ivory"
          >
            <div className="card-shine absolute inset-0 -z-10" />
            <div className="grain absolute inset-0 -z-10 opacity-30" />
            <p className="eyebrow text-ivory/35">{contract.standard}</p>
            <h2 className="mt-2 font-display text-xl">{contract.label}</h2>
            <p className="mt-2 text-[11px] leading-5 text-ivory/50">{contract.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ivory/10 pt-3.5">
              <span className="truncate font-mono text-[10px] text-gold/85">
                {contract.address ?? "Not deployed"}
              </span>
              {contract.address ? (
                <CopyButton value={contract.address} className="shrink-0 text-ivory/40" label="Copy" />
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="card card-padded">
          <p className="eyebrow text-muted">Parameters</p>
          <h2 className="mt-2 font-display text-2xl text-forest">Local network</h2>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
            {parameters.map((parameter) => (
              <div key={parameter.label} className="border-b border-line/60 pb-3">
                <dt className="text-[9px] uppercase tracking-[0.12em] text-muted/70">{parameter.label}</dt>
                <dd className="mt-1 truncate text-[11.5px] font-medium text-ink">{parameter.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[10.5px] leading-5 text-muted/70">
            This environment runs a single Hardhat node with deterministic demo accounts. For a public
            deployment, contracts would move to a testnet with managed keys and audited access control.
          </p>
        </section>

        <section className="card card-padded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Supply</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Points in motion</h2>
            </div>
            <span className="rounded-full border border-line px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
              VYA
            </span>
          </div>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-parchment">
            <div
              className="h-full bg-forest"
              style={{ width: `${Math.max(2, circulatingShare)}%` }}
              title={`${formatNumber(circulating)} circulating`}
            />
            <div
              className="h-full bg-terracotta/75"
              style={{ width: `${Math.max(2, burnedShare)}%` }}
              title={`${formatNumber(burned)} burned`}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.1em] text-muted/70">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-forest" />
              Circulating
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-terracotta/75" />
              Burned
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.12em] text-muted/70">Circulating</dt>
              <dd className="mt-1.5 font-display text-xl text-forest">{formatNumber(circulating)}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.12em] text-muted/70">Burned</dt>
              <dd className="mt-1.5 font-display text-xl text-terracotta">{formatNumber(burned)}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.12em] text-muted/70">Issued</dt>
              <dd className="mt-1.5 font-display text-xl text-forest">{formatNumber(issued)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div>
            <p className="eyebrow text-muted">Audit ledger</p>
            <h2 className="mt-1.5 font-display text-xl text-forest">
              {state.transactions} on-chain events
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted/65">
            Every partner, every member
          </span>
        </div>
        <ActivityLedger
          activity={state.activity}
          empty="No events have been recorded on this chain yet."
        />
      </section>
    </div>
  );
}
