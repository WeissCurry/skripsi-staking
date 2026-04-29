"use client";

import React from "react";
import Image from "next/image";
import { 
  Bell,
  Menu,
  X,
  History,
  Trash2,
  ExternalLink
} from "lucide-react";
import dynamic from "next/dynamic";
import { useActivity } from "@/hooks/useActivity";
import { motion, AnimatePresence } from "framer-motion";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { activities, clearActivity } = useActivity();

  return (
    <header className="flex justify-between items-center p-2 lg:p-3 neo-card gap-4 relative z-50">
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
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`neo-btn p-3 flex items-center justify-center relative transition-all ${isOpen ? "bg-black text-white" : "neo-btn-white"}`}
          >
            {isOpen ? <X size={20} /> : <Bell size={20} />}
            {activities.length > 0 && !isOpen && (
              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#EF4444] border-2 border-black rounded-full" />
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden rounded-xl"
              >
                <div className="bg-black text-white p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-[#10b981]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aktivitas Terbaru</span>
                  </div>
                  {activities.length > 0 && (
                    <button 
                      onClick={clearActivity}
                      className="text-[9px] font-black uppercase bg-[#EF4444] px-2 py-1 border border-white hover:bg-white hover:text-black transition-colors rounded-md"
                    >
                      <Trash2 size={10} className="inline mr-1" /> Clear
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 border-2 border-black border-dashed rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-black/20" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-black/40">Belum ada aktivitas</p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-black">
                      {activities.map((activity) => (
                        <div key={activity.id} className="p-3 hover:bg-gray-50 transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-black rounded-md ${
                              activity.type === "Deposit" ? "bg-[#10b981]" : "bg-[#EF4444] text-white"
                            }`}>
                              {activity.type}
                            </span>
                            <span className="text-[8px] font-bold text-black/40 italic">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-xs font-black italic mb-2">
                            {activity.amount} {activity.unit}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-black/60 truncate w-40">
                              Tx: {activity.id.slice(0, 12)}...
                            </span>
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${activity.id}`} 
                              target="_blank" 
                              className="text-[8px] font-black uppercase flex items-center gap-1 hover:text-[#3B82F6] underline"
                            >
                              Scan <ExternalLink size={8} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {activities.length > 0 && (
                  <div className="p-2 bg-gray-50 border-t-2 border-black text-center">
                    <p className="text-[8px] font-bold text-black/40 uppercase tracking-tighter">Data disimpan secara lokal di browser Anda</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="neo-card p-1">
          <ConnectButton showBalance={false} label="Hubungkan Dompet" />
        </div>
      </div>
    </header>
  );
}

