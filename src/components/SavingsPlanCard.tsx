import React from "react";
import type { SavingsJar, SmartSavingsPlan } from "../types/savings";

interface SavingsPlanCardProps {
  jar: SavingsJar;
  plan: SmartSavingsPlan | null;
}

export function SavingsPlanCard({ jar, plan }: SavingsPlanCardProps) {
  if (!plan) return null;

  const remainingAmount = Math.max(0, jar.targetAmount - jar.currentAmount);

  return (
    <div className="loot-plan-card">
      <div className="loot-plan-head">
        <span className="loot-plan-title">
          <span>🎯</span>
          <span>智能储蓄节奏测算</span>
        </span>
        <span className="loot-plan-days">
          {plan.percent >= 100
            ? "已达成"
            : plan.isExpired
            ? "已超期"
            : `剩 ${plan.daysRemaining} 天`}
        </span>
      </div>

      <div className="loot-plan-grid">
        <div className="loot-plan-item">
          <span className="loot-plan-item__label">尚缺金额</span>
          <span className="loot-plan-item__val" style={{ color: "#f59e0b" }}>
            {jar.currency}{remainingAmount.toLocaleString()}
          </span>
        </div>

        <div className="loot-plan-item">
          <span className="loot-plan-item__label">建议日均储蓄</span>
          <span className="loot-plan-item__val" style={{ color: "var(--loot-tint)" }}>
            {jar.currency}{plan.dailyNeeded.toLocaleString()}/天
          </span>
        </div>

        <div className="loot-plan-item">
          <span className="loot-plan-item__label">建议周度储蓄</span>
          <span className="loot-plan-item__val">
            {jar.currency}{plan.weeklyNeeded.toLocaleString()}/周
          </span>
        </div>

        <div className="loot-plan-item">
          <span className="loot-plan-item__label">目标达成期</span>
          <span className="loot-plan-item__val" style={{ fontSize: 12 }}>
            {jar.deadline || "按日推进"}
          </span>
        </div>
      </div>

      <div className="loot-plan-tip">
        💡 {plan.suggestedAction}
      </div>
    </div>
  );
}
