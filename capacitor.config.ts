import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.haiwenna.lootsavings",
  appName: "Loot 存钱罐",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    iosScheme: "ionic"
  },
  ios: {
    contentInset: "always"
  }
};

export default config;
