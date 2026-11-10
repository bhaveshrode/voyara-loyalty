import { cn } from "@/lib/format";

export function ChainBadge({ connected, label }: { connected: boolean; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        connected
          ? "border-moss/25 bg-moss/10 text-forest-soft"
          : "border-gold/40 bg-gold/10 text-[#7b6333]"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-[#5d8b6f] shadow-[0_0_0_3px_rgba(93,139,111,0.12)]" : "bg-gold"
        )}
      />
      {label || (connected ? "Chain live" : "Snapshot mode")}
    </span>
  );
}
