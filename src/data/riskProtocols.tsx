import React from "react";
import { 
  Scale, 
  Zap, 
  AlertTriangle, 
  RefreshCcw, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Database, 
  Target, 
  Activity 
} from "lucide-react";

export interface Metric { 
  label: string; 
  score: number; 
  maxScore: number; 
  icon: React.ReactNode; 
  description: string;
}

export interface Protocol {
  id: string; 
  name: string; 
  iconPath: string; 
  description: string;
  status: "Audited" | "Upcoming";
  compliance: Metric[];
  operational: Metric[];
  technological: Metric[];
  financial: Metric[];
}

export const protocols: Protocol[] = [
  {
    id: "solo", 
    name: "Solo Staking (Syariah)", 
    iconPath: "/solo staking logo.png",
    description: "Model staking mandiri dengan kontrol penuh atas validator, mematuhi prinsip syariah sepenuhnya.",
    status: "Audited",
    compliance: [
      { label: "Mekanisme Akad", score: 0, maxScore: 1, icon: <Scale size={12} />, description: "Wajib E-Contract / Ijarah Muntahiyah" },
      { label: "Potensi Riba", score: 0, maxScore: 1, icon: <Zap size={12} />, description: "Murni bagi hasil (NAV)" },
      { label: "Potensi Gharar", score: 0, maxScore: 1, icon: <AlertTriangle size={12} />, description: "Data on-chain transparan" },
    ],
    operational: [
      { label: "Uptime (RAVER)", score: 2, maxScore: 4, icon: <RefreshCcw size={12} />, description: "Uptime > 99.9%" },
      { label: "Slashing History", score: 1, maxScore: 2, icon: <ShieldCheck size={12} />, description: "Rekam jejak bersih" },
      { label: "Client Diversity", score: 2, maxScore: 3, icon: <Globe size={12} />, description: "Minoritas (<33%)" },
    ],
    technological: [
      { label: "SC Security", score: 2, maxScore: 3, icon: <Lock size={12} />, description: "Verified / Not Audited" },
      { label: "Key Management", score: 2, maxScore: 2, icon: <Database size={12} />, description: "Single-Signature" },
      { label: "Redundancy", score: 2, maxScore: 2, icon: <Target size={12} />, description: "Single-Node" },
    ],
    financial: [
      { label: "Liquidity Constraint", score: 1, maxScore: 3, icon: <Activity size={12} />, description: "Cepat (< 2 hari)" },
    ]
  },
  {
    id: "lido", 
    name: "Lido Finance", 
    iconPath: "/lido finance logo.png",
    description: "Protokol liquid staking populer, namun memiliki celah kepatuhan pada mekanisme reward.",
    status: "Audited",
    compliance: [
      { label: "Mekanisme Akad", score: 1, maxScore: 1, icon: <Scale size={12} />, description: "Akad tidak formal" },
      { label: "Potensi Riba", score: 0, maxScore: 1, icon: <Zap size={12} />, description: "Murni bagi hasil (NAV)" },
      { label: "Potensi Gharar", score: 0, maxScore: 1, icon: <AlertTriangle size={12} />, description: "Delegasi otomatis" },
    ],
    operational: [
      { label: "Uptime (RAVER)", score: 2, maxScore: 4, icon: <RefreshCcw size={12} />, description: "Dikelola pihak ketiga" },
      { label: "Slashing History", score: 1, maxScore: 2, icon: <ShieldCheck size={12} />, description: "Insiden minor" },
      { label: "Client Diversity", score: 3, maxScore: 3, icon: <Globe size={12} />, description: "Client mayoritas" },
    ],
    technological: [
      { label: "SC Security", score: 1, maxScore: 3, icon: <Lock size={12} />, description: "Verified & Audited" },
      { label: "Key Management", score: 1, maxScore: 2, icon: <Database size={12} />, description: "Multisig/DVT" },
      { label: "Redundancy", score: 1, maxScore: 2, icon: <Target size={12} />, description: "Multi-Node" },
    ],
    financial: [
      { label: "Liquidity Constraint", score: 1, maxScore: 3, icon: <Activity size={12} />, description: "Likuiditas instan" },
    ]
  },
  { id: "rocket", name: "Rocket Pool", status: "Upcoming", iconPath: "/rocket pool logo.jpeg", description: "Protokol staking terdesentralisasi.", compliance: [], operational: [], technological: [], financial: [] },
  { id: "ssv", name: "SSV Network (DVT)", status: "Upcoming", iconPath: "/SSV logo.png", description: "Infrastruktur DVT terdistribusi.", compliance: [], operational: [], technological: [], financial: [] },
  { id: "etherfi", name: "Ether.Fi", status: "Upcoming", iconPath: "/ether.fi logo.png", description: "Non-custodial liquid staking.", compliance: [], operational: [], technological: [], financial: [] },
  { id: "binance", name: "Binance Staking", status: "Upcoming", iconPath: "/Binance logo.webp", description: "Layanan staking bursa terpusat.", compliance: [], operational: [], technological: [], financial: [] },
  { id: "coinbase", name: "Coinbase Cloud", status: "Upcoming", iconPath: "/Coinbase logo.png", description: "Staking institusional terpercaya.", compliance: [], operational: [], technological: [], financial: [] },
];
