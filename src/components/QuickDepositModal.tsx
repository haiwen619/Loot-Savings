import React, { useState } from "react";
import type { SavingsJar } from "../types/savings";
import { triggerHaptic } from "../services/haptics";

interface QuickDepositModalProps {
  isOpen: boolean;
  jar: SavingsJar;
  initialType?: "deposit" | "withdraw";
  onClose: () => void;
  onSubmit: (amount: number, type: "deposit" | "withdraw", note?: string) => Promise<boolean>;
  onEditJar?: () => void;
}

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

const PRESET_NOTES = [
  "省下一杯奶茶 🧋",
  "自带午餐便当 🍱",
  "工资定期储蓄 💰",
  "理财收益入账 📈",
  "二手闲置转让 📦",
  "节约一趟打车 🚇",
];

export function QuickDepositModal({
  isOpen,
  jar,
  initialType = "deposit",
  onClose,
  onSubmit,
  onEditJar,
}: QuickDepositModalProps) {
  const [type, setType] = useState<"deposit" | "withdraw">(initialType);
  const [amountStr, setAmountStr] = useState("50");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !jar) return null;

  const currentAmount = parseFloat(amountStr) || 0;
  const isDeposit = type === "deposit";
  const jarName = jar?.name || "存钱罐";
  const currency = jar?.currency || "¥";

  const handleQuickAdd = (delta: number) => {
    void triggerHaptic("light");
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit(currentAmount, type, note);
      if (ok) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="loot-sheet-overlay" onClick={onClose}>
      <div className="loot-sheet-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="loot-sheet-handle" />

        {/* 存取款类型切换 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            background: "rgba(0,0,0,0.05)",
            padding: 4,
            borderRadius: 16,
          }}
        >
          <button
            type="button"
            className={`loot-tab-btn ${isDeposit ? "is-active" : ""}`}
            style={{ height: 38, borderRadius: 12 }}
            onClick={() => {
              setType("deposit");
              void triggerHaptic("light");
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700 }}>+ 存入罐子</span>
          </button>
          <button
            type="button"
            className={`loot-tab-btn ${!isDeposit ? "is-active" : ""}`}
            style={{ height: 38, borderRadius: 12 }}
            onClick={() => {
              setType("withdraw");
              void triggerHaptic("light");
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700 }}>- 应急取出</span>
          </button>
        </div>

        <h3 className="loot-sheet-title">
          {isDeposit ? `向「${jarName}」存入钱币` : `从「${jarName}」取出资金`}
        </h3>

        {/* 快捷金额标签 */}
        <div className="loot-quick-chips">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              className="loot-quick-chip"
              onClick={() => handleQuickAdd(amt)}
            >
              +{amt}
            </button>
          ))}
          <button
            type="button"
            className="loot-quick-chip"
            style={{ opacity: 0.7 }}
            onClick={() => {
              setAmountStr("0");
              void triggerHaptic("light");
            }}
          >
            归零
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 大号金额输入栏 */}
          <div className="loot-input-wrap">
            <span className="loot-input-curr">{currency}</span>
            <input
              type="number"
              className="loot-input-amount"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0"
              step="any"
              min="0"
              inputMode="decimal"
            />
          </div>

          {/* 备注输入框 */}
          <input
            type="text"
            className="loot-input-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加储蓄备注（如：省下一杯奶茶钱）"
          />

          {/* 预设备注标签 */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {PRESET_NOTES.map((pNote) => (
              <button
                key={pNote}
                type="button"
                className="loot-quick-chip"
                style={{ fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap" }}
                onClick={() => {
                  setNote(pNote);
                  void triggerHaptic("light");
                }}
              >
                {pNote}
              </button>
            ))}
          </div>

          {/* 提交主按钮 */}
          <button
            type="submit"
            className="loot-btn-primary"
            style={{ height: 52, marginTop: 6 }}
            disabled={submitting || currentAmount <= 0}
          >
            {submitting
              ? "处理中..."
              : isDeposit
              ? `立即存入 ${currency}${currentAmount || 0} 🪙`
              : `确认取出 ${currency}${currentAmount || 0}`}
          </button>

          {/* 快捷跳转修改目标入口 */}
          {onEditJar && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 6,
                padding: "8px 0 2px",
                fontSize: 12,
                color: "var(--loot-text-muted)",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => {
                onClose();
                onEditJar();
              }}
            >
              <span>想调整此罐的目标金额或名称？</span>
              <span style={{ color: "var(--loot-tint)", fontWeight: 700 }}>
                去修改目标 ➔
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
