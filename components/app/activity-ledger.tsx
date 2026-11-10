"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ActivityList } from "@/components/app/activity-list";
import { cn } from "@/lib/format";
import type { ChainActivity } from "@/lib/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "earn", label: "Earned" },
  { id: "redeem", label: "Redeemed" },
  { id: "transfer", label: "Transfers" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function ActivityLedger({
  activity,
  empty,
}: {
  activity: ChainActivity[];
  empty?: string;
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return activity.filter((event) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "transfer"
            ? event.type === "transfer-in" || event.type === "transfer-out"
            : event.type === filter;
      if (!matchesFilter) return false;
      if (!term) return true;
      return [event.label, event.detail, event.merchantName, event.counterparty, event.txHash]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [activity, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((entry) => {
            const count =
              entry.id === "all"
                ? activity.length
                : entry.id === "transfer"
                  ? activity.filter((event) => event.type.startsWith("transfer")).length
                  : activity.filter((event) => event.type === entry.id).length;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition",
                  filter === entry.id
                    ? "border-forest bg-forest text-ivory"
                    : "border-line text-muted hover:border-forest/35 hover:text-forest"
                )}
              >
                {entry.label}
                <span className={cn("ml-1.5 text-[9px]", filter === entry.id ? "text-ivory/50" : "text-muted/50")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted/60" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity"
            aria-label="Search activity"
            className="input min-h-9 py-2 pl-9 text-[12px]"
          />
        </div>
      </div>
      <ActivityList
        activity={filtered}
        empty={empty || "No transactions match this view."}
      />
    </div>
  );
}
