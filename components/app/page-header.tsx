import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className="eyebrow text-terracotta">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.1rem,4.4vw,3.15rem)] text-forest">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{action}</div> : null}
    </header>
  );
}
