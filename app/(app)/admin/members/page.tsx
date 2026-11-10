import type { Metadata } from "next";
import { setMemberStatusAction } from "@/app/actions/merchant";
import { CopyButton } from "@/components/app/copy-button";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { SubmitButton } from "@/components/submit-button";
import { ChainBadge } from "@/components/chain-badge";
import { requireRole } from "@/lib/auth";
import { getAdminChainState } from "@/lib/chain/read";
import { formatDate, formatNumber, shortAddress } from "@/lib/format";
import { getTier } from "@/lib/membership";

export const metadata: Metadata = { title: "Members" };

export default async function AdminMembersPage() {
  await requireRole("admin");
  const state = await getAdminChainState();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
      <PageHeader
        eyebrow="Membership directory"
        title="The people in the network."
        description="Every traveler, their tier, wallet and balance. Pausing a membership is an off-chain control that blocks sign-in and new awards."
        action={<ChainBadge connected={state.connected} />}
      />

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-muted/70">
        <span>{state.members.length} traveler memberships</span>
        <span>{state.memberCount} soulbound NFTs</span>
        <span>{formatNumber(state.totalSupply)} VYA in wallets</span>
      </div>

      <section className="card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line/70 text-[9px] uppercase tracking-[0.14em] text-muted/70">
                <th className="px-5 py-3.5 font-semibold">Member</th>
                <th className="px-5 py-3.5 font-semibold">Tier</th>
                <th className="px-5 py-3.5 font-semibold">Wallet</th>
                <th className="px-5 py-3.5 text-right font-semibold">Balance</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {state.members.map((member) => {
                const tier = getTier(member.tier);
                const initials = member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2);
                return (
                  <tr key={member.userId} className="align-middle transition hover:bg-ivory/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-ivory font-display text-xs text-forest">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-ink">{member.name}</p>
                          <p className="mt-0.5 truncate text-[10px] text-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-full border px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em]"
                        style={{
                          borderColor: `${tier.accent}66`,
                          backgroundColor: `${tier.accent}1a`,
                          color: "#112a22",
                        }}
                      >
                        {tier.name}
                      </span>
                      <p className="mt-1 text-[9px] text-muted/65">
                        {member.tokenId ? `NFT #${member.tokenId.padStart(4, "0")}` : "No NFT"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted">
                          {shortAddress(member.address, 4)}
                        </span>
                        <CopyButton value={member.address} className="text-muted/50" label="Copy" />
                      </div>
                      <p className="mt-1 text-[9px] text-muted/60">
                        Earned {formatNumber(member.lifetimeEarned)} · spent{" "}
                        {formatNumber(member.lifetimeRedeemed)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right font-display text-lg text-forest">
                      {formatNumber(member.balance)}
                    </td>
                    <td className="px-5 py-4 text-[10.5px] text-muted">{formatDate(member.joinedAt)}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={member.status} />
                    </td>
                    <td className="px-5 py-4">
                      <form action={setMemberStatusAction} className="flex justify-end">
                        <input type="hidden" name="userId" value={member.userId} />
                        <input
                          type="hidden"
                          name="active"
                          value={member.status === "active" ? "false" : "true"}
                        />
                        <SubmitButton
                          className="btn-sm btn-outline whitespace-nowrap px-3 text-[10px]"
                          pendingLabel="Saving…"
                        >
                          {member.status === "active" ? "Pause" : "Resume"}
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 max-w-3xl text-[10.5px] leading-5 text-muted/70">
        Pausing a member updates the platform record only. Their wallet and membership NFT remain
        intact on-chain, but sign-in and new point awards are blocked until reactivated.
      </p>
    </div>
  );
}
