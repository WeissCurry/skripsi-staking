"use client";

import React from "react";
import Image from "next/image";
import { 
  Bell,
  Menu
} from "lucide-react";
import dynamic from "next/dynamic";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="flex justify-between items-center p-2 lg:p-3 neo-card gap-4">
      <div className="flex items-center gap-4 lg:gap-6">
         {/* Mobile Menu Toggle */}
         <button className="xl:hidden p-2 neo-btn neo-btn-white">
            <Menu size={20} />
         </button>

         {/* Logo Section */}
         <div className="flex items-center gap-3 pr-4 lg:pr-6 border-r-2 border-black/10">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group cursor-pointer hover:bg-gray-50 transition-colors">
               <Image src="/favicon.ico" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-black tracking-tighter uppercase leading-none">
                 Skripsi<span className="text-[#10b981]">Staking</span>
               </span>
               <span className="text-[8px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">v1.0 Beta</span>
            </div>
         </div>

      </div>
      
      <div className="flex items-center gap-4">
        <button className="neo-btn neo-btn-white p-3 flex items-center justify-center relative">
          <Bell size={20} />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#EF4444] border-2 border-black rounded-full" />
        </button>
        <div className="neo-card p-1">
          <ConnectButton showBalance={false} label="Hubungkan Dompet" />
        </div>
      </div>
    </header>
  );
}

