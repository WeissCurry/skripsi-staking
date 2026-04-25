"use client";

import React from "react";
import { 
  ShieldCheck, 
  Gem,
  Activity,
  ExternalLink,
  Layers,
  Calendar,
  Users,
  Filter,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StakeCard from "@/components/StakeCard";

const POOLS: PoolRowProps[] = [
  { id: "S-02", status: "Active", duration: "180 Hari", filled: 482, total: 512, apr: "4.2", color: "bg-[#10b981]" },
  { id: "S-03", status: "Upcoming", duration: "90 Hari", filled: 0, total: 256, apr: "3.8", color: "bg-[#FDE047]", date: "Buka: 12 Mei" },
  { id: "S-04", status: "Upcoming", duration: "365 Hari", filled: 0, total: 1024, apr: "5.1", color: "bg-[#FDE047]", date: "Buka: 28 Mei" },
  { id: "S-01", status: "Finished", duration: "30 Hari", filled: 128, total: 128, apr: "3.5", color: "bg-gray-400" },
];

export default function Dashboard() {
  const [filter, setFilter] = React.useState<"All" | "Active" | "Upcoming" | "Finished">("All");
  const [sortBy, setSortBy] = React.useState<"ID" | "APR">("ID");

  const filteredPools = React.useMemo(() => {
    const result = filter === "All" ? [...POOLS] : POOLS.filter(p => p.status === filter);
    if (sortBy === "APR") {
      result.sort((a, b) => parseFloat(b.apr) - parseFloat(a.apr));
    }
    return result;
  }, [filter, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Summary Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total ETH Di-stake" val="1.245,82" sub="+2,4% vs bulan lalu" icon={<Gem size={15} />} color="bg-[#10b981]" />
        <StatCard label="Imbal Hasil LST" val="3,82% APR" sub="Suku bunga variabel" icon={<Activity size={15} />} color="bg-[#3B82F6]" />
        <StatCard label="Validator Aman" val="32 Unit" sub="100% Syariah" icon={<ShieldCheck size={15} />} color="bg-[#FDE047]" />
        <StatCard label="Posisi Pasar" val="$2,98M" sub="$2.400,00 / ETH" icon={<ExternalLink size={15} />} color="bg-[#A855F7]" />
      </section>

      {/* Diversity & Health Row (NEW: Nakamoto Coefficient) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <div className="neo-card p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#A855F7] border-2 border-black flex items-center justify-center rounded-md">
                  <Layers size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase italic leading-none">Nakamoto Coefficient (Client Diversity)</h3>
                  <p className="text-[10px] font-bold text-black/40 uppercase mt-1">Distribusi Konsensus Beacon Chain</p>
                </div>
              </div>
              <div className="neo-badge bg-black text-white text-[9px]">Skor Keragaman: Tinggi</div>
            </div>
            
            <div className="space-y-3">
              <div className="h-8 w-full border-2 border-black rounded-md overflow-hidden flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="h-full bg-[#3B82F6] border-r-2 border-black flex items-center justify-center text-[10px] font-black text-white" style={{ width: '60%' }}>GETH 60%</div>
                <div className="h-full bg-[#10b981] border-r-2 border-black flex items-center justify-center text-[10px] font-black text-black" style={{ width: '20%' }}>TEKU 20%</div>
                <div className="h-full bg-[#FDE047] flex items-center justify-center text-[10px] font-black text-black" style={{ width: '20%' }}>BESU 20%</div>
              </div>
              <p className="text-[9px] font-bold text-black/60 italic">
                *Diversitas klien krusial untuk mencegah slashing massal dan menjaga integritas Hifzul Mal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Dashboard Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Section 1: Execution Card */}
        <div className="xl:col-span-5">
           <StakeCard />
        </div>

        {/* Section 2: Staking Pools */}
        <div className="xl:col-span-7">
          <div className="neo-card p-4 bg-white h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b-2 border-black border-dashed gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B82F6] border-2 border-black flex items-center justify-center rounded-lg">
                     <Layers size={22} className="text-white" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase italic leading-none">Pool Staking</h3>
                     <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest mt-1">Daftar Seri Delegasi Aktif & Mendatang</p>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="neo-btn neo-btn-white py-1.5 px-3 text-[10px] flex items-center gap-2">
                      <Filter size={12} /> {filter === "All" ? "Semua Status" : filter} <ChevronDown size={12} />
                    </button>
                    <div className="absolute top-full right-0 w-32 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                      {(["All", "Active", "Upcoming", "Finished"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 border-b border-black/10 last:border-0">{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="neo-btn neo-btn-white py-1.5 px-3 text-[10px] flex items-center gap-2">
                      Sort: {sortBy} <ChevronDown size={12} />
                    </button>
                    <div className="absolute top-full right-0 w-32 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                      {(["ID", "APR"] as const).map(s => (
                        <button key={s} onClick={() => setSortBy(s)} className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 border-b border-black/10 last:border-0">{s}</button>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
               <AnimatePresence mode="popLayout">
                 {filteredPools.map((pool) => (
                    <motion.div key={pool.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                      <PoolRow {...pool} />
                    </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, val, sub, icon, color }: { label: string; val: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`neo-card p-3 bg-white neo-card-hover group cursor-default relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-8 h-8 ${color} border-l-2 border-b-2 border-black flex items-center justify-center rounded-bl-[10px]`}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {React.cloneElement(icon as React.ReactElement, { size: 18, className: "text-black" } as any)}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 leading-none">{label}</h3>
        <div className="text-xl font-black italic tracking-tighter leading-none my-1">{val}</div>
        <p className="text-[10px] font-bold text-black/60 italic leading-none">{sub}</p>
      </div>
    </div>
  );
}
interface PoolRowProps {
  id: string;
  status: "Active" | "Upcoming" | "Finished";
  duration: string;
  filled: number;
  total: number;
  apr: string;
  color: string;
  date?: string;
}

function PoolRow({ id, status, duration, filled, total, apr, color, date }: PoolRowProps) {
  const percent = (filled / total) * 100;
  
  return (
    <div className="neo-card p-3 bg-white hover:bg-gray-50 transition-colors border-2 border-black/10 hover:border-black">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase italic">
            {id}
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs font-black uppercase tracking-tight">{duration} Duration</span>
             <span className="text-[10px] font-bold text-[#10b981]">{apr}% APR</span>
          </div>
        </div>
        <div className={`neo-badge text-[8px] ${
          status === "Active" ? "bg-[#10b981] text-black" : 
          status === "Upcoming" ? "bg-[#FDE047] text-black" : "bg-gray-200 text-black/40"
        }`}>
          {status}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="h-2 bg-gray-100 border border-black overflow-hidden rounded-sm">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full ${color}`} />
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase text-black/50">
            <div className="flex items-center gap-1">
               <Users size={10} />
               <span>{filled} / {total} ETH</span>
            </div>
            <span>{percent.toFixed(1)}% Terisi</span>
          </div>
        </div>
        
        {date && (
           <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 text-[9px] font-black text-[#3B82F6] uppercase italic">
                 <Calendar size={10} />
                 {date}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
