import type { ReactNode } from "react";
import { AppShell, type ShellNavItem } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth";
import { getChainOverview } from "@/lib/chain/read";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLE_SHELL: Record<Role, { label: string; items: ShellNavItem[] }> = {
  traveler: {
    label: "Member portal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/wallet", label: "Wallet", icon: "wallet" },
      { href: "/marketplace", label: "Marketplace", icon: "marketplace" },
      { href: "/membership", label: "Membership", icon: "membership" },
    ],
  },
  merchant: {
    label: "Merchant portal",
    items: [
      { href: "/merchant", label: "Overview", icon: "dashboard" },
      { href: "/merchant/campaigns", label: "Campaigns", icon: "campaigns" },
      { href: "/merchant/issue", label: "Issue points", icon: "issue" },
      { href: "/merchant/activity", label: "Activity", icon: "activity" },
    ],
  },
  admin: {
    label: "Network admin",
    items: [
      { href: "/admin", label: "Overview", icon: "dashboard" },
      { href: "/admin/members", label: "Members", icon: "members" },
      { href: "/admin/merchants", label: "Merchants", icon: "merchants" },
      { href: "/admin/network", label: "Network", icon: "network" },
    ],
  },
};

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const overview = await getChainOverview();
  const shell = ROLE_SHELL[user.role];

  return (
    <AppShell
      user={{
        name: user.name,
        roleLabel: shell.label,
        initials: user.initials,
        walletAddress: user.walletAddress,
      }}
      nav={shell.items}
      connected={overview.connected}
    >
      {children}
    </AppShell>
  );
}
