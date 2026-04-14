// ─────────────────────────────────────────────────────────────
// DittoCoin Full Ecosystem Deployment
// ─────────────────────────────────────────────────────────────
// Deploys: DittoCoin → DittoStaking → DittoPresale → DittoVesting
// Links them, configures presale rounds, funds reward pools, and
// writes all addresses to deployments/<network>.json for the frontend.
//
// Usage:
//   npx hardhat run scripts/deploy-all.js --network sepolia
//   npx hardhat run scripts/deploy-all.js --network mainnet
//
// Prerequisites:
//   - DEPLOYER_PRIVATE_KEY set in .env
//   - ALCHEMY_API_KEY set in .env
//   - Deployer wallet funded with enough ETH (~0.1 ETH for Sepolia,
//     ~0.5 ETH for mainnet)
// ─────────────────────────────────────────────────────────────

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? `chainId-${network.chainId}` : network.name;

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║   DittoCoin Full Ecosystem Deployment                ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");
  console.log(`Network:  ${networkName} (chainId ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Deployer balance too low. Fund the wallet with at least 0.05 ETH.");
  }

  const deployments = { network: networkName, chainId: network.chainId.toString(), deployer: deployer.address };

  // ── 1. Deploy DittoCoin ──────────────────────────────────────
  console.log("[1/5] Deploying DittoCoin...");
  const DittoCoin = await ethers.getContractFactory("DittoCoin");
  const dittoCoin = await DittoCoin.deploy(deployer.address); // deployer = temporary treasury
  await dittoCoin.waitForDeployment();
  const dittoCoinAddress = await dittoCoin.getAddress();
  deployments.dittoCoin = dittoCoinAddress;
  console.log(`      ✓ DittoCoin:      ${dittoCoinAddress}`);

  const totalSupply = await dittoCoin.totalSupply();
  console.log(`      ✓ Total supply:  ${ethers.formatEther(totalSupply)} DITTO\n`);

  // ── 2. Deploy DittoStaking ───────────────────────────────────
  console.log("[2/5] Deploying DittoStaking...");
  const DittoStaking = await ethers.getContractFactory("DittoStaking");
  const dittoStaking = await DittoStaking.deploy(dittoCoinAddress);
  await dittoStaking.waitForDeployment();
  const stakingAddress = await dittoStaking.getAddress();
  deployments.dittoStaking = stakingAddress;
  console.log(`      ✓ DittoStaking:  ${stakingAddress}\n`);

  // ── 3. Deploy DittoPresale ───────────────────────────────────
  console.log("[3/5] Deploying DittoPresale...");
  const DittoPresale = await ethers.getContractFactory("DittoPresale");
  const presale = await DittoPresale.deploy(dittoCoinAddress);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  deployments.dittoPresale = presaleAddress;
  console.log(`      ✓ DittoPresale:  ${presaleAddress}\n`);

  // ── 4. Deploy DittoVesting ───────────────────────────────────
  console.log("[4/5] Deploying DittoVesting...");
  const DittoVesting = await ethers.getContractFactory("DittoVesting");
  const vesting = await DittoVesting.deploy(dittoCoinAddress);
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  deployments.dittoVesting = vestingAddress;
  console.log(`      ✓ DittoVesting:  ${vestingAddress}\n`);

  // ── 5. Link + configure ──────────────────────────────────────
  console.log("[5/5] Linking contracts and funding pools...");

  // 5a. Link presale → vesting
  let tx = await presale.setVestingContract(vestingAddress);
  await tx.wait();
  console.log("      ✓ Presale → Vesting linked");

  // 5b. Link vesting → presale (authorizes presale to register schedules)
  tx = await vesting.setPresaleContract(presaleAddress);
  await tx.wait();
  console.log("      ✓ Vesting ← Presale authorized");

  // 5c. Fee exemptions for ecosystem contracts
  tx = await dittoCoin.setExempt(stakingAddress, true);
  await tx.wait();
  tx = await dittoCoin.setExempt(presaleAddress, true);
  await tx.wait();
  tx = await dittoCoin.setExempt(vestingAddress, true);
  await tx.wait();
  console.log("      ✓ Staking, Presale, Vesting marked fee-exempt");

  // 5d. Configure presale rounds (amounts per design doc)
  // Total presale allocation: 25% of 420B = 105B DITTO
  const SEED_ALLOCATION      = ethers.parseEther("30000000000");   // 30B
  const EARLYBIRD_ALLOCATION = ethers.parseEther("35000000000");   // 35B
  const PUBLIC_ALLOCATION    = ethers.parseEther("40000000000");   // 40B

  tx = await presale.configureRound(
    0, // Seed
    ethers.parseEther("50000000"),    // 50M DITTO per ETH (60% discount)
    ethers.parseEther("300"),         // 300 ETH hardcap
    ethers.parseEther("50"),          // 50 ETH softcap
    ethers.parseEther("5"),           // 5 ETH per wallet
    SEED_ALLOCATION,
    true                              // whitelist required
  );
  await tx.wait();
  console.log("      ✓ Round 0 (Seed) configured: 300 ETH cap, whitelist");

  tx = await presale.configureRound(
    1, // EarlyBird
    ethers.parseEther("33333333"),    // 33.3M DITTO per ETH (40% discount)
    ethers.parseEther("500"),         // 500 ETH hardcap
    ethers.parseEther("100"),         // 100 ETH softcap
    ethers.parseEther("10"),          // 10 ETH per wallet
    EARLYBIRD_ALLOCATION,
    false
  );
  await tx.wait();
  console.log("      ✓ Round 1 (EarlyBird) configured: 500 ETH cap");

  tx = await presale.configureRound(
    2, // Public
    ethers.parseEther("25000000"),    // 25M DITTO per ETH (20% discount)
    ethers.parseEther("1000"),        // 1000 ETH hardcap
    ethers.parseEther("200"),         // 200 ETH softcap
    ethers.parseEther("20"),          // 20 ETH per wallet
    PUBLIC_ALLOCATION,
    false
  );
  await tx.wait();
  console.log("      ✓ Round 2 (Public) configured: 1000 ETH cap");

  // 5e. Transfer presale tokens to presale contract
  const totalPresaleTokens = SEED_ALLOCATION + EARLYBIRD_ALLOCATION + PUBLIC_ALLOCATION;
  tx = await dittoCoin.transfer(presaleAddress, totalPresaleTokens);
  await tx.wait();
  console.log(`      ✓ ${ethers.formatEther(totalPresaleTokens)} DITTO → Presale contract`);

  // 5f. Fund staking reward pool (5% of supply = 21B)
  const STAKING_REWARDS = ethers.parseEther("21000000000");
  tx = await dittoCoin.approve(stakingAddress, STAKING_REWARDS);
  await tx.wait();
  tx = await dittoStaking.fundRewardPool(STAKING_REWARDS);
  await tx.wait();
  console.log(`      ✓ ${ethers.formatEther(STAKING_REWARDS)} DITTO → Staking reward pool`);

  // ── Save deployments ─────────────────────────────────────────
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const timestamp = new Date().toISOString();
  deployments.timestamp = timestamp;
  deployments.blockNumber = await ethers.provider.getBlockNumber();

  const filename = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filename, JSON.stringify(deployments, null, 2));
  console.log(`\n      ✓ Addresses saved: deployments/${networkName}.json`);

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║   Deployment Complete!                                ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`  DittoCoin:     ${dittoCoinAddress}`);
  console.log(`  DittoStaking:  ${stakingAddress}`);
  console.log(`  DittoPresale:  ${presaleAddress}`);
  console.log(`  DittoVesting:  ${vestingAddress}`);
  console.log("═══════════════════════════════════════════════════════");

  console.log("\nNext steps:");
  console.log("  1. Update frontend/lib/contracts.ts with these addresses");
  console.log("  2. Verify on Etherscan:");
  console.log(`     npx hardhat verify --network ${networkName} ${dittoCoinAddress} ${deployer.address}`);
  console.log(`     npx hardhat verify --network ${networkName} ${stakingAddress} ${dittoCoinAddress}`);
  console.log(`     npx hardhat verify --network ${networkName} ${presaleAddress} ${dittoCoinAddress}`);
  console.log(`     npx hardhat verify --network ${networkName} ${vestingAddress} ${dittoCoinAddress}`);
  console.log("  3. (Optional) Deploy DittoVault:");
  console.log(`     DITTO_TOKEN_ADDRESS=${dittoCoinAddress} npx hardhat run scripts/deploy-vault.js --network ${networkName}`);
  console.log("  4. When ready, add whitelist addresses: presale.setWhitelist([...], true)");
  console.log("  5. Activate Seed round: presale.activateRound(0)\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
