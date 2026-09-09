import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * iOS Taptic Engine 触觉震动反馈服务
 * 原生优先，Web 浏览器环境自动降级
 */
export async function triggerHaptic(style: "light" | "medium" | "heavy" | "success" | "warning" = "light") {
  try {
    const isCapacitor = typeof window !== "undefined" && Boolean((window as any)?.Capacitor?.isNativePlatform?.());

    if (isCapacitor) {
      if (style === "success") {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (style === "warning") {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        const impact = 
          style === "heavy" 
            ? ImpactStyle.Heavy 
            : style === "medium" 
            ? ImpactStyle.Medium 
            : ImpactStyle.Light;
        await Haptics.impact({ style: impact });
      }
      return;
    }

    // Web 降级
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      switch (style) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(20);
          break;
        case "heavy":
          navigator.vibrate([30, 20, 30]);
          break;
        case "success":
          navigator.vibrate([15, 40, 30]);
          break;
        case "warning":
          navigator.vibrate([40, 30, 40]);
          break;
      }
    }
  } catch {
    // 忽略不支持平台报错
  }
}
