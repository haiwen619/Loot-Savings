import React, { useEffect, useState } from "react";

interface PhoneFrameWrapperProps {
  children: React.ReactNode;
}

const checkMobile = () => {
  if (typeof window === "undefined") return false;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent
  );
  return isMobileUA || window.innerWidth <= 640;
};

export function PhoneFrameWrapper({ children }: PhoneFrameWrapperProps) {
  const [isMobileScreen, setIsMobileScreen] = useState(checkMobile);
  const [standaloneMode, setStandaloneMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(checkMobile());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const timeStr = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 如果是在移动设备/小屏幕上，直接以全屏原生模式展示
  if (isMobileScreen || standaloneMode) {
    return (
      <div className="loot-phone-frame is-standalone">
        {children}
      </div>
    );
  }

  return (
    <div className="loot-desktop-shell">
      {/* 桌面预览顶层工具栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          color: "#94a3b8",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span>📱 iPhone 16 Pro 仿真模式</span>
        <button
          type="button"
          onClick={() => setStandaloneMode(true)}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#e2e8f0",
            padding: "4px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          切换全屏预览 ↗
        </button>
      </div>

      <div className="loot-phone-frame">
        {/* 灵动岛 (Dynamic Island) */}
        <div className="loot-island">
          <div className="loot-island__lens" />
          <div className="loot-island__sensor" />
        </div>

        {/* 顶部 iOS 原生状态栏 */}
        <div className="loot-status-bar">
          <span>{timeStr}</span>
          <div className="loot-status-bar__icons">
            <span>5G</span>
            <span>􀙇</span>
            <span>100% 􀛨</span>
          </div>
        </div>

        {/* 核心应用视口 */}
        {children}

        {/* 底部 iOS Home Indicator 小黑条 */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 134,
            height: 5,
            background: "var(--loot-text-primary)",
            opacity: 0.25,
            borderRadius: 3,
            pointerEvents: "none",
            zIndex: 101,
          }}
        />
      </div>
    </div>
  );
}
