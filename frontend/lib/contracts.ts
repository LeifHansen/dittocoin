// ─── Contract Addresses ──────────────────────────────────────
// Update these after deploying your contracts
export const CONTRACTS = {
  // Sepolia testnet (update after deploy)
  sepolia: {
    dittoCoin: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    dittoStaking: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  // Mainnet (update after deploy)
  mainnet: {
    dittoCoin: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    dittoStaking: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
} as const;

// Uniswap V2 Router (mainnet)
export const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" as `0x${string}`;

// Token metadata
export const TOKEN = {
  name: "DittoCoin",
  symbol: "DITTO",
  decimals: 18,
  initialSupply: "100000000000", // 100 billion
} as const;

// Staking tiers
export const STAKING_TIERS = [
  { id: 0, name: "Paper Hands", emoji: "\u{1F9FB}", lock: "7 days", lockSeconds: 604800, mult: "1x", apr: 10, color: "from-gray-400 to-gray-500" },
  { id: 1, name: "Hodler", emoji: "\u{1F48E}", lock: "30 days", lockSeconds: 2592000, mult: "2x", apr: 20, color: "from-ditto-teal to-emerald-400" },
  { id: 2, name: "Diamond Hands", emoji: "\u{1F64C}", lock: "90 days", lockSeconds: 7776000, mult: "4x", apr: 40, color: "from-ditto-purple-600 to-purple-400" },
  { id: 3, name: "Whale", emoji: "\u{1F40B}", lock: "365 days", lockSeconds: 31536000, mult: "8x", apr: 80, color: "from-ditto-amber to-yellow-300" },
] as const;
