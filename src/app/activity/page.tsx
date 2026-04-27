"use client";

import React, { useState } from "react";
import Link from "next/link";
import { History, Search, Download, ExternalLink, ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ActivityPage() {
  const { activities, clearActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = activities.filter(
    (a) =>
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button onClick={clearActivity} className="neo-btn bg-red-100 p-2.5 hover:bg-red-200 transition-colors" title="Bersihkan Riwayat">
            <Trash2 size={18} className="text-red-600" />
          </button>
          <button className="neo-btn neo-btn-white p-2.5"><Download size={18} /></button>
        </div>
      </div>

      <div className="neo-card bg-white overflow-hidden min-h-[500px]">
        {/* Search bar */}
        <div className="p-3 border-b-2 border-black bg-[#F8F9FA] flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
            <input
              type="text"
              placeholder="Cari berdasarkan hash transaksi atau tipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input w-full py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        {/* List Aktivitas */}
        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Tipe / Hash</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Waktu</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Jumlah</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-black ${
                          activity.type === "Deposit" ? "bg-[#10b981]/20" : "bg-[#EF4444]/20"
                        }`}>
                          {activity.type === "Deposit" ? <ArrowUpRight size={14} className="text-[#10b981]" /> : <ArrowDownLeft size={14} className="text-[#EF4444]" />}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase italic">{activity.type}</p>
                          <p className="text-[9px] font-bold text-black/40 font-mono mt-0.5">{activity.id.slice(0, 10)}...{activity.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[10px] font-bold text-black/60">
                      {format(activity.timestamp, "d MMM yyyy, HH:mm", { locale: id })}
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black italic">{activity.amount} {activity.unit}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[8px] font-black uppercase px-2 py-1 bg-[#10b981] text-black border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {activity.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${activity.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 neo-btn neo-btn-white p-0 hover:bg-black hover:text-white transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center mb-3 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <History size={28} className="text-black/20" />
            </div>
            <h3 className="text-base font-black uppercase italic mb-1.5">Transaksi Tidak Ditemukan</h3>
            <p className="text-black/50 text-[10px] max-w-xs font-bold leading-relaxed uppercase tracking-tight">
              Seluruh operasi yang Anda lakukan akan muncul di sini setelah konfirmasi jaringan.
            </p>
            <Link href="/" className="neo-btn neo-btn-emerald mt-4 text-[10px] inline-block px-4 py-2">Mulai Stake Sekarang</Link>
          </div>
        )}
      </div>
    </div>
  );
}
