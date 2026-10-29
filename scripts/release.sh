#!/usr/bin/env bash
# Alma Android 发布脚本：测试 → 构建 → latest.json → commit → tag → push → GitHub Release。
#
# 用法：
#   bash scripts/release.sh [版本号] [发布说明]
#   版本号缺省 = 当前 versionName 的 patch 位 +1（1.3.0 → 1.3.1）
#   发布说明缺省 = "Alma Android v<版本>。"
#
# 前置：HEAD 干净（www/ 与 android/ 已提交）；test 三件套全绿才会走到 commit
# （对应「端到端测试和回归测试通过之前不许提交」的项目规则）。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="${ALMA_TEST_DIR:-$ROOT/../test}"
GRADLE="$ROOT/android"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"

cd "$ROOT"

# ── 0. 前置检查 ─────────────────────────────────────────────────────
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ 工作区有未提交改动；先提交或 stash 再发布。" >&2
  exit 1
fi
command -v gh >/dev/null || { echo "✗ 需要 gh CLI。" >&2; exit 1; }
for t in cdp-e2e.mjs cdp-drawer.mjs cdp-webview-gate.mjs; do
  [ -f "$TEST_DIR/$t" ] || { echo "✗ 缺少测试 $TEST_DIR/$t（可用 ALMA_TEST_DIR 覆盖路径）。" >&2; exit 1; }
done

# ── 1. 版本号 ───────────────────────────────────────────────────────
GRADLE_FILE="$GRADLE/app/build.gradle"
CUR_NAME="$(sed -n 's/.*versionName "\([^"]*\)".*/\1/p' "$GRADLE_FILE" | head -1)"
CUR_CODE="$(sed -n 's/.*versionCode \([0-9]*\).*/\1/p' "$GRADLE_FILE" | head -1)"
NEW_NAME="${1:-}"
if [ -z "$NEW_NAME" ]; then
  NEW_NAME="$(echo "$CUR_NAME" | awk -F. '{print $1"."$2"."$3+1}')"
fi
NEW_CODE=$((CUR_CODE + 1))
NOTES="${2:-Alma Android v${NEW_NAME}。}"
TAG="v${NEW_NAME}"
ASSET="alma-android-${TAG}.apk"
echo "▶ $CUR_NAME ($CUR_CODE) → $NEW_NAME ($NEW_CODE)  tag=$TAG"

# ── 2. 回归测试（www 静态服务 8778 + CDP 断言三件套）────────────────
# www/alma-droid-shim.js 等最终态已提交，测试即针对当前 HEAD；版本号写在
# android/ 不影响 www 层测试，先测后改号等价于测即将发布的代码。
STARTED_SERVER=0
if ! curl -sf -o /dev/null http://127.0.0.1:8778/ ; then
  echo "▶ 启动 www 静态服务 :8778"
  python3 -m http.server 8778 --directory "$ROOT/www" >/dev/null 2>&1 &
  SERVER_PID=$!
  STARTED_SERVER=1
  sleep 1
fi
cleanup() { [ "$STARTED_SERVER" = 1 ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

fail=0
for t in cdp-webview-gate.mjs cdp-e2e.mjs cdp-drawer.mjs cdp-update.mjs; do
  [ -f "$TEST_DIR/$t" ] || continue
  echo "── $t"
  if ! node "$TEST_DIR/$t"; then fail=1; fi
done
if [ "$fail" = 1 ]; then echo "✗ 测试未全绿，中止（未提交任何内容）。" >&2; exit 1; fi
echo "✓ 回归测试全绿"

# ── 3. 写版本号 + 构建 APK ──────────────────────────────────────────
sed -i '' -e "s/versionCode $CUR_CODE/versionCode $NEW_CODE/" \
          -e "s/versionName \"$CUR_NAME\"/versionName \"$NEW_NAME\"/" "$GRADLE_FILE"
echo "▶ gradle assembleDebug（JDK $JAVA_HOME）"
( cd "$GRADLE" && ./gradlew -q assembleDebug )
APK="$GRADLE/app/build/outputs/apk/debug/app-debug.apk"
[ -f "$APK" ] || { echo "✗ 构建产物缺失：$APK" >&2; exit 1; }
cp "$APK" "/tmp/$ASSET"
# 本地分发目录（外层 apk-serve，非 git）
[ -d "$ROOT/../apk-serve" ] && cp "$APK" "$ROOT/../apk-serve/app-debug.apk" || true

# ── 4. latest.json（镜像 fallback 的 raw 源，随 main 分支发布）────────
# notes 用 \n 转义以便单行 JSON；应用内只展示版本号，这里仅留档。
python3 - "$TAG" "$ASSET" "$NOTES" <<'PY'
import json, sys
tag, asset, notes = sys.argv[1:4]
with open("latest.json", "w") as f:
    json.dump({"tag": tag, "apk": asset, "notes": notes.replace("\n", " ")}, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY

# ── 5. commit + tag + push ─────────────────────────────────────────
git add -A
git commit -m "release: $TAG (versionCode $NEW_CODE)

$NOTES"
git tag "$TAG"
git push origin main
git push origin "$TAG"

# ── 6. GitHub Release（附 APK 资产；应用内检查即读它）──────────────
gh release create "$TAG" "/tmp/$ASSET#$ASSET" \
  --repo nanami-0713/alma-android \
  --title "Alma Android $TAG" \
  --notes "$NOTES"

echo "✓ 发布完成：$TAG（资产 $ASSET，latest.json 已随 main 推送）"
