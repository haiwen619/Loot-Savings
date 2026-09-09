import React, { useEffect, useMemo } from "react";

interface ConfettiEffectProps {
  active: boolean;
  onFinish?: () => void;
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f43f5e", "#fde047"];

export function ConfettiEffect({ active, onFinish }: ConfettiEffectProps) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onFinish?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [active, onFinish]);

  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.5,
      tilt: Math.random() * 360,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(16px)",
          border: "2px solid #f59e0b",
          boxShadow: "0 12px 40px rgba(245, 158, 11, 0.4)",
          padding: "16px 28px",
          borderRadius: 28,
          textAlign: "center",
          color: "#ffffff",
          animation: "sheet-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 4 }}>🎉</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24", margin: 0 }}>愿望已圆满达成！</h2>
        <p style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
          每一分积累，都在照亮心中的热爱
        </p>
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.tilt}deg)`,
            opacity: 0.9,
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
