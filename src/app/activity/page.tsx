"use client";

import React from "react";
import { History, Search, Filter, Download } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3B82F6] border-2 border-black flex items-center justify-center rounded-lg shrink-0">
            <History size={20} className="text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">Aktivitas Transaksi</h2>
            <p className="text-xs text-black/60 font-bold uppercase tracking-widest mt-0.5">Riwayat seluruh operasional staking</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="neo-btn neo-btn-white p-2.5"><Filter size={18} /></button>
          <button className="neo-btn neo-btn-white p-2.5"><Download size={18} /></button>
        </div>
      </div>

      <div className="neo-card bg-white overflow-hidden">
        {/* Search bar */}
        <div className="p-3 border-b-2 border-black bg-[#F8F9FA] flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
            <input
              type="text"
              placeholder="Cari berdasarkan hash transaksi atau tipe..."
              className="neo-input w-full py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        {/* Empty state */}
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center mb-3 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <History size={28} className="text-black/20" />
          </div>
          <h3 className="text-base font-black uppercase italic mb-1.5">Transaksi Tidak Ditemukan</h3>
          <p className="text-black/50 text-[10px] max-w-xs font-bold leading-relaxed uppercase tracking-tight">
            Seluruh operasi yang Anda lakukan akan muncul di sini setelah konfirmasi jaringan.
          </p>
          <button className="neo-btn neo-btn-emerald mt-3 text-[10px]">Mulai Stake Sekarang</button>
        </div>
      </div>
    </div>
  );
}
