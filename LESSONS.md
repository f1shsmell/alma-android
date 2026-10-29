# LESSONS — 项目教训录

> 底线（nanami 定，2026-10-29）：**每次发版必须通过端到端的真实测试和回归测试**。
> 一为保证新功能真的成功，二为保障以前的错误不再犯、以前的功能保持稳定正常。
> 任何"测试全绿"都要先问一句：测的是不是发出去的那个包？

## 2026-10-29 语言切换：闪屏 + 挤回首页 + 3-4 秒后弹回系统语言

- **现象**：设置里从「跟随系统」切到日语 → 主界面整页闪屏、被挤回首页；约 3-4 秒后语言弹回系统中文，切换永远不生效。
- **根因一（灾难切换体验）**：语言行补丁用 `postMessage → 主帧 location.reload()` 同步主界面语言 —— 整页冷启动 = 闪屏 + 重置到首页。
- **根因二（选择丢失）**：i18next detector 的 localStorage 缓存写入挂在 `languageChanged` **异步链**上（语言资源异步加载后才发事件），而 reload 同步抢跑把 iframe 连同未完成的写入一起销毁 → `i18nextLng` 没写进去 → 重启按系统语言检测 → 回到中文。
- **修复**：i18next 单例（两个文档同一 chunk）加 `message` 监听 —— iframe 选语言 → `postMessage(alma-android-lang)` → 主帧同单例 `changeLanguage` live 切换；语言行**同步**写 `i18nextLng`；不再任何 reload。
- **教训**：
  1. 状态持久化要区分「同步写」与「框架异步链写」；有竞态窗口时自己先同步落盘。
  2. 跨 iframe 同步状态：postMessage + 单例监听，不要用 reload 大锤 —— reload 的代价（冷启动/丢导航态/闪屏）永远比想象中大。
  3. 测试断言别假设环境 locale（headless Chrome 跟随宿主系统语言，本机是 zh 不是 en）。

## 2026-10-29 自动更新 v1.3.0：mock 全绿 ≠ 真实可用（AVD 闭环实测抓出三个真 bug）

- **cap sync 缺失**：`assets/public` 不进 git，构建直接 assembleDebug 打出**旧 web 层** —— 测试全绿测的是 www/，发出去的是 assets/ 里的旧包（首测 APK 里更新功能整个不存在即此故）。release.sh 已强制构建前 `npx cap sync android`。
- **DownloadManager 完成广播收不到**：Android 14+ 上 DownloadProvider（Mainline 模块）发出的 `ACTION_DOWNLOAD_COMPLETE` 会被 `RECEIVER_NOT_EXPORTED` 当"其他应用"拦掉（AVD 实测零回调、UI 永远"下载中"）。该广播是 protected broadcast，改 `RECEIVER_EXPORTED` 安全；另加 shim 轮询兜底（downloadProgress 连续 3 次 failed → error 终态）。
- **默认镜像会死**：mirror.ghproxy.com 当时已无响应 → 换 gh-proxy.com。免费 GitHub 代理没有 SLA，默认值要实测，且保留 localStorage 覆盖口。
- **教训**：
  1. 发版前必须走一次**真实闭环**：装上一版 → 应用内检查/下载/装上新一版。mock 测试再全也覆盖不了"广播被系统拦""镜像死了""构建产物没更新"这类环境事实。
  2. "测试通过"的对象要和"发布"的对象是同一份产物（cap sync 教训的本质）。

## 2026-10-29 手机 UI ≠ 桌面 UI：两套组件，别混

- 官方 updater UI（AboutSettings，Card 版，含完整状态机/进度条）**只在桌面设置布局**；手机设置页（PhoneRow 版）的「关于」区只有一行版本号 —— "renderer 自带更新 UI、零补丁接入"的结论对手机端不成立，仍需给手机设置页补入口行。
- 同理：改任何"renderer 自带 X"的结论前，先确认**目标平台布局**真的渲染那个组件。

## 2026-10-29 版本号权威 = 内嵌 renderer 版本

- 用户可见版本统一为 renderer 版本（0.4.213 形态，与 Alma 桌面一致）：APK `versionName` = renderer 版本，GitHub tag = `v0.4.213`；About 页只显示一个版本号（build 留空）。
- 壳独立修复（renderer 没变）：release.sh 自动出 `v0.4.213-<code>` 后缀 tag，应用内比较含第 4 段。
- 曾经的 1.x 壳版本号（v1.3.0）与 renderer 版本并存，用户看到 "1.3.0 (0.4.213)" 两套版本 → 混乱，弃。
- **后缀判定要看线上最新 tag，不能只看本地 CUR≠NEW**（v0.4.213-6 发布前修正）：build.gradle 预写成新版本号后 CUR==NEW，只比本地会漏加后缀 → 折算后相等 → 老用户收不到提示。规则 = tag 占用 **或** 对已发布最新 tag 不构成严格更新（与应用内 isNewer 同款比较，含遗留折算）。
- **过渡死结（已知，接受）**：v1.3.0 旧 shim 是 3 段点分比较，`0.4.213-x` 数值恒小于 `1.3.0` → 老包**收不到**新形态版的自动提示，且不存在同时满足新旧两个比较器的 tag（旧要求 ≥1.x，新要求 ≤0.4.x）。v1.3.0 用户需最后一次手动安装 v0.4.213-6，此后永续自动。
- **教训**：换版本号方案时，先审计**已发出设备的旧代码**怎么比较版本，再定新 tag 形态；两个方向的过渡（新 app 认旧号、旧 app 认新 tag）要分开验证。

## 环境事实（测试时别再踩）

- **alma-api35 的 DownloadManager 系统级坏**：任何 enqueue（含默认目标裸下载）秒失败 reason 0、netd DNS 循环重试，同 URL WebView fetch 却正常，重启无效。下载传输只能真机验证；模拟器可验证到"下载已入队 + 安装器全链"。
- `adb root` / `adb reboot` 会清掉所有 forward，要重新 `adb forward`。
- uiautomator 看不到 WebView 内文本：权限弹窗先 `pm grant` 预授权，WebView 内容用 CDP 远程调试断言。
- 沙箱内 kill 8778 服务会静默失败；本地端口监听/连接需非沙箱跑。
- **addJavascriptInterface 的原生桥对象不可 JS 覆写**：真机 WebView 里 `window.__almaAndroidUpdate` 是 Java 代理，`getVersionName = () => '1.3.0'` 这类属性赋值**静默失效**（不报错、不生效）；Chrome mock 里却能覆写。要在真机验证"特定壳版本号下的行为"，唯一可靠办法是改 build.gradle 的 versionName 重打包装机（test/post-release-verify.sh 的替代法），别指望运行时覆写。
- **测试脚本自己也会写错**：模板串里多打反引号、正则双重转义（`/settings\\.html/` 不匹配 `./settings.html`）、PNG 滤镜未解码、箭头参数作用域。测试红了先分辨是产品 bug 还是测试 bug（git stash 基线对照）。

## 观察中（未定位）

- 2026-10-29 用户报告：relay 已连 Mac 但模型/思考强度/历史对话全部消失，「连接中…」卡住 —— 数分钟后自愈。代码层排查无版本握手/门控消费 `almaApp.version`，疑似中继服务器或 Mac 端瞬时状态。再遇时先抓：chrome://inspect console 报错、Mac 端 Alma 版本号、`relay.alma.now` WebSocket 状态。
