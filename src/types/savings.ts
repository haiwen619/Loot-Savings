export type JarThemeColor = 
  | "emerald"   // 翡翠绿 (Apple 经典清新)
  | "amber"     // 琥珀金 (金币与丰收)
  | "sapphire"  // 冰川蓝 (理性与科技)
  | "rose"      // 樱花粉 (心愿与浪漫)
  | "violet"    // 极光紫 (高级与梦想)
  | "coral"     // 活力橙 (热情与目标)
  | "ivory";    // 象牙白温润玉质

export interface JarThemeConfig {
  id: JarThemeColor;
  name: string;
  primary: string;
  gradientStart: string;
  gradientEnd: string;
  liquidColor: string;
  glowColor: string;
}

export const JAR_THEMES: Record<JarThemeColor, JarThemeConfig> = {
  emerald: {
    id: "emerald",
    name: "翡翠绿",
    primary: "#0d9488",
    gradientStart: "#14b8a6",
    gradientEnd: "#0f766e",
    liquidColor: "rgba(20, 184, 166, 0.45)",
    glowColor: "rgba(13, 148, 136, 0.35)",
  },
  amber: {
    id: "amber",
    name: "琥珀金",
    primary: "#f59e0b",
    gradientStart: "#fbbf24",
    gradientEnd: "#d97706",
    liquidColor: "rgba(251, 191, 36, 0.48)",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  sapphire: {
    id: "sapphire",
    name: "宝石蓝",
    primary: "#0284c7",
    gradientStart: "#38bdf8",
    gradientEnd: "#0369a1",
    liquidColor: "rgba(56, 189, 248, 0.45)",
    glowColor: "rgba(2, 132, 199, 0.35)",
  },
  rose: {
    id: "rose",
    name: "玫瑰粉",
    primary: "#e11d48",
    gradientStart: "#fb7185",
    gradientEnd: "#be123c",
    liquidColor: "rgba(251, 113, 133, 0.45)",
    glowColor: "rgba(225, 29, 72, 0.35)",
  },
  violet: {
    id: "violet",
    name: "幻夜紫",
    primary: "#7c3aed",
    gradientStart: "#a78bfa",
    gradientEnd: "#6d28d9",
    liquidColor: "rgba(167, 139, 250, 0.45)",
    glowColor: "rgba(124, 58, 237, 0.35)",
  },
  coral: {
    id: "coral",
    name: "活力珊瑚",
    primary: "#ea580c",
    gradientStart: "#fb923c",
    gradientEnd: "#c2410c",
    liquidColor: "rgba(251, 146, 60, 0.45)",
    glowColor: "rgba(234, 88, 12, 0.35)",
  },
  ivory: {
    id: "ivory",
    name: "温润象牙白",
    primary: "#84735c",
    gradientStart: "#ffffff",
    gradientEnd: "#eee7db",
    liquidColor: "rgba(230, 222, 210, 0.65)",
    glowColor: "rgba(180, 165, 145, 0.35)",
  }
};

export interface SavingsJar {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  themeColor: JarThemeColor;
  emoji: string;
  createdAt: string;
  isArchived?: boolean;
}

export type TransactionType = "deposit" | "withdraw";

export interface SavingsTransaction {
  id: string;
  jarId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  timestamp: number;
}

export interface SmartSavingsPlan {
  daysRemaining: number;
  isExpired: boolean;
  percent: number;
  dailyNeeded: number;
  weeklyNeeded: number;
  monthlyNeeded: number;
  suggestedAction: string;
}

export type ThemeAppearance = "system" | "ivory" | "dark";
