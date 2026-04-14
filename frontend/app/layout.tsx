import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Particles } from "@/components/Particles";
import "./globals.css";

export const metadata: Metadata = {
  title: "DittoCoin ($DITTO) — The Memecoin That Burns Brighter | ERC20 Staking",
  description:
    "Community-driven ERC20 memecoin with 2% auto-burn, anti-whale protection, gamified staking up to 80% APR, and deflationary tokenomics. Stake, earn, hodl.",
  keywords: [
    "memecoin",
    "ERC20",
    "deflationary token",
    "crypto staking",
    "DeFi",
    "DittoCoin",
    "DITTO token",
    "yield farming",
    "token burn",
    "cryptocurrency",
  ],
  icons: { icon: "/favicon.ico", apple: "/logo.png" },
  metadataBase: new URL("https://dittocoin.com"),
  alternates: { canonical: "https://dittocoin.com" },
  openGraph: {
    type: "website",
    url: "https://dittocoin.com",
    title: "DittoCoin ($DITTO) — The Memecoin That Burns Brighter",
    description:
      "Deflationary ERC20 memecoin with 2% auto-burn, 1% treasury fee, anti-whale protection, and gamified DeFi staking up to 80% APR.",
    images: [
      {
        url: "https://dittocoin.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "DittoCoin - Memecoin That Burns Brighter",
      },
    ],
    siteName: "DittoCoin",
  },
  twitter: {
    card: "summary_large_image",
    title: "DittoCoin ($DITTO) — The Memecoin That Burns Brighter",
    description:
      "Stake DITTO and earn up to 80% APR with deflationary tokenomics. ERC20 memecoin with 2% auto-burn.",
    images: ["https://dittocoin.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#1a0f2e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DittoCoin",
              url: "https://dittocoin.com",
              logo: "https://dittocoin.com/logo.png",
              description:
                "DittoCoin is a community-driven ERC20 deflationary memecoin with 2% auto-burn, anti-whale protection, and gamified DeFi staking up to 80% APR.",
              sameAs: [
                "https://twitter.com/dittocoin",
                "https://discord.gg/dittocoin",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Community Support",
                url: "https://dittocoin.com",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <Particles />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
