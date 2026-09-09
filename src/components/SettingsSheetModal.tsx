import React, { useState } from "react";
import { useSavings } from "../context/SavingsContext";
import { SavingsPlanCard } from "./SavingsPlanCard";
import { TransactionList } from "./TransactionList";
import { triggerHaptic } from "../services/haptics";

interface SettingsSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCurrentJar: () => void;
}

export function SettingsSheetModal({
  isOpen,
  onClose,
  onEditCurrentJar,
}: SettingsSheetModalProps) {
  const {
    activeJar,
    smartPlan,
    activeJarTransactions,
    theme,
    soundEnabled,
    hapticEnabled,
    totalSaved,
    totalTarget,
    overallPercent,
    isNativeDb,
    setTheme,
    setSoundEnabled,
    setHapticEnabled,
  } = useSavings();

  const [sheetTab, setSheetTab] = useState<"plan" | "history" | "settings">("plan");

  if (!isOpen || !activeJar) return null;

  return (
    <div className="loot-sheet-overlay" onClick={onClose}>
      <div
        className="loot-sheet-dialog loot-settings-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部拉手与标题 */}
        <div className="loot-sheet-handle" />
        <div className="loot-sheet-header">
          <div className="loot-settings-tab-pills">
            <button
              type="button"
              className={`loot-pill-tab ${sheetTab === "plan" ? "is-active" : ""}`}
              onClick={() => {
                setSheetTab("plan");
                void triggerHaptic("light");
              }}
            >
              储蓄节奏
            </button>
            <button
              type="button"
              className={`loot-pill-tab ${sheetTab === "history" ? "is-active" : ""}`}
              onClick={() => {
                setSheetTab("history");
                void triggerHaptic("light");
              }}
            >
              流水明细
            </button>
            <button
              type="button"
              className={`loot-pill-tab ${sheetTab === "settings" ? "is-active" : ""}`}
              onClick={() => {
                setSheetTab("settings");
                void triggerHaptic("light");
              }}
            >
              偏好设置
            </button>
          </div>

          <button
            type="button"
            className="loot-btn-circle"
            style={{ width: 32, height: 32, fontSize: 16 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="loot-sheet-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* ════ TAB 1: 储蓄节奏与全局资产 ════ */}
          {sheetTab === "plan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* 全局资产卡片 */}
              <div className="loot-global-stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--loot-text-muted)" }}>全部心愿总资产</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--loot-tint)" }}>
                    达成 {overallPercent}%
                  </span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  ¥{totalSaved.toLocaleString()}
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--loot-text-muted)", marginLeft: 6 }}>
                    / ¥{totalTarget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 当前心愿智能计划卡片 */}
              <SavingsPlanCard jar={activeJar} plan={smartPlan} />

              <button
                type="button"
                className="loot-btn-secondary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  onClose();
                  onEditCurrentJar();
                }}
              >
                ✎ 编辑「{activeJar.name}」目标与参数
              </button>
            </div>
          )}

          {/* ════ TAB 2: 流水账单 ════ */}
          {sheetTab === "history" && (
            <TransactionList transactions={activeJarTransactions} currency={activeJar.currency} />
          )}

          {/* ════ TAB 3: 偏好设置 ════ */}
          {sheetTab === "settings" && (
            <div className="loot-settings-group">
              {/* 外观配色 */}
              <div className="loot-settings-item">
                <div className="loot-settings-label">
                  <span>主题视觉风格</span>
                  <span style={{ fontSize: 11, color: "var(--loot-text-muted)" }}>
                    延续温润象牙白与 Apple 暗夜双质感
                  </span>
                </div>
                <div className="loot-theme-toggle-group">
                  <button
                    type="button"
                    className={`loot-theme-btn ${theme === "ivory" ? "is-selected" : ""}`}
                    onClick={() => setTheme("ivory")}
                  >
                    🌾 象牙白
                  </button>
                  <button
                    type="button"
                    className={`loot-theme-btn ${theme === "dark" ? "is-selected" : ""}`}
                    onClick={() => setTheme("dark")}
                  >
                    🌙 暗夜深黑
                  </button>
                </div>
              </div>

              {/* 音效开关 */}
              <div className="loot-settings-item">
                <div className="loot-settings-label">
                  <span>清脆撞击物理音效</span>
                  <span style={{ fontSize: 11, color: "var(--loot-text-muted)" }}>
                    Web Audio 零延迟硬币撞击玻璃声音
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  style={{ width: 22, height: 22, accentColor: "var(--loot-tint)" }}
                />
              </div>

              {/* 触觉开关 */}
              <div className="loot-settings-item">
                <div className="loot-settings-label">
                  <span>Taptic 触觉震动</span>
                  <span style={{ fontSize: 11, color: "var(--loot-text-muted)" }}>
                    存钱与落币时的震动回馈
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hapticEnabled}
                  onChange={(e) => setHapticEnabled(e.target.checked)}
                  style={{ width: 22, height: 22, accentColor: "var(--loot-tint)" }}
                />
              </div>

              {/* 数据存储引擎 */}
              <div className="loot-settings-item">
                <div className="loot-settings-label">
                  <span>本地数据存储引擎</span>
                  <span style={{ fontSize: 11, color: "var(--loot-text-muted)" }}>
                    {isNativeDb ? "iOS 原生 SQLite 数据库 (ACID 级联保护)" : "Web 本地离线引擎 (支持一键无感迁移)"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--loot-tint)",
                    background: "rgba(34, 197, 94, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                  }}
                >
                  {isNativeDb ? "SQLite 原生" : "Web 引擎"}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="loot-btn-secondary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    onClose();
                    onEditCurrentJar();
                  }}
                >
                  ✎ 编辑当前存钱罐配置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
