import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Voyara — Rewards that travel further",
    template: "%s · Voyara",
  },
  description:
    "A blockchain-powered travel and lifestyle loyalty network. Earn one balance across hotels, dining, wellness, shopping and travel — then spend it wherever you wander.",
  applicationName: "Voyara",
  keywords: [
    "travel rewards",
    "loyalty program",
    "blockchain loyalty",
    "NFT membership",
    "smart contracts",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Voyara — Rewards that travel further",
    description:
      "One membership. A world of places. A blockchain-powered loyalty network for travel and lifestyle.",
    type: "website",
    siteName: "Voyara",
  },
  appleWebApp: {
    capable: true,
    title: "Voyara",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#112a22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-ivory text-ink" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-forest px-4 py-2 text-sm text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
