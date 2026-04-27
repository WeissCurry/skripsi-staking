"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ShieldCheck, AlertTriangle, Target, Zap, Globe, Lock, Database, RefreshCcw, Scale, Activity, X, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Metric { label: string; score: number; maxScore: number; icon: React.ReactNode; }
interface Protocol {
  id: string; name: string; icon: React.ReactNode; description: string;
  status: "Audited" | "Warning" | "Verified";
  metrics: Metric[];
}

const protocols: Protocol[] = [
  {
    id: "solo", name: "Solo Staking (Syariah)", 
    icon: <Image src="/solo staking logo.png" alt="Solo" width={24} height={24} className="object-contain" />,
    description: "Model staking mandiri dengan kontrol penuh atas validator.",
    status: "Verified",
    metrics: [
      { label: "Akad", score: 0, maxScore: 1, icon: <Scale size={12} /> },
      { label: "Riba", score: 0, maxScore: 1, icon: <Zap size={12} /> },
      { label: "Gharar", score: 0, maxScore: 1, icon: <AlertTriangle size={12} /> },
      { label: "Uptime", score: 2, maxScore: 4, icon: <RefreshCcw size={12} /> },
      { label: "Slashing", score: 1, maxScore: 2, icon: <ShieldCheck size={12} /> },
      { label: "Diversity", score: 2, maxScore: 3, icon: <Globe size={12} /> },
      { label: "Audit", score: 1, maxScore: 2, icon: <Lock size={12} /> },
      { label: "Key", score: 1, maxScore: 2, icon: <Database size={12} /> },
      { label: "Redundancy", score: 2, maxScore: 2, icon: <Target size={12} /> },
      { label: "Liquidity", score: 2, maxScore: 3, icon: <Activity size={12} /> },
    ]
  },
  {
    id: "lido", name: "Lido Finance", 
    icon: <Image src="/lido finance logo.png" alt="Lido" width={24} height={24} className="object-contain" />,
    description: "Protokol liquid staking terbesar, risiko sentralisasi.",
    status: "Warning",
    metrics: [
      { label: "Akad", score: 0, maxScore: 1, icon: <Scale size={12} /> },
      { label: "Riba", score: 1, maxScore: 1, icon: <Zap size={12} /> },
      { label: "Gharar", score: 0, maxScore: 1, icon: <AlertTriangle size={12} /> },
      { label: "Uptime", score: 1, maxScore: 4, icon: <RefreshCcw size={12} /> },
      { label: "Slashing", score: 1, maxScore: 2, icon: <ShieldCheck size={12} /> },
      { label: "Diversity", score: 3, maxScore: 3, icon: <Globe size={12} /> },
      { label: "Audit", score: 1, maxScore: 2, icon: <Lock size={12} /> },
      { label: "Key", score: 2, maxScore: 2, icon: <Database size={12} /> },
      { label: "Redundancy", score: 1, maxScore: 2, icon: <Target size={12} /> },
      { label: "Liquidity", score: 2, maxScore: 3, icon: <Activity size={12} /> },
    ]
  },
];

export default function RiskExplorer() {

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const protocolData = useMemo(() => {
    return protocols.map(p => {
      const totalScore = p.metrics.reduce((acc, m) => acc + m.score, 0);
      const complianceMetrics = p.metrics.slice(0, 3);
      const isVetoed = complianceMetrics.some(m => m.score === 1);
      
      let riskLevel = "Investment Grade / Aman";
      let scoreColor = "bg-[#10b981]";
      let zone: "green" | "yellow" | "red" = "green";

      if (isVetoed) {
        riskLevel = "Tidak Patuh Syariah";
        scoreColor = "bg-[#EF4444]";
        zone = "red";
      } else if (totalScore >= 17) {
        riskLevel = "High-Risk";
        scoreColor = "bg-[#EF4444]";
        zone = "red";
      } else if (totalScore >= 12) {
        riskLevel = "Speculative Grade";
        scoreColor = "bg-[#FDE047]";
        zone = "yellow";
      } else {
        riskLevel = "Investment Grade / Aman";
        scoreColor = "bg-[#10b981]";
        zone = "green";
      }

      // Normalization logic for radar chart (0-100%)
      const totalCompliance = p.metrics[0].score + p.metrics[1].score + p.metrics[2].score;
      const totalOps = p.metrics[3].score + p.metrics[4].score + p.metrics[5].score;
      const totalTech = p.metrics[6].score + p.metrics[7].score + p.metrics[8].score;
      const totalFin = p.metrics[9].score;

      const complianceAxis = isVetoed ? 100 : (totalCompliance / 3) * 100;
      const opsAxis = (totalOps / 9) * 100;
      const techAxis = (totalTech / 6) * 100;
      const finAxis = (totalFin / 3) * 100;

      const averages = [
        { subject: 'Compliance', A: complianceAxis, fullMark: 100 },
        { subject: 'Operational', A: opsAxis, fullMark: 100 },
        { subject: 'Technological', A: techAxis, fullMark: 100 },
        { subject: 'Financial', A: finAxis, fullMark: 100 },
      ];

      return {
        ...p,
        totalScore,
        riskLevel,
        scoreColor,
        isVetoed,
        zone,
        averages,
        pillarGroups: [
          { title: "Compliance Risk", color: "bg-[#3B82F6]", items: p.metrics.slice(0, 3) },
          { title: "Operational Risk", color: "bg-[#10b981]", items: p.metrics.slice(3, 6) },
          { title: "Technological Risk", color: "bg-[#A855F7]", items: p.metrics.slice(6, 9) },
          { title: "Financial Risk", color: "bg-[#FDE047]", items: p.metrics.slice(9, 10) },
        ]
      };
    });
  }, []);

  const currentProtocol = protocolData.find(p => p.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Header Table */}
      <div className="flex justify-between items-center bg-white neo-card p-4">
        <h2 className="text-xl font-black uppercase italic italic">Daftar Audit Protokol</h2>
        <div className="relative">
          <input type="text" placeholder="Cari protokol..." className="neo-input py-2 pl-10 pr-4 text-xs w-64" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
        </div>
      </div>

      {/* Protocol Table */}
      <div className="neo-card bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] font-black tracking-widest">
              <th className="p-4 border-r border-white/20">Protokol</th>
              <th className="p-4 border-r border-white/20">Status Syariah</th>
              <th className="p-4 border-r border-white/20 text-center">Risk Score</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/5">
            {protocolData.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-black bg-[#F8F9FA] flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-black uppercase text-sm leading-none mb-1">{p.name}</div>
                      <div className="text-[10px] font-bold text-black/40 uppercase truncate max-w-[200px]">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`neo-badge text-[10px] ${
                    p.isVetoed ? "bg-[#EF4444] text-white" :
                    p.zone === "green" ? "bg-[#10b981] text-black" : "bg-[#FDE047] text-black"
                  }`}>{p.isVetoed ? "TIDAK SYARIAH" : "SYARIAH"}</span>
                </td>
                <td className="p-4">
                   <div className="flex flex-col items-center">
                      <div className="text-lg font-black italic leading-none">{p.totalScore}</div>
                      <div className={`text-[8px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${p.scoreColor} border border-black ${p.isVetoed ? 'text-white' : 'text-black'}`}>
                        {p.riskLevel}
                      </div>
                   </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setSelectedId(p.id)}
                    className="neo-btn neo-btn-emerald inline-flex items-center gap-2"
                  >
                    Detail Audit <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Audit */}
      <AnimatePresence>
        {selectedId && currentProtocol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="neo-card bg-[#EFEFEF] w-full max-w-6xl relative z-10 max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b-2 border-black flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] border-2 border-black flex items-center justify-center rounded-xl">
                    {currentProtocol.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic leading-none">{currentProtocol.name}</h3>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Laporan Audit Risiko Terperinci</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="neo-btn neo-btn-white p-2 hover:bg-[#EF4444] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto min-h-0 space-y-6">
                {/* Banner Status */}
                <AnimatePresence mode="wait">
                  {currentProtocol.isVetoed ? (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="neo-card p-4 bg-[#EF4444] text-white border-black">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-black rounded-lg shrink-0"><AlertTriangle size={24} className="text-[#EF4444]" /></div>
                        <div>
                          <h4 className="font-black uppercase italic text-sm mb-1">High Risk: Shariah Violation Detected</h4>
                          <p className="font-bold text-xs leading-relaxed uppercase">Protokol ini gagal melewati gerbang kepatuhan (Veto triggered). Penggunaan sangat tidak direkomendasikan.</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="neo-card p-4 bg-[#10b981] text-black border-black">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-black rounded-lg shrink-0"><ShieldCheck size={24} className="text-[#10b981]" /></div>
                        <div>
                          <h4 className="font-black uppercase italic text-sm mb-1">Safe: Shariah Compliant & Low Risk</h4>
                          <p className="font-bold text-xs leading-relaxed uppercase">Protokol ini telah melewati audit kepatuhan dan memiliki profil risiko yang terjaga. Dana Anda dikelola dengan transparansi penuh.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Score & Details */}
                  <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className={`neo-card p-6 flex flex-col items-center justify-center text-center ${currentProtocol.scoreColor}`}>
                      <span className={`text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-60 ${currentProtocol.isVetoed ? 'text-white' : 'text-black'}`}>Total Risk Score</span>
                      <div className={`text-6xl font-black tracking-tighter leading-none mb-2 ${currentProtocol.isVetoed ? 'text-white' : 'text-black'}`}>
                        {currentProtocol.totalScore}<span className="text-xl opacity-40">/21</span>
                      </div>
                      <div className="neo-badge bg-black text-white mt-4 text-xs px-4 py-1">{currentProtocol.riskLevel}</div>
                    </div>
                    
                    <div className="neo-card p-4 bg-white flex-1 min-h-[250px]">
                      <h4 className="text-xs font-black uppercase border-b-2 border-black pb-1 mb-4 block italic text-center">Risk Radar Chart</h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentProtocol.averages}>
                            <PolarGrid stroke="#000" strokeWidth={1} />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 900, fill: '#000' }} />
                            <Radar
                              name="Risk"
                              dataKey="A"
                              stroke="#000"
                              strokeWidth={2}
                              fill={currentProtocol.zone === 'red' ? '#EF4444' : currentProtocol.zone === 'yellow' ? '#FDE047' : '#10b981'}
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Grouped Metrics */}
                  <div className="lg:col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentProtocol.pillarGroups.map((pillar, pIdx) => (
                        <div key={pIdx} className="neo-card p-4 bg-white border-2 border-black">
                          <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                             <div className={`w-3 h-3 rounded-full ${pillar.color} border border-black`} />
                             <h4 className="text-xs font-black uppercase italic">{pillar.title}</h4>
                          </div>
                          <div className="space-y-4">
                            {pillar.items.map((item, iIdx) => (
                              <div key={iIdx} className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 bg-black text-white rounded-sm">{item.icon}</span>
                                    <span className="text-[10px] font-black uppercase leading-none">{item.label}</span>
                                  </div>
                                  <span className={`text-[10px] font-black ${item.score === item.maxScore ? "text-[#EF4444]" : "text-black"}`}>{item.score}/{item.maxScore}</span>
                                </div>
                                <div className="h-6 flex gap-1">
                                  {Array.from({ length: item.maxScore }).map((_, bIdx) => {
                                    const blockNumber = bIdx + 1;
                                    
                                    // Determine how many blocks are "filled" and the color
                                    let isFilled = false;
                                    let blockColor = "bg-gray-100";

                                    if (item.maxScore === 1) {
                                      // Boolean Case
                                      isFilled = true; // Always fill 1 block to represent state
                                      blockColor = item.score === 0 ? "bg-[#10b981]" : "bg-[#EF4444]";
                                    } else {
                                      // Standard Case
                                      isFilled = blockNumber <= item.score;
                                      if (isFilled) {
                                        if (item.score === item.maxScore) blockColor = "bg-[#EF4444]";
                                        else if (item.score === 1) blockColor = "bg-[#10b981]";
                                        else blockColor = "bg-[#FDE047]";
                                      }
                                    }

                                    return (
                                      <div 
                                        key={blockNumber}
                                        className={`flex-1 border-2 border-black rounded-sm transition-colors ${blockColor}`}
                                      />
                                    );
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
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t-2 border-black bg-white flex justify-end">
                <button onClick={() => setSelectedId(null)} className="neo-btn neo-btn-white px-8">Tutup Laporan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
