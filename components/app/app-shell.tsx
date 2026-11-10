"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Building2,
  Gift,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Network,
  Send,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Wordmark } from "@/components/brand";
import { cn, shortAddress } from "@/lib/format";

const ICONS = {
  dashboard: LayoutDashboard,
  wallet: Wallet,
  marketplace: Gift,
  membership: BadgeCheck,
  campaigns: Megaphone,
  issue: Send,
  activity: Activity,
  members: Users,
  merchants: Building2,
  network: Network,
} as const;

export type ShellIcon = keyof typeof ICONS;

export interface ShellNavItem {
  href: string;
  label: string;
  icon: ShellIcon;
}

interface ShellUser {
  name: string;
  roleLabel: string;
  initials: string;
  walletAddress: string;
}

function NavLinks({ items, onNavigate }: { items: ShellNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition",
              active
                ? "bg-ivory text-forest shadow-soft"
                : "text-ivory/55 hover:bg-ivory/6 hover:text-ivory"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-terracotta" : "text-ivory/35 group-hover:text-ivory/70"
              )}
              strokeWidth={1.7}
            />
            <span className="flex-1">{item.label}</span>
            {active ? <span className="size-1.5 rounded-full bg-terracotta" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function ChainStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/38">
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-[#7fb08d] shadow-[0_0_0_3px_rgba(127,176,141,0.12)]" : "bg-gold"
        )}
      />
      {connected ? "Hardhat · Chain live" : "Snapshot mode"}
    </div>
  );
}

function UserFooter({ user, connected }: { user: ShellUser; connected: boolean }) {
  return (
    <div className="border-t border-ivory/10 p-4">
      <div className="px-2 pb-4">
        <ChainStatus connected={connected} />
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-ivory/5 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ivory/20 bg-ivory/10 font-display text-sm text-ivory">
          {user.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-ivory/90">{user.name}</p>
          <p className="mt-0.5 truncate text-[10px] text-ivory/35">
            {user.roleLabel} · {shortAddress(user.walletAddress)}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="flex size-8 items-center justify-center rounded-full text-ivory/40 transition hover:bg-ivory/10 hover:text-ivory"
          >
            <LogOut className="size-4" strokeWidth={1.7} />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  nav,
  connected,
  children,
}: {
  user: ShellUser;
  nav: ShellNavItem[];
  connected: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-forest-deep lg:flex">
        <div className="px-6 pt-7">
          <Link href="/" aria-label="Voyara home" className="inline-flex text-ivory">
            <Wordmark markClassName="border-ivory/25" />
          </Link>
          <p className="eyebrow mt-4 text-ivory/30">{user.roleLabel}</p>
        </div>
        <div className="scrollbar-none mt-7 flex-1 overflow-y-auto px-3.5">
          <NavLinks items={nav} />
        </div>
        <UserFooter user={user} connected={connected} />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/80 bg-ivory/90 px-5 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex size-10 items-center justify-center rounded-full border border-line/80 text-forest transition hover:bg-parchment/60"
          >
            <Menu className="size-4.5" />
          </button>
          <Link href="/" aria-label="Voyara home" className="text-forest">
            <Wordmark className="[&>span:last-child]:text-[1.3rem]" markClassName="size-8 border-forest/25" />
          </Link>
          <span
            className={cn("size-2 rounded-full", connected ? "bg-[#5d8b6f]" : "bg-gold")}
            title={connected ? "Local chain connected" : "Snapshot mode"}
          />
        </header>
        <main id="main">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-deep/65 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[84%] max-w-[310px] flex-col bg-forest-deep text-ivory shadow-2xl">
            <div className="flex items-start justify-between px-5 pt-6">
              <div>
                <Wordmark
                  className="text-ivory [&>span:last-child]:text-[1.45rem]"
                  markClassName="size-8 border-ivory/25"
                />
                <p className="eyebrow mt-3 text-ivory/30">{user.roleLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex size-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto px-3">
              <NavLinks items={nav} onNavigate={() => setOpen(false)} />
            </div>
            <UserFooter user={user} connected={connected} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
