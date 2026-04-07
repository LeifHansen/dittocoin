const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DittoCoin", function () {
  let dittoCoin;
  let owner;
  let treasury;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = ethers.parseEther("100000000000"); // 100 billion

  beforeEach(async function () {
    [owner, treasury, addr1, addr2] = await ethers.getSigners();
    const DittoCoin = await ethers.getContractFactory("DittoCoin");
    dittoCoin = await DittoCoin.deploy(treasury.address);
    await dittoCoin.waitForDeployment();
  });

  // ── Deployment ────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await dittoCoin.name()).to.equal("DittoCoin");
      expect(await dittoCoin.symbol()).to.equal("DITTO");
    });

    it("should mint all tokens to the deployer", async function () {
      expect(await dittoCoin.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should set total supply to 100 billion", async function () {
      expect(await dittoCoin.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("should set the deployer as owner", async function () {
      expect(await dittoCoin.owner()).to.equal(owner.address);
    });

    it("should set the treasury address", async function () {
      expect(await dittoCoin.treasury()).to.equal(treasury.address);
    });

    it("should exempt owner and treasury from fees", async function () {
      expect(await dittoCoin.isExempt(owner.address)).to.be.true;
      expect(await dittoCoin.isExempt(treasury.address)).to.be.true;
    });

    it("should revert if treasury is zero address", async function () {
      const DittoCoin = await ethers.getContractFactory("DittoCoin");
      await expect(DittoCoin.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "Treasury cannot be zero address"
      );
    });

    it("should reject transfers to the token contract itself", async function () {
      const tokenAddr = await dittoCoin.getAddress();
      await expect(
        dittoCoin.transfer(tokenAddr, ethers.parseEther("100"))
      ).to.be.revertedWith("Cannot transfer to token contract");
    });
  });

  // ── Fee-exempt transfers (owner) ──────────────────────────

  describe("Exempt transfers (no fees)", function () {
    it("should transfer full amount when sender is exempt", async function () {
      const amount = ethers.parseEther("1000");
      await dittoCoin.transfer(addr1.address, amount);
      expect(await dittoCoin.balanceOf(addr1.address)).to.equal(amount);
    });
  });

  // ── Taxed transfers ───────────────────────────────────────

  describe("Taxed transfers (2% burn + 1% treasury)", function () {
    const seedAmount = ethers.parseEther("1000000"); // 1M to addr1

    beforeEach(async function () {
      // Owner is exempt, so this is a clean transfer
      await dittoCoin.transfer(addr1.address, seedAmount);
    });

    it("should burn 2% and send 1% to treasury on non-exempt transfer", async function () {
      const sendAmount = ethers.parseEther("10000"); // 10k
      const expectedBurn = (sendAmount * 200n) / 10000n;     // 200 tokens
      const expectedTreasury = (sendAmount * 100n) / 10000n; // 100 tokens
      const expectedReceived = sendAmount - expectedBurn - expectedTreasury;

      const supplyBefore = await dittoCoin.totalSupply();
      const treasuryBefore = await dittoCoin.balanceOf(treasury.address);

      await dittoCoin.connect(addr1).transfer(addr2.address, sendAmount);

      expect(await dittoCoin.balanceOf(addr2.address)).to.equal(expectedReceived);
      expect(await dittoCoin.totalSupply()).to.equal(supplyBefore - expectedBurn);
      expect(await dittoCoin.balanceOf(treasury.address)).to.equal(
        treasuryBefore + expectedTreasury
      );
    });

    it("should report correct totalBurned", async function () {
      const sendAmount = ethers.parseEther("10000");
      await dittoCoin.connect(addr1).transfer(addr2.address, sendAmount);

      const expectedBurn = (sendAmount * 200n) / 10000n;
      expect(await dittoCoin.totalBurned()).to.equal(expectedBurn);
    });
  });

  // ── Anti-whale ────────────────────────────────────────────

  describe("Anti-whale limits", function () {
    it("should reject transfers exceeding max tx size", async function () {
      // Max tx = 0.5% of 100B = 500M
      const tooMuch = ethers.parseEther("600000000"); // 600M
      // First give addr1 enough tokens (owner is exempt from limits)
      await dittoCoin.transfer(addr1.address, ethers.parseEther("900000000"));

      await expect(
        dittoCoin.connect(addr1).transfer(addr2.address, tooMuch)
      ).to.be.revertedWith("Exceeds max transaction");
    });

    it("should reject if recipient would exceed max wallet", async function () {
      // Max wallet = 1% of 100B = 1B
      // Each 500M tx nets 485M after 3% fee. Two = 970M. Third would push over 1B.
      const chunk = ethers.parseEther("500000000"); // 500M each (at max tx limit)
      await dittoCoin.transfer(addr1.address, ethers.parseEther("2000000000"));

      await dittoCoin.connect(addr1).transfer(addr2.address, chunk); // addr2 gets ~485M
      await dittoCoin.connect(addr1).transfer(addr2.address, chunk); // addr2 gets ~970M

      // Third chunk: 970M + 485M net = ~1.455B > 1B limit
      await expect(
        dittoCoin.connect(addr1).transfer(addr2.address, chunk)
      ).to.be.revertedWith("Exceeds max wallet");
    });

    it("should allow exempt addresses to bypass limits", async function () {
      // Owner is exempt — can send more than max tx
      const bigAmount = ethers.parseEther("900000000"); // 900M
      await expect(dittoCoin.transfer(addr1.address, bigAmount)).to.not.be.reverted;
    });
  });

  // ── Owner functions ───────────────────────────────────────

  describe("Owner functions", function () {
    it("should allow owner to update treasury", async function () {
      await dittoCoin.setTreasury(addr1.address);
      expect(await dittoCoin.treasury()).to.equal(addr1.address);
      expect(await dittoCoin.isExempt(addr1.address)).to.be.true;
      expect(await dittoCoin.isExempt(treasury.address)).to.be.false;
    });

    it("should allow owner to update fees", async function () {
      await dittoCoin.setFees(100, 50); // 1% burn, 0.5% treasury
      expect(await dittoCoin.burnFeeBps()).to.equal(100);
      expect(await dittoCoin.treasuryFeeBps()).to.equal(50);
    });

    it("should reject fees exceeding 10%", async function () {
      await expect(dittoCoin.setFees(800, 300)).to.be.revertedWith(
        "Total fees cannot exceed 10%"
      );
    });

    it("should allow owner to remove limits", async function () {
      await dittoCoin.removeLimits();
      expect(await dittoCoin.maxWalletBps()).to.equal(10000);
      expect(await dittoCoin.maxTxBps()).to.equal(10000);
    });

    it("should allow owner to remove fees", async function () {
      await dittoCoin.removeFees();
      expect(await dittoCoin.burnFeeBps()).to.equal(0);
      expect(await dittoCoin.treasuryFeeBps()).to.equal(0);
    });

    it("should reject non-owner from changing fees", async function () {
      await expect(
        dittoCoin.connect(addr1).setFees(100, 50)
      ).to.be.reverted;
    });
  });

  // ── Pausable ──────────────────────────────────────────────────

  describe("Pausable", function () {
    it("should allow owner to pause and unpause", async function () {
      await dittoCoin.pause();
      await expect(
        dittoCoin.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.reverted;

      await dittoCoin.unpause();
      await expect(
        dittoCoin.transfer(addr1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });

    it("should reject non-owner from pausing", async function () {
      await expect(dittoCoin.connect(addr1).pause()).to.be.reverted;
    });
  });
});
