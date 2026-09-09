import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Loot Savings Uncaught Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    if (window.confirm("确定要重置本地数据并重新加载吗？")) {
      try {
        localStorage.clear();
      } catch {}
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 20px",
            background: "var(--loot-bg, #faf9f6)",
            color: "var(--loot-text-primary, #0f172a)",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 380,
              width: "100%",
              background: "var(--loot-card-solid, #ffffff)",
              border: "1px solid var(--loot-border, #e6e2d8)",
              borderRadius: 24,
              padding: "28px 24px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 44 }}>🍯</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>
              遇到了一点小问题
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--loot-text-secondary, #475569)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              应用已自动启动保护机制，防止屏幕白屏或异常。您可以点击下方按钮快速恢复。
            </p>

            {this.state.error && (
              <pre
                style={{
                  width: "100%",
                  maxHeight: 100,
                  overflow: "auto",
                  background: "rgba(0,0,0,0.04)",
                  padding: "8px 10px",
                  borderRadius: 10,
                  fontSize: 11,
                  textAlign: "left",
                  color: "#ef4444",
                  margin: "6px 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="loot-btn-primary"
                onClick={this.handleReload}
                style={{ height: 46, borderRadius: 14, fontSize: 14 }}
              >
                🔄 立即刷新恢复
              </button>
              <button
                type="button"
                className="loot-btn-secondary"
                onClick={this.handleReset}
                style={{ height: 42, borderRadius: 14, fontSize: 12 }}
              >
                清空本地缓存并重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
