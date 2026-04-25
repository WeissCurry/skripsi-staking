// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SkripsiToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SkripsiPool
 * @dev Kontrak Utama Pengelola Dana Staking (Model Wakalah).
 */
contract SkripsiPool is Ownable, ReentrancyGuard {
    SkripsiToken public token;
    
    uint256 public totalEthStaked;
    uint256 public operatorFee = 5; // 5% Biaya Wakalah
    
    event Deposited(address indexed user, uint256 ethAmount, uint256 tokenAmount);
    event WithdrawalRequested(address indexed user, uint256 tokenAmount, uint256 ethAmount);
    event Purified(address indexed charity, uint256 amount);

    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused, "Kontrak sedang dihentikan (Emergency)");
        _;
    }

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = SkripsiToken(_tokenAddress);
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    /**
     * @dev Deposit ETH dan Mint Token SKRIPSI berdasarkan NAV.
     * Model NAV: 1 Token = (Total ETH / Total Supply) ETH.
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "ETH harus lebih dari 0");
        
        uint256 tokensToMint;
        uint256 totalSupply = token.totalSupply();
        
        if (totalSupply == 0) {
            // Initial rate 1:1
            tokensToMint = msg.value;
        } else {
            // NAV Formula: tokens = eth * (totalSupply / totalEthStaked)
            tokensToMint = (msg.value * totalSupply) / totalEthStaked;
        }
        
        totalEthStaked += msg.value;
        token.mint(msg.sender, tokensToMint);
        
        emit Deposited(msg.sender, msg.value, tokensToMint);
    }

    /**
     * @dev Unstake: Bakar LST dan dapatkan ETH kembali berdasarkan NAV.
     */
    function withdraw(uint256 _tokenAmount) external nonReentrant whenNotPaused {
        require(_tokenAmount > 0, "Jumlah token harus > 0");
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Saldo token tidak mencukupi");

        uint256 ethToReturn;
        uint256 totalSupply = token.totalSupply();
        
        // Formula: eth = tokens * (totalEthStaked / totalSupply)
        ethToReturn = (_tokenAmount * totalEthStaked) / totalSupply;
        
        require(address(this).balance >= ethToReturn, "Saldo ETH pool tidak mencukupi");

        totalEthStaked -= ethToReturn;
        token.burn(msg.sender, _tokenAmount);
        
        (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
        require(success, "Gagal mengirim ETH");

        emit WithdrawalRequested(msg.sender, _tokenAmount, ethToReturn);
    }

    /**
     * @dev Purification: Kirim dana syubhat ke alamat sosial/charity.
     * Bagian dari kepatuhan Syariah untuk membersihkan hasil investasi.
     */
    function purify(uint256 _amount, address _charityAddress) external onlyOwner nonReentrant {
        require(_amount <= address(this).balance, "Saldo tidak mencukupi untuk pembersihan");
        require(_charityAddress != address(0), "Alamat charity tidak valid");

        (bool success, ) = payable(_charityAddress).call{value: _amount}("");
        require(success, "Gagal mengirim dana pembersihan");

        if (totalEthStaked >= _amount) {
            totalEthStaked -= _amount;
        } else {
            totalEthStaked = 0;
        }

        emit Purified(_charityAddress, _amount);
    }

    /**
     * @dev Fungsi untuk menghitung nilai NAV saat ini.
     * Digunakan oleh Frontend untuk menampilkan "1 LST = X.XX ETH".
     */
    function getExchangeRate() public view returns (uint256) {
        uint256 totalSupply = token.totalSupply();
        if (totalSupply == 0) return 1e18; // 1:1
        return (totalEthStaked * 1e18) / totalSupply;
    }

    // Fungsi tambahan untuk simulasi profit validator (hanya owner/oracle)
    function simulateValidatorProfit() external payable onlyOwner {
        totalEthStaked += msg.value;
    }

    receive() external payable {
        totalEthStaked += msg.value;
    }
}
