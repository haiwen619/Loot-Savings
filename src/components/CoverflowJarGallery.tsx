import React, { useRef, useState } from "react";
import type { SavingsJar } from "../types/savings";
import { MoneyJarView } from "./MoneyJarView";
import { triggerHaptic } from "../services/haptics";

interface CoverflowJarGalleryProps {
  jars: SavingsJar[];
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  onTapJar: () => void;
}

export function CoverflowJarGallery({
  jars,
  currentIndex,
  onSelectIndex,
  onTapJar,
}: CoverflowJarGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);

  // 触摸与鼠标拖拽事件处理
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    hasMovedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 8) {
      hasMovedRef.current = true;
    }
    setDragOffset(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 50 && currentIndex > 0) {
        onSelectIndex(currentIndex - 1);
        void triggerHaptic("light");
      } else if (dragOffset < -50 && currentIndex < jars.length - 1) {
        onSelectIndex(currentIndex + 1);
        void triggerHaptic("light");
      }
    }
    setDragOffset(0);
  };

  if (!jars || jars.length === 0) return null;

  return (
    <div className="loot-coverflow-wrapper">
      <div
        ref={containerRef}
        className="loot-coverflow-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {jars.map((jar, idx) => {
          const diff = idx - currentIndex;
          // 只渲染当前以及左右相邻的罐子以获得最佳性能与干净构图
          if (Math.abs(diff) > 1) return null;

          const isCenter = diff === 0;
          // 计算 3D 转换位置
          const baseOffset = diff * 125;
          const currentOffset = baseOffset + (isDragging ? dragOffset : 0);
          const scale = isCenter ? (isDragging ? 0.98 : 1) : 0.76;
          const opacity = isCenter ? 1 : 0.35;
          const zIndex = isCenter ? 10 : 2;

          return (
            <div
              key={jar.id}
              className={`loot-coverflow-item ${isCenter ? "is-center" : "is-side"}`}
              style={{
                transform: `translateX(calc(-50% + ${currentOffset}px)) scale(${scale})`,
                opacity,
                zIndex,
                transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (hasMovedRef.current) return;
                if (!isCenter) {
                  onSelectIndex(idx);
                  void triggerHaptic("light");
                } else {
                  onTapJar();
                }
              }}
            >
              <MoneyJarView
                jar={jar}
                isCenter={isCenter}
                onTap={isCenter ? onTapJar : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* 底部点状指示器 (仅在多罐时显示，轻巧优雅) */}
      {jars.length > 1 && (
        <div className="loot-coverflow-dots">
          {jars.map((_, idx) => (
            <span
              key={idx}
              className={`loot-dot ${idx === currentIndex ? "is-active" : ""}`}
              onClick={() => {
                onSelectIndex(idx);
                void triggerHaptic("light");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
