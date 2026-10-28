// alma-android 平台 shim：在应用 JS 之前就位，等价官方 iOS 壳提供的原生桥。
// 全部 ??= —— 只补缺失，不覆盖任何已存在实现。
// 平台身份：android（isPhoneShell / PlatformContext 已扩展 android 分支）
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

  // ── 冷启动底色：React 挂载前用主题色打底（与官方 FOUC guard 同一缓存键）──
  // html 背景/主题变量在 CSS 与 root class 之外再垫一层内联底色，
  // 避免 body 为空时露出视口默认白底（暗色用户看到的是"白屏"的主因）。
  try {
    var raw = localStorage.getItem("alma:appearance-cache");
    var mode = raw ? (JSON.parse(raw).mode || null) : null;
    if (mode === "dark" || mode === "light") {
      document.documentElement.style.backgroundColor = mode === "dark" ? "#282c34" : "#ffffff";
    }
  } catch (e) {}

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

  // ── 设置窗口：同文档 iframe 覆盖层 ──────────────────────────────
  // 桌面端设置是独立 BrowserWindow；直接用 location 导航会让整个 renderer
  // 冷启动（且 E2E 中继的活跃 WebSocket 使页面无 bfcache 资格）→ 关设置白屏数秒。
  // 改为 iframe 承载 settings.html：开=显示（首开后常驻隐藏复用，秒开），关=隐藏。
  // 注意：刻意不做 pushState/history.back —— iframe 参与联合会话历史，
  // 跨 frame 的历史操作存在竞态（实测会把主文档弹到 about:blank）；
  // Android 返回键由 MainActivity 原生侧调 window.__almaAndroidBack() 接管。
  var inSubframe = false;
  try { inSubframe = window.parent && window.parent !== window; } catch (e) {}

  function settingsFrame() { return document.getElementById("alma-settings-frame"); }
  function hideSettingsFrame() {
    var f = settingsFrame();
    if (f) f.style.display = "none";
  }
  if (!inSubframe) {
    window.addEventListener("message", function (e) {
      if (e && e.data && e.data.type === "alma-settings-close") hideSettingsFrame();
    });
    // 原生返回键入口（MainActivity.onBackPressed 调用）：设置层可见则关闭并报告已处理
    window.__almaAndroidBack = function () {
      var f = settingsFrame();
      if (f && f.style.display !== "none") { hideSettingsFrame(); return true; }
      return false;
    };
  }

  window.settingsWindow ??= {
    open: function (tab) {
      if (inSubframe) return Promise.resolve(); // 设置层内部不再开新层
      var f = settingsFrame();
      if (!f) {
        f = document.createElement("iframe");
        f.id = "alma-settings-frame";
        f.src = "./settings.html" + (tab ? "#" + encodeURIComponent(tab) : "");
        f.setAttribute("style",
          "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#fff");
        document.body.appendChild(f);
      } else {
        f.style.display = "block";
      }
      return Promise.resolve();
    },
    close: function () {
      if (inSubframe) {
        // 设置层内部（settings.html 的完成按钮）：通知宿主隐藏
        try { window.parent.postMessage({ type: "alma-settings-close" }, "*"); } catch (e) {}
      } else {
        hideSettingsFrame();
      }
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

  // 应用信息：真值实现（版本懒读 renderer 自带的 SENTRY_RELEASE，形如 alma@0.4.213）
  window.almaApp ??= {
    getInfo: function () {
      var ver = "";
      try {
        var id = (window.SENTRY_RELEASE && window.SENTRY_RELEASE.id) || "";
        ver = id.indexOf("@") > -1 ? id.split("@")[1] : id;
      } catch (e) {}
      return Promise.resolve({ name: "Alma", version: ver, build: "", platform: PLATFORM, arch: "android" });
    },
    getVersion: function () {
      return this.getInfo().then(function (i) { return i.version; });
    },
    checkForUpdates: function () { return Promise.resolve({ available: false, version: null }); },
    getUpdateInfo: function () { return Promise.resolve({ available: false, version: null }); },
    quit: noop, relaunch: noop
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
  window.moreMenu ??= { show: noop, hide: noop };
  window.selectDirectory ??= rejecter("selectDirectory");
  window.getPathForFile ??= function (f) { return f && f.name; };
})();
