import type { ReactNode } from "react";
import { cn } from "@/lib/format";

const TONES = {
  forest: "border-moss/20 bg-moss/10 text-forest",
  terracotta: "border-terracotta/20 bg-terracotta/10 text-terracotta",
  gold: "border-gold/30 bg-gold/10 text-[#8a6c32]",
  clay: "border-clay/25 bg-clay/10 text-clay",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "forest",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border [&>svg]:size-3.5",
              TONES[tone]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="display mt-4 text-[1.9rem] leading-none text-forest">{value}</p>
      {hint ? <p className="mt-2.5 text-[11px] leading-5 text-muted">{hint}</p> : null}
    </div>
  );
}
