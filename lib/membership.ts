export const TIERS = [
  {
    id: 1,
    name: "Explorer",
    threshold: 0,
    tagline: "The beginning of the journey",
    description: "A digital membership for curious travelers, with access to the full Voyara rewards marketplace.",
    accent: "#B8C5B1",
    benefits: [
      "One unified points balance",
      "Access to partner offers",
      "Member-only welcome rates",
      "On-chain, verifiable activity",
    ],
  },
  {
    id: 2,
    name: "Voyager",
    threshold: 2500,
    tagline: "More places, more possibility",
    description: "For members who travel with intention. Enjoy elevated offers and early access to seasonal campaigns.",
    accent: "#D07A52",
    benefits: [
      "Everything in Explorer",
      "Early access to new offers",
      "Priority partner support",
      "Complimentary room upgrades where available",
      "Invitations to Voyara dinners",
    ],
  },
  {
    id: 3,
    name: "Luminary",
    threshold: 10000,
    tagline: "The quiet luxury of being known",
    description: "Our most personal tier, extended by invitation and built around a member's individual rhythm.",
    accent: "#D9B872",
    benefits: [
      "Everything in Voyager",
      "Dedicated travel curator",
      "Private experiences with partners",
      "Annual statement of impact",
      "No expiry on loyalty points",
      "Invitation-only gatherings",
    ],
  },
] as const;

export type Tier = (typeof TIERS)[number];

export function getTier(tier: number): Tier {
  return TIERS.find((entry) => entry.id === tier) ?? TIERS[0];
}

export function getNextTier(tier: number): Tier | null {
  return TIERS.find((entry) => entry.id === tier + 1) ?? null;
}

export function tierProgress(tier: number, lifetimeEarned: number) {
  const current = getTier(tier);
  const next = getNextTier(tier);
  if (!next) {
    return { current, next: null, progress: 100, remaining: 0 };
  }
  const span = next.threshold - current.threshold;
  const progress = Math.min(100, Math.round(((lifetimeEarned - current.threshold) / span) * 100));
  return { current, next, progress, remaining: Math.max(0, next.threshold - lifetimeEarned) };
}
