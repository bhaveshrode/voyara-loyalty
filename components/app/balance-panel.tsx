import Link from "next/link";
import { ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { CopyButton } from "@/components/app/copy-button";
import { cn, formatNumber, shortAddress } from "@/lib/format";

export function BalancePanel({
  balance,
  address,
  lifetimeEarned,
  lifetimeRedeemed,
  connected,
  showActions = true,
  className,
}: {
  balance: number;
  address: string;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  connected: boolean;
  showActions?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[26px] bg-forest-deep p-6 text-ivory shadow-card sm:p-8",
        className
      )}
    >
      <div className="card-shine absolute inset-0 -z-10" />
      <div className="grain absolute inset-0 -z-10 opacity-40" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-ivory/45">Available balance</p>
        <span className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-ivory/55">
          <span
            className={cn(
              "size-1.5 rounded-full",
              connected ? "bg-[#7fb08d]" : "bg-gold"
            )}
          />
          {connected ? "On-chain" : "Snapshot"}
        </span>
      </div>

      <div className="mt-8 flex items-end gap-2.5">
        <p className="display text-[clamp(3rem,7vw,4.65rem)] leading-none">
          {formatNumber(balance)}
        </p>
        <span className="pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/40">
          VYA
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] text-ivory/40">
        <span className="font-mono">{shortAddress(address, 6)}</span>
        <CopyButton
          value={address}
          className="text-ivory/40 hover:text-ivory"
          label="Wallet"
        />
      </div>

      {showActions ? (
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link href="/marketplace" className="btn btn-light btn-sm">
            Redeem points
            <ArrowUpRight className="size-3.5" />
          </Link>
          <Link
            href="/wallet"
            className="btn btn-sm border border-ivory/25 bg-transparent text-ivory hover:bg-ivory/10"
          >
            <ArrowLeftRight className="size-3.5" />
            Transfer
          </Link>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ivory/10 pt-5">
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ivory/35">Lifetime earned</p>
          <p className="mt-1.5 font-display text-xl text-ivory/90">
            {formatNumber(lifetimeEarned)}
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ivory/35">Lifetime redeemed</p>
          <p className="mt-1.5 font-display text-xl text-ivory/90">
            {formatNumber(lifetimeRedeemed)}
          </p>
        </div>
      </div>
    </section>
  );
}
