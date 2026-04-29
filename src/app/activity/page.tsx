"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { History, Search, Download, ExternalLink, ArrowUpRight, ArrowDownLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const ITEMS_PER_PAGE = 8;

export default function ActivityPage() {
  const { activities, clearActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActivities = useMemo(() => {
    return activities.filter(
      (a) =>
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

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
            <p className="text-xs text-black/60 font-bold uppercase tracking-widest mt-0.5">Riwayat operasional staking</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => confirm("Bersihkan riwayat?") && clearActivity()} 
            className="neo-btn bg-red-100 p-2.5 hover:bg-red-200 transition-colors"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
          <button className="neo-btn neo-btn-white p-2.5"><Download size={18} /></button>
        </div>
      </div>

      <div className="neo-card bg-white overflow-hidden min-h-[500px] flex flex-col">
        {/* Search bar & Pagination ATAS */}
        <div className="p-3 border-b-2 border-black bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="neo-input w-full py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-wider"
            />
          </div>
          
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>


        {/* List Aktivitas */}
        <div className="flex-1 overflow-x-auto">
          {paginatedActivities.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Tipe / Hash</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Waktu</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40">Jumlah</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40 text-center">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black/40 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedActivities.map((activity, index) => (
                  <tr key={`${activity.id}-${index}`} className="hover:bg-gray-50 transition-colors">
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
                    <td className="p-4 text-center">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        activity.status.toLowerCase() === "success" ? "bg-[#10b981] text-black" :
                        activity.status.toLowerCase() === "pending" ? "bg-[#FDE047] text-black" :
                        activity.status.toLowerCase() === "failed" || activity.status.toLowerCase() === "fail" ? "bg-[#EF4444] text-white" :
                        "bg-[#10b981] text-black"
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${activity.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 neo-btn neo-btn-white p-0 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <History size={48} className="text-black/10 mb-4" />
              <h3 className="text-base font-black uppercase italic mb-1.5">Tidak Ada Data</h3>
              <p className="text-black/50 text-[10px] font-bold uppercase tracking-tight">Mulai staking untuk melihat riwayat.</p>
              <Link href="/" className="neo-btn neo-btn-emerald mt-4 text-[10px] inline-block px-4 py-2">Stake Sekarang</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function PaginationControls({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: { 
  currentPage: number; 
  totalPages: number; 
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] font-black uppercase text-black/40 mr-2 hidden sm:block">
        Halaman {currentPage} / {totalPages}
      </div>
      <button 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="neo-btn neo-btn-white p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={14} />
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          if (totalPages > 7) {
            if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
              if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-0.5 text-black/20 font-black">.</span>;
              return null;
            }
          }
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-6 h-6 text-[9px] font-black border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                currentPage === pageNum ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="neo-btn neo-btn-white p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
