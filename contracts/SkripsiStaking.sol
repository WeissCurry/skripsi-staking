// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

/**
 * @title SkripsiStaking
 * @dev Tokenized Vault (ERC-4626) for Shariah-Compliant Staking.
 * Alignment with Chapter 4: NAV-based calculation using ERC-4626 standard.
 * The contract acts as the "Share" token itself.
 */
contract SkripsiStaking is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IWETH public immutable weth;
    
    uint256 public operatorFee = 5; // 5% Biaya Wakalah
    bool public paused = false;

    event Purified(address indexed charity, uint256 amount);
    event EmergencyPaused(bool paused);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @param _weth Address of the WETH contract (Underlying Asset).
     */
    constructor(IWETH _weth) 
        ERC20("Skripsi Shariah Share", "SKRIPSI") 
        ERC4626(_weth) 
        Ownable(msg.sender) 
    {
        weth = _weth;
    }

    /**
     * @dev Toggle emergency pause (Hifzul Mal / Asset Protection).
     */
    function togglePause() external onlyOwner {
        paused = !paused;
        emit EmergencyPaused(paused);
    }

    /**
     * @dev NATIVE ETH DEPOSIT: Wraps ETH into WETH and mints shares.
     * Use this function for "Stake ETH" interactions.
     */
    function depositETH() external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value > 0, "Amount must be > 0");
        
        uint256 assets = msg.value;
        
        // 1. Calculate shares based on current NAV
        uint256 shares = previewDeposit(assets);
        
        // 2. Wrap ETH to WETH
        weth.deposit{value: assets}();
        
        // 3. Mint shares to user
        _mint(msg.sender, shares);
        
        return shares;
    }

    /**
     * @dev NATIVE ETH REDEEM: Burns shares and returns native ETH.
     * Use this function for "Unstake/Withdraw" interactions.
     */
    function redeemETH(uint256 _shares) external nonReentrant whenNotPaused returns (uint256) {
        require(_shares > 0, "Shares must be > 0");
        require(balanceOf(msg.sender) >= _shares, "Insufficient share balance");

        // 1. Calculate assets (WETH) to return
        uint256 assets = previewRedeem(_shares);
        require(totalAssets() >= assets, "Insufficient liquidity in vault");

        // 2. Burn shares
        _burn(msg.sender, _shares);

        // 3. Unwrap WETH to ETH
        weth.withdraw(assets);

        // 4. Send native ETH to user
        (bool success, ) = payable(msg.sender).call{value: assets}("");
        require(success, "ETH transfer failed");

        return assets;
    }

    /**
     * @dev totalAssets() represents the total WETH managed by the contract.
     * This forms the basis of the NAV calculation.
     */
    function totalAssets() public view override returns (uint256) {
        return weth.balanceOf(address(this));
    }

    /**
     * @dev SHARIAH PURIFICATION: Allows the owner to cleanse the pool.
     * yield from suspected non-compliant activities is removed to charity.
     */
    function purify(uint256 _amount, address _charityAddress) external onlyOwner nonReentrant {
        require(_charityAddress != address(0), "Invalid charity address");
        require(totalAssets() >= _amount, "Insufficient assets for purification");

        // Unwrap WETH and send to charity
        weth.withdraw(_amount);
        
        (bool success, ) = payable(_charityAddress).call{value: _amount}("");
        require(success, "Purification transfer failed");

        emit Purified(_charityAddress, _amount);
    }

    /**
     * @dev Simulation Helper: Represent validator profit arrival.
     * Increases WETH balance, thereby increasing the NAV (Share Price).
     */
    function simulateValidatorProfit() external payable onlyOwner {
        if (msg.value > 0) {
            weth.deposit{value: msg.value}();
        }
    }

    /**
     * @dev Exchange Rate: Value of 1 Share in ETH (Fixed Point 18).
     */
    function getExchangeRate() public view returns (uint256) {
        if (totalSupply() == 0) return 1e18;
        return (totalAssets() * 1e18) / totalSupply();
    }

    /**
     * @dev Fallback to wrap ETH sent to the contract.
     */
    receive() external payable {
        if (msg.value > 0) {
            weth.deposit{value: msg.value}();
        }
    }
}
