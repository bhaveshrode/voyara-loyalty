import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Store, UserRound } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { BrandLink, Wordmark } from "@/components/brand";
import { ChainBadge } from "@/components/chain-badge";
import { demoLoginAction } from "@/app/actions/auth";
import { getCurrentUser, homeForRole } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Enter the Voyara travel and lifestyle rewards network.",
};

const demos = [
  {
    role: "Traveler",
    name: "Ava Bennett",
    email: "ava@voyara.club",
    copy: "Wallet, rewards and membership",
    icon: UserRound,
  },
  {
    role: "Merchant",
    name: "Casa Marea",
    email: "casa@voyara.club",
    copy: "Campaigns and point issuance",
    icon: Store,
  },
  {
    role: "Admin",
    name: "Voyara network",
    email: "admin@voyara.club",
    copy: "Members, merchants and audit",
    icon: ShieldCheck,
  },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  return (
    <main id="main" className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <div className="relative isolate hidden min-h-dvh overflow-hidden bg-forest-deep lg:block">
        <Image
          src="/images/coast2.jpg"
          alt="A sunlit coastal village above the sea"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/36 to-forest-deep/20" />
        <div className="grain absolute inset-0 opacity-30" />
        <div className="relative z-10 flex h-full min-h-dvh flex-col p-10 text-ivory xl:p-14">
          <BrandLink light />
          <div className="mt-auto max-w-xl pb-8">
            <div className="flex items-center gap-3 text-gold">
              <span className="h-px w-8 bg-gold/70" />
              <p className="eyebrow">The travel rewards network</p>
            </div>
            <blockquote className="display mt-7 text-[clamp(3rem,4.7vw,5.3rem)] leading-[0.98]">
              The world is wide.
              <br />
              <em className="text-gold/95">Your loyalty</em>
              <br />
              should be, too.
            </blockquote>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/15 pt-6 text-[10px] uppercase tracking-[0.16em] text-ivory/45">
              <span>Casa Marea</span>
              <span>Solenne</span>
              <span>Ember &amp; Fig</span>
              <span>Dune House</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between border-b border-line/80 px-5 py-4 lg:border-b-0 lg:px-10 lg:py-6">
          <div className="lg:hidden">
            <BrandLink markClassName="size-8" />
          </div>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.04em] text-muted transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" />
            Back to the network
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:py-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-terracotta">Members&apos; entrance</p>
                <h1 className="display mt-3 text-[clamp(2.7rem,5vw,3.7rem)] text-forest">Welcome back.</h1>
                <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted">
                  Sign in to see your balance, discover rewards and manage your digital membership.
                </p>
              </div>
            </div>

            <LoginForm />

            <div className="my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted/60">
                Or step into a demo
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="space-y-2.5">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <form key={demo.email} action={demoLoginAction}>
                    <input type="hidden" name="email" value={demo.email} />
                    <button
                      type="submit"
                      className="group flex w-full items-center gap-4 rounded-2xl border border-line/90 bg-cream/60 px-4 py-3.5 text-left transition hover:border-forest/30 hover:bg-cream"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-ivory text-forest transition group-hover:border-forest/20">
                        <Icon className="size-4" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-forest">{demo.name}</span>
                          <span className="rounded-full bg-parchment px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted">
                            {demo.role}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[10px] text-muted">{demo.copy}</span>
                      </span>
                      <ArrowUpRight className="size-4 text-muted/50 transition group-hover:text-forest" />
                    </button>
                  </form>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted/75">
              <ChainBadge connected label="Local demo · Hardhat" />
              <span>All demo accounts use password “voyara123”.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-5 text-[9px] uppercase tracking-[0.14em] text-muted/55 sm:px-8 lg:px-10">
          <span>Voyara Club</span>
          <span className="hidden sm:block">Rewards that travel further</span>
          <Wordmark className="text-forest [&>span:last-child]:text-lg" markClassName="size-6 hidden" />
        </div>
      </div>
    </main>
  );
}
