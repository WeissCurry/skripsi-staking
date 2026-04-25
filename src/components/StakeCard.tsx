"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, ArrowRight, Zap, RefreshCcw, AlertCircle, TrendingUp, Lock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES } from "@/constants/contracts";
import SkripsiPoolABI from "@/abis/SkripsiPool.json";

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
  const [selectedProtocol, setSelectedProtocol] = useState<"solo" | "lido">("solo");

  const { data: navRateRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_POOL as `0x${string}`,
    abi: SkripsiPoolABI,
    functionName: "getExchangeRate",
    query: { enabled: isConnected, refetchInterval: 10000 }
  });

  const NAV_RATE = navRateRaw ? parseFloat(formatEther(navRateRaw as bigint)) : 1.0;
  const POOL_FILLED = 1500;
  const POOL_TOTAL = 2048;

  const ACTIVE_POOLS = [
    { id: "S-02", name: "Alpha Series", apr: "4.2%", remaining: "30 ETH" },
    { id: "S-03", name: "Beta Series", apr: "3.8%", remaining: "256 ETH" },
  ];

  const [selectedPoolId, setSelectedPoolId] = useState(ACTIVE_POOLS[0].id);
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    writeContract({
      address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_POOL as `0x${string}`,
      abi: SkripsiPoolABI,
      functionName: "deposit",
      value: parseEther(amount),
    });
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    writeContract({
      address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_POOL as `0x${string}`,
      abi: SkripsiPoolABI,
      functionName: "withdraw",
      args: [parseEther(amount)],
    });
  };

  const getEstimatedOutput = () => {
    const val = parseFloat(amount) || 0;
    return activeTab === "stake" ? (val / NAV_RATE).toFixed(4) : (val * NAV_RATE).toFixed(4);
  };

  const riskState = useMemo(() => {
    if (selectedProtocol === "lido") {
      return {
        level: "red",
        label: "High Risk: Shariah Violation Detected",
        score: 18,
        isVetoed: true,
        statusText: "TIDAK SYARIAH (HARAM)"
      };
    }
    return {
      level: "green",
      label: "Safe: Shariah Compliant & Low Risk",
      score: 14,
      isVetoed: false,
      statusText: "SYARIAH COMPLIANT"
    };
  }, [selectedProtocol]);

  const isButtonDisabled = !agreed || !amount || parseFloat(amount) <= 0 || riskState.isVetoed || isWritePending || isConfirming || !isConnected;

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => { setAmount(""); }, 0);
      alert("Transaksi Berhasil! Token SKRIPSI Anda akan segera muncul di dompet.");
    }
  }, [isSuccess]);

  return (
    <div className="neo-card bg-white w-full mx-auto overflow-hidden">
      {/* EWS Banner (Hifzul Mal Indicator) */}
      <div className={`px-4 py-3 border-b-2 border-black flex items-center justify-between transition-all duration-500 relative overflow-hidden ${
        riskState.level === "green" ? "bg-[#10b981]" : riskState.level === "yellow" ? "bg-[#FDE047]" : "bg-[#EF4444]"
      }`}>
        {/* Animated pulse for danger state */}
        {riskState.isVetoed && <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-white" />}
        
        <div className="flex items-center gap-3 relative z-10">
          <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center ${
            riskState.isVetoed ? "bg-white" : "bg-black"
          }`}>
            <ShieldCheck size={18} className={riskState.isVetoed ? "text-[#EF4444]" : "text-white"} />
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] block leading-none ${riskState.isVetoed ? "text-white" : "text-black"}`}>
              {riskState.statusText}
            </span>
            <span className={`text-sm font-black italic uppercase leading-none ${riskState.isVetoed ? "text-white" : "text-black"}`}>
              {riskState.label}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 relative z-10">
          <span className={`text-[8px] font-black uppercase ${riskState.isVetoed ? "text-white/60" : "text-black/40"}`}>Pilih Protokol:</span>
          <div className="flex gap-1 p-1 bg-black/20 rounded-lg border border-black/20">
            <button 
              onClick={() => setSelectedProtocol("solo")}
              className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${
                selectedProtocol === "solo" ? "bg-[#10b981] text-black border border-black" : "text-black/40 hover:text-black"
              }`}
            >
              Solo
            </button>
            <button 
              onClick={() => setSelectedProtocol("lido")}
              className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${
                selectedProtocol === "lido" ? "bg-[#EF4444] text-white border border-black" : "text-black/40 hover:text-black"
              }`}
            >
              Lido
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black bg-black">
        <button onClick={() => { setActiveTab("stake"); setAmount(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "stake" ? "bg-[#10b981] text-black" : "text-white hover:text-[#10b981]"
          }`}>
          <Zap size={14} /> Stake (Mint)
        </button>
        <button onClick={() => { setActiveTab("unstake"); setAmount(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "unstake" ? "bg-[#EF4444] text-white" : "text-white hover:text-[#EF4444]"
          }`}>
          <RefreshCcw size={14} /> Unstake (Burn)
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
                    <label className="text-xs font-black uppercase">Jumlah Stake (ETH)</label>
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
                <div className="neo-card p-3 bg-gray-50 border-dashed">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Kurs NAV</span>
                  <div className="text-sm font-black italic">1 LST = {NAV_RATE} ETH</div>
                </div>
                <div className="neo-card p-3 bg-[#10b981]/10 border-[#10b981]/30">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Estimasi LST</span>
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
                  <>{!isConnected ? "Hubungkan Dompet" : riskState.isVetoed ? "AKSES DIBLOKIR (PELANGGARAN SYARIAH)" : "Deposit ETH & Mint LST"} <ArrowRight size={18} /></>
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
                  <label className="text-xs font-black uppercase">Jumlah LST (Burn)</label>
                  <button onClick={() => setAmount("100.00")} className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 hover:bg-[#3B82F6] transition-colors rounded">Max</button>
                </div>
                <div className="relative">
                  <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="neo-input w-full py-4 pr-16 text-2xl font-black placeholder:text-gray-300 border-[#EF4444]" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="text-base font-black text-[#EF4444]">LST</span>
                    <span className="text-[10px] font-bold text-black/40 tracking-tighter">SKRIPSI</span>
                  </div>
                </div>
              </div>

              {/* NAV Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="neo-card p-3 bg-gray-50">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Kurs</span>
                  <div className="text-sm font-black italic">1 LST = {NAV_RATE} ETH</div>
                </div>
                <div className="neo-card p-3 bg-[#EF4444]/10">
                  <span className="text-[10px] font-black uppercase text-black/40 block mb-1">Estimasi ETH</span>
                  <div className="text-lg font-black text-[#EF4444]">{getEstimatedOutput()}</div>
                </div>
              </div>

              <div className="neo-card p-3 bg-[#EF4444]/5 flex items-center gap-3 border-dashed">
                <Lock size={16} className="text-black/40 shrink-0" />
                <p className="text-[10px] font-bold text-black/60 uppercase leading-tight">Pokok + Imbal Hasil dikirimkan otomatis setelah antrian.</p>
              </div>

              <button onClick={handleUnstake} disabled={!amount || parseFloat(amount) <= 0 || isWritePending || isConfirming || !isConnected}
                className={`neo-btn w-full py-4 text-sm flex items-center justify-center gap-3 ${
                  !amount || parseFloat(amount) <= 0 || isWritePending || isConfirming || !isConnected ? "bg-gray-100 text-black/20 cursor-not-allowed border-black/10 shadow-none opacity-50" : "neo-btn-red"
                }`}>
                {isWritePending || isConfirming ? (
                  <>Memproses... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>{!isConnected ? "Hubungkan Dompet" : "Burn LST & Withdraw ETH"} <TrendingUp size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
