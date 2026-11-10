"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandLink } from "@/components/brand";
import { cn } from "@/lib/format";

const links = [
  { label: "The network", href: "/#network" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Membership", href: "/#membership" },
  { label: "For partners", href: "/#partners" },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const light = !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line/80 bg-ivory/92 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="shell flex h-[76px] items-center justify-between gap-6">
          <BrandLink light={light} markClassName="size-8" />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[12px] font-semibold tracking-[0.055em] transition-colors",
                  light ? "text-ivory/78 hover:text-ivory" : "text-muted hover:text-forest"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 sm:flex">
            <Link
              href="/login"
              className={cn(
                "link-line px-3 py-2 text-[12px]",
                light ? "text-ivory/90" : "text-forest"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className={cn(
                "btn btn-sm rounded-full",
                light ? "btn-light" : "btn-dark"
              )}
            >
              Join the club
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full border transition sm:hidden",
              light ? "border-ivory/25 text-ivory" : "border-line text-forest"
            )}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-ivory px-6 pb-8 pt-28 sm:hidden">
          <nav className="flex flex-col divide-y divide-line/70 border-y border-line/70">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-5 font-display text-[1.65rem] text-forest"
              >
                {link.label}
                <span className="font-sans text-[10px] tracking-[0.16em] text-muted">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 pt-10">
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-dark w-full">
              Join the club
              <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-outline w-full">
              Sign in
            </Link>
            <p className="pt-5 text-center text-[10px] uppercase tracking-[0.18em] text-muted">
              Rewards that travel further
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
