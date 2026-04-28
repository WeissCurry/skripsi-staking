# Shariah-Compliant Ethereum Staking Dashboard

A decentralized application for Shariah-compliant Ethereum staking based on the **ERC-4626 Tokenized Vault Standard**. This project is part of a thesis (Skripsi) focusing on building a transparent, interest-free (Anti-Riba), and purified staking architecture.

## 🌟 Core Pillars & Shariah Mechanisms

### 1. NAV-Based Yield (Anti-Riba)
Unlike traditional staking pools that might use rebasing mechanisms, this vault uses a **Net Asset Value (NAV)** model. Yield is reflected in the appreciation of the `SKRIPSI` share token value relative to the underlying `WETH`. This aligns with the *Wakalah bil Istithmar* principle.

### 2. Shariah Cleansing (Purify Function)
Equipped with a **Purification Mechanism** (Hifzul Mal), allowing the administrator to extract non-compliant yield (e.g., from illicit MEV) and redirect it to verified charity addresses without affecting users' principal deposits.

### 3. ERC-4626 Tokenized Vault
Strictly follows the **OpenZeppelin ERC-4626** standard for high interoperability and security. The contract acts as a transparent vault where 1 Share represents a claim on the underlying ETH/WETH pool.

### 4. Advanced Security
- **Inflation Attack Mitigation**: Implements `_decimalsOffset` (virtual shares) to prevent exchange rate manipulation.
- **Reentrancy Protection**: Uses `ReentrancyGuard` on all state-changing functions.
- **Native ETH Handling**: Custom logic for wrapping/unwrapping ETH to WETH seamlessly.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), Tailwind CSS, Framer Motion.
- **Web3**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [RainbowKit](https://www.rainbowkit.com/).
- **Smart Contracts**: [Solidity 0.8.20](https://soliditylang.org/), [OpenZeppelin V5](https://openzeppelin.com/contracts/).
- **Network**: Ethereum Sepolia Testnet.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- pnpm or npm

### 2. Installation
```bash
pnpm install
```

### 3. Environment Setup
Copy `env.example` to `.env.local` and fill in the required values:
```bash
NEXT_PUBLIC_WC_PROJECT_ID=      # Your WalletConnect Project ID
NEXT_PUBLIC_SKRIPSI_STAKING_ADDRESS=0x36288b3C7BDdfd8987B0BbCfFDDe37aC7b05a8de
NEXT_PUBLIC_WETH_ADDRESS=0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9
```

### 4. Run Development
```bash
pnpm run dev
```

## 📜 Smart Contract Functions

- **`depositETH()`**: Stake native ETH to mint SKRIPSI shares.
- **`redeemETH(shares)`**: Burn SKRIPSI shares to withdraw native ETH.
- **`purify(amount, charity)`**: (Admin only) Extract non-compliant funds for social charity.
- **`getExchangeRate()`**: View the current value of 1 SKRIPSI in ETH.

---

Built as part of a Bachelor's Thesis on Blockchain Finance.
