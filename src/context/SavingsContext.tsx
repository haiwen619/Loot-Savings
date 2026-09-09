import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  SavingsJar,
  SavingsTransaction,
  SmartSavingsPlan,
  ThemeAppearance,
  TransactionType,
} from "../types/savings";
import { soundFx } from "../services/audio";
import { triggerHaptic } from "../services/haptics";
import { savingsRepo } from "../services/db";
import {
  loadHapticEnabled,
  loadSavedActiveJarId,
  loadSavedJars,
  loadSavedTransactions,
  loadSoundEnabled,
  loadThemeAppearance,
  saveActiveJarId,
  saveHapticEnabled,
  saveJarsToStorage,
  saveSoundEnabled,
  saveThemeAppearance,
  saveTransactionsToStorage,
} from "../services/storage";

interface SavingsContextType {
  jars: SavingsJar[];
  activeJar: SavingsJar | null;
  activeJarIndex: number;
  transactions: SavingsTransaction[];
  activeJarTransactions: SavingsTransaction[];
  smartPlan: SmartSavingsPlan | null;
  totalSaved: number;
  totalTarget: number;
  overallPercent: number;
  isNativeDb: boolean;
  theme: ThemeAppearance;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  celebrating: boolean;
  setActiveJarId: (id: string) => void;
  nextJar: () => void;
  prevJar: () => void;
  deposit: (amount: number, note?: string) => Promise<boolean>;
  withdraw: (amount: number, note?: string) => Promise<boolean>;
  createJar: (data: Omit<SavingsJar, "id" | "currentAmount" | "createdAt">) => void;
  updateJar: (jar: SavingsJar) => void;
  deleteJar: (id: string) => void;
  setTheme: (theme: ThemeAppearance) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  stopCelebrating: () => void;
}

const SavingsContext = createContext<SavingsContextType | null>(null);

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [jars, setJars] = useState<SavingsJar[]>(() => loadSavedJars());
  const [transactions, setTransactions] = useState<SavingsTransaction[]>(() => loadSavedTransactions());
  const [activeJarId, setActiveJarIdState] = useState<string>(() => {
    const savedId = loadSavedActiveJarId();
    const initialJars = loadSavedJars();
    if (savedId && initialJars.some((j) => j.id === savedId)) return savedId;
    return initialJars[0]?.id || "";
  });
  const [theme, setThemeState] = useState<ThemeAppearance>(() => loadThemeAppearance());
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => loadSoundEnabled());
  const [hapticEnabled, setHapticEnabledState] = useState<boolean>(() => loadHapticEnabled());
  const [celebrating, setCelebrating] = useState(false);

  // 异步初始化 SQLite / 仓储，若数据库中有更新数据则无缝合并
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await savingsRepo.init();
        const dbJars = await savingsRepo.getJars();
        const dbTxs = await savingsRepo.getTransactions();
        if (mounted && dbJars && dbJars.length > 0) {
          setJars(dbJars);
        }
        if (mounted && dbTxs && dbTxs.length > 0) {
          setTransactions(dbTxs);
        }
      } catch (err) {
        console.warn("[SavingsProvider] Failed to load from repository:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 持久化与主题应用 (同时写入 SQLite 数据库与 LocalStorage 快照)
  useEffect(() => {
    saveJarsToStorage(jars);
    void savingsRepo.saveJars(jars);
  }, [jars]);

  useEffect(() => {
    saveTransactionsToStorage(transactions);
    void savingsRepo.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveThemeAppearance(theme);
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "ivory") {
      root.classList.add("theme-ivory");
      root.classList.remove("theme-dark");
    } else if (theme === "dark") {
      root.classList.add("theme-dark");
      root.classList.remove("theme-ivory");
    } else {
      root.classList.remove("theme-ivory", "theme-dark");
    }
  }, [theme]);

  const activeJarIndex = useMemo(() => {
    const idx = jars.findIndex((j) => j.id === activeJarId);
    return idx >= 0 ? idx : 0;
  }, [jars, activeJarId]);

  const activeJar = useMemo(() => {
    return jars[activeJarIndex] || null;
  }, [jars, activeJarIndex]);

  const activeJarTransactions = useMemo(() => {
    if (!activeJar) return [];
    return transactions
      .filter((t) => t.jarId === activeJar.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, activeJar]);

  // 总体资金统计
  const { totalSaved, totalTarget, overallPercent } = useMemo(() => {
    const saved = jars.reduce((acc, j) => acc + j.currentAmount, 0);
    const target = jars.reduce((acc, j) => acc + j.targetAmount, 0);
    const percent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { totalSaved: saved, totalTarget: target, overallPercent: percent };
  }, [jars]);

  // 智能规划测算
  const smartPlan = useMemo<SmartSavingsPlan | null>(() => {
    if (!activeJar) return null;
    const remainingAmount = Math.max(0, activeJar.targetAmount - activeJar.currentAmount);
    const percent = activeJar.targetAmount > 0
      ? Math.min(100, Math.round((activeJar.currentAmount / activeJar.targetAmount) * 100))
      : 0;

    let daysRemaining = 30; // 默认 30 天
    let isExpired = false;

    if (activeJar.deadline) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const targetDate = new Date(activeJar.deadline);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysRemaining = diffDays;
      isExpired = diffDays <= 0 && remainingAmount > 0;
    }

    const effectiveDays = Math.max(1, daysRemaining);
    const dailyNeeded = remainingAmount > 0 ? Math.ceil(remainingAmount / effectiveDays) : 0;
    const weeklyNeeded = remainingAmount > 0 ? Math.ceil(remainingAmount / Math.max(1, effectiveDays / 7)) : 0;
    const monthlyNeeded = remainingAmount > 0 ? Math.ceil(remainingAmount / Math.max(1, effectiveDays / 30)) : 0;

    let suggestedAction = "按计划稳步储蓄中";
    if (percent >= 100) {
      suggestedAction = "恭喜！储蓄愿望已圆满达成！🎉";
    } else if (isExpired) {
      suggestedAction = "目标日期已过，建议延长日期或加速补齐 ⏱️";
    } else if (daysRemaining <= 7) {
      suggestedAction = `距离截止仅剩 ${daysRemaining} 天，冲刺达成！🚀`;
    } else {
      suggestedAction = `每天只需存入 ${activeJar.currency}${dailyNeeded} 即可按期实现 🎯`;
    }

    return {
      daysRemaining,
      isExpired,
      percent,
      dailyNeeded,
      weeklyNeeded,
      monthlyNeeded,
      suggestedAction,
    };
  }, [activeJar]);

  const setActiveJarId = (id: string) => {
    setActiveJarIdState(id);
    saveActiveJarId(id);
    if (hapticEnabled) void triggerHaptic("light");
  };

  const nextJar = () => {
    if (jars.length <= 1) return;
    const nextIdx = (activeJarIndex + 1) % jars.length;
    setActiveJarId(jars[nextIdx]!.id);
  };

  const prevJar = () => {
    if (jars.length <= 1) return;
    const prevIdx = (activeJarIndex - 1 + jars.length) % jars.length;
    setActiveJarId(jars[prevIdx]!.id);
  };

  // 存入金额
  const deposit = async (amount: number, note?: string): Promise<boolean> => {
    if (!activeJar || amount <= 0) return false;

    if (soundEnabled) soundFx.playCoinDrop();
    if (hapticEnabled) void triggerHaptic("medium");

    const prevAmount = activeJar.currentAmount;
    const nextAmount = prevAmount + amount;
    const isNowCompleted = prevAmount < activeJar.targetAmount && nextAmount >= activeJar.targetAmount;

    setJars((prev) =>
      prev.map((j) => (j.id === activeJar.id ? { ...j, currentAmount: nextAmount } : j))
    );

    const newTx: SavingsTransaction = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      jarId: activeJar.id,
      type: "deposit",
      amount,
      note: note?.trim() || "存入零钱",
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isNowCompleted) {
      setTimeout(() => {
        if (soundEnabled) soundFx.playGoalSuccess();
        if (hapticEnabled) void triggerHaptic("success");
        setCelebrating(true);
      }, 350);
    }

    return true;
  };

  // 取出金额
  const withdraw = async (amount: number, note?: string): Promise<boolean> => {
    if (!activeJar || amount <= 0) return false;
    const available = activeJar.currentAmount;
    const deduct = Math.min(available, amount);
    if (deduct <= 0) return false;

    if (soundEnabled) soundFx.playWithdraw();
    if (hapticEnabled) void triggerHaptic("warning");

    const nextAmount = Math.max(0, available - deduct);
    setJars((prev) =>
      prev.map((j) => (j.id === activeJar.id ? { ...j, currentAmount: nextAmount } : j))
    );

    const newTx: SavingsTransaction = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      jarId: activeJar.id,
      type: "withdraw",
      amount: deduct,
      note: note?.trim() || "取出周转",
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const createJar = (data: Omit<SavingsJar, "id" | "currentAmount" | "createdAt">) => {
    const newJar: SavingsJar = {
      ...data,
      id: "jar-" + Date.now(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setJars((prev) => [...prev, newJar]);
    setActiveJarId(newJar.id);
    if (hapticEnabled) void triggerHaptic("success");
  };

  const updateJar = (updated: SavingsJar) => {
    setJars((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    if (hapticEnabled) void triggerHaptic("light");
  };

  const deleteJar = (id: string) => {
    setJars((prev) => {
      const next = prev.filter((j) => j.id !== id);
      if (activeJarId === id && next.length > 0) {
        setActiveJarIdState(next[0]!.id);
      }
      return next;
    });
    setTransactions((prev) => prev.filter((t) => t.jarId !== id));
    if (hapticEnabled) void triggerHaptic("warning");
  };

  const setTheme = (t: ThemeAppearance) => {
    setThemeState(t);
  };

  const setSoundEnabled = (e: boolean) => {
    setSoundEnabledState(e);
    saveSoundEnabled(e);
  };

  const setHapticEnabled = (e: boolean) => {
    setHapticEnabledState(e);
    saveHapticEnabled(e);
  };

  const stopCelebrating = () => {
    setCelebrating(false);
  };

  return (
    <SavingsContext.Provider
      value={{
        jars,
        activeJar,
        activeJarIndex,
        transactions,
        activeJarTransactions,
        smartPlan,
        totalSaved,
        totalTarget,
        overallPercent,
        isNativeDb: savingsRepo.isNative(),
        theme,
        soundEnabled,
        hapticEnabled,
        celebrating,
        setActiveJarId,
        nextJar,
        prevJar,
        deposit,
        withdraw,
        createJar,
        updateJar,
        deleteJar,
        setTheme,
        setSoundEnabled,
        setHapticEnabled,
        stopCelebrating,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error("useSavings must be used within a SavingsProvider");
  }
  return context;
}
