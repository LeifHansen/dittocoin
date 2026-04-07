import { useState, useEffect } from "react";

const TIERS = [
  { name: "Paper Hands", emoji: "🧻", lock: "7 days", mult: "1x", apr: "10%", color: "from-gray-500 to-gray-600" },
  { name: "Hodler", emoji: "💎", lock: "30 days", mult: "2x", apr: "20%", color: "from-blue-500 to-blue-600" },
  { name: "Diamond Hands", emoji: "🙌", lock: "90 days", mult: "4x", apr: "40%", color: "from-purple-500 to-purple-600" },
  { name: "Whale", emoji: "🐋", lock: "365 days", mult: "8x", apr: "80%", color: "from-yellow-500 to-amber-500" },
];

const TOKENOMICS = [
  { label: "Total Supply", value: "100,000,000,000", sub: "100 Billion DITTO" },
  { label: "Burn per Tx", value: "2%", sub: "Deflationary forever" },
  { label: "Treasury Fee", value: "1%", sub: "Community-funded growth" },
  { label: "Max Wallet", value: "1%", sub: "Anti-whale protection" },
];

function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}

function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{prefix}{formatNumber(count)}{suffix}</span>;
}

function NavBar({ connected, onConnect, page, setPage }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold text-gray-900">D</div>
        <span className="text-xl font-bold text-white tracking-tight">DittoCoin</span>
        <span className="text-xs text-gray-500 ml-1">$DITTO</span>
      </div>
      <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
        {["Home", "Stake", "Dashboard"].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              page === p ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={onConnect}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          connected
            ? "bg-green-900 text-green-300 border border-green-700"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 hover:from-yellow-400 hover:to-orange-400"
        }`}
      >
        {connected ? "0x7a2F...b93E" : "Connect Wallet"}
      </button>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="text-center py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="text-8xl mb-6 animate-bounce" style={{ animationDuration: "3s" }}>🪙</div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          The Memecoin That <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Burns Brighter</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Deflationary by design. Community-funded. Whale-proof. Stake your DITTO and earn up to 80% APR.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20">
            Buy $DITTO
          </button>
          <button className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-750 transition-all">
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
}

function TokenomicsGrid() {
  return (
    <div className="px-6 pb-16">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Tokenomics</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {TOKENOMICS.map((t) => (
          <div key={t.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
            <div className="text-gray-400 text-sm mb-1">{t.label}</div>
            <div className="text-2xl font-bold text-white">{t.value}</div>
            <div className="text-gray-500 text-xs mt-1">{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BurnTracker() {
  const [burned, setBurned] = useState(0);
  useEffect(() => {
    const target = 142857143;
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 50000;
      if (current > target) current = target;
      setBurned(current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const pct = (burned / 100000000000) * 100;

  return (
    <div className="px-6 pb-16 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-800/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔥</span>
          <h3 className="text-lg font-bold text-white">Live Burn Tracker</h3>
        </div>
        <div className="text-3xl font-bold text-orange-400 mb-2">
          <AnimatedCounter target={burned} duration={3000} suffix=" DITTO" />
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(pct * 500, 100)}%` }}
          />
        </div>
        <div className="text-gray-500 text-sm">Burned from total supply — gone forever</div>
      </div>
    </div>
  );
}

function StakingTierCard({ tier, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(tier.name)}
      className={`text-left rounded-xl p-5 border transition-all ${
        selected
          ? "bg-gray-800 border-yellow-500/50 shadow-lg shadow-yellow-500/10 scale-105"
          : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
      }`}
    >
      <div className="text-3xl mb-2">{tier.emoji}</div>
      <div className="text-white font-bold text-lg">{tier.name}</div>
      <div className="text-gray-400 text-sm mt-1">Lock: {tier.lock}</div>
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.color} text-white`}>
          {tier.mult}
        </span>
        <span className="text-green-400 font-bold">{tier.apr} APR</span>
      </div>
    </button>
  );
}

function StakingPage({ connected }) {
  const [selectedTier, setSelectedTier] = useState("Hodler");
  const [stakeAmount, setStakeAmount] = useState("");
  const [staked, setStaked] = useState(false);

  const tier = TIERS.find((t) => t.name === selectedTier);
  const amount = parseFloat(stakeAmount) || 0;
  const aprNum = parseFloat(tier?.apr) || 0;
  const dailyReward = (amount * (aprNum / 100)) / 365;

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-2">Stake Your DITTO</h2>
      <p className="text-gray-400 text-center mb-10">Pick a tier, lock your tokens, earn rewards</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {TIERS.map((t) => (
          <StakingTierCard key={t.name} tier={t} selected={selectedTier === t.name} onSelect={setSelectedTier} />
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-gray-400 text-sm font-medium">Amount to Stake</label>
          <span className="text-gray-500 text-xs">Balance: {connected ? "4,750,000 DITTO" : "—"}</span>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => { setStakeAmount(e.target.value); setStaked(false); }}
              placeholder="0.00"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
            <span className="absolute right-3 top-3.5 text-gray-500 text-sm">DITTO</span>
          </div>
          <button
            onClick={() => { setStakeAmount("4750000"); setStaked(false); }}
            className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            MAX
          </button>
        </div>

        {amount > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tier</span>
              <span className="text-white">{tier.emoji} {tier.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lock Period</span>
              <span className="text-white">{tier.lock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">APR</span>
              <span className="text-green-400 font-semibold">{tier.apr}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-800 pt-2">
              <span className="text-gray-400">Est. Daily Reward</span>
              <span className="text-yellow-400 font-semibold">{formatNumber(dailyReward)} DITTO</span>
            </div>
          </div>
        )}

        <button
          onClick={() => connected && amount > 0 && setStaked(true)}
          disabled={!connected || amount === 0}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
            staked
              ? "bg-green-900 text-green-300 border border-green-700"
              : connected && amount > 0
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-orange-500/20"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {staked ? "✓ Staked Successfully!" : !connected ? "Connect Wallet to Stake" : amount === 0 ? "Enter an Amount" : `Stake ${formatNumber(amount)} DITTO`}
        </button>
      </div>
    </div>
  );
}

function DashboardPage({ connected }) {
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <div className="text-5xl mb-4">🔒</div>
        <p className="text-lg">Connect your wallet to view your dashboard</p>
      </div>
    );
  }

  const positions = [
    { tier: TIERS[1], amount: 2000000, staked: "12 days ago", unlocks: "18 days", earned: 13150, progress: 40 },
    { tier: TIERS[2], amount: 1500000, staked: "45 days ago", unlocks: "45 days", earned: 74383, progress: 50 },
  ];

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Your Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Wallet Balance</div>
          <div className="text-xl font-bold text-white">1.25M</div>
          <div className="text-gray-500 text-xs">DITTO</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Total Staked</div>
          <div className="text-xl font-bold text-yellow-400">3.5M</div>
          <div className="text-gray-500 text-xs">DITTO</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Rewards Earned</div>
          <div className="text-xl font-bold text-green-400">87.5K</div>
          <div className="text-gray-500 text-xs">DITTO</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
      <div className="space-y-4">
        {positions.map((p, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.tier.emoji}</span>
                <div>
                  <div className="text-white font-semibold">{p.tier.name}</div>
                  <div className="text-gray-500 text-xs">Staked {p.staked}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatNumber(p.amount)} DITTO</div>
                <div className="text-green-400 text-xs">+{formatNumber(p.earned)} earned</div>
              </div>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5 mb-2">
              <div
                className={`bg-gradient-to-r ${p.tier.color} h-1.5 rounded-full`}
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Unlocks in {p.unlocks}</span>
              <span>{p.progress}% complete</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                Emergency Unstake
              </button>
              {p.progress >= 100 && (
                <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-bold">
                  Claim & Unstake
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-gray-800 px-6 py-8 mt-12">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-gray-900">D</div>
          <span className="text-gray-500 text-sm">DittoCoin © 2026</span>
        </div>
        <div className="flex gap-4 text-gray-500 text-sm">
          <a href="#" className="hover:text-white transition-colors">Etherscan</a>
          <a href="#" className="hover:text-white transition-colors">Uniswap</a>
          <a href="#" className="hover:text-white transition-colors">Telegram</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </div>
  );
}

export default function DittoCoinDApp() {
  const [connected, setConnected] = useState(false);
  const [page, setPage] = useState("Home");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar connected={connected} onConnect={() => setConnected(!connected)} page={page} setPage={setPage} />

      {page === "Home" && (
        <>
          <HeroSection />
          <TokenomicsGrid />
          <BurnTracker />
          <div className="px-6 pb-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Staking Tiers</h2>
            <div className="grid grid-cols-2 gap-4">
              {TIERS.map((t) => (
                <div key={t.name} className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center hover:border-gray-600 transition-all`}>
                  <div className="text-4xl mb-2">{t.emoji}</div>
                  <div className="text-white font-bold text-lg">{t.name}</div>
                  <div className="text-gray-400 text-sm">Lock {t.lock}</div>
                  <div className="mt-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${t.color} text-white`}>
                      {t.mult}
                    </span>
                    <span className="text-green-400 font-bold ml-2">{t.apr} APR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page === "Stake" && <StakingPage connected={connected} />}
      {page === "Dashboard" && <DashboardPage connected={connected} />}

      <Footer />
    </div>
  );
}
