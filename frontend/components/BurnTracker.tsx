"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function formatNumber(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}

export function BurnTracker() {
  // In production, this would read from the contract's totalBurned()
  // For now, simulate a growing burn counter
  const [burned, setBurned] = useState(0);
  const target = 142_857_143; // example: ~143M burned so far

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 800_000 + 200_000;
      if (current > target) current = target;
      setBurned(current);
      if (current >= target) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const supplyPct = (burned / 100_000_000_000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-8 glow-pink"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl animate-pulse">{"\u{1F525}"}</span>
        <h3 className="font-display text-xl font-bold text-white">
          Live Burn Tracker
        </h3>
        <span className="ml-auto px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
          LIVE
        </span>
      </div>

      <div className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
        {formatNumber(burned)} DITTO
      </div>

      <div className="w-full h-2 bg-white/5 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(supplyPct * 500, 100)}%` }}
          transition={{ duration: 3, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/40">
          {supplyPct.toFixed(4)}% of total supply burned
        </span>
        <span className="text-white/40">Gone forever</span>
      </div>
    </motion.div>
  );
}
