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

## 2026-10-29 忘记这台 Mac 踢出设置层：转发类补丁要按方向分支

- **现象**（v0.4.213-6 实机反馈）：设置 → 我的 Mac →「忘记这台 Mac」后预期回设置页，实际整层退出到对话页；重开设置还可能落在配对屏。
- **根因**：shim 把设置 iframe 里的 `backend-mode-changed` **无条件**转发成宿主整页重载。这个转发本为配对（→remote，主应用要以连接态重启）设计，但「忘记/切回本机」（→local）走同一事件 → 用户被立即踹回对话页。
- **修复**：→local 不重载、挂 pending 标记，设置层关闭（完成/原生返回）时才重载主文档；→remote 维持立即重载并清标记。
- **教训**：一个事件两个语义相反的方向时，转发/响应要**按方向分支**，别写无条件转发；"主应用需要重载"和"此刻就要重载"是两回事，时机可以（且应该）推迟到用户离开当前上下文的自然过渡点。
- 排查技巧：Capacitor Preferences 的 web 存储是 `localStorage["CapacitorStorage." + key]`（预置/伪造配对态用它）；真机上 addJavascriptInterface 桥不可 JS 覆写（见环境事实），行为差异先在 Chrome CDP 真实点击流复现。

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

## 2026-10-29 返回键不认 iframe 内部层级：配对页侧滑两次直接退出 App

- **现象**（v0.4.213-7 OPPO 实机反馈）：设置 → 我的 Mac 配对页侧滑返回，预期回设置页，实际被退出 Alma 应用。
- **根因**（AVD keyevent 4 逐步实证）：`__almaAndroidBack` 只认「设置层 iframe 可见」一刀切关整层——返回键第一次把配对屏连着设置层全关（用户看到"退出到对话页"），第二次 `canGoBack()=false` + JS 返回 false → `super.onBackPressed()` → Activity 结束 → **退出 App**。手机上连续两次侧滑被感知为"直接退出"。
- **实验要点**：设置层 iframe 的加载**不进** WebView 历史栈（`Page.getNavigationHistory` 恒 1 条）→ `canGoBack()` 恒 false → 返回键永远走 JS 路径，修 shim 即可，原生侧不用动。
- **修复**：`__almaAndroidBack` 实现层级链——detail Pane 已推出时先点 renderer 自己的返回钮（iframe 内部回退，走其滑动动画与状态机），已在根页才整层关闭。
- **语言无关的 DOM 锚点**（设置页中/英/日三语，文案匹配不可靠）：renderer 返回钮 = ChevronLeft `svg` + 头部样式 `pl-1`/`pr-2`（Tailwind 工具类名不随构建哈希）；**detail Pane 的 `aria-hidden` 直接由 `pushed`（`section !== null`）驱动**——`false` = 子屛当前推出，`true` = 已收回，是比 rect/transform 更干净的判定（React 渲染同步翻转，无动画中间态）。
- **教训**：宿主给 iframe 盖了一层导航时，返回键的处理必须穿透到 iframe 内部层级，否则用户的"返回"语义会在某一层被吞掉整层；找 DOM 锚点优先看 aria 属性/结构/工具类名，别用文案。

## 2026-10-30 下载"成功"≠文件有效：安装器收到垃圾报「安装包已损坏」

- **现象**（v0.4.213-8 OPPO 实机）：应用内更新下载完成、拉起安装器，安装器报「安装包已损坏」。GitHub 资产本身字节级完好（gh 下载 sha256 与本地构建一致）。
- **根因**：DownloadManager 报 SUCCESSFUL 只代表 HTTP 传输走完——透明代理/门户对 GitHub 资产可能返回 **200 的 HTML 错误页**，旧代码拿到文件不校验直接交安装器。另实测 gh-proxy 镜像对该网络只有 ~15KB/s（38MB 拉了 570s 只到 8.4MB）——镜像兜底也会慢到不可用。
- **修复**：`installUpdate()` 交安装器前 `getPackageArchiveInfo` 预检（截断 zip/HTML/空文件 → null）**且包名必须匹配本应用**；坏了删文件、自动换镜像重下（与下载失败同路径），镜像也坏才报 error。
- **教训**：把系统组件的"成功"当数据完整性保证是错的——下载完成≠内容正确；对外来文件先验后用（解析即校验，比比对长度/哈希更省事且权威）。
- **测试技巧**：往 `getExternalFilesDir` 塞文件——`run-as`/shell 对 `/storage/emulated/0/Android/data/<pkg>` 均无权限；`adb root` 后写 raw 路径 `/data/media/0/...` 可行（google_apis 镜像可 root）。**同一文件路径被覆写后 FUSE 视图可能陈旧读到旧内容**（换文件要 rm + force-stop 应用 + drop_caches，或干脆隔离测试）；测试钩子链式包装共享变量会让状态计数逐轮 +1（每轮 arm 都把上一轮 wrapper 当 prev 链上）——arm 要幂等替换而不是包一层。

## 2026-10-30 给 React 树外面挂 UI：fixed 注入 + MutationObserver 重挂（更新 pill）

- **需求**：有新版时在 renderer 左上菜单钮旁放「更新」pill + 版本说明弹窗，但 UI 是 renderer 的 React 树，不能改其源码。
- **注入策略**：pill/弹窗 append 到 `document.body` 且 `position:fixed`——React 重渲染会**吞掉**React 根内的外来节点，body 直挂 + 几何定位（菜单钮 rect 推算 `left/top`）不受影响；`MutationObserver(childList+subtree, 250ms 防抖)` 被移除即重挂（CDP 有断言：手动 remove 700ms 内复活）。
- **定位菜单钮**：几何特征（20–60px 宽、left<60、top<60、含 svg），不依赖文案/类名哈希。
- **真机桥不可 mock**：`window.__almaAndroidUpdate` 是 addJavascriptInterface 注入，页内 JS **覆盖不了**——CDP/浏览器测试里 mock 有效是因为宿主是浏览器。真机侧 UI 流程只能：装新版后用 CDP（webview_devtools socket）mock `fetch` 喂假新版，或等下一个真版本。
- **弹窗条目来自 release notes**：`updateNoteItems()` 逐行过滤（跳过 `^#` 标题、Co-Authored-By/🤖 署名行；剥 `[-*•] `/**/反引号；≤140 字、至多 8 条）——release.sh 自动取 git log 生成 notes，两端约定字段。
- **发布后实测（AVD api33 装 -10，真实网络）**：直连 GitHub 在本机 reset → 镜像 raw latest.json 兜底成功，`rel` 落盘含双镜像 fallbacks + notes，壳=tag → 已是最新。链路端到端通。

## 2026-10-30 「检查更新→安装包已损坏」复盘：陈旧终态 + 校验只查 manifest；返回键 canGoBack 判序

- **陈旧终态死循环**（-10 实机复现于 AVD）：手动装新版后 localStorage 残留 `update-downloaded` + 磁盘残留旧 `alma-update.apk`。设置页按状态分派，点行=launchInstaller；-10 校验只查 manifest+包名 → **旧的有效包照样放行** → 系统安装器拿旧包报「安装包已损坏」（国产 ROM 对降级/坏包的通用文案）。修复三重：shim 启动时 rel.tag 不新于壳 → 清回 idle；quitAndInstall 同守卫；原生校验追加 versionName 严格新于当前 + 签名一致。
- **返回键 canGoBack() 判在 JS 之前是错的**：renderer 主页面积累 pushState 历史（真机用几天必然有）后 canGoBack=true → 返回手势全被 webView.goBack() 吃掉，设置层层级逻辑永远不跑（实机「配对页侧滑退出」在 AVD 复现不了——刚装的壳没有历史）。正确优先级：JS（弹窗→设置层）→ WebView 历史 → 默认。AVD 造历史法：`history.pushState` ×2 再走 keyevent 4。
- **弃用 DownloadManager**（社区共识 + 实测根因）：透明代理对 GitHub 资产回 200 HTML，DownloadManager 照落盘报 SUCCESSFUL。应用内 HttpURLConnection：写盘前验状态码/Content-Type/长度，第一块数据验 zip 魔数 PK，垃圾不落盘直接换镜像；.part 原子改名；代次号 dlGen 让旧线程让位。
- **AVD 实测事实**：api33 镜像拉起 PackageInstaller 会把 qemu 整个带崩（连崩 3 次的元凶），api30 正常——安装器全链测试用 api30；WebView localStorage 是异步落盘，force-stop 会丢，seed 后必须 location.reload() 触发提交；`cleartext` 白名单走 network_security_config（仅 10.0.2.2），本地 http.server 8808 当下载源。
- **测试基建坑**：模拟器连环崩时把 8778 静态服务一并带走 → 一串 CDP 套件假失败（no-button/NO_FRAME），先查服务再怀疑代码；qemu 进程名是 qemu-system-x86_64，pkill "emulator" 杀不掉。

## 2026-10-30 Chromium 100 兼容层：Tailwind 4 的 @property 兜底已够用，真正缺的是 oklch 与 :has

- **目标**：MIUI 14 出厂 WebView（Chromium 100）不升级系统 WebView 也能正常显示。
- **实测结论**：Tailwind 4.1.12 已在 `@layer properties` 里用 `@supports` 为不支持 `@property` 的内核写好 `--tw-*` 默认值（`--tw-border-style: solid`、`--tw-shadow: 0 0 #0000` 等），Chrome 100 上 `var(--tw-*)` 1137 处引用本来就有兜底；`color-mix()` 1147/1148 已在 `@supports (color: color-mix(...))` 内且块外有同选择器 fallback。**不要重复造 @property/color-mix 的轮子**。
- **真正要补的**：103 个 `--color-*: oklch(...)` 变量（旧内核整条丢弃，402 处 `var(--color-*)` 失色）、43 处 `:has()`（Tailwind 没包 `@supports`，整条规则丢弃）、1 处 @supports 外的 win98 `color-mix`、`field-sizing: content`、React inline `color-mix`。
- **实现**：`scripts/compat-css.js` 构建期 oklch→sRGB + `:has()`→`.alma-has-N`（映射 `www/alma-has-rules.js`）；`scripts/shim/alma-compat.js` 运行时补类、textarea 自适应、inline color-mix。
- **坑**：
  1. 构建期替换必须跳过 CSS 注释：retro 注释里的 `:has()` 曾被替换成空映射（`alma-has-12` 的 `s` 为空）。
  2. 不要在 `CSSStyleDeclaration.prototype` 上 `defineProperty` 遮 `background`：Chrome 100 上会与原生 `getPropertyValue` 递归/卡死。正确做法是 MutationObserver 监听 `style` 属性，把属性字符串里的 `color-mix(...)` 就地替换成 `rgba(...)`（属性里保留了原始字符串，即使 computed 值已失效）。
  3. `sync-assets.sh` 里兼容脚本必须在复制 renderer 后、注入 HTML 前跑；升级 renderer 时只跑 `npx cap sync` 不会转换 CSS。
- **验证**：Chromium 100.0.4896 快照 headless 实测 12 条 `:has`、`field-sizing`、inline color-mix、`border`/`bg-red-500` 全绿；现代 Chrome 回归通过。

## 2026-10-30 「还是不行」复盘：@layer 才是白框主因，我第一版判断错了

- **现象**（Redmi K30 Pro / Android 12 / MIUI 13）：装上第一版兼容包后界面仍是「有 DOM 没样式」——原生输入框边框、衬线字体、图标竖排堆叠、卡片圆角全无。
- **我错在哪**：先扫特性数量就下结论（oklch 103 个、`:has` 43 处），把 `@layer` 当成「Chromium 99+ 才需要、目标 100 用不上」而忽略；并臆测「MIUI 14 出厂 WebView 常见 100–110」。**实测这台是 WebView 96.0.4664.104**，`@layer` 直接不支持。
- **真正根因**：Tailwind 4 把**全部**样式包进 5 个 `@layer`（utilities 独占 31 万字符），`@layer` 之外的顶层规则只有 `@property` 和少量 `@supports`。内核不认 `@layer` → 整份 CSS 归零，连 `:root` 里的 `--spacing`/`--font-sans`/`--color-*` 一起消失 → `calc(var(--spacing)*4)` 全失效。所以看起来「连 flex 都坏了」，其实 `.flex` 规则一直都在。
- **修复**：`compat-css.js` 增加 `expandLayers()`，递归展开成裸规则（文件里的 layer 顺序就是层叠顺序，铺平后优先级一致）。必须在 oklch/`:has` 处理**之前**跑。
- **教训**：
  1. **别用「特性数量」代替「结构位置」判断**。`@layer` 只有 5 处，却是唯一的致命单点；1148 处 color-mix 反而无害。判断失效面要看「规则是否被包在某个可能整体失效的结构里」。
  2. **别猜设备内核版本**。`adb shell dumpsys webviewupdate` 一行就能拿到，实测 96 与猜测 100+ 差了整整一个 `@layer`。
  3. 症状可反推层级：**连 base 重置（`box-sizing`/`margin:0`/`font-family`）都失效**，说明不是单个属性不支持，而是整个样式表被丢弃——优先怀疑 `@layer`、`@import` 失败、或 MIME 不对。
  4. 自检命令：`grep -c '@layer' www/assets/*.css`，转换后应只剩注释里的 4 处（retro 主题注释）。
