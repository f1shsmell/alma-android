// alma-android WebView 内核版本门槛（"UI 完全没适配"的根因兜底）。
// 【必须保持纯 ES5】：本文件要在 Chromium <85（连 ??= 都无法解析，shim
// 整个文件直接 SyntaxError 的设备）上也跑得起来，所以不用任何新语法。
// Alma renderer 原始样式依赖 Chromium 111+（oklch/color-mix/:has/@property）。
// 本项目构建期已把 oklch -> sRGB、:has() -> .alma-has-N，并保留 Tailwind 4
// 自带的 @property 兜底块，目标下限降到 Chromium 100。低于 100 时 @layer
// 等基础能力也不完整，这里在一切应用 JS 之前给出可操作的升级指引；
// 用户可关闭继续使用（记忆在 localStorage）。
(function () {
  var MIN = 100;
  var isTop = true;
  try { isTop = !(window.parent && window.parent !== window); } catch (e) {}
  if (!isTop) return;

  var ua = navigator.userAgent || "";
  var mt = /Chrome\/(\d+)/.exec(ua);
  var ver = mt ? parseInt(mt[1], 10) : 0;
  if (ver >= MIN) return;
  // 非 Android 环境不拦（桌面浏览器调试）；Android 上无 Chrome 版本号
  // 的非 Chromium 内核同样无法渲染，照拦。
  if (!ver && ua.indexOf("Android") === -1) return;
  try { if (localStorage.getItem("alma.android.webview.dismiss")) return; } catch (e) {}

  var lang = "zh";
  try {
    var lg = (localStorage.getItem("i18nextLng") ||
      (window.__almaAndroidLang__ || navigator.language || "zh")).toLowerCase();
    lang = lg.indexOf("ja") === 0 ? "ja" : lg.indexOf("zh") === 0 ? "zh" : "en";
  } catch (e) {}

  var L = {
    zh: {
      title: "界面无法正常显示",
      body: "这台设备的系统浏览器内核（Android WebView）版本过低：Alma 的界面需要 Chromium " + MIN + " 或更高版本，当前是 " + (ver || "未知") + "，配色与布局无法渲染。",
      how: "请在系统「应用商店」或「设置 → 系统应用更新」里升级 Android System WebView（部分系统显示为「浏览器内核」），然后重新打开 Alma。",
      go: "仍要继续使用"
    },
    en: {
      title: "The interface can't render",
      body: "This device's Android System WebView is too old: Alma's interface needs Chromium " + MIN + " or newer (found " + (ver || "unknown") + "), so colors and layout fail to render.",
      how: "Update Android System WebView from the system app store (Settings → system app updates), then reopen Alma.",
      go: "Continue anyway"
    },
    ja: {
      title: "画面を正しく表示できません",
      body: "この端末の Android System WebView が古すぎます：Alma の画面には Chromium " + MIN + " 以降が必要です（現在 " + (ver || "不明") + "）。",
      how: "システムのアプリストアなどで「Android System WebView」を更新してから、Alma を開き直してください。",
      go: "このまま続ける"
    }
  }[lang];

  function el(tag, text, style) {
    var d = document.createElement(tag);
    d.setAttribute("style", style);
    if (text) d.textContent = text;
    return d;
  }

  var box = el("div", null,
    "position:fixed;inset:0;z-index:2147483600;background:#282c34;color:#f3f4f6;" +
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
    "display:-webkit-flex;-webkit-align-items:center;-webkit-justify-content:center;" +
    "display:flex;align-items:center;justify-content:center;padding:32px 24px;");
  var card = el("div", null, "max-width:420px;width:100%;");
  card.appendChild(el("div", "Alma", "font-size:15px;font-weight:600;color:#9ca3af;margin-bottom:12px;"));
  card.appendChild(el("div", L.title, "font-size:22px;font-weight:700;line-height:1.3;margin-bottom:14px;"));
  card.appendChild(el("div", L.body, "font-size:14px;line-height:1.7;color:#d1d5db;margin-bottom:14px;"));
  card.appendChild(el("div", L.how,
    "font-size:14px;line-height:1.7;color:#9ca3af;padding:12px 14px;" +
    "background:#31353d;border-radius:10px;margin-bottom:18px;"));
  var btn = el("button", L.go,
    "font-size:14px;font-weight:600;color:#9ca3af;background:none;border:none;" +
    "padding:8px 4px;text-decoration:underline;");
  btn.onclick = function () {
    try { localStorage.setItem("alma.android.webview.dismiss", "1"); } catch (e) {}
    if (box.parentNode) box.parentNode.removeChild(box);
  };
  card.appendChild(btn);
  box.appendChild(card);

  function mount() {
    (document.body || document.documentElement).appendChild(box);
  }
  if (document.body) { mount(); return; }
  document.addEventListener("DOMContentLoaded", mount);
})();
