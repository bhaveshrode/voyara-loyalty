import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gem,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { MembershipCard } from "@/components/membership-card";
import { readDb } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { TIERS } from "@/lib/membership";

const experiences = [
  {
    index: "01",
    label: "The stay",
    title: "Casa Marea",
    location: "Mallorca, Spain",
    copy: "Slow mornings, salt air and a room that opens straight onto the sea.",
    image: "/images/coast2.jpg",
    alt: "A sunlit coastal village above the sea",
  },
  {
    index: "02",
    label: "The table",
    title: "Ember & Fig",
    location: "Copenhagen, Denmark",
    copy: "A wood-fired dining room where the menu follows the coast and the season.",
    image: "/images/market-dining.jpg",
    alt: "An elegant restaurant table in warm evening light",
  },
  {
    index: "03",
    label: "The ritual",
    title: "Solenne",
    location: "Lisbon, Portugal",
    copy: "Thermal baths, quiet hands and an hour that belongs only to you.",
    image: "/images/spa3.jpg",
    alt: "A warm stone massage ritual",
  },
];

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Earn across the network",
    copy: "Book a stay, reserve a table, visit the spa or shop with a partner. Every eligible moment adds to one shared balance.",
  },
  {
    number: "02",
    icon: WalletCards,
    title: "Settle in your wallet",
    copy: "Points are issued as VYA tokens through auditable smart contracts, creating a transparent record you actually own.",
  },
  {
    number: "03",
    icon: Gem,
    title: "Spend without borders",
    copy: "Redeem across participating brands for stays, dining, wellness, upgrades and private experiences. Your points travel with you.",
  },
];

export default function HomePage() {
  const database = readDb();
  const featured = database.rewards.filter((reward) => reward.featured).slice(0, 3);
  const luminary = TIERS[2];

  return (
    <>
      <main id="main">
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-forest-deep">
        <Image
          src="/images/hero.jpg"
          alt="A warm coastal hotel pool at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="grain absolute inset-0 z-[1] opacity-30" />
        <MarketingHeader />

        <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-12 pt-36 sm:pb-16 lg:pb-20">
          <div className="grid items-end gap-12 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="max-w-4xl">
              <div className="fade-up flex items-center gap-3 text-gold">
                <span className="h-px w-8 bg-gold/70" />
                <p className="eyebrow">Travel &amp; lifestyle loyalty, on-chain</p>
              </div>
              <h1 className="display fade-up fade-up-delay-1 mt-6 text-[clamp(3.55rem,8.6vw,8.2rem)] text-ivory">
                Rewards that
                <br />
                <em className="text-gold/95">travel further.</em>
              </h1>
              <p className="fade-up fade-up-delay-2 mt-7 max-w-xl text-[0.95rem] leading-7 text-ivory/68 sm:text-base">
                One membership. One balance. A world of hotels, tables, spas and places that
                reward you for wandering well.
              </p>
              <div className="fade-up fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link href="/login" className="btn btn-light">
                  Begin your journey
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="btn border border-ivory/25 bg-ivory/5 text-ivory backdrop-blur-sm hover:bg-ivory/10"
                >
                  See how it works
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="fade-up fade-up-delay-3 mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-ivory/45">
                <span className="inline-flex items-center gap-2">
                  <Check className="size-3 text-gold" /> 6 launch partners
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="size-3 text-gold" /> 3 membership tiers
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="size-3 text-gold" /> 100% verifiable
                </span>
              </div>
            </div>

            <div className="fade-up fade-up-delay-2 hidden justify-end lg:flex">
              <div className="w-full max-w-[330px] rounded-[26px] border border-ivory/18 bg-forest-deep/52 p-5 text-ivory shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="eyebrow text-ivory/42">Member wallet</p>
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-sage">
                    <span className="size-1.5 rounded-full bg-[#8fb89b] shadow-[0_0_0_3px_rgba(143,184,155,0.12)]" />
                    Live on-chain
                  </span>
                </div>
                <div className="mt-7">
                  <p className="font-display text-[3.6rem] leading-none tracking-[-0.05em]">
                    6,770
                    <span className="ml-2 font-sans text-[10px] font-semibold tracking-[0.18em] text-ivory/40">
                      VYA
                    </span>
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ivory/38">
                    Voyager · Membership No. 0001
                  </p>
                </div>
                <div className="mt-6 space-y-3 border-t border-ivory/12 pt-5 text-[11px]">
                  <div className="flex items-center justify-between gap-3 text-ivory/52">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-gold" /> Casa Marea
                    </span>
                    <span className="text-ivory/85">+850 VYA</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-ivory/52">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-sage/60" /> Solenne
                    </span>
                    <span className="text-ivory/85">−950 VYA</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-full border border-ivory/12 bg-ivory/4 px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-ivory/38">
                  <ShieldCheck className="size-3 text-gold" />
                  Every transaction is verifiable
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-ivory">
        <div className="shell flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow shrink-0 text-muted/70">In good company</p>
          <div className="scrollbar-none flex items-center gap-7 overflow-x-auto pb-1 sm:gap-9">
            {database.merchants.map((merchant) => (
              <span
                key={merchant.id}
                className="whitespace-nowrap font-display text-lg tracking-[-0.03em] text-forest/68"
              >
                {merchant.name}
              </span>
            ))}
          </div>
          <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.15em] text-muted/60 xl:block">
            The launch network · 2026
          </span>
        </div>
      </section>

      <section id="network" className="scroll-mt-20 py-24 lg:py-32">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <p className="eyebrow text-terracotta">One loyalty layer</p>
              <h2 className="display mt-5 max-w-lg text-[clamp(2.8rem,5vw,4.9rem)] text-forest">
                One balance.
                <br />A world of places.
              </h2>
              <Link href="#membership" className="link-line mt-8 text-forest">
                Discover the membership
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
              <p className="font-display text-[clamp(1.45rem,2.4vw,2.05rem)] leading-[1.35] text-forest-soft">
                Loyalty used to mean staying in one lane. Voyara connects the places you already
                love — and the ones you have not found yet.
              </p>
              <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
                Earn once, spend everywhere. Every reward is settled through shared smart contracts,
                so your balance and history remain transparent, consistent and yours.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line/80 pt-7">
                <div>
                  <p className="font-display text-3xl text-forest">06</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">Partner brands</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-forest">03</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">Member tiers</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-forest">100%</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">On-chain</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-20 lg:gap-7">
            {experiences.map((experience) => (
              <Link href="/login" key={experience.index} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-parchment">
                  <Image
                    src={experience.image}
                    alt={experience.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/32 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-ivory/30 bg-forest-deep/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory backdrop-blur-md">
                    {experience.label}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl text-forest">{experience.title}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                      {experience.location}
                    </p>
                    <p className="mt-3 max-w-xs text-[13px] leading-6 text-muted">{experience.copy}</p>
                  </div>
                  <span className="pt-1 text-[10px] tracking-[0.14em] text-muted/60">{experience.index}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative isolate scroll-mt-20 overflow-hidden bg-forest py-24 text-ivory lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-28 top-1/2 -translate-y-1/2 select-none font-display text-[28rem] leading-none text-ivory/[0.025]">
            V
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-ivory/10" />
        </div>
        <div className="shell relative z-10 grid items-center gap-16 lg:grid-cols-[1fr_0.86fr] lg:gap-24">
          <div>
            <p className="eyebrow text-gold">Built differently</p>
            <h2 className="display mt-5 max-w-xl text-[clamp(3rem,5.5vw,5.4rem)]">
              Loyalty that
              <br />
              moves with you.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-ivory/55">
              No silos. No points left behind. Just one transparent rewards layer connecting every
              part of a well-lived trip.
            </p>

            <div className="mt-12 space-y-0 border-t border-ivory/12">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="grid grid-cols-[auto_1fr] gap-5 border-b border-ivory/12 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-6"
                  >
                    <span className="pt-0.5 text-[10px] tracking-[0.16em] text-gold/80">{step.number}</span>
                    <div>
                      <h3 className="font-display text-xl text-ivory">{step.title}</h3>
                      <p className="mt-2 max-w-md text-[13px] leading-6 text-ivory/48">{step.copy}</p>
                    </div>
                    <Icon className="mt-1 hidden size-5 text-gold/60 sm:block" strokeWidth={1.4} />
                  </div>
                );
              })}
            </div>

            <Link href="#membership" className="link-line mt-9 text-ivory">
              Explore the membership
              <ArrowRight className="size-4 text-gold" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[470px] lg:mr-0">
            <div className="absolute -inset-12 -z-10 rounded-full bg-gold/[0.06] blur-3xl" />
            <div className="rotate-[-2.5deg]">
              <MembershipCard
                name="Ava Bennett"
                tier={2}
                tokenId="1"
                address="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                joinedAt="2025-03-14T10:20:00.000Z"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 w-[250px] rotate-[1.5deg] rounded-2xl border border-line/80 bg-cream p-4 text-ink shadow-card sm:-left-10 sm:w-[280px]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-forest text-ivory">
                    <Check className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-forest">Reward settled</p>
                    <p className="text-[9px] uppercase tracking-[0.13em] text-muted">Casa Marea</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-[0.12em] text-moss">Confirmed</span>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-line/80 pt-3">
                <p className="font-display text-2xl text-forest">+850 VYA</p>
                <p className="text-[9px] tracking-[0.08em] text-muted/70">0x8f2c…3a91</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="membership" className="scroll-mt-20 py-24 lg:py-32">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-terracotta">Membership, evolved</p>
              <h2 className="display mt-5 max-w-lg text-[clamp(2.9rem,5vw,4.9rem)] text-forest">
                A card that
                <br />
                lives on-chain.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted">
                Your membership is a soulbound NFT — a permanent digital object that carries your
                tier, privileges and place in the network. No plastic. No expiry. No ambiguity.
              </p>

              <div className="mt-10">
                <MembershipCard
                  name="Isla Rossi"
                  tier={3}
                  tokenId="3"
                  joinedAt="2024-06-21T14:30:00.000Z"
                  address="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
                />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-[12px] text-muted">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-terracotta" />
                  Soulbound to your wallet
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-terracotta" />
                  On-chain card artwork
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
                <div>
                  <p className="eyebrow text-muted">Three ways to belong</p>
                  <p className="mt-2 text-[13px] text-muted">Tiers unlock through lifetime points earned.</p>
                </div>
                <span className="hidden font-display text-5xl text-forest/10 sm:block">I—III</span>
              </div>

              <div className="divide-y divide-line/80">
                {TIERS.map((tier, index) => (
                  <article key={tier.id} className="grid gap-5 py-7 sm:grid-cols-[auto_1fr] sm:gap-7">
                    <span
                      className="mt-1 flex size-9 items-center justify-center rounded-full border text-[11px] font-semibold"
                      style={{ borderColor: tier.accent, color: tier.id === 1 ? "#3f5244" : tier.accent }}
                    >
                      0{index + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-2xl text-forest">{tier.name}</h3>
                        <span className="text-[9px] uppercase tracking-[0.15em] text-muted">
                          {tier.threshold === 0
                            ? "From your first point"
                            : `${formatNumber(tier.threshold)}+ lifetime VYA`}
                        </span>
                      </div>
                      <p className="mt-2 max-w-lg text-[13px] leading-6 text-muted">{tier.description}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {tier.benefits.slice(0, 3).map((benefit) => (
                          <span
                            key={benefit}
                            className="inline-flex items-center gap-1.5 text-[11px] text-forest-soft/72"
                          >
                            <Check className="size-3" style={{ color: tier.accent }} />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-line/80 bg-parchment/40 p-5">
                <p className="text-[12px] leading-6 text-muted">
                  <span className="font-semibold text-forest">{luminary.name}</span> is extended by
                  invitation, with a dedicated curator and access to private experiences across the
                  network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rewards" className="scroll-mt-20 bg-parchment/45 py-24 lg:py-28">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-terracotta">The marketplace</p>
              <h2 className="display mt-5 max-w-xl text-[clamp(2.8rem,5vw,4.6rem)] text-forest">
                A few ways to spend
                <br />a good thing.
              </h2>
            </div>
            <Link href="/login" className="btn btn-outline shrink-0 self-start sm:self-auto">
              Explore all rewards
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((reward) => {
              const merchant = database.merchants.find((entry) => entry.id === reward.merchantId);
              return (
                <Link key={reward.id} href="/login" className="group block">
                  <article className="overflow-hidden rounded-[24px] border border-line/70 bg-cream transition duration-300 hover:-translate-y-1 hover:shadow-card">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={reward.image}
                        alt={reward.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-ivory/25 bg-forest-deep/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-ivory backdrop-blur-md">
                        {reward.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-muted/80">
                        {merchant?.name} · {merchant?.city}
                      </p>
                      <h3 className="mt-2 font-display text-[1.4rem] leading-tight text-forest">
                        {reward.title}
                      </h3>
                      <div className="mt-5 flex items-center justify-between border-t border-line/80 pt-4">
                        <span className="text-[11px] font-semibold tracking-[0.04em] text-forest">
                          {formatNumber(reward.cost)} VYA
                        </span>
                        <span className="text-[10px] text-muted">${reward.valueUsd} value</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-28">
        <div className="shell">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div className="order-2 lg:order-1">
              <p className="eyebrow text-terracotta">From the network</p>
              <blockquote className="display mt-6 text-[clamp(2rem,3.5vw,3.4rem)] leading-[1.15] text-forest">
                “I used to chase points across six different apps. Now my whole year of travel sits
                in one balance — and I can see every moment that made it.”
              </blockquote>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-forest font-display text-sm text-ivory">
                  AB
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-forest">Ava Bennett</p>
                  <p className="text-[10px] uppercase tracking-[0.13em] text-muted">
                    Voyager member · London
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px]">
                <Image
                  src="/images/coast2.jpg"
                  alt="A colorful coastal village in Italy"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-[24px]">
                <Image
                  src="/images/membership.jpg"
                  alt="A serene resort pool at dusk"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="partners" className="scroll-mt-20 pb-24 lg:pb-32">
        <div className="shell">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-forest-deep text-ivory">
            <Image
              src="/images/coast.jpg"
              alt="A coastal town at dusk"
              fill
              sizes="100vw"
              className="object-cover opacity-32"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/92 to-forest-deep/35" />
            <div className="relative z-10 grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:p-16">
              <div>
                <p className="eyebrow text-gold">For partners</p>
                <h2 className="display mt-5 max-w-xl text-[clamp(2.8rem,4.8vw,4.8rem)]">
                  Your brand
                  <br />
                  belongs here.
                </h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-ivory/58">
                  Reach members who are already disposed to spend well. Build campaigns, issue points
                  and understand your most loyal guests — with settlement you can verify.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className="btn btn-light">
                    Enter merchant portal
                    <ArrowUpRight className="size-4" />
                  </Link>
                  <a
                    href="mailto:partners@voyara.club"
                    className="btn border border-ivory/20 text-ivory hover:bg-ivory/5"
                  >
                    Talk to the team
                  </a>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden rounded-2xl border border-ivory/15 bg-ivory/15 sm:grid-cols-2 lg:grid-cols-1 lg:self-center">
                {[
                  ["Campaign engine", "Launch offers in minutes, not quarters."],
                  ["Shared settlement", "Points issued and redeemed on-chain."],
                  ["Member insight", "See who returns, and why."],
                ].map(([title, copy]) => (
                  <div key={title} className="bg-forest-deep/80 p-5 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                      <div>
                        <p className="text-[12px] font-semibold text-ivory">{title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-ivory/45">{copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      <MarketingFooter />
    </>
  );
}
