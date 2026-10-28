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
      return json(p, 201);
    }

    if ((m = path.match(/^\/api\/providers\/([^/]+)\/models$/))) {
      var pid1 = m[1], pr1 = d.providers.find(function (x) { return x.id === pid1; });
      if (!pr1) return err("provider not found", 404);
      if (method === "GET") return json({ models: pr1.models || [] });
      if (method === "PUT") {
        pr1.models = (body && body.models) || [];
        save(d);
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
        return json(pr5);
      }
      if (method === "DELETE") {
        var d3 = db();
        d3.providers = d3.providers.filter(function (x) { return x.id !== m[1]; });
        save(d3);
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

    if (method === "GET" && path === "/api/settings") return json(d.settings);
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

  // WebSocket：本地模式下的 /ws/* 无处可连，返回永不打开的哑连接
  // （避免 ProviderSyncClient 对 ws://alma.local 的无限重连）
  var RealWebSocket = window.WebSocket;
  function PatchedWebSocket(url, protocols) {
    var u = String(url);
    if (u.indexOf("ws://alma.local") === 0 || u.indexOf("wss://alma.local") === 0) {
      this.readyState = 0; // CONNECTING：不 open 也不 close → 客户端 isConnecting 卡位，不再重试
      this.send = function () {};
      this.close = function () {};
      this.addEventListener = function () {};
      this.removeEventListener = function () {};
    } else {
      return new RealWebSocket(url, protocols);
    }
  }
  PatchedWebSocket.CONNECTING = 0; PatchedWebSocket.OPEN = 1;
  PatchedWebSocket.CLOSING = 2; PatchedWebSocket.CLOSED = 3;
  window.WebSocket = PatchedWebSocket;

  window.__ALMA_LOCAL_ENGINE__ = true;
})();
