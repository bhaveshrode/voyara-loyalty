import { cn } from "@/lib/format";

const STYLES = {
  active: "border-moss/25 bg-moss/10 text-forest-soft",
  paused: "border-terracotta/25 bg-terracotta/10 text-terracotta",
  draft: "border-line bg-parchment/70 text-muted",
  confirmed: "border-moss/25 bg-moss/10 text-forest-soft",
} as const;

const DOTS = {
  active: "bg-[#5d8b6f]",
  paused: "bg-terracotta",
  draft: "bg-muted/50",
  confirmed: "bg-[#5d8b6f]",
} as const;

export function StatusPill({
  status,
  label,
}: {
  status: keyof typeof STYLES;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em]",
        STYLES[status]
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOTS[status])} />
      {label || status}
    </span>
  );
}
