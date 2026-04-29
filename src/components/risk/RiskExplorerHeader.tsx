"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterMode: "all" | "shariah" | "audited";
  setFilterMode: (mode: "all" | "shariah" | "audited") => void;
  isUpdating: boolean;
  handleUpdate: () => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function RiskExplorerHeader({
  searchQuery,
  setSearchQuery,
  filterMode,
  setFilterMode,
  isUpdating,
  lastUpdate,
  handleUpdate,
  currentPage,
  totalPages,
  setCurrentPage
}: Props & { lastUpdate: string }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterLabels = {
    all: "Semua Protokol",
    audited: "Ter-Audit Saja",
    shariah: "Lulus Syariah"
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white neo-card p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative flex-1 w-full md:w-96">
          <input 
            type="text" 
            placeholder="Cari Protokol Staking..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="neo-input py-2.5 pl-10 pr-4 text-xs w-full font-bold bg-[#F8F9FA]" 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
        </div>
        <div className="flex items-center gap-3">
           {/* PAGINATION ATAS - MATCH ACTIVITY PAGE */}
           {totalPages > 1 && (
             <div className="flex items-center gap-2 mr-2 border-r-2 border-black/10 pr-3">
                <div className="text-[9px] font-black uppercase text-black/40 mr-1 hidden lg:block">
                  Hal. {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="neo-btn neo-btn-white p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (totalPages > 5) {
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="neo-btn neo-btn-white p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
             </div>
           )}

           <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="neo-btn neo-btn-white py-2 px-4 text-[11px] font-black uppercase flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Filter size={14} className={filterMode !== "all" ? "text-[#3B82F6]" : "text-black"} />
                {filterLabels[filterMode]}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
                  >
                    {( [
                      { id: "all", label: "Semua Protokol", icon: <LayoutGrid size={12} className="text-gray-400" /> },
                      { id: "audited", label: "Ter-Audit Saja", icon: <ShieldCheck size={12} className="text-[#3B82F6]" /> },
                      { id: "shariah", label: "Lulus Syariah", icon: <CheckCircle2 size={12} className="text-[#10b981]" /> }
                    ] as const).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFilterMode(opt.id as "all" | "shariah" | "audited");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase transition-colors hover:bg-black hover:text-white ${
                          filterMode === opt.id ? "bg-gray-100" : ""
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                        {filterMode === opt.id && <div className="ml-auto w-1.5 h-1.5 bg-current rounded-full" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
           
           <div className="flex flex-col items-end gap-0.5">
             <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              title="Update Audit Database"
              className="neo-btn neo-btn-white p-1.5"
             >   
               <RefreshCcw size={12} className={isUpdating ? "animate-spin-reverse" : ""} />
             </button>
             <span className="text-[8px] font-black text-black/30 uppercase tracking-tighter">
               {lastUpdate}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}
