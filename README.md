# Alma for Android

向官方 iOS 端看齐的 Android 版 Alma：**Capacitor 壳 + 与 Mac 安装包完全相同的 React renderer**。零 UI 开发——官方手机界面通过平台身份补丁与桥注入直接激活。

> **v1.0（2026-10-27）**：配对、E2E 加密中继、手机版设置（含「本机 / AI 提供商」自备密钥模式）、扫码配对、剪贴板、触感反馈全部打通；已与 Mac 端官方 Alma 完成真实配对验证。

## 架构（与官方 iOS 同构）

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

官方 iOS 壳的原生桥（`almaIOSConfig` 等）在本项目中由 connected chunk 里的官方 JS 实现提供：`scripts/sync-assets.sh` 把它的 `boot()`（桌面 handoff 流程）替换为「只装桥不渲染」的迷你 boot，注入 index.html / settings.html。**注意不可调用 `installConnectedWindowBridges`**（它会以非 `??=` 方式覆盖 settingsWindow）。

## 补丁系统（sync-assets.sh，每次从 alma-re 原始产物重建 www/）

| 块 | 作用 |
|---|---|
| 1 | 注入 shim（紧跟 `<body>`，首帧即手机布局） |
| 2 | 平台身份补丁 A–E：`isPhoneShell`/`isPhone`/`isIOS`(=手机壳语义)/PlatformProvider 初始 state 同步读 dataset/settings 标题栏 |
| 2.5 | composer chip `min-w-0`（修复长模型名把发送按钮挤出屏幕） |
| 3.5 | connected chunk 迷你 boot + 桥模块注入 |
| 4 | 文案中性化（“这台 iPhone”→“这台设备”等 11 组） |

## 目录

```
alma-android/
├── www/                    # Alma renderer（不入库；sync-assets.sh 从 alma-re 同步+打补丁）
├── android/                # Capacitor Gradle 工程（含官方图标生成的 mipmap）
├── scripts/sync-assets.sh  # renderer → www 全流程（alma-re 升级后重跑）
├── scripts/shim/alma-droid-shim.js
├── capacitor.config.json   # appId local.almaandroid.app / androidScheme https
└── package.json
```

## 构建 APK

工具链：`brew install openjdk@21`（**必须 21**；17 报「无效的源发行版：21」）+ Android SDK（platform-35 / build-tools-35.0.0，许可已接受）。

```bash
# 前置：alma-re 已解包官方 renderer 到 app/out/renderer
bash scripts/sync-assets.sh          # 重建 www/（注入 shim + 全部补丁）
npx cap sync android
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew assembleDebug
# 产物: android/app/build/outputs/apk/debug/app-debug.apk（~41MB）
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 使用 / 配对

1. Mac 上打开 Alma → 设置 → Remote Access，生成配对二维码（`alma://connect?u=…&e2e=1&k=…` 深链格式）
2. Android 安装后：设置 → 我的 Mac → 扫码（首扫需授予相机权限；被系统静默拒绝的去 系统设置→应用→Alma→权限 手动开）
3. 配对成功自动重载 → 完整手机体验（会话列表/生成跑在 Mac 上，经 E2E 加密中继）
4. 不连 Mac：设置 → 本机 → AI 提供商，配自己的密钥

## 版权说明

`www/` 与 APK 内嵌的 renderer 为 Alma 官方专有产物，**本仓库不包含**（构建时从本地 alma-re 解包再生）；仓库内容仅为自有壳工程与补丁脚本。请勿公开分发 APK。

## 已验证（2026-10-27）

- 手机 UI 在真机与无头 Chrome 完整渲染（抽屉/搜索/新建/设置/本机会话），0 运行时异常
- 与 Mac 官方 Alma 扫码配对成功，会话/头像同步
- E2E 协议（alma-relay-e2e/v1）与 Mac 端 MobileRelay 帧协议对齐（wopen/wmsg/wclose）
- 设置 → 手机版设置全功能（外观/关于/连接管理/AI 提供商）
