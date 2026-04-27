"use client";

import React from "react";
import { 
  ShieldCheck, 
  Gem,
  Activity,
  Layers,
  Calendar,
  Users,
  Filter,
  ChevronDown,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import StakeCard from "@/components/StakeCard";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { CONTRACT_ADDRESSES } from "@/constants/contracts";
import SkripsiStakingABI from "@/abis/SkripsiStaking.json";

const POOLS: PoolRowProps[] = [
  { id: "S-02", status: "Active", duration: "180 Hari", filled: 482, total: 512, apr: "4.2", color: "bg-[#10b981]" },
  { id: "S-03", status: "Upcoming", duration: "90 Hari", filled: 0, total: 256, apr: "3.8", color: "bg-[#FDE047]", date: "Buka: 12 Mei" },
  { id: "S-04", status: "Upcoming", duration: "365 Hari", filled: 0, total: 1024, apr: "5.1", color: "bg-[#FDE047]", date: "Buka: 28 Mei" },
  { id: "S-01", status: "Finished", duration: "30 Hari", filled: 128, total: 128, apr: "3.5", color: "bg-gray-400" },
];

export default function Dashboard() {
  const [filter, setFilter] = React.useState<"All" | "Active" | "Upcoming" | "Finished">("All");
  const [sortBy, setSortBy] = React.useState<"ID" | "APR">("ID");

  // Membaca total ETH di dalam pool secara real-time
  const { data: totalAssets } = useReadContract({
    address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
    abi: SkripsiStakingABI,
    functionName: "totalAssets",
    query: { refetchInterval: 10000 }
  });

  const formattedTotal = totalAssets ? parseFloat(formatEther(totalAssets as bigint)).toLocaleString('id-ID', { minimumFractionDigits: 2 }) : "0,00";

  // Membaca kurs NAV terbaru
  const { data: navRateRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.SEPOLIA.SKRIPSI_STAKING as `0x${string}`,
    abi: SkripsiStakingABI,
    functionName: "getExchangeRate",
    query: { refetchInterval: 10000 }
  });

  const navRate = navRateRaw ? parseFloat(formatEther(navRateRaw as bigint)) : 1.0;

  // Mock data untuk historis (Data real-time disisipkan di titik terakhir)
  const chartData = [
    { name: "Apr 22", staked: 800, nav: 1.000 },
    { name: "Apr 23", staked: 950, nav: 1.005 },
    { name: "Apr 24", staked: 1100, nav: 1.008 },
    { name: "Apr 25", staked: 1150, nav: 1.012 },
    { name: "Apr 26", staked: 1200, nav: 1.015 },
    { name: "Hari Ini", staked: totalAssets ? parseFloat(formatEther(totalAssets as bigint)) : 1245, nav: navRate },
  ];

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
        <StatCard label="Total ETH Di-stake" val={formattedTotal} sub="+2,4% vs bulan lalu" icon={<Gem size={15} />} color="bg-[#10b981]" />
        <StatCard label="Imbal Hasil LST" val={`${((navRate - 1) * 100).toFixed(2)}%`} sub="Kenaikan Nilai NAV" icon={<Activity size={15} />} color="bg-[#3B82F6]" />
        <StatCard label="Validator Aman" val="32 Unit" sub="100% Syariah" icon={<ShieldCheck size={15} />} color="bg-[#FDE047]" />
        <StatCard label="Kurs LST/ETH" val={navRate.toFixed(4)} sub="1 Share dalam ETH" icon={<TrendingUp size={15} />} color="bg-[#A855F7]" />
      </section>

      {/* Performance & Client Diversity Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Performance Chart */}
        <div className="lg:col-span-8">
           <div className="neo-card p-4 bg-white h-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center rounded-md">
                       <BarChart3 size={18} className="text-[#10b981]" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black uppercase italic leading-none">Staking Performance</h3>
                       <p className="text-[9px] font-bold text-black/40 uppercase mt-1">Akumulasi Deposit & Pertumbuhan NAV</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                       <div className="w-2 h-2 bg-[#10b981] rounded-full" />
                       <span className="text-[9px] font-black uppercase">ETH Staked</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <div className="w-2 h-2 bg-[#3B82F6] rounded-full" />
                       <span className="text-[9px] font-black uppercase">NAV Price</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 w-full mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorStaked" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                       <XAxis dataKey="name" fontSize={10} fontStyle="italic" fontWeight="bold" axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                       <YAxis yAxisId="right" orientation="right" domain={['dataMin - 0.01', 'dataMax + 0.01']} fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}
                       />
                       <Area yAxisId="left" type="monotone" dataKey="staked" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStaked)" />
                       <Line yAxisId="right" type="monotone" dataKey="nav" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: 'black' }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Client Diversity (Nakamoto) */}
        <div className="lg:col-span-4">
          <div className="neo-card p-4 bg-white h-[320px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#A855F7] border-2 border-black flex items-center justify-center rounded-md">
                  <Layers size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase italic leading-none">Client Diversity</h3>
                  <p className="text-[9px] font-bold text-black/40 uppercase mt-1">Hifzul Mal Indicator</p>
                </div>
              </div>
              <div className="neo-badge bg-black text-white text-[9px]">Skor: Tinggi</div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase">
                    <span>Geth (Execution)</span>
                    <span className="text-[#EF4444]">60%</span>
                 </div>
                 <div className="h-3 w-full bg-gray-100 border-2 border-black rounded-sm overflow-hidden">
                    <div className="h-full bg-[#EF4444]" style={{ width: '60%' }} />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase">
                    <span>Teku (Consensus)</span>
                    <span>25%</span>
                 </div>
                 <div className="h-3 w-full bg-gray-100 border-2 border-black rounded-sm overflow-hidden">
                    <div className="h-full bg-[#10b981]" style={{ width: '25%' }} />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase">
                    <span>Prysm (Consensus)</span>
                    <span>15%</span>
                 </div>
                 <div className="h-3 w-full bg-gray-100 border-2 border-black rounded-sm overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: '15%' }} />
                 </div>
              </div>
              <p className="text-[9px] font-bold text-black/60 italic mt-4 leading-tight">
                *Peringatan: Dominasi Geth &gt; 66% berisiko tinggi terhadap finalitas jaringan.
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
