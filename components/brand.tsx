import Link from "next/link";
import { cn } from "@/lib/format";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-current/25",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path
          d="M7.5 10.5 16 23l8.5-12.5M12 10.5 16 16.6l4-6.1"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({
  className,
  markClassName,
  showMark = true,
}: {
  className?: string;
  markClassName?: string;
  showMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark ? <BrandMark className={markClassName} /> : null}
      <span className="font-display text-[1.65rem] leading-none tracking-[-0.04em]">Voyara</span>
    </span>
  );
}

export function BrandLink({
  className,
  markClassName,
  light = false,
}: {
  className?: string;
  markClassName?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", light ? "text-ivory" : "text-forest", className)}
      aria-label="Voyara home"
    >
      <Wordmark markClassName={markClassName} showMark />
    </Link>
  );
}
