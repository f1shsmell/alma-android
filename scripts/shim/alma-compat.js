// alma-android: Chromium 100 兼容层的运行时部分。
//
// 构建期（scripts/compat-css.js）已经做了两件旧内核会整条丢弃的事：
//   - oklch() -> sRGB
//   - :has() -> .alma-has-N（映射在 alma-has-rules.js）
// 本文件负责这三个运行时缺口：
//   1. :has()  —— 按映射给匹配元素补 .alma-has-N（所有内核都跑，因为
//      CSS 选择器已经被重写；原生 :has 不再参与）
//   2. field-sizing: content —— 旧内核不支持，textarea 用 JS 自适应高度
//   3. inline color-mix —— React 动态样式里的 color-mix 会被旧内核丢弃，
//      拦截 style 设置换成等价的 rgba
//
// 纯 ES5：与 alma-webview-gate.js 保持同样的约束，便于复用到更老的 WebView。
(function () {
  'use strict';

  var rules = window.__ALMA_HAS_RULES__ || [];

  var supportsHas = false;
  try {
    supportsHas = !!(window.CSS && CSS.supports && CSS.supports('selector(:has(*))'));
  } catch (e) {}

  // ── :has() polyfill ────────────────────────────────────────────────

  /** 在顶层按组合器拆成 { head, comb, rest }；忽略 () [] 与引号内部。 */
  function splitTopLevel(sel) {
    var depth = 0;
    var quote = 0;
    var i;
    var c;
    for (i = 0; i < sel.length; i++) {
      c = sel.charAt(i);
      if (quote) {
        if (c === quote && sel.charAt(i - 1) !== '\\') quote = 0;
        continue;
      }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === '(' || c === '[') { depth++; continue; }
      if (c === ')' || c === ']') { depth--; continue; }
      if (depth !== 0) continue;
      if (c === '>' || c === '+' || c === '~') {
        return { head: sel.slice(0, i).trim(), comb: c, rest: sel.slice(i + 1).trim() };
      }
      if (c === ' ' || c === '\t' || c === '\n') {
        var j = i;
        while (j < sel.length && /\s/.test(sel.charAt(j))) j++;
        if (j >= sel.length) break;
        var next = sel.charAt(j);
        if (next === '>' || next === '+' || next === '~') { i = j - 1; continue; }
        return { head: sel.slice(0, i).trim(), comb: ' ', rest: sel.slice(j).trim() };
      }
    }
    return { head: sel.trim(), comb: '', rest: '' };
  }

  /** 判断 el 是否满足 :has(sel) 里的相对选择器 sel。 */
  function test(el, sel) {
    sel = sel.trim();
    if (!sel) return false;
    var first = sel.charAt(0);
    var rest;
    var p;
    try {
      if (first === '>') return !!el.querySelector(':scope ' + sel);

      if (first === '+') {
        var sib = el.nextElementSibling;
        if (!sib) return false;
        rest = sel.slice(1).trim();
        p = splitTopLevel(rest);
        if (!p.head) return false;
        if (!sib.matches(p.head)) return false;
        if (p.comb === '>') return !!sib.querySelector(':scope > ' + p.rest);
        if (p.comb === ' ') return !!sib.querySelector(p.rest);
        return true;
      }

      if (first === '~') {
        var s = el.nextElementSibling;
        rest = sel.slice(1).trim();
        p = splitTopLevel(rest);
        if (!p.head) return false;
        while (s) {
          if (s.matches(p.head)) {
            if (!p.comb) return true;
            if (p.comb === '>' && s.querySelector(':scope > ' + p.rest)) return true;
            if (p.comb === ' ' && s.querySelector(p.rest)) return true;
          }
          s = s.nextElementSibling;
        }
        return false;
      }

      return !!el.querySelector(sel);
    } catch (e) {
      return false;
    }
  }

  function update(el) {
    if (!el || el.nodeType !== 1 || !el.classList) return;
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (test(el, r.s)) el.classList.add(r.c);
      else el.classList.remove(r.c);
    }
    compatStyleAttribute(el);
  }

  var queue = [];
  var scheduled = false;

  function enqueue(el) {
    if (!el || el.nodeType !== 1) return;
    if (queue.indexOf(el) === -1) queue.push(el);
    schedule();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    raf(flush);
  }

  function flush() {
    scheduled = false;
    var items = queue;
    queue = [];
    var targets = [];
    var i;

    // 后代/兄弟/class 变化会影响祖先与“前一个兄弟”的 :has 状态。
    for (i = 0; i < items.length; i++) {
      var el = items[i];
      while (el && el.nodeType === 1) {
        if (targets.indexOf(el) === -1) targets.push(el);
        var prev = el.previousElementSibling;
        if (prev && targets.indexOf(prev) === -1) targets.push(prev);
        el = el.parentElement;
      }
    }

    for (i = 0; i < targets.length; i++) update(targets[i]);
    setupAutoSize();
  }

  function scanAll() {
    if (!document.body) return;
    if (document.documentElement) update(document.documentElement);
    update(document.body);
    var all = document.body.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) update(all[i]);
    setupAutoSize();
  }

  function observe() {
    if (!window.MutationObserver || !document.documentElement) return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'childList') {
          enqueue(m.target);
          for (var j = 0; j < m.addedNodes.length; j++) enqueue(m.addedNodes[j]);
        } else if (m.type === 'attributes') {
          if (m.attributeName === 'style') compatStyleAttribute(m.target);
          enqueue(m.target);
        }
      }
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-state', 'data-slot', 'data-button', 'data-icon',
        'data-streamdown', 'aria-expanded', 'aria-hidden', 'open', 'hidden', 'disabled']
    });
  }

  // ── field-sizing: content ──────────────────────────────────────────

  var supportsFieldSizing = true;
  try {
    supportsFieldSizing = !!(window.CSS && CSS.supports &&
      CSS.supports('field-sizing', 'content'));
  } catch (e) {}

  function autoSize(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    var h = el.scrollHeight;
    if (h > 0) el.style.height = (h + 2) + 'px';
  }

  function setupAutoSize() {
    // 现代内核原生支持 field-sizing；不要再写 inline height 覆盖它，
    // 否则内容后续变化/字体加载时高度不再自动跟随。
    if (supportsFieldSizing) return;
    try {
      var els = document.querySelectorAll('.field-sizing-content');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.tagName !== 'TEXTAREA' || el.__almaAutoSize) continue;
        el.__almaAutoSize = true;
        el.addEventListener('input', function () { autoSize(this); });
        autoSize(el);
      }
    } catch (e) {}
  }

  // ── inline color-mix（React 动态 style） ───────────────────────────

  var supportsColorMix = true;
  try {
    supportsColorMix = !!(window.CSS && CSS.supports &&
      CSS.supports('color', 'color-mix(in srgb, red, blue)'));
  } catch (e) {}

  var rootStyle = null;

  function rootVar(name) {
    try {
      if (!rootStyle) rootStyle = getComputedStyle(document.documentElement);
      return rootStyle.getPropertyValue(name).trim();
    } catch (e) {
      return '';
    }
  }

  function parseColor(value, depth) {
    if (depth > 8) return null;
    value = String(value == null ? '' : value).trim();
    if (!value) return null;
    if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    var m = /^#([0-9a-f]{3,8})$/i.exec(value);
    if (m) {
      var h = m[1];
      if (h.length === 3 || h.length === 4) {
        h = h.split('').map(function (c) { return c + c; }).join('');
      }
      return {
        r: parseInt(h.slice(0, 2), 16) / 255,
        g: parseInt(h.slice(2, 4), 16) / 255,
        b: parseInt(h.slice(4, 6), 16) / 255,
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
      };
    }

    m = /^rgba?\(([^)]+)\)$/i.exec(value);
    if (m) {
      var parts = m[1].split(/[,\s/]+/).filter(Boolean);
      if (parts.length >= 3) {
        var ch = function (v, max) {
          return v.indexOf('%') >= 0 ? parseFloat(v) / 100 : parseFloat(v) / max;
        };
        var a = 1;
        if (parts[3] != null) {
          a = parts[3].indexOf('%') >= 0 ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
        }
        var c = { r: ch(parts[0], 255), g: ch(parts[1], 255), b: ch(parts[2], 255), a: a };
        if (isFinite(c.r) && isFinite(c.g) && isFinite(c.b)) return c;
      }
    }

    m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
    if (m) {
      var v = rootVar(m[1]);
      return v ? parseColor(v, depth + 1) : null;
    }

    var named = {
      white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0],
      navy: [0, 0, 128], gray: [128, 128, 128], grey: [128, 128, 128]
    };
    var n = named[value.toLowerCase()];
    if (n) return { r: n[0] / 255, g: n[1] / 255, b: n[2] / 255, a: 1 };
    return null;
  }

  function splitCommas(s) {
    var out = [];
    var start = 0;
    var depth = 0;
    var quote = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (quote) {
        if (c === quote && s.charAt(i - 1) !== '\\') quote = 0;
        continue;
      }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
    }
    out.push(s.slice(start));
    return out;
  }

  function mixColor(c1, c2, p) {
    var a = c1.a * p + c2.a * (1 - p);
    if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (c1.r * c1.a * p + c2.r * c2.a * (1 - p)) / a,
      g: (c1.g * c1.a * p + c2.g * c2.a * (1 - p)) / a,
      b: (c1.b * c1.a * p + c2.b * c2.a * (1 - p)) / a,
      a: a
    };
  }

  function fmtAlpha(a) {
    return Math.round(a * 1000) / 1000;
  }

  function resolveColorMix(body) {
    var parts = splitCommas(body);
    if (parts.length < 3) return null;
    var m = /^(.*?)\s+([\d.]+)%$/.exec(parts[1].trim());
    var c1s = m ? m[1].trim() : parts[1].trim();
    var p = m ? parseFloat(m[2]) / 100 : 0.5;
    var c1 = parseColor(c1s, 0);
    var c2 = parseColor(parts[2].trim(), 0);
    if (!c1 || !c2) return null;
    var c = mixColor(c1, c2, p);
    return 'rgba(' + Math.round(c.r * 255) + ', ' + Math.round(c.g * 255) + ', ' +
      Math.round(c.b * 255) + ', ' + fmtAlpha(c.a) + ')';
  }

  function findColorMix(value) {
    var out = [];
    var needle = 'color-mix(';
    var i = 0;
    while ((i = value.indexOf(needle, i)) !== -1) {
      var depth = 1;
      var j = i + needle.length;
      for (; j < value.length; j++) {
        if (value.charAt(j) === '(') depth++;
        else if (value.charAt(j) === ')') { depth--; if (depth === 0) { j++; break; } }
      }
      if (depth !== 0) break;
      out.push({ start: i, end: j, body: value.slice(i + needle.length, j - 1) });
      i = j;
    }
    return out;
  }

  function compatValue(value) {
    if (supportsColorMix || typeof value !== 'string' || value.indexOf('color-mix(') === -1) {
      return value;
    }
    var fns = findColorMix(value);
    var out = value;
    for (var i = fns.length - 1; i >= 0; i--) {
      var color = resolveColorMix(fns[i].body);
      if (color) out = out.slice(0, fns[i].start) + color + out.slice(fns[i].end);
    }
    return out;
  }

  /**
   * 旧内核把 color-mix() 当作无效值：computed style 是 transparent，
   * 但 CSSStyleDeclaration 里仍保留原始字符串（style 属性也还在）。
   * 这里把 style 属性里的 color-mix 就地换成等价的 rgba。
   */
  function compatStyleAttribute(el) {
    if (supportsColorMix || !el || el.nodeType !== 1 || !el.getAttribute) return;
    try {
      var attr = el.getAttribute('style');
      if (!attr || attr.indexOf('color-mix(') === -1) return;
      var fns = findColorMix(attr);
      var out = attr;
      for (var i = fns.length - 1; i >= 0; i--) {
        var color = resolveColorMix(fns[i].body);
        if (color) out = out.slice(0, fns[i].start) + color + out.slice(fns[i].end);
      }
      if (out !== attr) el.setAttribute('style', out);
    } catch (e) {}
  }

  function patchStyle() {
    if (supportsColorMix) return;
    try {
      var proto = CSSStyleDeclaration.prototype;
      var origSet = proto.setProperty;
      proto.setProperty = function (name, value, priority) {
        return origSet.call(this, name, compatValue(value), priority);
      };
      // 不遮 CSSStyleDeclaration 上的 camelCase 访问器：Chrome 100 上
      // 它与原生 getPropertyValue 会互相递归。React 的 style.background
      // 赋值改为由 MutationObserver 监听 style 属性后就地替换（见下）。
    } catch (e) {}
  }

  // ── boot ───────────────────────────────────────────────────────────

  function boot() {
    patchStyle();
    scanAll();
    observe();
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  try {
    window.__almaCompat = {
      scan: scanAll,
      update: update,
      rules: rules,
      supportsHas: supportsHas,
      supportsColorMix: supportsColorMix,
      supportsFieldSizing: supportsFieldSizing
    };
  } catch (e) {}
})();
