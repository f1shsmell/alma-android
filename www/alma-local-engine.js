// alma-local-engine：手机本机模式的本地 API 引擎。
// 官方 iOS 壳在原生层伺服 http://alma.local；Android 壳用本引擎在 WebView 内
// 拦截 fetch(/WebSocket) 提供同源实现 —— 数据持久化在 localStorage。
// 覆盖面 v1：providers CRUD / 模型列表与拉取 / 连接测试 / settings / health。
// （本地生成 /api/chat/completions 属于下一里程碑，暂不实现。）
(function () {
  var ORIGIN = "http://alma.local";
  var STORE_KEY = "alma.local.data.v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save(d) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function db() {
    var d = load();
    if (!Array.isArray(d.providers)) d.providers = [];
    if (!d.settings || typeof d.settings !== "object") d.settings = {};
    return d;
  }
  function json(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  function err(msg, status) {
    return json({ error: msg }, status || 400);
  }
  function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      ("p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10));
  }

  // ── provider 直连（openai 系 / anthropic 两种鉴权形状）──────────────
  function providerHeaders(p) {
    var h = { "Content-Type": "application/json" };
    if (p.apiFormat === "anthropic" || p.providerType === "anthropic") {
      h["x-api-key"] = p.apiKey || "";
      h["anthropic-version"] = "2023-06-01";
      h["anthropic-dangerous-direct-browser-access"] = "true";
    } else {
      h["Authorization"] = "Bearer " + (p.apiKey || "");
    }
    if (p.customHeaders && typeof p.customHeaders === "object") {
      Object.keys(p.customHeaders).forEach(function (k) { h[k] = p.customHeaders[k]; });
    }
    return h;
  }
  function modelsUrl(p) {
    var base = (p.baseURL || "").replace(/\/+$/, "");
    var wantsV1 = p.apiFormat === "anthropic" || p.providerType === "anthropic";
    var path = wantsV1 ? (base.endsWith("/v1") ? "/models" : "/v1/models") : "/models";
    return base + path;
  }
  function normalizeModels(raw) {
    var arr = raw && (raw.data || raw.models || raw) || [];
    if (!Array.isArray(arr)) return [];
    return arr.map(function (m) {
      var id = typeof m === "string" ? m : (m && (m.id || m.name));
      return id ? { id: id, name: id, capabilities: {} } : null;
    }).filter(Boolean);
  }

  // ── 路由 ────────────────────────────────────────────────────────────
  function route(method, path, body) {
    var d = db();
    var m;

    if (method === "GET" && path === "/api/health") return json({ ok: true });

    if (method === "GET" && path === "/api/providers") return json(d.providers);

    if (method === "POST" && path === "/api/providers") {
      var p = body || {};
      p.id = p.id || uuid();
      if (!Array.isArray(p.models)) p.models = [];
      d.providers.push(p);
      save(d);
      broadcastProviders("provider_created", { provider: p });
      return json(p, 201);
    }

    if ((m = path.match(/^\/api\/providers\/([^/]+)\/models$/))) {
      var pid1 = m[1], pr1 = d.providers.find(function (x) { return x.id === pid1; });
      if (!pr1) return err("provider not found", 404);
      if (method === "GET") return json({ models: pr1.models || [] });
      if (method === "PUT") {
        pr1.models = (body && body.models) || [];
        save(d);
        broadcastProviders("provider_updated", { provider: pr1 });
        return json({ models: pr1.models });
      }
    }

    // 从 provider API 实际拉取模型目录（客户端直连，受各家 CORS 策略影响）
    if (method === "GET" && (m = path.match(/^\/api\/providers\/([^/]+)\/models\/fetch$/))) {
      var pr2 = d.providers.find(function (x) { return x.id === m[1]; });
      if (!pr2) return err("provider not found", 404);
      return fetch(modelsUrl(pr2), { headers: providerHeaders(pr2) }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (raw) {
        var list = normalizeModels(raw);
        pr2.availableModels = list;
        var d2 = db();
        var pr3 = d2.providers.find(function (x) { return x.id === pr2.id; });
        if (pr3) { pr3.availableModels = list; save(d2); }
        return json({ models: list });
      }).catch(function (e) {
        return json({ models: [], warning: "拉取模型列表失败：" + (e && e.message) + "（部分服务商限制浏览器直连）" });
      });
    }

    // 连接测试：GET models 端点即可验证 key 与连通性
    if (method === "POST" && (m = path.match(/^\/api\/providers\/([^/]+)\/test$/))) {
      var pr4 = d.providers.find(function (x) { return x.id === m[1]; });
      if (!pr4) return err("provider not found", 404);
      var modelId = body && body.modelId || (pr4.models && pr4.models[0] && pr4.models[0].id) || null;
      return fetch(modelsUrl(pr4), { headers: providerHeaders(pr4) }).then(function (r) {
        return r.ok
          ? json({ success: true, modelId: modelId, latencyMs: 0 })
          : json({ success: false, modelId: modelId, error: "HTTP " + r.status });
      }).catch(function (e) {
        return json({ success: false, modelId: modelId, error: (e && e.message) || "network error" });
      });
    }

    if ((m = path.match(/^\/api\/providers\/([^/]+)$/))) {
      var pr5 = d.providers.find(function (x) { return x.id === m[1]; });
      if (!pr5) return err("provider not found", 404);
      if (method === "PUT") {
        Object.keys(body || {}).forEach(function (k) { pr5[k] = body[k]; });
        save(d);
        broadcastProviders("provider_updated", { provider: pr5 });
        return json(pr5);
      }
      if (method === "DELETE") {
        var d3 = db();
        d3.providers = d3.providers.filter(function (x) { return x.id !== m[1]; });
        save(d3);
        broadcastProviders("provider_deleted", { id: m[1] });
        return new Response(null, { status: 204 });
      }
    }

    // 合并所有已就绪 provider 的已启用模型（模型选择器数据源）
    if (method === "GET" && path === "/api/models") {
      var merged = [];
      d.providers.forEach(function (p) {
        (p.models || []).forEach(function (mm) {
          merged.push({ id: mm.id, name: mm.name || mm.id, providerId: p.id, providerName: p.name, capabilities: mm.capabilities || {} });
        });
      });
      return json({ models: merged });
    }

    // GET 必须返回非空对象且带 general.language：renderer 的 loadSettings() 对空对象
    // 回退 defaultSettings（language:"en"），ThemeContext 的 effect 会据此把整个应用
    // 改回英文（覆盖 shim 的系统语言预置）。语言单源取 i18next 的持久化键
    // i18nextLng —— shim 预置（跟随系统）与设置里的语言行（手动切换）都写它。
    if (method === "GET" && path === "/api/settings") {
      var out = JSON.parse(JSON.stringify(d.settings));
      if (!out.general || typeof out.general !== "object") out.general = {};
      var curLng = null;
      try { curLng = localStorage.getItem("i18nextLng"); } catch (e) {}
      out.general.language = curLng || out.general.language || "en";
      return json(out);
    }
    if (method === "PUT" && path === "/api/settings") {
      var s = d.settings, src = body || {};
      Object.keys(src).forEach(function (k) {
        var v = src[k];
        if (v && typeof v === "object" && !Array.isArray(v) && s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) {
          s[k] = Object.assign({}, s[k], v);
        } else {
          s[k] = v;
        }
      });
      save(d);
      return json(s);
    }

    return err("local engine: 未实现 " + method + " " + path, 501);
  }

  function handle(input, init) {
    var url;
    try { url = new URL(typeof input === "string" ? input : (input && input.url) || "", location.href); }
    catch (e) { return null; }
    if (url.origin !== ORIGIN) return null;
    var method = ((init && init.method) || (input instanceof Request && input.method) || "GET").toUpperCase();
    var bodyPromise = (init && init.body)
      ? Promise.resolve(init.body).then(function (b) { return typeof b === "string" ? JSON.parse(b) : b; })
      : (input instanceof Request && method !== "GET" && method !== "HEAD"
        ? input.clone().json().catch(function () { return null; })
        : Promise.resolve(null));
    return bodyPromise.then(function (body) {
      try {
        return route(method, url.pathname, body);
      } catch (e) {
        return err((e && e.message) || "local engine error", 500);
      }
    });
  }

  // fetch 包装（在 connected 模块 installE2EBridge 之前安装 → E2E 只拦哨兵，其余透传到这里）
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var local = null;
    try { local = handle(input, init); } catch (e) { local = null; }
    if (local) return local;
    return realFetch(input, init);
  };

  // ── 回环 WebSocket：镜像桌面端的变更推送 ──────────────────────────
  // 官方 renderer 的服务商增删改靠 ws://…/ws/providers 推送 provider_created/
  // updated/deleted → SWR mutate() 刷新 UI。本地模式无后端可连，改为：连接立即
  // 打开的本地回环 socket；引擎在路由层完成变更后广播对应消息 —— 所有面板
  // （含「启用服务商」等按钮）都能即时反馈，不依赖任何手工补丁。
  var LOCAL_SOCKETS = [];
  function LocalLoopSocket(url) {
    this.url = String(url);
    this.readyState = 0;
    this.onopen = null; this.onmessage = null; this.onclose = null; this.onerror = null;
    var self = this;
    setTimeout(function () {
      if (self.readyState !== 0) return;
      self.readyState = 1;
      if (typeof self.onopen === "function") { try { self.onopen({ type: "open" }); } catch (e) {} }
      LOCAL_SOCKETS.push(self);
    }, 0);
  }
  LocalLoopSocket.prototype.send = function () {};
  LocalLoopSocket.prototype.close = function () {
    this.readyState = 3;
    var i = LOCAL_SOCKETS.indexOf(this);
    if (i > -1) LOCAL_SOCKETS.splice(i, 1);
    // 刻意不派发 close：ProviderSyncClient 的 onclose 会 3 秒重连（风暴）
  };
  LocalLoopSocket.prototype.addEventListener = function (t, fn) { this["on" + t] = typeof fn === "function" ? fn : null; };
  LocalLoopSocket.prototype.removeEventListener = function (t) { this["on" + t] = null; };
  function broadcastProviders(type, payload) {
    var data;
    try { data = JSON.stringify(Object.assign({ type: type }, payload || {})); } catch (e) { return; }
    LOCAL_SOCKETS.slice().forEach(function (s) {
      if (s.readyState === 1 && typeof s.onmessage === "function") {
        try { s.onmessage({ type: "message", data: data }); } catch (e) {}
      }
    });
  }

  // WebSocket：alma.local 的连接给回环实现（真 WS 对不存在的本地服务只会
  // 无限重连）；其余地址透传原生 WebSocket。
  var RealWebSocket = window.WebSocket;
  function PatchedWebSocket(url, protocols) {
    var u = String(url);
    if (u.indexOf("ws://alma.local") === 0 || u.indexOf("wss://alma.local") === 0) {
      return new LocalLoopSocket(u);
    }
    return new RealWebSocket(url, protocols);
  }
  PatchedWebSocket.CONNECTING = 0; PatchedWebSocket.OPEN = 1;
  PatchedWebSocket.CLOSING = 2; PatchedWebSocket.CLOSED = 3;
  window.WebSocket = PatchedWebSocket;

  window.__ALMA_LOCAL_ENGINE__ = true;
})();
