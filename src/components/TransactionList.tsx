import React from "react";
import type { SavingsTransaction } from "../types/savings";

interface TransactionListProps {
  transactions: SavingsTransaction[];
  currency?: string;
  title?: string;
}

export function TransactionList({
  transactions,
  currency = "¥",
  title = "储蓄流水明细",
}: TransactionListProps) {
  function formatTime(ts: number) {
    const d = new Date(ts);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${m}月${day}日 ${h}:${min}`;
  }

  return (
    <div className="loot-tx-card">
      <div className="loot-tx-header">{title} ({transactions.length})</div>

      {transactions.length === 0 ? (
        <div
          style={{
            padding: "24px 10px",
            textAlign: "center",
            color: "var(--loot-text-muted)",
            fontSize: 13,
          }}
        >
          暂无存取记录，快投下第一枚金币吧 🪙
        </div>
      ) : (
        <div className="loot-tx-list">
          {transactions.map((tx) => {
            const isDeposit = tx.type === "deposit";
            return (
              <div key={tx.id} className="loot-tx-item">
                <div className="loot-tx-left">
                  <div className={`loot-tx-icon ${tx.type}`}>
                    {isDeposit ? "🪙" : "💸"}
                  </div>
                  <div className="loot-tx-details">
                    <span className="loot-tx-note">{tx.note || (isDeposit ? "存入零钱" : "取出周转")}</span>
                    <span className="loot-tx-time">{formatTime(tx.timestamp)}</span>
                  </div>
                </div>

                <div className={`loot-tx-amount ${tx.type}`}>
                  {isDeposit ? "+" : "-"}{currency}{tx.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
