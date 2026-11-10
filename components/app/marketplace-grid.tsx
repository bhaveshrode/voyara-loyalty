"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { RedeemDialog } from "@/components/app/redeem-dialog";
import { cn, formatNumber } from "@/lib/format";

export interface MarketplaceReward {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  valueUsd: number;
  image: string;
  inventory: number;
  merchantName: string;
  location: string;
  featured: boolean;
}

export function MarketplaceGrid({
  rewards,
  balance,
}: {
  rewards: MarketplaceReward[];
  balance: number;
}) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rewards.map((reward) => reward.category)))],
    [rewards]
  );
  const [category, setCategory] = useState("All");

  const visible = useMemo(() => {
    const list = category === "All" ? rewards : rewards.filter((reward) => reward.category === category);
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [category, rewards]);

  return (
    <div>
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {categories.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setCategory(entry)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition",
              category === entry
                ? "border-forest bg-forest text-ivory"
                : "border-line bg-cream/60 text-muted hover:border-forest/35 hover:text-forest"
            )}
          >
            {entry}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-muted/70">
        {visible.length} {visible.length === 1 ? "reward" : "rewards"} across the network
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((reward) => (
          <article
            key={reward.id}
            className="group flex flex-col overflow-hidden rounded-[24px] border border-line/90 bg-cream transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={reward.image}
                alt={reward.title}
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/55 via-transparent to-transparent" />
              <span className="absolute left-3.5 top-3.5 rounded-full border border-ivory/25 bg-forest-deep/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ivory backdrop-blur">
                {reward.category}
              </span>
              {reward.featured ? (
                <span className="absolute right-3.5 top-3.5 rounded-full bg-gold px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-deep">
                  Featured
                </span>
              ) : null}
              <p className="absolute inset-x-4 bottom-3.5 flex items-center gap-1.5 text-[10px] text-ivory/75">
                <MapPin className="size-3" />
                {reward.location}
              </p>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow text-[9px] text-muted">{reward.merchantName}</p>
              <h3 className="mt-2 font-display text-[1.3rem] leading-[1.15] text-forest">
                {reward.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-muted">
                {reward.description}
              </p>

              <div className="mt-auto flex items-end justify-between gap-3 border-t border-line/70 pt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted">Cost</p>
                  <p className="mt-1 font-display text-xl leading-none text-forest">
                    {formatNumber(reward.cost)} <span className="text-[10px] text-muted">VYA</span>
                  </p>
                  <p className="mt-1 text-[9px] text-muted/65">${formatNumber(reward.valueUsd)} value</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <RedeemDialog
                    reward={{
                      id: reward.id,
                      title: reward.title,
                      cost: reward.cost,
                      merchantName: reward.merchantName,
                      image: reward.image,
                      location: reward.location,
                    }}
                    balance={balance}
                  />
                  <span className="text-[9px] uppercase tracking-[0.1em] text-muted/60">
                    {reward.inventory} available
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
