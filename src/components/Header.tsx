"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDisconnect } from "wagmi";
import { 
  Bell,
  Menu,
  X,
  History,
  Trash2,
  ExternalLink,
  LayoutDashboard,
  AlertCircle,
  LogOut
} from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface CustomButtonProps {
  account?: { displayName: string; displayBalance?: string };
  chain?: { name?: string; iconUrl?: string; hasIcon: boolean; unsupported?: boolean };
  mounted: boolean;
  authenticationStatus?: "loading" | "authenticated" | "unauthenticated";
  openAccountModal: () => void;
  openChainModal: () => void;
  openConnectModal: () => void;
}

const CustomWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }: CustomButtonProps) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="w-full"
          >
            {(() => {
              if (!connected || !chain || !account) {
                return (
                  <button 
                    onClick={openConnectModal} 
                    type="button"
                    className="neo-btn neo-btn-white w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    Hubungkan Dompet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button 
                    onClick={openChainModal} 
                    type="button"
                    className="neo-btn neo-btn-red w-full py-2.5"
                  >
                    Salah Jaringan
                  </button>
                );
              }

              return (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={openChainModal}
                    className="neo-btn neo-btn-white flex items-center justify-center gap-2 py-2 w-full"
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-black relative">
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={16}
                            height={16}
                            unoptimized
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-[10px]">{chain.name}</span>
                  </button>

                  <button 
                    onClick={openAccountModal} 
                    type="button"
                    className="neo-btn neo-btn-blue text-white w-full py-2 flex items-center justify-center gap-2"
                  >
                    <div className="w-2 h-2 bg-[#10b981] rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const DesktopWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }: CustomButtonProps) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        if (!ready) return null;

        if (!connected || !chain || !account) {
          return (
            <button 
              onClick={openConnectModal} 
              type="button"
              className="neo-btn neo-btn-white"
            >
              Hubungkan
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button 
              onClick={openChainModal} 
              type="button"
              className="neo-btn neo-btn-red"
            >
              Network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              className="neo-btn neo-btn-white flex items-center gap-2"
              type="button"
            >
              {chain.hasIcon && (
                <div className="w-4 h-4 rounded-full overflow-hidden border border-black relative">
                  {chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      width={16}
                      height={16}
                      unoptimized
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}
              <span className="hidden lg:inline">{chain.name}</span>
            </button>

            <button 
              onClick={openAccountModal} 
              type="button"
              className="neo-btn neo-btn-white flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-[#10b981] rounded-full border border-black" />
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { activities, clearActivity } = useActivity();
  const pathname = usePathname();
  const { disconnect } = useDisconnect();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dasbor", href: "/" },
    { icon: <AlertCircle size={18} />, label: "Manajemen Risiko", href: "/risk" },
    { icon: <History size={18} />, label: "Aktivitas", href: "/activity" },
  ];

  return (
    <header className="flex justify-between items-center p-1.5 md:p-2 lg:p-3 neo-card gap-2 md:gap-4 relative z-50">
      <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
         {/* Mobile Menu Toggle */}
         <div className="relative xl:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 neo-btn transition-all ${isMenuOpen ? "bg-black text-white" : "neo-btn-white"}`}
            >
               {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-4 w-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden z-50"
                >
                  <div className="bg-black text-white p-3">
                    <span className="text-[10px] font-black uppercase tracking-widest">Menu Navigasi</span>
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`flex items-center gap-3 px-3 py-2.5 border-2 border-black rounded-lg font-black uppercase text-xs transition-all ${
                          pathname === item.href 
                          ? "bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-white text-black hover:bg-gray-50"
                        }`}>
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    ))}
                    
                    <div className="h-[2px] bg-black/10 my-1" />
                    
                    {/* Mobile Wallet Section */}
                    <div className="p-1 neo-card bg-gray-50 flex justify-center">
                      <CustomWalletButton />
                    </div>

                    <button 
                      onClick={() => {
                        disconnect();
                        setIsMenuOpen(false);
                      }}
                      className="neo-btn neo-btn-white flex items-center gap-3 w-full justify-center text-[10px] mt-1"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Logo Section */}
         <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-4 lg:pr-6 border-r-2 border-black/10">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
               <Image src="/favicon.ico" alt="Logo" width={20} height={20} className="object-contain md:w-6 md:h-6" unoptimized />
            </div>
            <div className="flex flex-col hidden sm:flex">
               <span className="text-sm font-black tracking-tighter uppercase leading-none">
                 Skripsi<span className="text-[#10b981]">Staking</span>
               </span>
               <span className="text-[8px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">v1.0 Beta</span>
            </div>
         </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsOpen(!isOpen);
              setIsMenuOpen(false);
            }}
            className={`neo-btn p-2 md:p-3 flex items-center justify-center relative transition-all ${isOpen ? "bg-black text-white" : "neo-btn-white"}`}
          >
            {isOpen ? <X size={18} /> : <Bell size={18} />}
            {activities.length > 0 && !isOpen && (
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] border-2 border-black rounded-full" />
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden rounded-xl"
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
                      {activities.slice(0, 3).map((activity) => (
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

        {/* Desktop Wallet Button */}
        <div className="hidden xl:block">
          <DesktopWalletButton />
        </div>
      </div>
    </header>
  );
}

