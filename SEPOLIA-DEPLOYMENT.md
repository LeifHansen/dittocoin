# Sepolia Deployment Runbook

End-to-end checklist for deploying DittoCoin to Sepolia testnet and validating the full presale → vesting → staking flow before mainnet.

Estimated time: 1-2 hours, plus a 30-day wait period if you want to test the full vesting curve.

---

## 0. Prerequisites

Before you start, confirm you have:

- [ ] An Ethereum wallet with a fresh private key (do NOT reuse mainnet keys for testnet)
- [ ] ~0.5 Sepolia ETH (get from [sepoliafaucet.com](https://sepoliafaucet.com) or [Alchemy's faucet](https://www.alchemy.com/faucets/ethereum-sepolia))
- [ ] An Alchemy API key ([dashboard.alchemy.com](https://dashboard.alchemy.com))
- [ ] An Etherscan API key ([etherscan.io/myapikey](https://etherscan.io/myapikey))

---

## 1. Environment setup

Create `.env` in the project root:

```bash
ALCHEMY_API_KEY=your_alchemy_api_key_here
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

Install dependencies and compile:

```bash
npm install
npx hardhat compile
```

Run the test suite to confirm everything passes locally:

```bash
npx hardhat test
```

Expected: `146 passing`.

---

## 2. Deploy the full ecosystem

One command deploys DittoCoin → DittoStaking → DittoPresale → DittoVesting, links them, configures all 3 presale rounds, transfers 105B DITTO to the presale contract, and funds the staking pool with 21B DITTO:

```bash
npx hardhat run scripts/deploy-all.js --network sepolia
```

Expected output ends with:

```
╔═══════════════════════════════════════════════════════╗
║   Deployment Complete!                                ║
╚═══════════════════════════════════════════════════════╝
  DittoCoin:     0x...
  DittoStaking:  0x...
  DittoPresale:  0x...
  DittoVesting:  0x...
```

Addresses are written to `deployments/sepolia.json` for later reference.

Gas cost: ~0.1-0.15 Sepolia ETH.

---

## 3. (Optional) Deploy the Vault

If you want to test the multi-asset vault flow:

```bash
DITTO_TOKEN_ADDRESS=<dittoCoin_address> npx hardhat run scripts/deploy-vault.js --network sepolia
```

This adds ETH as a supported asset using Sepolia's Chainlink ETH/USD feed. You can add USDC/USDT/DAI later via `vault.addAsset()`.

---

## 4. Verify contracts on Etherscan

The deploy script prints these commands at the end — copy them from your terminal:

```bash
npx hardhat verify --network sepolia <dittoCoin_addr> <deployer_addr>
npx hardhat verify --network sepolia <staking_addr> <dittoCoin_addr>
npx hardhat verify --network sepolia <presale_addr> <dittoCoin_addr>
npx hardhat verify --network sepolia <vesting_addr> <dittoCoin_addr>
```

Verified contracts show source on Etherscan, which is required for most block explorer integrations.

---

## 5. Update the frontend

Edit `frontend/lib/contracts.ts` and replace the `sepolia` block:

```typescript
sepolia: {
  dittoCoin:     "0x...",  // from deployments/sepolia.json
  dittoStaking:  "0x...",
  dittoPresale:  "0x...",
  dittoVesting:  "0x...",
  dittoVault:    "0x...",  // if you deployed the vault
},
```

Then run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and confirm:
- [ ] Wallet connects
- [ ] Network guard prompts you to switch to Sepolia if on wrong chain
- [ ] Landing page loads without errors
- [ ] Contract addresses display correctly in dashboard

---

## 6. End-to-end presale validation

Using 2-3 test wallets (you'll need some Sepolia ETH in each):

### 6a. Seed round (whitelist only)

```bash
# From hardhat console or a script, using the deployer:
npx hardhat console --network sepolia

> const presale = await ethers.getContractAt("DittoPresale", "<presale_addr>");
> await presale.setWhitelist(["<wallet1>", "<wallet2>"], true);
> await presale.activateRound(0);
```

Then from a whitelisted test wallet:
- [ ] Navigate to `/presale`
- [ ] Buy 0.1 ETH worth of DITTO (should receive ~5M DITTO at Seed price)
- [ ] Confirm transaction succeeds
- [ ] Confirm `presale.purchases(wallet, 0)` shows the buy

Attempt from a NON-whitelisted wallet:
- [ ] Should fail with "Not whitelisted"

### 6b. Advance to EarlyBird

```bash
> await presale.finalizeRound(0);   // close Seed
> await presale.activateRound(1);   // open EarlyBird
```

- [ ] Any wallet can now buy in EarlyBird
- [ ] Buy 0.2 ETH worth (should get ~6.7M DITTO)

### 6c. Advance to Public

```bash
> await presale.finalizeRound(1);
> await presale.activateRound(2);
```

- [ ] Buy 0.3 ETH worth (should get ~7.5M DITTO)

### 6d. Finalize and set TGE

```bash
> await presale.finalizeRound(2);
> const vesting = await ethers.getContractAt("DittoVesting", "<vesting_addr>");
> const now = Math.floor(Date.now() / 1000);
> await vesting.setTGE(now);   // TGE right now
```

### 6e. Claim vested tokens

From your buyer test wallets:
- [ ] Navigate to `/vesting`
- [ ] Should show Seed buyer: 25% claimable immediately (TGE), 75% over 90 days
- [ ] Should show EarlyBird buyer: 50% claimable immediately, 50% over 60 days
- [ ] Should show Public buyer: 100% claimable immediately
- [ ] Click claim → receive DITTO in wallet
- [ ] Balance on `/dashboard` should update

---

## 7. Staking validation

From any wallet with DITTO (e.g., the Public buyer from step 6e):

- [ ] Navigate to `/stake`
- [ ] Approve DITTO spend
- [ ] Stake 1M DITTO into Paper Hands tier (7 day lock)
- [ ] Confirm stake appears in `/dashboard`
- [ ] Advance time (Sepolia doesn't support arbitrary time travel — wait 7 days OR use hardhat's `evm_increaseTime` on a local fork)
- [ ] Unstake and confirm DITTO + reward is returned

Also test the other tiers:
- [ ] Hodler (30 days, 2x multiplier)
- [ ] Diamond Hands (90 days, 4x multiplier)
- [ ] Whale (365 days, 8x multiplier)

---

## 8. Edge cases to confirm before mainnet

- [ ] Buy exactly at the round hardcap → last buy adjusted down, round finalizes
- [ ] Buy when round is inactive → reverts with "Round not active"
- [ ] Buy exceeding per-wallet cap → reverts
- [ ] Claim vesting before TGE → reverts with "TGE not set" or "Before TGE"
- [ ] Emergency unstake → returns principal only, no reward
- [ ] Pause DittoCoin → transfers halt
- [ ] Owner transfer → 2-step accept required
- [ ] Remove asset from vault → existing deposits can still withdraw

---

## 9. Go/no-go for mainnet

Before mainnet deployment:

- [ ] All Sepolia flows validated end-to-end
- [ ] Frontend fully functional on Sepolia with no console errors
- [ ] Audit report received, findings addressed
- [ ] Gnosis Safe multisig deployed on mainnet (2-of-3 or 3-of-5)
- [ ] Legal review of presale terms complete
- [ ] Initial whitelist built (Seed round needs buyers ready)
- [ ] Community channels live (Telegram, X, Discord)
- [ ] Marketing plan for launch day ready
- [ ] Mainnet `.env` configured with production keys
- [ ] Ownership transfer plan documented (when to hand off to multisig)

---

## Troubleshooting

**"insufficient funds for intrinsic transaction cost"**
Your deployer wallet is out of Sepolia ETH. Hit the faucet.

**"HardhatError: Cannot connect to the network sepolia"**
Check that `ALCHEMY_API_KEY` in `.env` is valid and the Alchemy app is active.

**"Error: Transaction reverted without a reason string"**
Usually a require() hit somewhere. Check the transaction on Sepolia Etherscan for the revert reason.

**"Nonce too high"**
Your wallet state is desynced. In MetaMask: Settings → Advanced → Clear activity tab data.

**Frontend shows zero contract addresses**
You forgot to update `frontend/lib/contracts.ts` after deploy. See step 5.

---

## Files generated

- `deployments/sepolia.json` — authoritative record of deployed addresses
- `artifacts/` — compiled contract ABIs (already gitignored)
- `cache/` — Hardhat cache (already gitignored)
