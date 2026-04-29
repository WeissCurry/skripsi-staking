"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Zap, RefreshCcw, AlertCircle, TrendingUp, Lock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES } from "@/constants/contracts";
import SkripsiStakingABI from "@/abis/SkripsiStaking.json";
import { useActivity } from "@/hooks/useActivity";

type Tab = "stake" | "unstake";

export default function StakeCard() {
  const { isConnected, address } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    query: { enabled: isConnected }
  });

  const [activeTab, setActiveTab] = useState<Tab>("stake");
  const [amount, setAmount] = useState<string>("");
  const [agreed, setAgreed] = useState(false);

  // Membaca saldo Shares (SKRIPSI) milik user
  const { data: sharesBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
    abi: SkripsiStakingABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: isConnected && !!address, refetchInterval: 5000 }
  });

  // Hook untuk Transaksi
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Hook untuk Membaca NAV Rate
  const { data: navRateRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
    abi: SkripsiStakingABI,
    functionName: "getExchangeRate",
    query: { enabled: isConnected, refetchInterval: 10000 }
  });

  // Kompensasi untuk _decimalsOffset = 3 di Smart Contract
  // Agar secara visual 1 ETH = 1 SKRIPSI di awal
  const OFFSET_MULTIPLIER = 1000; 
  const NAV_RATE = navRateRaw ? parseFloat(formatEther(navRateRaw as bigint)) * OFFSET_MULTIPLIER : 1.0;
  
  const POOL_FILLED = 1500;
  const POOL_TOTAL = 2048;

  const ACTIVE_POOLS = [
    { id: "S-02", name: "Alpha Series", apr: "4.2%", remaining: "30 ETH" },
    { id: "S-03", name: "Beta Series", apr: "3.8%", remaining: "256 ETH" },
  ];

  const [selectedPoolId, setSelectedPoolId] = useState(ACTIVE_POOLS[0].id);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    writeContract({
      address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
      abi: SkripsiStakingABI,
      functionName: "depositETH",
      value: parseEther(amount),
    });
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    writeContract({
      address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
      abi: SkripsiStakingABI,
      functionName: "redeemETH",
      args: [parseEther((parseFloat(amount) * OFFSET_MULTIPLIER).toString())],
    });
  };

  const getEstimatedOutput = () => {
    const val = parseFloat(amount) || 0;
    // Jika stake: ETH / NAV_RATE. Jika unstake: SKRIPSI * NAV_RATE
    // Karena kita sudah mengalikan NAV_RATE dengan 1000, maka pembagian/perkalian ini akan menghasilkan angka 1:1
    return activeTab === "stake" ? (val / NAV_RATE).toFixed(4) : (val * NAV_RATE).toFixed(4);
  };

  const isButtonDisabled = !agreed || !amount || parseFloat(amount) <= 0 || isWritePending || isConfirming || !isConnected;

  const { addActivity } = useActivity();

  useEffect(() => {
    if (isSuccess && hash) {
      addActivity({
        id: hash,
        type: activeTab === "stake" ? "Deposit" : "Redeem",
        amount: amount,
        unit: activeTab === "stake" ? "ETH" : "SKRIPSI",
        timestamp: Date.now(),
        status: "success",
      });
      
      // Menggunakan setTimeout untuk menghindari cascading renders (lint error)
      setTimeout(() => {
        setAmount("");
      }, 0);
      
      alert("Transaksi Berhasil! Token SKRIPSI Anda akan segera muncul di dompet.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash]); // Cukup bergantung pada status sukses dan hash transaksi

  return (
    <div className="neo-card bg-white w-full mx-auto overflow-hidden">
      {/* Header Info (Hifzul Mal context) */}
      <div className="px-4 py-4 border-b-2 border-black bg-black text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-[#10b981] border-2 border-white flex items-center justify-center rounded-full shrink-0">
          <ShieldCheck size={24} className="text-black" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase italic leading-none">Proposed Shariah Staking</h3>
          <p className="text-[10px] font-bold text-white/60 uppercase mt-1 tracking-widest">ERC-4626 Tokenized Vault / NAV Model</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black bg-black">
        <button onClick={() => { setActiveTab("stake"); setAmount(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "stake" ? "bg-[#10b981] text-black" : "text-white hover:text-[#10b981]"
          }`}>
          <Zap size={14} /> Deposit
        </button>
        <button onClick={() => { setActiveTab("unstake"); setAmount(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "unstake" ? "bg-[#EF4444] text-white" : "text-white hover:text-[#EF4444]"
          }`}>
          <RefreshCcw size={14} /> Redeem
        </button>
      </div>

      <div className="p-4 min-h-[520px]">
        <AnimatePresence mode="wait">
          {activeTab === "stake" ? (
            <motion.div key="stake" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Pool Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Pilih Seri Delegasi</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVE_POOLS.map((pool) => (
                    <button key={pool.id} onClick={() => setSelectedPoolId(pool.id)}
                      className={`neo-card p-2 text-left transition-all ${
                        selectedPoolId === pool.id ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                      }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black italic">{pool.id}</span>
                        <span className="text-[8px] font-black bg-[#10b981] text-black px-1 rounded">{pool.apr}</span>
                      </div>
                      <div className="text-[9px] font-bold opacity-60 uppercase truncate">{pool.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pool Quota */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Kapasitas Seri {selectedPoolId}</span>
                  <span className="text-[10px] font-black">{POOL_FILLED} / {POOL_TOTAL} ETH</span>
                </div>
                <div className="h-4 bg-gray-100 border-2 border-black overflow-hidden relative rounded-md">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(POOL_FILLED / POOL_TOTAL) * 100}%` }}
                    className="h-full bg-[#10b981] border-r-2 border-black" />
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <label className="text-xs font-black uppercase">Jumlah Deposit (ETH)</label>
                    {isConnected && balanceData && (
                      <span className="text-[9px] font-bold text-black/40 uppercase">Saldo: {parseFloat(balanceData.formatted).toFixed(4)} ETH</span>
                    )}
                  </div>
                  <button onClick={() => setAmount(balanceData?.formatted || "0.00")} className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 hover:bg-[#3B82F6] transition-colors rounded">Max</button>
                </div>
                <div className="relative">
                  <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="neo-input w-full py-4 pr-16 text-2xl font-black placeholder:text-gray-300" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="text-base font-black text-[#10b981]">ETH</span>
                    <span className="text-[10px] font-bold text-black/40 tracking-tighter">SEPOLIA</span>
                  </div>
                </div>
              </div>

              {/* NAV Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="neo-card p-3 bg-gray-50 border-dashed border-black/20">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Kurs Saat Ini (NAV)</span>
                  <div className="text-sm font-black italic flex items-center gap-1">
                    1 SKRIPSI = <span className="text-[#10b981]">{NAV_RATE.toFixed(4)}</span> ETH
                  </div>
                </div>
                <div className="neo-card p-3 bg-[#10b981]/10 border-[#10b981]/30">
                  <span className="text-[10px] font-black uppercase text-[#10b981]/60 block mb-1">Estimasi SKRIPSI</span>
                  <div className="text-lg font-black text-[#10b981]">{getEstimatedOutput()}</div>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex gap-3 p-3 neo-card bg-gray-50 items-center cursor-pointer group" onClick={() => setAgreed(!agreed)}>
                <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-all rounded-md ${agreed ? "bg-[#10b981]" : "bg-white group-hover:bg-gray-100"}`}>
                  {agreed && <ShieldCheck size={12} className="text-black" />}
                </div>
                <p className="text-[10px] font-bold leading-tight text-black/60 uppercase tracking-tight">
                  Saya setuju dengan <a href="/terms" target="_blank" className="text-black underline font-black hover:text-[#10b981]">Syarat & Ketentuan Wakalah bil Istithmar</a>.
                </p>
              </div>

              {/* Submit */}
              <button onClick={handleStake} disabled={isButtonDisabled}
                className={`neo-btn w-full py-4 text-sm flex items-center justify-center gap-3 transition-all ${
                  isButtonDisabled ? "bg-gray-100 text-black/20 cursor-not-allowed border-black/10 shadow-none opacity-50" : "neo-btn-emerald"
                }`}>
                {isWritePending || isConfirming ? (
                  <>Menunggu... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>{!isConnected ? "Hubungkan Dompet" : "Deposit ETH to Mint Shares"} <ArrowRight size={18} /></>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div key="unstake" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Warning */}
              <div className="neo-card p-3 bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] flex gap-3 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight">
                  <span className="font-black uppercase block mb-0.5">Peringatan Penarikan</span>
                  Estimasi waktu tunggu: <span className="font-black italic">2-5 hari kerja</span> (antrean Beacon Chain).
                </p>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <label className="text-xs font-black uppercase">Jumlah Redeem (SKRIPSI)</label>
                    {isConnected && sharesBalance !== undefined && (
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${
                        parseFloat(amount) > parseFloat(formatEther(sharesBalance as bigint)) ? "text-red-500 animate-pulse" : "text-[#EF4444]/60"
                      }`}>
                        Saldo Token: {(parseFloat(formatEther(sharesBalance as bigint)) / OFFSET_MULTIPLIER).toFixed(4)} SKRIPSI
                        {parseFloat(amount) > parseFloat(formatEther(sharesBalance as bigint)) && " (Saldo Tidak Cukup)"}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setAmount((parseFloat(formatEther((sharesBalance as bigint) || BigInt(0))) / OFFSET_MULTIPLIER).toString())} 
                    className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 hover:bg-[#3B82F6] transition-colors rounded"
                  >
                    MAX
                  </button>
                </div>
                <div className="relative">
                  <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="neo-input w-full py-4 pr-16 text-2xl font-black placeholder:text-gray-300 border-[#EF4444]" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="text-base font-black text-[#EF4444]">SKRIPSI</span>
                  </div>
                </div>
              </div>

              {/* NAV Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="neo-card p-3 bg-gray-50 border-dashed border-black/20">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Kurs Saat Ini (NAV)</span>
                  <div className="text-sm font-black italic flex items-center gap-1">
                    1 SKRIPSI = <span className="text-[#EF4444]">{NAV_RATE.toFixed(4)}</span> ETH
                  </div>
                </div>
                <div className="neo-card p-3 bg-[#EF4444]/10 border-[#EF4444]/30">
                  <span className="text-[10px] font-black uppercase text-[#EF4444]/60 block mb-1">Estimasi ETH</span>
                  <div className="text-lg font-black text-[#EF4444]">{getEstimatedOutput()}</div>
                </div>
              </div>

              <div className="neo-card p-3 bg-[#EF4444]/5 flex items-center gap-3 border-dashed">
                <Lock size={16} className="text-black/40 shrink-0" />
                <p className="text-[10px] font-bold text-black/60 uppercase leading-tight">Pokok + Imbal Hasil dikirimkan otomatis setelah antrian.</p>
              </div>

              {/* Checkbox Persetujuan untuk Redeem */}
              <div className="flex gap-3 p-3 neo-card bg-gray-50 items-center cursor-pointer group" onClick={() => setAgreed(!agreed)}>
                <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-all rounded-md ${agreed ? "bg-[#EF4444]" : "bg-white group-hover:bg-gray-100"}`}>
                  {agreed && <ShieldCheck size={12} className="text-white" />}
                </div>
                <p className="text-[10px] font-bold leading-tight text-black/60 uppercase tracking-tight">
                  Saya mengerti bahwa penarikan SKRIPSI memerlukan waktu proses sesuai antrean Beacon Chain.
                </p>
              </div>

              <button onClick={handleUnstake} 
                disabled={isButtonDisabled || (activeTab === "unstake" && parseFloat(amount) > parseFloat(formatEther(sharesBalance as bigint || BigInt(0))))}
                className={`neo-btn w-full py-4 text-sm flex items-center justify-center gap-3 ${
                  isButtonDisabled || (activeTab === "unstake" && parseFloat(amount) > parseFloat(formatEther(sharesBalance as bigint || BigInt(0))))
                    ? "bg-gray-100 text-black/20 cursor-not-allowed border-black/10 shadow-none opacity-50" 
                    : "neo-btn-red"
                }`}>
                {isWritePending || isConfirming ? (
                  <>Memproses... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>{!isConnected ? "Hubungkan Dompet" : "Redeem SKRIPSI to Withdraw ETH"} <TrendingUp size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
