import React, { useState } from "react";
import { SavingsProvider, useSavings } from "./context/SavingsContext";
import { PhoneFrameWrapper } from "./components/PhoneFrameWrapper";
import { CoverflowJarGallery } from "./components/CoverflowJarGallery";
import { QuickDepositModal } from "./components/QuickDepositModal";
import { CreateJarModal } from "./components/CreateJarModal";
import { SettingsSheetModal } from "./components/SettingsSheetModal";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { triggerHaptic } from "./services/haptics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/loot-ios.css";

function AppMain() {
  const {
    jars,
    activeJar,
    activeJarIndex,
    celebrating,
    setActiveJarId,
    deposit,
    withdraw,
    createJar,
    updateJar,
    deleteJar,
    stopCelebrating,
  } = useSavings();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositModalType, setDepositModalType] = useState<"deposit" | "withdraw">("deposit");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  const openDeposit = (type: "deposit" | "withdraw" = "deposit") => {
    setDepositModalType(type);
    setDepositModalOpen(true);
    void triggerHaptic("medium");
  };

  const handleSelectIndex = (idx: number) => {
    if (jars[idx]) {
      setActiveJarId(jars[idx].id);
    }
  };

  if (!activeJar) {
    return (
      <div className="loot-empty-state">
        <span style={{ fontSize: 48 }}>🍯</span>
        <p>暂无存钱罐目标</p>
        <button
          type="button"
          className="loot-btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          + 创建第一个心愿罐
        </button>
      </div>
    );
  }

  return (
    <div className="loot-minimal-viewport">
      {/* 达成 100% 全屏礼花彩带 */}
      <ConfettiEffect active={celebrating} onFinish={stopCelebrating} />

      {/* ══════════════ 1. 极简顶栏 (对齐参考图 2) ══════════════ */}
      <header className="loot-minimal-topbar">
        {/* 左侧：设置齿轮 (进入偏好、储蓄测算与历史明细) */}
        <button
          type="button"
          className="loot-gear-btn"
          onClick={() => {
            setSettingsSheetOpen(true);
            void triggerHaptic("light");
          }}
          title="设置与储蓄洞察"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>

        {/* 右侧：编辑管理胶囊、存钱胶囊与新建加号 */}
        <div className="loot-topbar-right">
          <button
            type="button"
            className="loot-edit-jar-btn"
            onClick={() => {
              setEditModalOpen(true);
              void triggerHaptic("light");
            }}
            title="修改目标金额与存钱罐配置"
          >
            <span>✎ 编辑罐子</span>
          </button>

          <button
            type="button"
            className="loot-add-more-pill"
            onClick={() => openDeposit("deposit")}
          >
            <span>添加进更多的钱</span>
            <span className="loot-pill-arrow">➔</span>
          </button>

          <button
            type="button"
            className="loot-round-plus-btn"
            onClick={() => {
              setCreateModalOpen(true);
              void triggerHaptic("medium");
            }}
            title="新建心愿存钱罐"
          >
            +
          </button>
        </div>
      </header>

      {/* ══════════════ 2. 核心居中舞台: 3D Coverflow 存钱罐 ══════════════ */}
      <main className="loot-minimal-center-stage">
        <CoverflowJarGallery
          jars={jars}
          currentIndex={activeJarIndex}
          onSelectIndex={handleSelectIndex}
          onTapJar={() => openDeposit("deposit")}
        />

        {/* ══════════════ 3. 双行金额展示与可编辑交互 ══════════════ */}
        <div className="loot-minimal-amount-block">
          {/* 当前已存金额 (点击存入/取出) */}
          <div
            className="loot-current-amount"
            onClick={() => openDeposit("deposit")}
            title="点击存入零钱或取出资金"
          >
            {activeJar.currency}{activeJar.currentAmount.toLocaleString()}
          </div>

          {/* 目标储蓄金额 (点击直接修改目标) */}
          <div
            className="loot-target-amount-row"
            onClick={(e) => {
              e.stopPropagation();
              setEditModalOpen(true);
              void triggerHaptic("light");
            }}
            title="点击修改目标储蓄金额"
          >
            <span className="loot-target-amount">
              目标 {activeJar.currency}{activeJar.targetAmount.toLocaleString()}
            </span>
            <span className="loot-target-edit-badge">✎ 修改目标</span>
          </div>

          {/* 快捷操作胶囊栏 (让存钱、取钱、改目标与删罐一目了然) */}
          <div className="loot-stage-actions">
            <button
              type="button"
              className="loot-stage-action-pill"
              onClick={() => openDeposit("deposit")}
            >
              + 存入
            </button>
            <button
              type="button"
              className="loot-stage-action-pill"
              onClick={() => openDeposit("withdraw")}
            >
              - 取出
            </button>
            <button
              type="button"
              className="loot-stage-action-pill is-edit"
              onClick={() => {
                setEditModalOpen(true);
                void triggerHaptic("light");
              }}
            >
              🎯 调整目标 / 管理
            </button>
          </div>
        </div>
      </main>

      {/* ══════════════ 4. 浮动模态抽屉 ══════════════ */}
      {/* 快捷存取款 Action Sheet */}
      <QuickDepositModal
        isOpen={depositModalOpen}
        jar={activeJar}
        initialType={depositModalType}
        onClose={() => setDepositModalOpen(false)}
        onEditJar={() => setEditModalOpen(true)}
        onSubmit={async (amount, type, note) => {
          if (type === "deposit") {
            return await deposit(amount, note);
          } else {
            return await withdraw(amount, note);
          }
        }}
      />

      {/* 新建存钱罐弹窗 */}
      <CreateJarModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createJar}
      />

      {/* 编辑已有存钱罐弹窗 (包含目标金额调整与删除功能) */}
      <CreateJarModal
        isOpen={editModalOpen}
        initialJar={activeJar}
        onClose={() => setEditModalOpen(false)}
        onSubmit={() => {}}
        onUpdate={updateJar}
        onDelete={deleteJar}
      />

      {/* 设置与洞察抽屉 (储蓄规划、明细流水、偏好设置) */}
      <SettingsSheetModal
        isOpen={settingsSheetOpen}
        onClose={() => setSettingsSheetOpen(false)}
        onEditCurrentJar={() => setEditModalOpen(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SavingsProvider>
        <PhoneFrameWrapper>
          <AppMain />
        </PhoneFrameWrapper>
      </SavingsProvider>
    </ErrorBoundary>
  );
}

export default App;
