"use client";

import React from "react";
import RiskExplorer from "@/components/RiskExplorer";
import { AlertCircle, ShieldCheck, HeartPulse } from "lucide-react";

export default function RiskPage() {
  return (
    <div className="flex flex-col gap-4">

      <RiskExplorer />

      {/* Secondary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RiskIndicatorCard
          title="Stabilitas Konsensus"
          status="Stabil"
          desc="Finalitas jaringan dalam 2 epoch. Varians < 0.01%."
          icon={<HeartPulse className="text-[#3B82F6]" size={18} />}
          color="bg-[#3B82F6]/10"
        />
        <RiskIndicatorCard
          title="Proteksi Slashing"
          status="Aktif"
          desc="Anti-slashing terverifikasi pada 32/32 node validator."
          icon={<ShieldCheck className="text-[#10b981]" size={18} />}
          color="bg-[#10b981]/10"
        />
        <RiskIndicatorCard
          title="Kedalaman Likuiditas"
          status="Optimal"
          desc="Likuiditas exit LST > 10.000 ETH di DEX utama."
          icon={<AlertCircle className="text-[#A855F7]" size={18} />}
          color="bg-[#A855F7]/10"
        />
      </div>
    </div>
  );
}

function RiskIndicatorCard({ title, status, desc, icon, color }: { title: string; status: string; desc: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="neo-card p-4 bg-white group neo-card-hover cursor-default">
      <div className="flex justify-between items-center mb-3">
        <div className={`w-9 h-9 border-2 border-black flex items-center justify-center ${color} rounded-lg`}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <span className="neo-badge bg-black text-white text-[10px]">{status}</span>
      </div>
      <h4 className="text-sm font-black uppercase mb-1 italic">{title}</h4>
      <p className="text-xs text-black/60 leading-relaxed font-bold">{desc}</p>
    </div>
  );
}
