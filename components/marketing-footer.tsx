import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "The network", href: "/#network" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Membership", href: "/#membership" },
      { label: "Rewards", href: "/#rewards" },
    ],
  },
  {
    title: "Members",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Your wallet", href: "/wallet" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "NFT membership", href: "/membership" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Why Voyara", href: "/#partners" },
      { label: "Merchant portal", href: "/login" },
      { label: "The network", href: "/#network" },
      { label: "Contact", href: "mailto:partners@voyara.club" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-deep text-ivory">
      <div className="grain pointer-events-none absolute inset-0 opacity-40" />
      <div className="shell relative z-10">
        <div className="grid gap-14 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow text-gold">The invitation</p>
            <h2 className="display mt-5 max-w-xl text-[clamp(2.8rem,5.6vw,5.2rem)]">
              Rewards that
              <br />
              <em className="text-gold/90">travel further.</em>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-ivory/58">
              One membership. A whole world of places. Join the first loyalty network built to move
              with you, not hold you back.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-light">
                Begin your journey
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="btn border border-ivory/20 text-ivory hover:bg-ivory/5"
              >
                For partners
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:pt-12">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="eyebrow text-ivory/42">{column.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-ivory/72 transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-ivory/12 py-7 text-[11px] text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Wordmark className="text-ivory [&>span:last-child]:text-xl" markClassName="size-7" />
            <span className="hidden h-4 w-px bg-ivory/15 sm:block" />
            <span className="tracking-[0.06em]">© 2026 Voyara Club</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gold" />
              Local Hardhat network
            </span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Concept prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
