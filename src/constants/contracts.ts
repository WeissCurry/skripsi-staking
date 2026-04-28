/**
 * @dev Alamat Kontrak untuk Jaringan Ethereum Sepolia.
 * Diambil dari environment variables (.env.local).
 */
export const CONTRACT_ADDRESSES = {
  SEPOLIA: {
    SKRIPSI_STAKING: (process.env.NEXT_PUBLIC_SKRIPSI_STAKING_ADDRESS) as `0x${string}`,
    WETH: (process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9") as `0x${string}`,
  }
};

export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia Chain ID
