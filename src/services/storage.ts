import type { SavingsJar, SavingsTransaction, ThemeAppearance } from "../types/savings";

const STORAGE_KEYS = {
  JARS: "loot_savings_jars_v2",
  TRANSACTIONS: "loot_savings_transactions_v2",
  ACTIVE_JAR: "loot_savings_active_jar_id_v2",
  THEME: "loot_savings_theme_appearance",
  CURRENCY: "loot_savings_default_currency",
  SOUND_ENABLED: "loot_savings_sound_enabled",
  HAPTIC_ENABLED: "loot_savings_haptic_enabled",
};

export const DEFAULT_JARS: SavingsJar[] = [
  {
    id: "jar-car",
    name: "汽车",
    targetAmount: 5000,
    currentAmount: 3000,
    currency: "¥",
    deadline: "2026-10-31",
    themeColor: "emerald",
    emoji: "🚗",
    createdAt: new Date(Date.now() - 36 * 86400000).toISOString(),
  },
  {
    id: "jar-house",
    name: "新房子",
    targetAmount: 100000,
    currentAmount: 38000,
    currency: "¥",
    deadline: "2027-12-31",
    themeColor: "sapphire",
    emoji: "🏠",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "jar-emergency",
    name: "应急基金",
    targetAmount: 20000,
    currentAmount: 12000,
    currency: "¥",
    deadline: "2026-12-25",
    themeColor: "amber",
    emoji: "🛡️",
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "jar-iphone",
    name: "iPhone 17",
    targetAmount: 8999,
    currentAmount: 6200,
    currency: "¥",
    deadline: "2026-09-30",
    themeColor: "violet",
    emoji: "📱",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  }
];


export const DEFAULT_TRANSACTIONS: SavingsTransaction[] = [
  {
    id: "tx-1",
    jarId: "jar-iphone-17",
    type: "deposit",
    amount: 1000,
    note: "月度固定储蓄",
    timestamp: Date.now() - 2 * 86400000,
  },
  {
    id: "tx-2",
    jarId: "jar-iphone-17",
    type: "deposit",
    amount: 200,
    note: "二手旧物出清收入",
    timestamp: Date.now() - 86400000,
  },
  {
    id: "tx-3",
    jarId: "jar-coffee-budget",
    type: "deposit",
    amount: 35,
    note: "自带水杯省下星巴克",
    timestamp: Date.now() - 4 * 3600000,
  }
];

export function loadSavedJars(): SavingsJar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JARS);
    if (!raw) return DEFAULT_JARS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JARS;
  } catch {
    return DEFAULT_JARS;
  }
}

export function saveJarsToStorage(jars: SavingsJar[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(jars));
  } catch {}
}

export function loadSavedTransactions(): SavingsTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return DEFAULT_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TRANSACTIONS;
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactionsToStorage(txs: SavingsTransaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch {}
}

export function loadSavedActiveJarId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_JAR);
}

export function saveActiveJarId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_JAR, id);
  } catch {}
}

export function loadThemeAppearance(): ThemeAppearance {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return theme === "ivory" || theme === "dark" || theme === "light" ? (theme as ThemeAppearance) : "ivory";
}

export function saveThemeAppearance(theme: ThemeAppearance) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

export function loadSoundEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
  return val !== "false";
}

export function saveSoundEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
}

export function loadHapticEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEYS.HAPTIC_ENABLED);
  return val !== "false";
}

export function saveHapticEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.HAPTIC_ENABLED, String(enabled));
}
