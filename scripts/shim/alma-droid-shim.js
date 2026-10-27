// alma-android 平台 shim：在应用 JS 之前就位，等价官方 iOS 壳提供的原生桥。
// 全部 ??= —— 只补缺失，不覆盖任何已存在实现。
// 平台身份：android（不再伪装 ios；isPhoneShell / PlatformContext 已扩展 android 分支）
(function () {
  var noop = function () {};
  var rejecter = function (name) {
    return function () { return Promise.reject(new Error(name + " unavailable on this device")); };
  };
  var noopObj = function (fns, base) {
    var o = base || {};
    fns.forEach(function (n) { if (!o[n]) o[n] = function () { return Promise.resolve({}); }; });
    return o;
  };
  var capPlugin = function (name) {
    try { return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null; }
    catch (e) { return null; }
  };

  var PLATFORM = "android";

  // ── 关键：首帧就是手机布局 ─────────────────────────────────────
  // PlatformProvider 初始 platform="darwin"，get() 异步返回后切换会导致
  // 桌面布局闪现再重挂载（"一闪一闪"的元凶）。本脚本在应用模块执行前同步设好。
  if (document.body) document.body.dataset.platform = PLATFORM;
  document.addEventListener("DOMContentLoaded", function () {
    document.body.dataset.platform = PLATFORM;
  });

  window.platform = window.platform || {
    get: function () { return Promise.resolve(PLATFORM); },
    windowControlsHidden: function () { return Promise.resolve(false); }
  };
  window.__ALMA_ANDROID__ = true;

  // UI 细节：hero 副标题平衡换行（中文文案末尾的 "Alma" 不再孤行到第二行）
  try {
    var st = document.createElement("style");
    st.textContent = ".hero-fade.mb-8{text-wrap:balance}";
    document.head.appendChild(st);
  } catch (e) {}

  // API 桥：不在本 shim 定义 —— connected 模块的官方 apiServerShim（??= 安装）接管：
  // getBackendMode()（Preferences：remote/local）→ remote+E2E 激活给哨兵 baseURL、
  // local 给 LOCAL_BASE。配对状态读的是 Capacitor Preferences（真机原生存储），
  // 与 setE2EConfig 写入同源，避免手写判定在真机上错位。

  // 设置：settingsWindow.open → 导航到手机版设置页（settings.html 含 phone.settings.* UI）
  window.settingsWindow ??= {
    open: function (tab) {
      location.href = "./settings.html" + (tab ? "#" + encodeURIComponent(tab) : "");
      return Promise.resolve();
    },
    close: function () {
      if (history.length > 1) history.back();
      else location.href = "./index.html";
      return Promise.resolve();
    }
  };

  // 触感：优先 Capacitor Haptics 原生震动
  window.haptics ??= {
    tick: function (style) {
      var H = capPlugin("Haptics");
      if (H) H.impact({ style: "LIGHT" }).catch(noop);
    },
    impact: function (o) { var H = capPlugin("Haptics"); if (H) H.impact(o || { style: "LIGHT" }).catch(noop); },
    notification: function (o) { var H = capPlugin("Haptics"); if (H) H.notification(o || { type: "SUCCESS" }).catch(noop); },
    selection: function () { var H = capPlugin("Haptics"); if (H) H.selectionChanged().catch(noop); }
  };

  // Electron ipcRenderer：不可用语义（未配对手机同样无主进程）
  window.ipcRenderer ??= {
    send: noop, sendSync: function () { return undefined; }, sendTo: noop, sendToHost: noop, postMessage: noop,
    invoke: rejecter("ipcRenderer"),
    on: noop, once: noop, off: noop, removeListener: noop, removeAllListeners: noop,
    emit: noop, listenerCount: function () { return 0; }
  };

  // 剪贴板：优先 Capacitor 原生（Android WebView 的 navigator.clipboard 常被拒）
  window.electronClipboard ??= {
    writeText: function (t) {
      var C = capPlugin("Clipboard");
      if (C) return C.write({ string: t });
      return (navigator.clipboard || { writeText: noop }).writeText(t);
    },
    readText: function () {
      var C = capPlugin("Clipboard");
      if (C) return C.read().then(function (r) { return r && r.value || ""; });
      if (navigator.clipboard && navigator.clipboard.readText) return navigator.clipboard.readText();
      return Promise.resolve("");
    }
  };

  // 桌面专属桥：无害降级
  window.windowControls ??= {
    setWindowControlsHidden: noop, getWindowControlsHidden: function () { return Promise.resolve(false); },
    isMaximized: function () { return Promise.resolve(false); },
    isFullscreen: function () { return Promise.resolve(false); },
    isFullScreen: function () { return Promise.resolve(false); },
    isFocused: function () { return Promise.resolve(true); },
    minimize: noop, maximize: noop, unmaximize: noop, close: noop, toggleFullscreen: noop
  };
  window.systemFile ??= noopObj(["open", "save", "reveal", "openAndRead"]);
  window.almaApp ??= noopObj(["getInfo", "getVersion", "checkForUpdates", "quit", "relaunch"]);
  window.moreMenu ??= { show: noop, hide: noop };
  window.selectDirectory ??= rejecter("selectDirectory");
  window.getPathForFile ??= function (f) { return f && f.name; };
})();
