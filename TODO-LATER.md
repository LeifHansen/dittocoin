# DittoCoin — What's Left to Do

Repo: https://github.com/LeifHansen/DittoCoin
Landing page (live): https://leifhansen.github.io/DittoCoin/ ✅

---

## Status snapshot (as of 2026-04-10)

**What's working right now:**
- GitHub Pages landing page is **live** at https://leifhansen.github.io/DittoCoin/ — I verified the static site renders with the full marketing page, tokenomics, staking tiers, etc.
- Your local repo is clean. Three commits are ready to push:
  - `8abb28e` DittoCoin: full project (contracts, tests, frontend, deploy scripts)
  - `048797c` chore: repo cleanup and hygiene (LICENSE, .gitignore, index.html, headers)
  - `1686b6f` frontend: error handling, CSP, metadata hardening

**What GitHub has right now:**
- `contracts/` — DittoCoin.sol, DittoPresale.sol, DittoStaking.sol, DittoVesting.sol (missing `DittoVault.sol` and `mocks/MockPriceFeed.sol`)
- `scripts/` — deploy.js, verify.js (missing `deploy-presale.js`, `deploy-vault.js`)
- Root — .env.example, .gitignore (old version), LICENSE, README.md, hardhat.config.js, index.html, package.json, **TestFile.sol** (stray)
- Entirely missing: `test/`, `frontend/`, BRAND-GUIDE.md, LAUNCH-CHECKLIST.md, CRYPTOSHAKER-MERGE-PLAN.md, DITTO-EARNING-ECOSYSTEM.md, logo.png, og-image.png, package-lock.json

The Mac push (step 1 below) will fix **all** of this in one shot.

---

## 1. Push from your Mac — **takes 10 seconds** ← do this first

From my sandbox I can't reach GitHub (egress proxy blocks port 22 and 443 to github.com). The cleanest fix is to push from your Mac.

**Easiest path — double-click `push-to-github.command` in Finder.**

It will:
1. Switch `origin` to HTTPS so macOS Keychain can store credentials.
2. Pull-rebase any web-UI commits that are on `origin/main` but not local.
3. Push all three local commits.

**First-time PAT setup:**
- Go to https://github.com/settings/tokens → "Generate new token (classic)"
- Give it the `repo` scope, 90-day expiration is fine
- Copy the token, paste it when git asks for a password
- macOS Keychain will remember it from then on

**Or from Terminal:**

```bash
cd ~/path/to/dittocoi
git remote set-url origin https://github.com/LeifHansen/DittoCoin.git
git pull --rebase origin main
git push origin main
```

After push, the repo will have the full cleaned-up codebase: the `frontend/` Next.js app, all tests, the new contracts, the security-hardened `next.config.js`, the ErrorBoundary, the CSP header — everything.

## 2. Delete `TestFile.sol` from GitHub (30 seconds)

I can't delete files through the web UI (Claude safety policy).

- Go to https://github.com/LeifHansen/DittoCoin/blob/main/TestFile.sol
- Click the trash-can icon → commit the deletion.

## 3. Deploy the Next.js frontend (optional)

GitHub Pages is already serving a static landing at https://leifhansen.github.io/DittoCoin/ — **that's enough for marketing**.

If you want the full interactive wallet-connected dApp (buy / stake / vault / presale / dashboard pages) on a real domain, you need a Node host that runs Next.js. Options:

**Vercel** (easiest, free tier, zero config)
1. Go to https://vercel.com/new
2. Import the DittoCoin repo (sign in with GitHub)
3. Set the **Root Directory** to `frontend/`
4. Add env vars from `frontend/.env.local.example`:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (from https://cloud.walletconnect.com)
   - `NEXT_PUBLIC_ALCHEMY_ID` (from https://alchemy.com)
5. Click Deploy.

**Digital Ocean App Platform** (since you mentioned it)
1. Go to https://cloud.digitalocean.com/apps
2. "Create App" → GitHub source → pick DittoCoin repo → branch `main`
3. It auto-detects Next.js. Set **Source Directory** to `/frontend`
4. Add the same env vars
5. Pick plan (Basic $5/mo is fine)
6. Deploy.

**Heads-up:** my sandbox Chrome isn't signed into DigitalOcean — that session didn't carry over. You'll need to log in once in your browser, then follow the steps above.

---

## Pre-launch work (from LAUNCH-CHECKLIST.md)

Full detail lives in `LAUNCH-CHECKLIST.md`. The essentials:

### Before Sepolia testnet deploy
- [ ] `npm install` and `npm test` locally — my sandbox can't run solc, so compilation/tests need to pass on your Mac before you deploy.
- [ ] API keys:
  - Alchemy: https://www.alchemy.com
  - Etherscan: https://etherscan.io/myapikey
  - WalletConnect: https://cloud.walletconnect.com
- [ ] Set up a **dedicated deployer wallet** (not your personal one) — fund with test ETH.
- [ ] Create `.env` and `frontend/.env.local` from the `.example` templates.

### Before mainnet deploy
- [ ] **Professional audit** — non-negotiable. Certik, OpenZeppelin, Sherlock, or similar.
- [ ] **Gnosis Safe multisig** for treasury + contract ownership. Transfer via `transferOwnership()`.
- [ ] Add a Timelock controller between the multisig and the pause/unpause functions.
- [ ] Lock initial Uniswap liquidity with Unicrypt or Team Finance.
- [ ] Legal review: token classification, ToS, Privacy Policy, MSB/KYC questions.

---

## Cleanup & hardening done for you (reference)

- Comprehensive `.gitignore` (node_modules, env, build artifacts, OS junk, IDE).
- Removed tracked junk: `.DS_Store`, `frontend/.DS_Store`, `test_sync_file.txt`.
- Restored `frontend/next.config.js` with full security header set (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, X-DNS-Prefetch-Control) — an earlier static-export experiment had clobbered them.
- **Added Content-Security-Policy** tuned for wagmi + RainbowKit + WalletConnect (allows https/wss for RPCs and WC relays, data/blob for wallet icons, frame-src for verify.walletconnect.*).
- Sanitized `LAUNCH-CHECKLIST.md`: dropped stale password-rotation note, corrected repo slug.
- Added `LICENSE` (MIT, matches `package.json`) — this one *is* on GitHub already, I uploaded it via the web UI.
- Added root `index.html` so GitHub Pages (main/root) has an entry point. Pages is serving it now.
- Rewrote `push-to-github.command` to use HTTPS and rebase-then-push (no more `--force`).
- **Frontend hardening:**
  - Wrapped `<main>` in `ErrorBoundary` so a render crash on any page degrades gracefully.
  - Fixed Next 14 metadata schema (canonical moved under `alternates`, googleBot sub-keys under `robots.googleBot`).
  - Disabled `X-Powered-By: Next.js` header (`poweredByHeader: false`).
- **Stake page tx error handling:**
  - Added `txError` state that bubbles wagmi errors (`writeContract` + `waitForTransactionReceipt` from both approve and stake) into a red error banner instead of leaving users stuck on a spinner.
  - Button shows "Try again" on failure and re-enables.
  - Uses wagmi's `.shortMessage` for user-friendly text with `.message` fallback.

All committed locally as `048797c` (cleanup) and `1686b6f` (frontend hardening) — just waiting on the Mac push.
