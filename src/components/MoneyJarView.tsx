import React, { useMemo, useState } from "react";
import type { SavingsJar } from "../types/savings";
import { JAR_THEMES } from "../types/savings";
import { soundFx } from "../services/audio";
import { triggerHaptic } from "../services/haptics";

interface MoneyJarViewProps {
  jar: SavingsJar;
  isCenter?: boolean;
  onTap?: () => void;
  style?: React.CSSProperties;
}

interface BanknoteItem {
  x: number;
  y: number;
  rot: number;
  scale: number;
  denom: string;
  type: "red" | "green" | "amber" | "blue";
}

export function MoneyJarView({
  jar,
  isCenter = true,
  onTap,
  style,
}: MoneyJarViewProps) {
  const [jiggling, setJiggling] = useState(false);

  const themeConfig = JAR_THEMES[jar.themeColor] || JAR_THEMES.emerald;

  const percent = useMemo(() => {
    if (!jar.targetAmount || jar.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));
  }, [jar.currentAmount, jar.targetAmount]);

  // 根据进度计算纸币数量 (0% -> 0 张, 100% -> 12 张)
  const bundleCount = useMemo(() => {
    if (percent <= 0) return 0;
    if (percent < 15) return 2;
    if (percent < 35) return 4;
    if (percent < 60) return 7;
    if (percent < 85) return 9;
    return 12;
  }, [percent]);

  // 钞票堆叠数据（包含不同面额颜色、防伪印戳与安全落点，严格收拢在瓶身内壁范围内）
  const cashBundles = useMemo<BanknoteItem[]>(() => {
    const bundles: BanknoteItem[] = [
      // 第一层（底部基础，铺在金币之上）
      { x: 72, y: 198, rot: -3, scale: 1, denom: "100", type: "red" },
      { x: 104, y: 200, rot: 3, scale: 1.02, denom: "50", type: "green" },
      { x: 128, y: 196, rot: -2, scale: 0.98, denom: "100", type: "red" },
      // 第二层
      { x: 76, y: 178, rot: 5, scale: 1, denom: "20", type: "amber" },
      { x: 118, y: 176, rot: -5, scale: 1.02, denom: "100", type: "red" },
      { x: 96, y: 164, rot: 2, scale: 1.04, denom: "50", type: "green" },
      // 第三层
      { x: 74, y: 154, rot: -6, scale: 0.98, denom: "10", type: "blue" },
      { x: 126, y: 152, rot: 6, scale: 0.99, denom: "100", type: "red" },
      { x: 90, y: 138, rot: -4, scale: 1.01, denom: "50", type: "green" },
      // 第四层
      { x: 114, y: 134, rot: 5, scale: 1, denom: "20", type: "amber" },
      { x: 78, y: 118, rot: 6, scale: 0.96, denom: "100", type: "red" },
      { x: 120, y: 116, rot: -5, scale: 0.98, denom: "50", type: "green" },
    ];
    return bundles.slice(0, bundleCount);
  }, [bundleCount]);

  // 金币与银币硬币分布（饱满沉淀在瓶底）
  const coins = useMemo(() => {
    if (percent <= 0) return [];
    const arr = [
      { cx: 80, cy: 218, r: 12, fill: "gold", rot: 12, label: jar.currency || "¥" },
      { cx: 108, cy: 216, r: 13, fill: "gold", rot: -8, label: jar.currency || "¥" },
      { cx: 132, cy: 218, r: 10, fill: "silver", rot: 15, label: "★" },
      { cx: 62, cy: 218, r: 9, fill: "gold", rot: -14, label: "5" },
      { cx: 122, cy: 224, r: 7.5, fill: "silver", rot: 6, label: "1" },
    ];
    if (percent < 30) return arr.slice(0, 2);
    return arr;
  }, [percent, jar.currency]);

  // 心愿物品 Emoji 坐落的高度 (随钞票堆升高而上升)
  const emojiY = useMemo(() => {
    if (bundleCount === 0) return 185;
    if (bundleCount <= 3) return 160;
    if (bundleCount <= 6) return 135;
    if (bundleCount <= 9) return 110;
    return 88;
  }, [bundleCount]);

  const handleJarClick = (e: React.MouseEvent) => {
    if (!isCenter) return;
    e.stopPropagation();
    soundFx.playCoinDrop();
    void triggerHaptic("light");
    setJiggling(true);
    setTimeout(() => setJiggling(false), 380);
    onTap?.();
  };

  return (
    <div
      className={`loot-clean-jar ${jiggling ? "loot-jar-jiggle" : ""}`}
      onClick={handleJarClick}
      style={{
        ...style,
        "--accent-color": themeConfig.primary,
      } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 200 250"
        className="loot-clean-jar__svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 瓶体内腔绝对防漏裁切路径 (Strict Inner Cavity Boundary) */}
          <clipPath id={`jar-inner-clip-${jar.id}`}>
            <path
              d="
                M 72, 24
                C 72, 32  48, 42  42, 70
                L 39, 190
                C 39, 218 58, 232 100, 232
                C 142, 232 161, 218 161, 190
                L 158, 70
                C 152, 42  128, 32 128, 24
                Z
              "
            />
          </clipPath>

          {/* 玻璃瓶柔和光影渐变 */}
          <linearGradient id={`jar-glass-grad-${jar.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(219, 234, 254, 0.45)" />
            <stop offset="15%" stopColor="rgba(239, 246, 255, 0.18)" />
            <stop offset="85%" stopColor="rgba(239, 246, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(191, 219, 254, 0.4)" />
          </linearGradient>

          {/* 玻璃内部柔和背光 */}
          <radialGradient id={`jar-inner-glow-${jar.id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="60%" stopColor="rgba(240, 249, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(219, 234, 254, 0.04)" />
          </radialGradient>

          {/* 玻璃瓶身外轮廓微蓝边缘 */}
          <linearGradient id={`jar-stroke-${jar.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(186, 216, 250, 0.75)" />
            <stop offset="40%" stopColor="rgba(147, 197, 253, 0.5)" />
            <stop offset="100%" stopColor="rgba(191, 219, 254, 0.8)" />
          </linearGradient>

          {/* 1. 百元红钞渐变 (尊贵珊瑚红，防伪细纹层次) */}
          <linearGradient id="note-grad-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="45%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>

          {/* 2. 五十元绿钞渐变 (经典钞票翠绿) */}
          <linearGradient id="note-grad-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="45%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* 3. 二十元暖金钞渐变 (琥珀金黄) */}
          <linearGradient id="note-grad-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* 4. 十元晴空蓝钞渐变 (淡雅海蓝) */}
          <linearGradient id="note-grad-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="45%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* 金币径向浮雕光影 */}
          <radialGradient id="gold-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFF7A1" />
            <stop offset="40%" stopColor="#F6C843" />
            <stop offset="85%" stopColor="#E2A61B" />
            <stop offset="100%" stopColor="#A86F07" />
          </radialGradient>

          {/* 银币径向光影 */}
          <radialGradient id="silver-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E2E8F0" />
            <stop offset="85%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </radialGradient>

          {/* 瓶身左侧柔光反光条 */}
          <linearGradient id={`jar-sheen-${jar.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.65)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>

        {/* ════ 1. 瓶身背景底色 ════ */}
        <path
          d="
            M 70, 20
            C 70, 28  46, 38  40, 68
            L 36, 192
            C 36, 222 56, 236 100, 236
            C 144, 236 164, 222 164, 192
            L 160, 68
            C 154, 38  130, 28 130, 20
            Z
          "
          fill={`url(#jar-inner-glow-${jar.id})`}
        />

        {/* ════ 2. 罐内钞票与硬币（带瓶内壁防漏裁切 clipPath） ════ */}
        <g className="loot-jar-money-group" clipPath={`url(#jar-inner-clip-${jar.id})`}>
          {/* 多彩真实折叠钞票 */}
          {cashBundles.map((b, idx) => {
            const gradId =
              b.type === "red"
                ? "url(#note-grad-red)"
                : b.type === "green"
                ? "url(#note-grad-green)"
                : b.type === "amber"
                ? "url(#note-grad-amber)"
                : "url(#note-grad-blue)";

            const strokeColor =
              b.type === "red"
                ? "#881337"
                : b.type === "green"
                ? "#064E3B"
                : b.type === "amber"
                ? "#78350F"
                : "#1E3A8A";

            return (
              <g
                key={idx}
                transform={`translate(${b.x}, ${b.y}) rotate(${b.rot}) scale(${b.scale})`}
              >
                {/* 纸币底层厚度阴影 */}
                <rect
                  x="-20"
                  y="-6"
                  width="40"
                  height="14"
                  rx="2.5"
                  fill="rgba(0,0,0,0.2)"
                  transform="translate(0, 2)"
                />

                {/* 纸币本体（长方形微圆角折叠纸币形态，彻底告别药丸感） */}
                <rect
                  x="-21"
                  y="-7.5"
                  width="42"
                  height="15"
                  rx="2.5"
                  fill={gradId}
                  stroke={strokeColor}
                  strokeWidth="0.8"
                />

                {/* 纸币内边缘防伪印边框 */}
                <rect
                  x="-19"
                  y="-6"
                  width="38"
                  height="12"
                  rx="1.5"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.6"
                />

                {/* 左右两侧货币符号与细纹刻线 */}
                <text
                  x="-13"
                  y="2"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="bold"
                  fill="rgba(255,255,255,0.9)"
                  style={{ userSelect: "none" }}
                >
                  {jar.currency || "¥"}
                </text>
                <text
                  x="13"
                  y="2"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="bold"
                  fill="rgba(255,255,255,0.9)"
                  style={{ userSelect: "none" }}
                >
                  {jar.currency || "¥"}
                </text>

                {/* 纸币中央封条扎带 (扎带带有面额标识) */}
                <rect
                  x="-7"
                  y="-7.5"
                  width="14"
                  height="15"
                  rx="1"
                  fill="#FFFDF8"
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth="0.5"
                />
                {/* 扎带上的金/红安全线 */}
                <line
                  x1="-7"
                  y1="-5"
                  x2="7"
                  y2="-5"
                  stroke={b.type === "red" ? "#E11D48" : "#F59E0B"}
                  strokeWidth="0.8"
                />
                {/* 扎带上的大面额印戳 (100 / 50 / 20 / 10) */}
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="900"
                  fill="#1E293B"
                  style={{ userSelect: "none", letterSpacing: "-0.3px" }}
                >
                  {b.denom}
                </text>
              </g>
            );
          })}

          {/* 瓶底立体浮雕金银硬币 */}
          {coins.map((c, idx) => (
            <g key={idx} transform={`rotate(${c.rot}, ${c.cx}, ${c.cy})`}>
              {/* 硬币阴影 */}
              <circle
                cx={c.cx}
                cy={c.cy + 1.2}
                r={c.r}
                fill="rgba(0,0,0,0.18)"
              />
              {/* 硬币外圈 */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                fill={c.fill === "silver" ? "url(#silver-grad)" : "url(#gold-grad)"}
                stroke={c.fill === "silver" ? "#64748B" : "#A86F07"}
                strokeWidth="0.9"
              />
              {/* 内凹齿轮圆环线 */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r - 2.2}
                fill="none"
                stroke={c.fill === "silver" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.5)"}
                strokeWidth="0.7"
              />
              {c.label && (
                <text
                  x={c.cx}
                  y={c.cy + 3.2}
                  textAnchor="middle"
                  fontSize={c.r > 10 ? "8.5" : "7"}
                  fontWeight="bold"
                  fill={c.fill === "silver" ? "#334155" : "#78350F"}
                  style={{ userSelect: "none" }}
                >
                  {c.label}
                </text>
              )}
            </g>
          ))}

          {/* 钞票堆上方的愿望大 Emoji（如 🚗 汽车） */}
          <text
            x="100"
            y={emojiY}
            textAnchor="middle"
            fontSize="36"
            className="loot-jar-emoji"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
              userSelect: "none",
            }}
          >
            {jar.emoji || "🍯"}
          </text>
        </g>

        {/* ════ 3. 玻璃瓶透明轮廓外壁与瓶口 ════ */}
        {/* 瓶口顶部椭圆边缘 */}
        <ellipse
          cx="100"
          cy="18"
          rx="34"
          ry="7"
          fill="rgba(224, 242, 254, 0.35)"
          stroke={`url(#jar-stroke-${jar.id})`}
          strokeWidth="2.5"
        />
        {/* 瓶口内凹阴影 */}
        <ellipse
          cx="100"
          cy="18"
          rx="26"
          ry="4.5"
          fill="none"
          stroke="rgba(147, 197, 253, 0.4)"
          strokeWidth="1.2"
        />

        {/* 瓶身外层晶莹轮廓 */}
        <path
          d="
            M 70, 20
            C 70, 28  46, 38  40, 68
            L 36, 192
            C 36, 222 56, 236 100, 236
            C 144, 236 164, 222 164, 192
            L 160, 68
            C 154, 38  130, 28 130, 20
          "
          fill={`url(#jar-glass-grad-${jar.id})`}
          stroke={`url(#jar-stroke-${jar.id})`}
          strokeWidth="3.2"
        />

        {/* 左侧高光倒影弧线（通透玻璃感） */}
        <path
          d="
            M 48, 72
            L 45, 186
            C 45, 198 52, 214 68, 222
            C 56, 214 51, 198 51, 184
            L 54, 74
            C 55, 58 64, 46 72, 38
            Z
          "
          fill={`url(#jar-sheen-${jar.id})`}
          opacity="0.8"
        />

        {/* 右侧微光反光线 */}
        <path
          d="M 152, 76 L 155, 184"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 瓶底厚重玻璃聚光折射 */}
        <path
          d="M 46, 200 C 52, 224 72, 231 100, 231 C 128, 231 148, 224 154, 200 C 146, 218 126, 224 100, 224 C 74, 224 54, 218 46, 200 Z"
          fill="rgba(219, 234, 254, 0.5)"
        />

        {/* ════ 4. 瓶身中央愿望大字（增强文字可读性） ════ */}
        <text
          x="100"
          y="156"
          textAnchor="middle"
          className="loot-jar-title-text"
          style={{
            fontSize: jar.name.length > 5 ? "21px" : "27px",
            fontWeight: 800,
            fill: "var(--loot-jar-title-color)",
            letterSpacing: "1px",
            userSelect: "none",
            pointerEvents: "none",
            filter: "drop-shadow(0 1px 4px rgba(255,255,255,0.9)) drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
          }}
        >
          {jar.name}
        </text>
      </svg>
    </div>
  );
}
