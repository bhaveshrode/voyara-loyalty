import type { CSSProperties } from "react";
import { Wordmark } from "@/components/brand";
import { getTier } from "@/lib/membership";
import { cn, formatDate, shortAddress } from "@/lib/format";

export function MembershipCard({
  name,
  tier,
  tokenId,
  address,
  joinedAt,
  className,
  compact = false,
}: {
  name: string;
  tier: number;
  tokenId?: string | null;
  address?: string;
  joinedAt?: string;
  className?: string;
  compact?: boolean;
}) {
  const tierInfo = getTier(tier);
  const style = { "--tier-accent": tierInfo.accent } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "relative isolate overflow-hidden rounded-[26px] bg-forest-deep text-ivory shadow-card",
        compact ? "aspect-[1.58/1]" : "aspect-[1.5/1] min-h-[270px]",
        className
      )}
    >
      <div className="card-shine absolute inset-0 -z-10" />
      <div className="grain absolute inset-0 -z-10 opacity-40" />
      <svg
        className="absolute -right-16 -top-20 -z-10 size-[280px] text-[var(--tier-accent)] opacity-[0.16]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="94" stroke="currentColor" />
        <circle cx="100" cy="100" r="66" stroke="currentColor" />
        <circle cx="100" cy="100" r="38" stroke="currentColor" />
      </svg>
      <svg
        className="absolute -bottom-20 -right-6 -z-10 h-[220px] w-[300px] text-[var(--tier-accent)] opacity-60"
        viewBox="0 0 300 220"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 198 96 74l52 71 40-50 102 103"
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="1"
        />
        <path
          d="M52 198 116 112l38 45 32-30 72 71"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      </svg>

      <div className={cn("flex h-full flex-col", compact ? "p-5" : "p-6 sm:p-7")}>
        <div className="flex items-start justify-between gap-4">
          <Wordmark
            className="text-ivory [&>span:last-child]:text-[1.35rem]"
            markClassName="size-7 border-ivory/25"
          />
          <span className="rounded-full border border-[var(--tier-accent)]/45 bg-[var(--tier-accent)]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--tier-accent)]">
            {tierInfo.name}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/38">
            Digital membership
          </p>
          <p className={cn("display mt-2", compact ? "text-[2.35rem]" : "text-[clamp(2.7rem,5vw,3.55rem)]")}>
            {tierInfo.name}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-ivory/12 pt-4">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ivory/88">{name}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-ivory/38">
                {joinedAt ? `Since ${formatDate(joinedAt)}` : tierInfo.tagline}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] uppercase tracking-[0.16em] text-ivory/38">Member</p>
              <p className="mt-1 font-display text-lg text-[var(--tier-accent)]">
                No. {tokenId ? tokenId.padStart(4, "0") : "—"}
              </p>
            </div>
          </div>
          {!compact && address ? (
            <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-ivory/30">
              {shortAddress(address, 6)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
