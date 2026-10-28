# Alma for Android

Unofficial Android port of [Alma](https://alma.now) — same architecture as iOS Alma : **a thin Capacitor shell hosting the exact same React renderer that ships in the Mac app**. Zero re-implemented UI: the official mobile interface is activated through platform identity + bridge injection.

> 中文说明见下方。

## Quick build (self-contained)

```bash
npm install                 # Capacitor 7 CLI + plugins
npx cap sync android        # copy www/ (bundled renderer) into the Android project
cd android
JAVA_HOME=<jdk21> ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Requires JDK **21** and the Android SDK (platform 35). No other local dependencies — the Alma renderer is bundled in `www/` (included with the author's permission).

**Pairing**: on your Mac, open Alma → Settings → Remote Access, show the QR code; on Android: Settings → 我的 Mac → scan (grant camera on first scan). Chats run on your Mac over an E2E-encrypted relay. Provider-key-only mode (no Mac) lives in Settings → 本机 → AI 提供商.

---

Alma 的非官方 Android 版：**Capacitor 壳 + 与 Mac 安装包完全相同的 React renderer**，与 yetone 的 iOS 端 Alma 同构。UI 通过平台身份补丁与桥注入直接激活。

## 架构（与 iOS Alma 同构）

```
┌─ Android 壳（Capacitor 7）──────────────────────────┐
│ WebView (https scheme) + MainActivity 运行时 CAMERA 授权 │
│ platform 身份 = "android"（非伪装 ios）                │
├─ 桥层（两层，??= 共存，shim 先执行优先）────────────────┤
│ ① scripts/shim/alma-droid-shim.js                     │
│    platform.get→"android" / settingsWindow→settings.html│
│    / haptics / clipboard / ipcRenderer 降级面          │
│ ② connected chunk 迷你 boot（官方 JS 参考实现）          │
│    installElectronShim（≈45 桥）+ almaIOSConfig（配对）  │
│    + E2E fetch/WebSocket 拦截 + 官方 apiServerShim      │
└───────────────┬───────────────────────────────────────┘
                ↓ 加载 www/（Alma 官方 renderer 产物）
   手机 UI（composer/抽屉/配对/设置/本机会话）
                ↓ E2E 中继（P-256+HKDF+AES-GCM，纯 JS）
   relay.alma.now / 自建中继 ←→ Mac 端 Alma（MobileRelay）
```

yetone iOS 壳的原生桥（`almaIOSConfig` 等）在本项目中由 connected chunk 里的官方 JS 实现提供：`scripts/sync-assets.sh` 把它的 `boot()`（桌面 handoff 流程）替换为「只装桥不渲染」的迷你 boot，注入 index.html / settings.html。**注意不可调用 `installConnectedWindowBridges`**（它会以非 `??=` 方式覆盖 settingsWindow）。

## 目录

```
alma-android/
├── www/                    # Alma renderer
├── android/                # Capacitor Gradle 工程（含官方同款图标）
├── scripts/sync-assets.sh  # 【可选】升级用：新版 renderer → www/ 全流程重建
├── scripts/shim/alma-droid-shim.js
├── capacitor.config.json   # appId local.almaandroid.app / androidScheme https
└── package.json
```

## 补丁系统（sync-assets.sh，升级 Alma 版本时重跑）

| 块 | 作用 |
|---|---|
| 1 | 注入 shim（紧跟 `<body>`，首帧即手机布局） |
| 2 | 平台身份补丁 A–E：`isPhoneShell`/`isPhone`/`isIOS`(=手机壳语义)/PlatformProvider 初始 state 同步读 dataset/settings 标题栏 |
| 2.5 | composer chip `min-w-0`（修复长模型名把发送按钮挤出屏幕） |
| 2.7 | 手机设置语言行（跟随系统 / English·中文·日本語，词典补键） |
| 2.8 | 配对执行转发主帧（iframe 只解码，规避 iframe 桥环境差异） |
| 2.9 | 主题切换同步主帧 + 容忍 settings 未加载 |
| 3.0 | 手机 hero 移除「连接你的 Mac」配对引导块（入口保留在 设置→我的 Mac） |
| 3.5 | connected chunk 迷你 boot + 桥模块注入 |

## 使用 / 配对

1. Mac 上打开 Alma → 设置 → Remote Access，生成配对二维码（`alma://connect?u=…&e2e=1&k=…` 深链格式）
2. Android 安装后：设置 → 我的 Mac → 扫码（首扫需授予相机权限；被系统静默拒绝的去 系统设置→应用→Alma→权限 手动开）
3. 配对成功自动重载 → 完整手机体验（会话列表/生成跑在 Mac 上，经 E2E 加密中继）
4. 不连 Mac：设置 → 本机模式（beta）→ AI 提供商，配自己的密钥
**（注：本机模式暂不完善，待后续开发...）**

**语言**：首启跟随系统语言；设置 → 外观下方可切换 跟随系统 / English / 中文 / 日本語，选择立即生效并持久化。

## 升级到新版 Alma

`www/` 提交的是**已打补丁的最终态**，日常构建不需要重新生成。Alma 发新版时：

```bash
# 先从新版 Mac 安装包解出 renderer（或更新本地解包），然后：
bash scripts/sync-assets.sh [renderer目录]   # 默认 ~/AlmaProjects/alma-re/app/out/renderer
npx cap sync android
```

脚本内含 assert：上游结构变化（补丁定位失败）会直接报错，不会静默漏 patch。

## 许可

[MIT](LICENSE) — 版权归 Alma 作者 **yetone（叶天帝）** 所有。

本项目为非官方个人移植，与 Alma 官方无隶属关系。`www/` 内嵌的 renderer 来自 Alma 官方安装包，经作者许可以 MIT 随本仓库发布。
