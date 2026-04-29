"use client";

import React, { useEffect, useState } from "react";
import { Layers, RefreshCcw, AlertTriangle, Wifi } from "lucide-react";
import { motion } from "framer-motion";

interface ClientData {
  name: string;
  percentage: number;
  blocks: number;
}

interface DiversityResponse {
  consensus: ClientData[];
  totalBlocks: number;
  updatedAt: string;
  fallback?: boolean;
}

const CLIENT_COLORS: Record<string, string> = {
  Lighthouse: "#10b981",
  Prysm: "#3B82F6",
  Teku: "#A855F7",
  Nimbus: "#FDE047",
  Lodestar: "#F97316",
  Grandine: "#EC4899",
};

export default function ClientDiversityPanel() {
  const [data, setData] = useState<DiversityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/client-diversity");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Gunakan setTimeout untuk menghindari synchronous state update di dalam effect
    // yang dapat menyebabkan cascading renders sesuai aturan ESLint.
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    // Auto-refresh setiap 10 menit
    const interval = setInterval(fetchData, 600000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Cek apakah ada client dengan dominasi > 33%
  const hasMajority = data?.consensus.some((c) => c.percentage > 33);
  const topClient = data?.consensus[0];

  return (
    <div className="neo-card p-4 bg-white h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A855F7] border-2 border-black flex items-center justify-center rounded-md">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase italic leading-none">Client Diversity</h3>
            <p className="text-[9px] font-bold text-black/40 uppercase mt-1">Hifzul Mal · Real-Time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && !data.fallback && (
            <div className="flex items-center gap-1">
              <Wifi size={10} className="text-[#10b981]" />
              <span className="text-[7px] font-black uppercase text-[#10b981]">Live</span>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="neo-btn neo-btn-white p-1.5"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin-reverse" : ""} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-black border-t-[#A855F7] rounded-full animate-spin" />
        </div>
      ) : error && !data ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-[10px] font-bold text-black/40">Gagal memuat data</p>
        </div>
      ) : data ? (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {data.consensus.slice(0, 5).map((client, idx) => (
              <div key={client.name} className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full border border-black inline-block"
                      style={{ backgroundColor: CLIENT_COLORS[client.name] || "#999" }}
                    />
                    {client.name}
                  </span>
                  <span
                    className={
                      client.percentage > 33
                        ? "text-[#EF4444]"
                        : ""
                    }
                  >
                    {client.percentage}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 border border-black rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-sm"
                    style={{ backgroundColor: CLIENT_COLORS[client.name] || "#999" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Warning */}
          <div className="pt-2 border-t border-dashed border-black/10 mt-2">
            {hasMajority && topClient ? (
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={10} className="text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-[8px] font-bold text-[#EF4444] leading-tight">
                  {topClient.name} mendominasi {topClient.percentage}% — berisiko terhadap finalitas jaringan.
                </p>
              </div>
            ) : (
              <p className="text-[8px] font-bold text-[#10b981] leading-tight italic">
                ✓ Distribusi client sehat. Tidak ada dominasi &gt;33%.
              </p>
            )}
            {data.updatedAt && (
              <p className="text-[7px] font-bold text-black/30 mt-1">
                Sumber: Blockprint (Sigma Prime) · {new Date(data.updatedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
