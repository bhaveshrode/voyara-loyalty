import { ArrowDownLeft, ArrowUpRight, Gift, Ticket } from "lucide-react";
import { cn, formatNumber, formatRelativeDate } from "@/lib/format";
import { isIncoming } from "@/lib/activity";
import type { ChainActivity } from "@/lib/types";

const ICONS = {
  earn: Gift,
  redeem: Ticket,
  "transfer-in": ArrowDownLeft,
  "transfer-out": ArrowUpRight,
} as const;

const TONES = {
  earn: "border-moss/25 bg-moss/10 text-forest-soft",
  redeem: "border-terracotta/20 bg-terracotta/10 text-terracotta",
  "transfer-in": "border-gold/30 bg-gold/10 text-[#8a6c32]",
  "transfer-out": "border-line bg-parchment/70 text-muted",
} as const;

export function ActivityList({
  activity,
  limit,
  empty = "No activity yet. Your first reward will appear here.",
  className,
}: {
  activity: ChainActivity[];
  limit?: number;
  empty?: string;
  className?: string;
}) {
  const rows = typeof limit === "number" ? activity.slice(0, limit) : activity;

  if (rows.length === 0) {
    return (
      <div className={cn("px-5 py-10 text-center text-[12px] text-muted", className)}>{empty}</div>
    );
  }

  return (
    <ul className={cn("divide-y divide-line/70", className)}>
      {rows.map((event) => {
        const Icon = ICONS[event.type];
        const incoming = isIncoming(event.type);
        return (
          <li key={event.id} className="flex items-center gap-3.5 px-5 py-3.5">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border",
                TONES[event.type]
              )}
            >
              <Icon className="size-4" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">{event.label}</p>
              <p className="mt-0.5 truncate text-[10.5px] text-muted">
                {event.detail} · {formatRelativeDate(event.timestamp)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "text-[12.5px] font-semibold",
                  incoming ? "text-forest-soft" : "text-terracotta"
                )}
              >
                {incoming ? "+" : "−"}
                {formatNumber(event.points)}
              </p>
              <p
                className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted/60"
                title={event.txHash}
              >
                {event.txHash.slice(0, 8)}…
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
