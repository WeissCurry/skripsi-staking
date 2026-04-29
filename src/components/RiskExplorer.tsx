"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { protocols } from "@/data/riskProtocols";
import RiskExplorerHeader from "./risk/RiskExplorerHeader";
import ProtocolTable from "./risk/ProtocolTable";
import AuditModal from "./risk/AuditModal";

interface DynamicScore {
  score: number;
  description: string;
}

interface RiskScoringResponse {
  scores: Record<string, {
    clientDiversity: DynamicScore;
    scSecurity: DynamicScore;
  }>;
  meta: {
    clientDiversity?: {
      topClient: string;
      topPercentage: number;
      totalClients: number;
      fallback: boolean;
    };
    updatedAt: string;
    fallback?: boolean;
  };
}

export default function RiskExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "shariah" | "audited">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("29 April 2026");
  const [dynamicScores, setDynamicScores] = useState<RiskScoringResponse | null>(null);

  const ITEMS_PER_PAGE = 5;

  // Fetch skor dinamis dari API
  const fetchDynamicScores = useCallback(async () => {
    try {
      setIsUpdating(true);
      const res = await fetch("/api/risk-scoring");
      if (!res.ok) throw new Error("API error");
      const data: RiskScoringResponse = await res.json();
      setDynamicScores(data);
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = now.toLocaleDateString('id-ID', options);
      const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastUpdate(`${formattedDate} ${formattedTime}`);
    } catch (error) {
      console.error("Failed to fetch dynamic scores:", error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Auto-fetch saat pertama kali mount
  const hasFetched = React.useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const controller = new AbortController();
      fetch("/api/risk-scoring", { signal: controller.signal })
        .then(res => res.json())
        .then((data: RiskScoringResponse) => {
          setDynamicScores(data);
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const formattedDate = now.toLocaleDateString('id-ID', options);
          const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          setLastUpdate(`${formattedDate} ${formattedTime}`);
        })
        .catch(() => { /* ignored */ });
      return () => controller.abort();
    }
  }, []);

  // Merge data statis dengan skor dinamis
  const filteredData = useMemo(() => {
    return protocols.map(p => {
      if (p.status === "Upcoming") return { ...p, totalScore: 0, isVetoed: false, riskGrade: "TBA", gradeLabel: "Soon", colorClass: "bg-gray-100", zone: "neutral" as const, radarData: [], pillars: [] };
      
      // Merge skor dinamis ke dalam operational & technological
      let operational = [...p.operational];
      let technological = [...p.technological];

      const protocolScores = dynamicScores?.scores[p.id];
      if (protocolScores) {
        // Update Client Diversity (operational index 2)
        const cdIdx = operational.findIndex(m => m.label === "Client Diversity");
        if (cdIdx !== -1) {
          operational = operational.map((m, i) => 
            i === cdIdx ? { ...m, score: protocolScores.clientDiversity.score, description: protocolScores.clientDiversity.description } : m
          );
        }

        // Update SC Security (technological index 0)
        const scIdx = technological.findIndex(m => m.label === "SC Security");
        if (scIdx !== -1) {
          technological = technological.map((m, i) =>
            i === scIdx ? { ...m, score: protocolScores.scSecurity.score, description: protocolScores.scSecurity.description } : m
          );
        }
      }

      const isVetoed = p.compliance.some(m => m.score === 1);
      const allMetrics = [...p.compliance, ...operational, ...technological, ...p.financial];
      const totalScore = allMetrics.reduce((acc, m) => acc + m.score, 0);

      let riskGrade = "Aman"; let gradeLabel = "Investment Grade"; let colorClass = "bg-[#10b981]"; let zone: "green" | "yellow" | "red" | "veto" = "green";
      if (isVetoed) { riskGrade = "TIDAK PATUH"; gradeLabel = "Veto Syariah"; colorClass = "bg-[#EF4444]"; zone = "veto"; }
      else if (totalScore >= 17) { riskGrade = "BAHAYA"; gradeLabel = "High-Risk"; colorClass = "bg-[#EF4444]"; zone = "red"; }
      else if (totalScore >= 12) { riskGrade = "WASPADA"; gradeLabel = "Speculative Grade"; colorClass = "bg-[#FDE047]"; zone = "yellow"; }

      const radarData = [
        { subject: 'A', A: isVetoed ? 100 : Math.max(10, (p.compliance.reduce((a, b) => a + b.score, 0) / 3) * 100), fullMark: 100 },
        { subject: 'B', A: Math.max(10, ((operational.reduce((a, b) => a + b.score, 0) - 3) / 6) * 100), fullMark: 100 },
        { subject: 'C', A: Math.max(10, ((technological.reduce((a, b) => a + b.score, 0) - 3) / 3) * 100), fullMark: 100 },
        { subject: 'D', A: Math.max(10, ((p.financial.reduce((a, b) => a + b.score, 0) - 1) / 2) * 100), fullMark: 100 },
      ];

      return { ...p, operational, technological, totalScore, isVetoed, riskGrade, gradeLabel, colorClass, zone, radarData, pillars: [
        { id: 'A', title: "Compliance", metrics: p.compliance, color: "bg-[#3B82F6]" },
        { id: 'B', title: "Operational", metrics: operational, color: "bg-[#10b981]" },
        { id: 'C', title: "Technological", metrics: technological, color: "bg-[#A855F7]" },
        { id: 'D', title: "Financial", metrics: p.financial, color: "bg-[#FDE047]" },
      ]};
    }).filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterMode === "shariah") return matchSearch && p.status === "Audited" && !p.isVetoed;
      if (filterMode === "audited") return matchSearch && p.status === "Audited";
      return matchSearch;
    });
  }, [searchQuery, filterMode, dynamicScores]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const protocolData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const current = filteredData.find(p => p.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      <RiskExplorerHeader 
        searchQuery={searchQuery}
        setSearchQuery={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        filterMode={filterMode}
        setFilterMode={(mode) => { setFilterMode(mode); setCurrentPage(1); }}
        isUpdating={isUpdating}
        handleUpdate={fetchDynamicScores}
        lastUpdate={lastUpdate}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <ProtocolTable 
        protocolData={protocolData}
        setSelectedId={setSelectedId}
      />

      <AnimatePresence>
        {selectedId && current && (
          <AuditModal 
            current={current}
            setSelectedId={setSelectedId}
            lastUpdate={lastUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
