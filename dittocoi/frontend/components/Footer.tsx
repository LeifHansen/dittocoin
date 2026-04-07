import Image from "next/image";

const LINKS = {
  Community: [
    { label: "Telegram", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "Discord", href: "#" },
  ],
  Resources: [
    { label: "Etherscan", href: "#" },
    { label: "CoinGecko", href: "#" },
    { label: "CoinMarketCap", href: "#" },
  ],
  Trade: [
    { label: "Uniswap", href: "#" },
    { label: "DEXTools", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ditto-purple-900/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src="/logo.png" alt="DittoCoin" fill className="object-cover" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Ditto<span className="text-ditto-teal">Coin</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              The memecoin that burns brighter. Deflationary, community-funded,
              and whale-proof by design.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 hover:text-ditto-teal transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; 2026 DittoCoin. Not financial advice. DYOR.
          </p>
          <p className="text-xs text-white/20">
            Contract verified on Etherscan
          </p>
        </div>
      </div>
    </footer>
  );
}
