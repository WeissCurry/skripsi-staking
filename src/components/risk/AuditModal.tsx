"use client";

import React from "react";
import Image from "next/image";
import { X, ShieldAlert, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Protocol } from "@/data/riskProtocols";

interface Props {
  current: Protocol & {
    totalScore: number;
    isVetoed: boolean;
    riskGrade: string;
    gradeLabel: string;
    colorClass: string;
    zone: string;
    radarData: { subject: string; A: number; fullMark: number }[];
    pillars: {
      id: string;
      title: string;
      color: string;
      metrics: {
        label: string;
        description: string;
        score: number;
        maxScore: number;
        icon: React.ReactNode;
      }[];
    }[];
  };
  setSelectedId: (id: string | null) => void;
  lastUpdate: string;
}

export default function AuditModal({ current, setSelectedId, lastUpdate }: Props) {
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="neo-card bg-[#F5F5F5] w-full max-w-5xl relative z-10 flex flex-col border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-h-[98vh]">
        <div className="p-3 border-b-[3px] border-black flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Image src={current.iconPath} alt={current.name} width={28} height={28} className="object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none">{current.name}</h3>
              <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-0.5 italic">ISO 31000:2018 Framework</p>
            </div>
          </div>
          <button onClick={() => setSelectedId(null)} className="neo-btn neo-btn-white p-1.5 border-2 border-black hover:bg-[#EF4444] hover:text-white rounded-lg"> <X size={20} /> </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 hide-scrollbar">
          {current.isVetoed && (
            <div className="bg-[#EF4444] text-white p-2.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
              <ShieldAlert size={30} className="animate-pulse shrink-0" />
              <div>
                <h4 className="text-base font-black uppercase italic leading-none mb-1 underline decoration-2">Veto Syariah Aktif</h4>
                <p className="text-[9px] font-black uppercase opacity-90 leading-tight">Melanggar kriteria absolut syariah. Investasi dilarang.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className={`neo-card p-6 flex flex-col items-center justify-center text-center ${current.colorClass} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                 <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Risk Score</span>
                 <div className="text-6xl font-black italic tracking-tighter leading-none mb-2">{current.totalScore}<span className="text-xl opacity-30">/22</span></div>
                 <div className="bg-black text-white px-4 py-1.5 rounded-lg font-black uppercase italic text-sm"> {current.gradeLabel} </div>
              </div>

              <div className="neo-card bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <h4 className="text-[9px] font-black uppercase italic mb-4 border-b-2 border-black pb-1 text-center">Radar Analysis</h4>
                 <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={current.radarData}>
                        <PolarGrid stroke="#000" strokeWidth={1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 900, fill: '#000' }} />
                        <Radar name="Risk" dataKey="A" stroke="#000" strokeWidth={3} fill={current.zone === 'veto' ? '#EF4444' : current.zone === 'yellow' ? '#FDE047' : '#10b981'} fillOpacity={0.7} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 w-full px-2">
                    {['Compliance', 'Operational', 'Technological', 'Financial'].map((label, idx) => (
                      <div key={label} className="flex items-center justify-between border-b border-black/5 pb-0.5">
                         <span className="text-xs font-black italic">{String.fromCharCode(65 + idx)}</span>
                         <span className="text-[8px] font-bold uppercase text-black/40">{label}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
               {current.pillars.map((pillar, pIdx) => (
                 <div key={pIdx} className="neo-card bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
                    <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                       <div className={`w-5 h-5 rounded-md ${pillar.color} border border-black flex items-center justify-center text-[10px] font-black italic`}>{pillar.id}</div>
                       <h4 className="text-[10px] font-black uppercase italic">{pillar.title}</h4>
                    </div>
                    <div className="space-y-4">
                       {pillar.metrics.map((m, mIdx) => (
                         <div key={mIdx}>
                            <div className="flex justify-between items-end mb-1">
                               <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-black text-white rounded-md border border-black">{m.icon}</div>
                                  <div><div className="text-[9px] font-black uppercase leading-none">{m.label}</div><div className="text-[7px] font-bold text-black/40 uppercase italic">{m.description}</div></div>
                               </div>
                               <div className="text-sm font-black italic">{m.score}<span className="text-[9px] opacity-30">/{m.maxScore}</span></div>
                            </div>
                            <div className="flex gap-1 h-4">
                               {Array.from({ length: m.maxScore }).map((_, bIdx) => {
                                  const blockNum = bIdx + 1;
                                  let bColor = blockNum <= m.score ? (m.score === m.maxScore ? "bg-[#EF4444]" : m.score === 1 ? "bg-[#10b981]" : "bg-[#FDE047]") : "bg-gray-100";
                                  if (m.maxScore === 1) bColor = m.score === 0 ? "bg-[#10b981]" : "bg-[#EF4444]";
                                  return <div key={bIdx} className={`flex-1 border border-black rounded-sm ${bColor}`} />;
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t-2 border-black bg-white flex justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <Info size={16} className="text-[#3B82F6]" />
              <span className="text-[8px] font-black uppercase text-black/40 italic">
                  Last Updated: {lastUpdate} | Database Audit Hash: 0x82f...a10b
              </span>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => setSelectedId(null)} className="neo-btn neo-btn-white px-6 py-2 text-[10px] font-black italic uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black">Tutup</button>
              <button 
                disabled={current.isVetoed}
                className={`neo-btn px-10 py-2 text-[10px] font-black italic uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all ${
                  current.isVetoed 
                    ? "bg-gray-100 text-black/20 cursor-not-allowed border-black/10 shadow-none" 
                    : "bg-[#10b981] text-black hover:bg-black hover:text-[#10b981]"
                }`}
              >
                {current.isVetoed ? "Investasi Dilarang" : "Stake Now"}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
