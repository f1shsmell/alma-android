#!/bin/bash
# 从 alma-re 的运行树同步 Alma 官方 renderer 到 www/ 并注入手机平台桥。
# 用法: bash scripts/sync-assets.sh [alma-re路径]   （默认 ~/AlmaProjects/alma-re）
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${1:-$HOME/AlmaProjects/alma-re}/app/out/renderer"

[ -d "$SRC" ] || { echo "✗ 找不到 $SRC（先在 alma-re 跑 scripts/extract-app.py）"; exit 1; }

rm -rf www
mkdir -p www
# renderer 全量拷贝（assets/fonts/各 html 入口）
cp -R "$SRC/." www/

# ── 1. 注入 shim（紧跟 <body>：document.body 已存在 → 首帧即手机布局） ──
python3 - << 'PYEOF'
import glob, re, shutil
shutil.copyfile('scripts/shim/alma-droid-shim.js', 'www/alma-droid-shim.js')

for p in glob.glob('www/*.html'):
    s = open(p, encoding='utf-8').read()
    if '__ALMA_ANDROID__' in s:
        continue
    # 若旧注入残留在 head，先移除
    s = re.sub(r'<script>\s*// alma-android: 平台桥.*?</script>\n?', '', s, flags=re.S)
    m = re.search(r'<body[^>]*>', s)
    if m:
        s = s[:m.end()] + '\n<script src="./alma-droid-shim.js"></script>' + s[m.end():]
    else:
        s = s.replace('</head>', '<script src="./alma-droid-shim.js"></script></head>')
    open(p, 'w', encoding='utf-8').write(s)
    print('✓ 注入', p)
PYEOF

# ── 2. Android 平台身份补丁：所有手机 UI 门控纳入 android ──
python3 - << 'PYEOF'
import glob

# dataset 判定（phone shell 门控的通用形式，出现在 App / mermaid 等多个 chunk）
A_OLD = 'document.body.dataset.platform === "ios"'
A_NEW = '(document.body.dataset.platform === "ios" || document.body.dataset.platform === "android")'
# PlatformContext state 判定
B_OLD = 'const isPhone = platform === "ios";'
B_NEW = 'const isPhone = platform === "ios" || platform === "android";'
# 官方代码里 isIOS 的事实语义是「手机壳」（当时只有 iOS 壳）：
# App 手机标题栏/触控尺寸/边距与 settings 整套手机 UI 都挂在 context.isIOS 上。
# android 壳必须打开它；真值另由 isAndroid 表达，platform 字符串仍是 "android"。
C_OLD = 'isIOS: platform === "ios",'
C_NEW = 'isIOS: platform === "ios" || platform === "android", isAndroid: platform === "android",'
# 频闪残根：PlatformProvider 初始 state "darwin" → get() 异步回来才翻成 android，
# 首帧 context 是 isMac:true，整棵树重挂一次。改为同步从 dataset 初始化（shim 已提前设好）。
D_OLD = 'const [platform, setPlatform] = reactExports.useState("darwin");'
D_NEW = ('const [platform, setPlatform] = reactExports.useState(function () '
         '{ try { return document.body.dataset.platform || "darwin"; } catch (e) { return "darwin"; } });')
# settings 标题栏窗口控件：手机壳无桌面窗口控件
E_OLD = 'if (platform === "ios") return "none";'
E_NEW = 'if (platform === "ios" || platform === "android") return "none";'

PAIRS = [(A_OLD, A_NEW), (B_OLD, B_NEW), (C_OLD, C_NEW), (D_OLD, D_NEW), (E_OLD, E_NEW)]
for p in glob.glob('www/assets/*.js'):
    s = open(p, encoding='utf-8').read()
    o, n = s, 0
    for old, new in PAIRS:
        n += s.count(old)
        s = s.replace(old, new)
    if s != o:
        open(p, 'w', encoding='utf-8').write(s)
        print(f'✓ {p.split("/")[-1]}: {n} 处手机门控纳入 android')
PYEOF

# ── 2.5 手机 composer 布局修复：chip 可收缩 ──
# model/effort chip 只有 max-w-[46vw] 没有 min-w-0 —— flex 项的 min-content
# 会被长模型名（如 Deepseek-V3.2-Exp）撑死，行总宽超出屏宽，把 shrink-0 的
# 圆形发送按钮挤出屏幕右缘切半。加 min-w-0 让 chip 收缩（span 自带 truncate）。
python3 - << 'PYEOF'
p = 'www/assets/App-CHUt1SP7.js'
s = open(p, encoding='utf-8').read()
OLD = 'const chip = "flex h-9 max-w-[46vw] '
NEW = 'const chip = "flex h-9 min-w-0 max-w-[46vw] '
assert OLD in s, 'chip 类定义未找到'
s = s.replace(OLD, NEW)
open(p, 'w', encoding='utf-8').write(s)
print('✓ composer chip → min-w-0（修复发送按钮被切）')
PYEOF

# ── 3.5 手机桥：复用官方 connected chunk 的桥实现（almaIOSConfig/E2E/全量 Electron shim）──
# 官方 iOS 壳由原生注入这些桥；Android 壳用 connected-D8mcBngn.js 里的 JS 参考实现。
# boot() 是桌面 handoff 流程（要求 #connect? hash、platform="connected"），不能跑——
# 换成迷你 boot：只装桥不渲染。全部 ??=，与 shim 共存（shim 先执行，android 身份优先）。
# 注意：不调 installConnectedWindowBridges（它非 ??= 覆盖 settingsWindow 为桌面 hash 路由）。
python3 - << 'PYEOF'
import re

p = 'www/assets/connected-D8mcBngn.js'
s = open(p, encoding='utf-8').read()
MINI_BOOT = '''// alma-android: 手机迷你 boot —— 只装桥，不做 connected 桌面渲染/hash 配对。
installElectronShim();
installE2EBridge();
installConnectedApprovalBridge(apiClient, E2E_SENTINEL_BASE);
installConnectedQuestionBridge(apiClient, E2E_SENTINEL_BASE);
installRendererFetchTimeoutGuard();
window.systemFile.openInPreview = (path) => downloadHostFile(path, E2E_SENTINEL_BASE);
window.systemFile.readAsDataUrl = (path) => readHostFileAsDataUrl(path, E2E_SENTINEL_BASE);
'''
new = re.sub(r'void boot\(\)\.catch\(\(error\) => \{.*?\}\);', MINI_BOOT, s, count=1, flags=re.S)
assert new != s, 'boot() 尾调用未找到，connected chunk 结构变了'
open(p, 'w', encoding='utf-8').write(new)
print('✓ connected chunk → 迷你 boot（装桥不渲染）')

# 入口注入：<head> 里 entry 模块之前加载 connected 模块（同为 deferred，按序执行；
# shim 是 body 里的非延迟脚本，仍最先执行 → ??= 以 shim 为准）
for p in ['www/index.html', 'www/settings.html']:
    s = open(p, encoding='utf-8').read()
    if 'connected-D8mcBngn.js' in s:
        continue
    tag = '<script type="module" crossorigin src="./assets/connected-D8mcBngn.js"></script>'
    m = re.search(r'<script type="module"[^>]*src="[^"]*"', s)
    s = s[:m.start()] + tag + '\n  ' + s[m.start():]
    open(p, 'w', encoding='utf-8').write(s)
    print('✓ 注入桥模块', p)
PYEOF

# ── 3.9 文案中性化：iOS 专属措辞 → 设备中性（只动可见整句，不碰 UA/平台检测代码） ──
python3 - << 'PYEOF'
import glob
REPL = [
    ('On this iPhone', 'On this device'),
    ('This iPhone only', 'This device only'),
    ('Pair this iPhone', 'Pair this device'),
    ('Connect this iPhone', 'Connect this device'),
    ('This iPhone drives', 'This device drives'),
    ('仅在这台 iPhone 上', '仅在这台设备上'),
    ('在这台 iPhone 上', '在这台设备上'),
    ('这台 iPhone', '这台设备'),
    ('iPhone 上で動作します', '端末上で動作します'),
    ('iPhone のみ', 'この端末のみ'),
    ('この iPhone をペアリングして始めましょう', 'この端末をペアリングして始めましょう'),
]
n = 0
for p in glob.glob('www/assets/*.js'):
    s = open(p, encoding='utf-8').read()
    o = s
    for a, b in REPL:
        s = s.replace(a, b)
    if s != o:
        open(p, 'w', encoding='utf-8').write(s)
        n += sum(o.count(a) for a, _ in REPL)
print(f'✓ 文案中性化 {n} 处')
PYEOF

echo "✓ www/ 就绪（$(du -sh www | cut -f1)）— npx cap sync android"
