"use client";

import { useState, useEffect } from "react";

export type ActivityType = "Deposit" | "Redeem" | "Purify";

export interface ActivityItem {
  id: string; // Tx Hash
  type: ActivityType;
  amount: string;
  unit: string;
  timestamp: number;
  status: "success" | "pending" | "failed";
}

const STORAGE_KEY = "skripsi_staking_activity";

export function useActivity() {
  // Use initializer function to read from localStorage immediately on mount
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse activities", e);
        return [];
      }
    }
    return [];
  });

  // Keep localStorage in sync whenever activities change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (item: ActivityItem) => {
    setActivities((prev) => [item, ...prev].slice(0, 50));
  };

  const clearActivity = () => {
    setActivities([]);
  };

  return { activities, addActivity, clearActivity };
}
