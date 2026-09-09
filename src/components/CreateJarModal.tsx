import React, { useEffect, useState } from "react";
import type { JarThemeColor, SavingsJar } from "../types/savings";
import { JAR_THEMES } from "../types/savings";
import { triggerHaptic } from "../services/haptics";

interface CreateJarModalProps {
  isOpen: boolean;
  initialJar?: SavingsJar | null;
  onClose: () => void;
  onSubmit: (data: Omit<SavingsJar, "id" | "currentAmount" | "createdAt">) => void;
  onUpdate?: (jar: SavingsJar) => void;
  onDelete?: (id: string) => void;
}

const EMOJI_OPTIONS = [
  "📱", "💻", "🎮", "✈️", "🏖️", "🚗", "🏠", "💍",
  "🎒", "🎓", "🎸", "⌚", "📷", "🍵", "☕", "🍣",
  "🐶", "🐱", "🚲", "🎿", "🏕️", "🛡️", "💰", "🎁",
];

const CURRENCIES = ["¥", "$", "€", "£"];

export function CreateJarModal({
  isOpen,
  initialJar,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
}: CreateJarModalProps) {
  const isEditing = Boolean(initialJar);

  const [name, setName] = useState(initialJar?.name || "");
  const [targetAmount, setTargetAmount] = useState(initialJar ? String(initialJar.targetAmount) : "3000");
  const [currency, setCurrency] = useState(initialJar?.currency || "¥");
  const [deadline, setDeadline] = useState(initialJar?.deadline || "");
  const [themeColor, setThemeColor] = useState<JarThemeColor>(initialJar?.themeColor || "emerald");
  const [emoji, setEmoji] = useState(initialJar?.emoji || "📱");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当窗口打开或传入的 initialJar 切换时，严格同步表单内部状态
  useEffect(() => {
    if (isOpen) {
      setName(initialJar?.name || "");
      setTargetAmount(initialJar ? String(initialJar.targetAmount) : "3000");
      setCurrency(initialJar?.currency || "¥");
      setDeadline(initialJar?.deadline || "");
      setThemeColor(initialJar?.themeColor || "emerald");
      setEmoji(initialJar?.emoji || "📱");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialJar]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(targetAmount) || 1000;
    if (!name.trim()) return;

    if (isEditing && initialJar && onUpdate) {
      onUpdate({
        ...initialJar,
        name: name.trim(),
        targetAmount: amountNum,
        currency,
        deadline: deadline || undefined,
        themeColor,
        emoji,
      });
    } else {
      onSubmit({
        name: name.trim(),
        targetAmount: amountNum,
        currency,
        deadline: deadline || undefined,
        themeColor,
        emoji,
      });
    }
    onClose();
  };

  return (
    <div className="loot-sheet-overlay" onClick={onClose}>
      <div className="loot-sheet-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="loot-sheet-handle" />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 className="loot-sheet-title">
            {isEditing ? `编辑「${initialJar?.name}」配置` : "新建愿望存钱罐"}
          </h3>
          <button
            type="button"
            className="loot-btn-circle"
            style={{ width: 32, height: 32, fontSize: 13 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* ════ 二次确认删除状态 ════ */}
        {showDeleteConfirm ? (
          <div className="loot-delete-confirm-box">
            <div style={{ fontSize: 36, marginBottom: 8 }}>🗑️</div>
            <h4 style={{ fontSize: 17, fontWeight: 800, color: "#ef4444" }}>
              确认永久删除此存钱罐？
            </h4>
            <p style={{ fontSize: 13, color: "var(--loot-text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              确定要删除愿望罐<strong>「{initialJar?.name}」</strong>吗？
              {initialJar && initialJar.currentAmount > 0 && (
                <span style={{ display: "block", marginTop: 4, color: "#ef4444", fontWeight: 700 }}>
                  ⚠️ 当前罐内尚有 {initialJar.currency}{initialJar.currentAmount.toLocaleString()} 储蓄资金！
                </span>
              )}
              删除后此罐及其所有存取明细将被永久清除，无法恢复。
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18, width: "100%" }}>
              <button
                type="button"
                className="loot-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="loot-btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  if (initialJar && onDelete) {
                    onDelete(initialJar.id);
                    void triggerHaptic("warning");
                    onClose();
                  }
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        ) : (
          /* ════ 常规编辑/创建表单 ════ */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* 编辑时显示当前进度摘要 */}
            {isEditing && initialJar && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--loot-text-secondary)" }}>
                  当前已存：<strong style={{ color: "var(--loot-tint)", fontSize: 14 }}>{initialJar.currency}{initialJar.currentAmount.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 12, color: "var(--loot-text-muted)" }}>
                  达成率：{Math.min(100, Math.round((initialJar.currentAmount / (parseFloat(targetAmount) || 1)) * 100))}%
                </div>
              </div>
            )}

            {/* 图标与罐名 */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: JAR_THEMES[themeColor]?.liquidColor || "rgba(20, 184, 166, 0.2)",
                  border: `2px solid ${JAR_THEMES[themeColor]?.primary || "#14b8a6"}`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {emoji}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--loot-text-muted)" }}>
                  储蓄愿望名称
                </label>
                <input
                  type="text"
                  className="loot-input-note"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：买 iPhone 17、去冰岛旅行"
                  required
                />
              </div>
            </div>

            {/* 目标储蓄金额与货币 (核心功能：可随时调整) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--loot-text-primary)" }}>
                  🎯 目标储蓄金额 (可随时修改调整)
                </label>
                {isEditing && (
                  <span style={{ fontSize: 10, color: "var(--loot-tint)", fontWeight: 600 }}>
                    支持随时上调或下调目标
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: 60,
                    height: 44,
                    borderRadius: 14,
                    border: "1px solid var(--loot-border)",
                    background: "var(--loot-card-solid)",
                    color: "var(--loot-text-primary)",
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="loot-input-note"
                  style={{ flex: 1, fontSize: 18, fontWeight: 700 }}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="any"
                  required
                />
              </div>
            </div>

            {/* 快捷推荐目标额度调整标签 */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {[1000, 3000, 5000, 10000, 20000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="loot-quick-chip"
                  style={{ fontSize: 11, padding: "4px 8px" }}
                  onClick={() => {
                    setTargetAmount(String(amt));
                    void triggerHaptic("light");
                  }}
                >
                  {currency}{amt >= 10000 ? `${amt / 10000}万` : amt}
                </button>
              ))}
            </div>

            {/* 目标截止日期 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--loot-text-muted)" }}>
                目标达成日期（可选，用于自动测算每日储蓄额）
              </label>
              <input
                type="date"
                className="loot-input-note"
                style={{ marginTop: 4 }}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* 罐体配色主题 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--loot-text-muted)" }}>
                瓶身拟物主题色
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 6, overflowX: "auto", paddingBottom: 4 }}>
                {(Object.keys(JAR_THEMES) as JarThemeColor[]).map((cKey) => {
                  const cfg = JAR_THEMES[cKey];
                  const active = themeColor === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => {
                        setThemeColor(cKey);
                        void triggerHaptic("light");
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: cfg.primary,
                        border: active ? "3px solid #ffffff" : "2px solid transparent",
                        boxShadow: active ? `0 0 0 2px ${cfg.primary}, 0 4px 10px rgba(0,0,0,0.2)` : "none",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.18s ease",
                      }}
                      title={cfg.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 贴纸 Emoji 选择 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--loot-text-muted)" }}>
                专属标签贴纸
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 6,
                  marginTop: 6,
                  maxHeight: 100,
                  overflowY: "auto",
                  background: "rgba(0,0,0,0.02)",
                  padding: 6,
                  borderRadius: 14,
                }}
              >
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setEmoji(em);
                      void triggerHaptic("light");
                    }}
                    style={{
                      height: 34,
                      border: emoji === em ? "1.5px solid var(--loot-tint)" : "1px solid transparent",
                      background: emoji === em ? "rgba(13, 148, 136, 0.15)" : "transparent",
                      borderRadius: 10,
                      fontSize: 18,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* 底部操作栏 */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {isEditing && onDelete && (
                <button
                  type="button"
                  className="loot-btn-secondary"
                  style={{
                    color: "#ef4444",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    background: "rgba(239, 68, 68, 0.06)",
                    padding: "0 16px",
                  }}
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    void triggerHaptic("medium");
                  }}
                >
                  🗑️ 删除罐子
                </button>
              )}
              <button
                type="submit"
                className="loot-btn-primary"
                style={{ flex: 1 }}
                disabled={!name.trim()}
              >
                {isEditing ? "保存修改配置" : "立即创建存钱罐"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
