// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DittoCoin (DITTO)
 * @notice A community-driven memecoin on Ethereum with built-in tokenomics:
 *
 *   - 2% burn on every transfer   → deflationary supply
 *   - 1% to community treasury    → self-funding growth
 *   - Anti-whale: max 1% of supply per wallet, 0.5% per tx
 *
 *   100 billion tokens minted at deploy. No mint function.
 */
contract DittoCoin is ERC20, Ownable2Step, Pausable {
    uint256 public constant INITIAL_SUPPLY = 100_000_000_000 * 10 ** 18;

    // ── Fee configuration (basis points, 100 = 1%) ──────────────
    uint256 public burnFeeBps = 200;      // 2%
    uint256 public treasuryFeeBps = 100;  // 1%

    // ── Anti-whale limits ───────────────────────────────────────
    uint256 public maxWalletBps = 100;    // 1% of initial supply
    uint256 public maxTxBps = 50;         // 0.5% of initial supply

    // ── Treasury ────────────────────────────────────────────────
    address public treasury;

    // ── Fee-exempt addresses (owner, treasury, staking, LPs) ────
    mapping(address => bool) public isExempt;

    // ── Events ──────────────────────────────────────────────────
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ExemptUpdated(address indexed account, bool exempt);
    event FeesUpdated(uint256 burnFeeBps, uint256 treasuryFeeBps);
    event LimitsUpdated(uint256 maxWalletBps, uint256 maxTxBps);

    constructor(address _treasury) ERC20("DittoCoin", "DITTO") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;

        // Exempt deployer and treasury from fees & limits
        isExempt[msg.sender] = true;
        isExempt[_treasury] = true;

        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ── Overridden transfer logic ───────────────────────────────

    function _update(address from, address to, uint256 amount) internal override whenNotPaused {
        // Minting and burning bypass all logic
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        // Prevent accidental transfers to token contract itself
        require(to != address(this), "Cannot transfer to token contract");

        bool exempt = isExempt[from] || isExempt[to];

        if (exempt) {
            // No fees or limits for exempt addresses
            super._update(from, to, amount);
        } else {
            // Anti-whale: max transaction size
            uint256 maxTx = (INITIAL_SUPPLY * maxTxBps) / 10_000;
            require(amount <= maxTx, "Exceeds max transaction");

            // Calculate fees
            uint256 burnAmount = (amount * burnFeeBps) / 10_000;
            uint256 treasuryAmount = (amount * treasuryFeeBps) / 10_000;
            uint256 transferAmount = amount - burnAmount - treasuryAmount;

            // Anti-whale: max wallet uses NET amount (what recipient actually gets)
            uint256 maxWallet = (INITIAL_SUPPLY * maxWalletBps) / 10_000;
            require(balanceOf(to) + transferAmount <= maxWallet, "Exceeds max wallet");

            // Burn
            if (burnAmount > 0) {
                super._update(from, address(0), burnAmount);
            }
            // Treasury
            if (treasuryAmount > 0) {
                super._update(from, treasury, treasuryAmount);
            }
            // Recipient gets the rest
            super._update(from, to, transferAmount);
        }
    }

    // ── Owner functions ─────────────────────────────────────────

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero address");
        emit TreasuryUpdated(treasury, _treasury);
        isExempt[treasury] = false;
        treasury = _treasury;
        isExempt[_treasury] = true;
    }

    function setExempt(address account, bool exempt) external onlyOwner {
        isExempt[account] = exempt;
        emit ExemptUpdated(account, exempt);
    }

    function setFees(uint256 _burnFeeBps, uint256 _treasuryFeeBps) external onlyOwner {
        require(_burnFeeBps + _treasuryFeeBps <= 1000, "Total fees cannot exceed 10%");
        burnFeeBps = _burnFeeBps;
        treasuryFeeBps = _treasuryFeeBps;
        emit FeesUpdated(_burnFeeBps, _treasuryFeeBps);
    }

    function setLimits(uint256 _maxWalletBps, uint256 _maxTxBps) external onlyOwner {
        require(_maxWalletBps >= 50, "Max wallet must be >= 0.5%");
        require(_maxTxBps >= 10, "Max tx must be >= 0.1%");
        maxWalletBps = _maxWalletBps;
        maxTxBps = _maxTxBps;
        emit LimitsUpdated(_maxWalletBps, _maxTxBps);
    }

    /// @notice Remove all limits — call this once trading is established
    function removeLimits() external onlyOwner {
        maxWalletBps = 10_000;
        maxTxBps = 10_000;
        emit LimitsUpdated(10_000, 10_000);
    }

    /// @notice Remove all fees — call this if community votes to go fee-free
    function removeFees() external onlyOwner {
        burnFeeBps = 0;
        treasuryFeeBps = 0;
        emit FeesUpdated(0, 0);
    }

    // ── Pause mechanism ─────────────────────────────────────────
    // PRODUCTION NOTE: This contract should be owned by a Timelock controller
    // or multisig to prevent unilateral pause actions.

    /// @notice Pause all token transfers (owner only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause all token transfers (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }

    // ── View helpers ────────────────────────────────────────────

    /// @notice Returns how many tokens have been burned so far
    function totalBurned() external view returns (uint256) {
        return INITIAL_SUPPLY - totalSupply();
    }
}
