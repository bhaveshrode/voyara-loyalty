import { cn } from "@/lib/format";

export function EarningsChart({
  series,
}: {
  series: Array<{ label: string; value: number; current: boolean }>;
}) {
  const max = Math.max(...series.map((point) => point.value), 1);

  return (
    <div>
      <div className="flex h-40 items-end gap-1.5 sm:gap-3">
        {series.map((point) => {
          const height = point.value === 0 ? 3 : Math.max(6, Math.round((point.value / max) * 100));
          return (
            <div
              key={point.label}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[9px] font-semibold text-muted opacity-0 transition group-hover:opacity-100">
                {point.value.toLocaleString("en-US")}
              </span>
              <div
                style={{ height: `${height}%` }}
                title={`${point.value.toLocaleString("en-US")} VYA`}
                className={cn(
                  "w-full rounded-t-[5px] transition",
                  point.value === 0
                    ? "bg-forest/10"
                    : point.current
                      ? "bg-forest"
                      : "bg-forest/20 group-hover:bg-forest/35"
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-1.5 sm:gap-3">
        {series.map((point) => (
          <span
            key={point.label}
            className="flex-1 truncate text-center text-[8.5px] font-semibold uppercase tracking-[0.08em] text-muted/70"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
