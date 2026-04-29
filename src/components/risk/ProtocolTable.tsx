"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Clock, Database } from "lucide-react";
import { Protocol } from "@/data/riskProtocols";

interface Props {
  protocolData: (Protocol & {
    totalScore: number;
    isVetoed: boolean;
    riskGrade: string;
    gradeLabel: string;
    colorClass: string;
    zone: string;
  })[];
  setSelectedId: (id: string) => void;
}

export default function ProtocolTable({ protocolData, setSelectedId }: Props) {
  return (
    <div className="neo-card bg-white overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] font-black tracking-[0.2em]">
              <th className="p-4 border-r border-white/20">Protokol</th>
              <th className="p-4 border-r border-white/20 text-center">Status Audit</th>
              <th className="p-4 border-r border-white/20 text-center">Analisis Syariah</th>
              <th className="p-4 border-r border-white/20 text-center">Risk Score</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-black">
            {protocolData.length > 0 ? protocolData.map((p) => (
              <tr key={p.id} className={`transition-colors group ${p.status === "Upcoming" ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 border-4 border-black bg-white flex items-center justify-center rounded-xl transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${p.status === "Upcoming" ? 'grayscale opacity-50' : 'group-hover:rotate-6'}`}>
                      <Image src={p.iconPath} alt={p.name} width={40} height={40} className="object-contain" />
                    </div>
                    <div>
                      <div className={`font-black uppercase text-sm leading-none mb-1.5 ${p.status === "Upcoming" ? 'text-black/40' : ''}`}>{p.name}</div>
                      <div className="text-[9px] font-bold text-black/40 uppercase truncate max-w-[280px]">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-[9px] font-black px-2 py-1 border-2 border-black rounded uppercase flex items-center justify-center gap-1 mx-auto w-fit ${p.status === "Audited" ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-gray-100 text-black/40 italic'}`}>
                     {p.status === "Audited" ? <ShieldCheck size={12} /> : <Clock size={12} />}
                     {p.status === "Audited" ? "Audit Selesai" : "Soon"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {p.status === "Audited" ? (
                    <span className={`neo-badge px-4 py-1.5 text-[9px] font-black border-2 border-black ${p.isVetoed ? "bg-[#EF4444] text-white" : "bg-[#10b981] text-black"}`}>
                      {p.isVetoed ? "NON-COMPLIANT" : "SHARIAH COMPLIANT"}
                    </span>
                  ) : "-"}
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {p.status === "Audited" ? (
                      <>
                        <div className="text-2xl font-black italic tracking-tighter leading-none">{p.totalScore}</div>
                        <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 border-black ${p.colorClass}`}> {p.riskGrade} </div>
                      </>
                    ) : <div className="w-12 h-2 bg-gray-200 rounded-full animate-pulse" />}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => p.status === "Audited" && setSelectedId(p.id)} disabled={p.status === "Upcoming"} className={`neo-btn py-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${p.status === "Upcoming" ? 'bg-gray-100 text-black/20 border-black/10' : 'neo-btn-white hover:bg-black hover:text-white transition-all'}`}>
                    {p.status === "Upcoming" ? "TBA" : "ANALISIS DETAIL"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-16 text-center text-black/40 font-black uppercase italic">
                  <Database size={48} className="mx-auto mb-4 opacity-10" />
                  Protokol tidak ditemukan dalam filter ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
