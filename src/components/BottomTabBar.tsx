import React from "react";
import { triggerHaptic } from "../services/haptics";

export type TabKey = "jars" | "insights" | "history" | "settings";

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs = [
    { key: "jars" as TabKey, label: "存钱罐", icon: "🍯" },
    { key: "insights" as TabKey, label: "规划与统计", icon: "📊" },
    { key: "history" as TabKey, label: "明细流水", icon: "📜" },
    { key: "settings" as TabKey, label: "偏好设置", icon: "⚙️" },
  ];

  return (
    <nav className="loot-tab-bar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`loot-tab-btn ${isActive ? "is-active" : ""}`}
            onClick={() => {
              onTabChange(tab.key);
              void triggerHaptic("light");
            }}
          >
            <span className="loot-tab-btn__icon">{tab.icon}</span>
            <span className="loot-tab-btn__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
