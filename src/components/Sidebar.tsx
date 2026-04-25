"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDisconnect } from "wagmi";
import { 
  LayoutDashboard, 
  History, 
  LogOut,
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { disconnect } = useDisconnect();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dasbor", href: "/" },
    { icon: <AlertCircle size={20} />, label: "Manajemen Risiko", href: "/risk" },
    { icon: <History size={20} />, label: "Aktivitas", href: "/activity" },
  ];

  return (
    <aside className="w-60 flex flex-col gap-3 hidden xl:flex h-full">
      <nav className="flex flex-col gap-2.5 flex-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            icon={item.icon} 
            label={item.label} 
            href={item.href}
            active={pathname === item.href} 
          />
        ))}
      </nav>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => disconnect()}
          className="neo-btn neo-btn-white flex items-center gap-3 w-full justify-center text-sm"
        >
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div 
        className={`flex items-center gap-3 px-3 py-2 border-2 border-black transition-all cursor-pointer font-black uppercase text-xs rounded-lg ${
          active 
          ? "bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
          : "bg-white text-black hover:bg-gray-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        }`}
      >
        <div className={active ? "text-white" : "text-black"}>
          {icon}
        </div>
        <span>{label}</span>
      </div>
    </Link>
  );
}

