# 🍯 Loot 存钱罐 · 极简储蓄与愿望管理 App (Loot Savings)

> 参考 iOS App Store 4.7 分热门应用 **[Loot - 存钱罐 储蓄 金钱]** 开发的高质感储蓄愿望管理应用。
> 采用 **React 19 + TypeScript + Vite + Web Audio 原生音效合成 + Capacitor 原生 SQLite / PWA 离线双模存储** 打造。
> 极致遵循 **Apple Human Interface Guidelines (HIG)** 与 **Emil Kowalski 动效哲学**，支持 **温润象牙白 (Ivory White)** 与 **Apple 暗夜深黑 (Dark Mode)** 双主题。

---

## 🌟 核心特性

### 1. 🫙 3D 通透水滴玻璃瓶与成捆钞票拟物堆叠
- **拟物微光玻璃罐**：无厚重软木塞或大标签遮挡，通透水滴弧线瓶身，双侧晶莹反光与瓶底厚重玻璃聚光折射；
- **动态钞票与硬币堆叠**：罐内随储蓄进度（0%~100%）动态堆叠扎有白纸封条的**绿色成捆钞票卷**与散落的金币银币；
- **愿望居中坐镇**：心愿物品 Emoji（如 🚗 汽车、🏠 房子、📱 手机）坐落在钱堆之上，瓶身中央印刻目标大字；
- **解压果冻回弹**：轻触瓶身触发 380ms 物理果冻回弹动效（Bounce Animation）与落币反馈。

### 2. 🎡 3D Coverflow 存钱罐画廊轮播
- 正中心高亮当前心愿罐（Scale 1.0, 100% 不透明度）；
- 左右两侧以 3D 景深半透明露出相邻心愿罐（Scale 0.76, 35% 不透明度）；
- 完整支持**触摸左右滑动手势（Touch Drag）**与轻触侧边罐顺滑平移切换。

### 3. 🔊 Web Audio API 零外链物理音效与 Taptic 触觉
- **零网络音频依赖**：内置双正弦振荡器（1800Hz + 2400Hz 带通滤波 + 指数衰减），物理合成真实硬币撞击玻璃瓶的清脆叮当声；
- **达成和弦**：达到 100% 目标时演奏大三和弦喜报音，并触发全屏五彩纸屑礼花（Confetti Fireworks）；
- **细腻触觉**：集成 Capacitor Haptics 与 Web Vibration 触觉引擎。

### 4. 💾 双模数据存储：iOS 原生 SQLite + Web 本地持久化
- **仓储模式（Repository Pattern）**：
  - **真机原生端**：走 `@capacitor-community/sqlite` 直接驱动 iOS C 语言引擎 `libsqlite3.dylib`，具备金融级 ACID 事务安全与应用沙盒保护（永不被系统清理，支持 iCloud 整机自动备份）；
  - **Web 端 / PWA 端**：自动降级到 Web 本地存储引擎，零配置开箱即用，新库首次打开自动执行无感数据迁移播种。

---

## 🚀 部署至 Vercel 指南 (推荐)

本项目支持通过 **Vercel** 免费部署，在 iPhone 上通过 Safari 一键添加至主屏幕即可享受 1:1 原生 App 体验！

### 方式一：Vercel 控制台网页端部署 (零终端操作)

1. 将本代码仓库推送至 GitHub / GitLab；
2. 登录 [Vercel 官网](https://vercel.com/)，点击 **「Add New...」➔「Project」** 导入本仓库；
3. **关键配置（Project Settings）**：
   - **Framework Preset**：选择 `Vite`
   - **Root Directory**：点击 Edit，选择并设置为 `apps/loot-savings` 👈 **【重要】**
   - **Build Command**：默认 `npm run build`
   - **Output Directory**：默认 `dist`
   - **Install Command**：默认 `npm install`
4. 点击 **「Deploy」**，约 30 秒即可获得专属的线上 HTTPS 访问链接（例如：`https://loot-savings.vercel.app`）。

### 方式二：使用 Vercel CLI 命令行部署

在项目根目录下运行：
```bash
# 全局安装 Vercel CLI (若未安装)
npm i -g vercel

# 进入 loot-savings 目录直接发布
cd apps/loot-savings
vercel
```

---

## 📱 iPhone Safari 一键安装为独立 App (PWA)

无需 Mac 电脑，无需付费申请 99 美元苹果开发者账号，无需担心证书过期：

1. 在 iPhone 上打开自带的 **Safari 浏览器**，访问部署好的 Vercel 链接；
2. 点击 Safari 底部中央的 **「分享 (⬆️)」** 图标；
3. 向下滑动，找到并点击 **「添加到主屏幕」 (Add to Home Screen)**；
4. 点击右上角 **「添加」** 完成！

> 🎉 **体验效果**：
> - 桌面生成专属独立 🍯 图标；
> - 点开即进入全屏模式，**没有任何 Safari 浏览器顶栏与底栏地址栏**；
> - 完美适配 iPhone 灵动岛（Dynamic Island）与底部横条（Home Indicator）；
> - 120Hz 高刷新率丝滑手势、清脆撞击音效与离线数据永久保存！

---

## 💻 本地开发与指令速查

在项目根目录下执行以下脚本：

```bash
# 启动本地开发服务 (默认端口 5175，自带 iPhone 16 Pro 钛金属仿真外壳与灵动岛)
npm run loot:dev

# 生产环境静态打包 (编译产物输出至 apps/loot-savings/dist)
npm run loot:build

# 一键编译并独立推送至 GitHub 专属仓库 (https://github.com/haiwen619/Loot-Savings)
# - main 分支: 独立 dist 静态部署包 (Vercel / Web 自动实时部署)
# - source 分支: 存钱罐独立完整前端源码
npm run loot:push

# Windows 桌面端支持直接双击运行：
# 1. 根目录：scripts/loot-deploy.bat
# 2. 存钱罐目录：apps/loot-savings/一键打包并推送.bat

# 本地执行 TypeScript 类型检查
npx tsc --noEmit -p apps/loot-savings/tsconfig.json

# 同步前端代码与 SQLite 插件至 iOS Xcode 原生工程 (需配有 Mac/Xcode 环境)
npm run loot:cap:ios
```

---

## 📂 工程目录结构

```
apps/loot-savings/
├── vercel.json                 # Vercel SPA 路由重写与无后缀 URL 配置
├── capacitor.config.ts         # Capacitor iOS 原生容器配置 (AppId: com.haiwenna.lootsavings)
├── index.html                  # iOS viewport-fit=cover、black-translucent 状态栏配置
├── package.json                # React 19 + TypeScript 5.8 + Capacitor 8 + SQLite 依赖
├── tsconfig.json               # 严格 TypeScript 编译选项
├── vite.config.ts              # Vite 5175 端口开发与静态构建配置
├── readme.md                   # 本说明文件
└── src/
    ├── App.tsx                 # 极简主界面调度器、顶栏与抽屉集成
    ├── main.tsx                # 应用挂载入口
    ├── components/
    │   ├── CoverflowJarGallery.tsx # 3D Coverflow 存钱罐画廊轮播 (支持触摸拖拽)
    │   ├── MoneyJarView.tsx        # 拟物水滴玻璃罐身、成捆绿色钞票与金币堆叠
    │   ├── PhoneFrameWrapper.tsx   # 桌面端 iPhone 16 Pro 钛金属机身与灵动岛外壳
    │   ├── QuickDepositModal.tsx   # 快捷存取款底部 Action Sheet (+10, +50, +100...)
    │   ├── SettingsSheetModal.tsx  # 设置与洞察抽屉 (储蓄节奏测算、流水明细、数据库引擎状态)
    │   ├── SavingsPlanCard.tsx     # 智能储蓄节奏 (每日/每周建议存入计算)
    │   ├── TransactionList.tsx     # 历史存取明细流水账单组件
    │   ├── CreateJarModal.tsx      # 新建/编辑存钱罐 (名称、目标、截止日、Emoji、主题色)
    │   └── ConfettiEffect.tsx      # 100% 达成全屏五彩纸屑礼花
    ├── context/
    │   └── SavingsContext.tsx      # 全局存钱罐状态树、音效触觉与主题 Provider
    ├── services/
    │   ├── audio.ts                # Web Audio API 物理振荡器硬币撞击玻璃声合成
    │   ├── haptics.ts              # Capacitor Haptics 触觉震动反馈服务
    │   ├── storage.ts              # LocalStorage 基础键值定义与预置种子数据
    │   └── db/
    │       ├── schema.ts           # SQLite DDL 建表语句与索引定义
    │       ├── repository.interface.ts # ISavingsRepository 仓储模式接口规范
    │       ├── sqlite-driver.ts    # iOS 原生 SQLite 驱动 (@capacitor-community/sqlite)
    │       ├── localstorage-driver.ts # Web 浏览器本地存储降级驱动
    │       └── index.ts            # 平台自动嗅探、单例管理与平滑数据迁移
    ├── styles/
    │   └── loot-ios.css            # 苹果毛玻璃、象牙白/暗夜主题变量、3D Coverflow 变换透视
    └── types/
        └── savings.ts              # 存钱罐、流水交易、主题配色类型定义
```

---

## 🎨 视觉主题系统

- **🌾 温润象牙白（Ivory White）**：继承海文娜桌面端特有的温润暖白无杂质白瓷底色（`#FAF9F6`），搭配深炭灰文字与水滴淡蓝晶莹玻璃罐；
- **🌙 Apple 暗夜深黑（Dark Mode）**：专为 iPhone OLED 屏调校的纯黑低功耗底色（`#0B0F17`），配合微发光毛玻璃与高对比度金币液面。

可在应用内点击左上角 ⚙️ 齿轮进入「偏好设置」随时自由无缝切换。
