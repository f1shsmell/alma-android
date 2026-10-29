#!/usr/bin/env node
/*
 * alma-android: 把 Alma 官方 renderer 的 CSS 降到 Chromium 100 可解析。
 *
 * 只做两件“旧内核会整条丢弃”的事：
 *   1. oklch() -> sRGB（Tailwind 4 的调色板变量；旧内核解析不了 oklch，
 *      402 处 var(--color-*) 会一起失效）
 *   2. :has() -> .alma-has-N 占位类（43 条规则，Tailwind 没有包 @supports；
 *      映射写到 www/alma-has-rules.js，由 alma-compat.js 运行时补类）
 * 另外给 @supports 之外唯一一处 color-mix 补静态 rgba fallback。
 *
 * 不碰：@property（Tailwind 4.1.12 自带 @supports 降级块）、color-mix
 * （1147/1148 已在 @supports 内，旧内核会走外面的 fallback 声明）。
 *
 * 幂等：已处理的文件带 MARK，重复运行直接跳过。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'www', 'assets');
const RULES_FILE = path.join(ROOT, 'www', 'alma-has-rules.js');
const MARK = '/* alma-compat:chromium100 */';

const stats = {
  files: 0,
  skippedFiles: 0,
  oklch: 0,
  oklchRelative: 0,
  oklchFailed: 0,
  has: 0,
  hasSkipped: 0,
  hasEmpty: 0,
  layers: 0,
  colorMixFallback: 0,
  colorMixFailed: 0,
};

// ── 基础工具 ──────────────────────────────────────────────────────────

/** 注释区间（斜杠星号到星号斜杠），避免改到注释里的说明文字。 */
function commentRanges(text) {
  const ranges = [];
  let i = 0;
  while ((i = text.indexOf('/*', i)) !== -1) {
    const j = text.indexOf('*/', i + 2);
    if (j === -1) { ranges.push([i, text.length]); break; }
    ranges.push([i, j + 2]);
    i = j + 2;
  }
  return ranges;
}

function inRanges(pos, ranges) {
  for (let i = 0; i < ranges.length; i++) {
    if (pos >= ranges[i][0] && pos < ranges[i][1]) return true;
  }
  return false;
}

/** 找出 name(...) 的所有出现（括号配对），返回 {start,end,body}。 */
function findFunctions(text, name, skip) {
  const out = [];
  const needle = name + '(';
  let i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) {
    if (i > 0 && text[i - 1] === '\\') { i += needle.length; continue; }
    if (skip && inRanges(i, skip)) { i += needle.length; continue; }
    let depth = 1;
    let j = i + needle.length;
    for (; j < text.length; j++) {
      const c = text[j];
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) { j++; break; } }
    }
    if (depth !== 0) break;
    out.push({ start: i, end: j, body: text.slice(i + needle.length, j - 1) });
    i = j;
  }
  return out;
}

/** 找出 needle 对应的 @-block 范围（用于 @supports color-mix）。 */
function findBlocks(text, needle, skip) {
  const out = [];
  let i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) {
    if (skip && inRanges(i, skip)) { i += needle.length; continue; }
    const brace = text.indexOf('{', i);
    if (brace === -1) break;
    let depth = 0;
    let j = brace;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    out.push({ start: i, end: j });
    i = j;
  }
  return out;
}

/** 在顶层按 sep 切分（忽略 () [] 和引号内的 sep）。 */
function topLevelSplit(s, sep) {
  const out = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote && s[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

// ── oklch -> sRGB（OKLab -> linear sRGB -> gamma）─────────────────────

function gamma(c) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(1, v));
}

function oklchToRgb(L, C, H) {
  const h = H * Math.PI / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: gamma(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  };
}

function hex2(n) {
  return ('0' + Math.round(n * 255).toString(16)).slice(-2);
}

function fmtRgb(c, a) {
  if (a == null || a >= 0.999) return '#' + hex2(c.r) + hex2(c.g) + hex2(c.b);
  return 'rgba(' + Math.round(c.r * 255) + ', ' + Math.round(c.g * 255) + ', ' +
    Math.round(c.b * 255) + ', ' + (Math.round(a * 1000) / 1000) + ')';
}

function parseOklch(body) {
  const slash = topLevelSplit(body, '/');
  const parts = slash[0].trim().split(/\s+/);
  if (parts.length < 3) return null;
  const L = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
  const C = parseFloat(parts[1]);
  const H = parseFloat(parts[2]);
  if (!isFinite(L) || !isFinite(C) || !isFinite(H)) return null;
  let a = 1;
  if (slash.length > 1) {
    const v = slash[1].trim();
    a = v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v);
    if (!isFinite(a)) a = 1;
  }
  const c = oklchToRgb(L, C, H);
  c.a = Math.max(0, Math.min(1, a));
  return c;
}

function convertOklch(css, skip) {
  const fns = findFunctions(css, 'oklch', skip);
  let out = css;
  for (let i = fns.length - 1; i >= 0; i--) {
    const f = fns[i];
    if (/^\s*from\s/i.test(f.body)) { stats.oklchRelative++; continue; }
    const c = parseOklch(f.body);
    if (!c) { stats.oklchFailed++; continue; }
    out = out.slice(0, f.start) + fmtRgb(c, c.a) + out.slice(f.end);
    stats.oklch++;
  }
  return out;
}

// ── :has() -> .alma-has-N ────────────────────────────────────────────

function loadHasRules() {
  if (!fs.existsSync(RULES_FILE)) return [];
  const s = fs.readFileSync(RULES_FILE, 'utf8');
  const m = s.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch (e) { return []; }
}

function rewriteHas(css, hasMap, nextId, skip) {
  const supportsSelector = findFunctions(css, '@supports selector', skip);
  const fns = findFunctions(css, ':has', skip);
  let out = css;
  for (let i = fns.length - 1; i >= 0; i--) {
    const f = fns[i];
    if (supportsSelector.some(r => f.start >= r.start && f.end <= r.end)) {
      stats.hasSkipped++;
      continue;
    }
    const body = f.body.trim();
    if (!body) { stats.hasEmpty++; continue; }
    let cls = hasMap.get(body);
    if (!cls) {
      cls = 'alma-has-' + nextId.value++;
      hasMap.set(body, cls);
    }
    out = out.slice(0, f.start) + '.' + cls + out.slice(f.end);
    stats.has++;
  }
  return out;
}

// ── @layer 展开 ───────────────────────────────────────────────────────
//
// Tailwind 4 把**全部**样式包在 @layer 里（properties/theme/base/
// components/utilities 五块，utilities 单独就占 31 万字符）。@layer 之外的
// 顶层规则只有 @property 和少量 @supports —— 一旦内核不支持 @layer，
// 整份 CSS 归零：变量、重置、工具类一起消失，表现为「有 DOM 没样式」
// （原生输入框、衬线字体、图标竖排）。
//
// 展开成裸规则即可恢复：文件里的 layer 顺序本身就是层叠顺序，按顺序
// 铺平后优先级与原来一致（同优先级时后者胜）。不处理 `@layer a, b;`
// 这类只声明顺序、不带块的语句——Tailwind 产物里没有。

function expandLayers(css, skip) {
  const needle = '@layer';
  const re = /@layer\s+[\w.-]+(?:\s*,\s*[\w.-]+)*\s*\{/g;
  let out = '';
  let last = 0;
  let i = 0;
  let blocks = 0;

  while (i < css.length) {
    re.lastIndex = i;
    const m = re.exec(css);
    if (!m) break;
    if (skip && inRanges(m.index, skip)) { i = m.index + m[0].length; continue; }

    const braceStart = m.index + m[0].length - 1;
    let depth = 0;
    let j = braceStart;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    if (depth !== 0) break;

    out += css.slice(last, m.index);
    const body = css.slice(braceStart + 1, j - 1);
    // 递归：layer 里还可能套 layer（@supports 内也会有）
    out += expandLayers(body, null);
    blocks++;
    last = j;
    i = j;
  }

  out += css.slice(last);
  stats.layers += blocks;
  return out;
}

// ── color-mix fallback（只处理 @supports 之外、且第二色是 transparent）──

function buildVars(css) {
  const vars = Object.create(null);
  const re = /(--[\w-]+)\s*:\s*([^;{}]+)/g;
  let m;
  while ((m = re.exec(css))) {
    const name = m[1];
    const val = m[2].trim();
    if (!(name in vars)) vars[name] = val;
  }
  return vars;
}

function resolveColor(value, vars, depth) {
  if (depth > 8) return null;
  value = String(value == null ? '' : value).trim();
  if (!value) return null;
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (/^currentcolor$/i.test(value)) return null;

  let m = /^#([0-9a-f]{3,8})$/i.exec(value);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  m = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const ch = (v, max) => v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / max;
      const r = ch(parts[0], 255);
      const g = ch(parts[1], 255);
      const b = ch(parts[2], 255);
      let a = 1;
      if (parts[3] != null) a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
      if ([r, g, b].every(isFinite)) return { r, g, b, a: isFinite(a) ? a : 1 };
    }
  }

  m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
  if (m) {
    const v = vars[m[1]];
    return v == null ? null : resolveColor(v, vars, depth + 1);
  }

  const named = {
    white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0],
    navy: [0, 0, 128], gray: [128, 128, 128], grey: [128, 128, 128],
  };
  const n = named[value.toLowerCase()];
  if (n) return { r: n[0] / 255, g: n[1] / 255, b: n[2] / 255, a: 1 };
  return null;
}

function parseColorMix(body) {
  const parts = topLevelSplit(body, ',').map(s => s.trim());
  if (parts.length < 3) return null;
  const c2 = parts[2].trim().toLowerCase();
  if (c2 !== 'transparent') return null;
  const m = /^(.*?)\s+([\d.]+)%$/.exec(parts[1].trim());
  if (!m) return null;
  return { color: m[1].trim(), pct: parseFloat(m[2]) };
}

function addColorMixFallback(css, skip) {
  const supports = findBlocks(css, '@supports (color: color-mix', skip);
  const fns = findFunctions(css, 'color-mix', skip);
  const vars = buildVars(css);
  let out = css;

  for (let i = fns.length - 1; i >= 0; i--) {
    const f = fns[i];
    if (supports.some(r => f.start >= r.start && f.end <= r.end)) continue;

    const mix = parseColorMix(f.body);
    if (!mix) { stats.colorMixFailed++; continue; }
    const color = resolveColor(mix.color, vars, 0);
    if (!color) { stats.colorMixFailed++; continue; }

    const alpha = Math.max(0, Math.min(1, (mix.pct / 100) * (color.a == null ? 1 : color.a)));
    const fallback = fmtRgb(color, alpha);

    const declStart = Math.max(css.lastIndexOf('{', f.start), css.lastIndexOf(';', f.start)) + 1;
    const before = css.slice(declStart, f.start);
    const pm = /^\s*([-\w]+)\s*:\s*$/.exec(before);
    if (!pm) { stats.colorMixFailed++; continue; }

    const lineStart = css.lastIndexOf('\n', declStart);
    const indent = (css.slice(lineStart + 1, declStart).match(/^[ \t]*/) || [''])[0];

    out = out.slice(0, declStart) + indent + pm[1] + ': ' + fallback + ';\n' +
      out.slice(declStart);
    stats.colorMixFallback++;
  }
  return out;
}

// ── 主流程 ────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(ASSETS)) {
    console.error('✗ 找不到 www/assets，先运行 npx cap sync 或 sync-assets.sh');
    process.exit(1);
  }

  const existingRules = loadHasRules();
  const hasMap = new Map();
  let maxId = 0;
  for (const r of existingRules) {
    if (!r || !r.c || !r.s) continue;
    hasMap.set(r.s, r.c);
    const n = parseInt(String(r.c).replace('alma-has-', ''), 10);
    if (isFinite(n) && n > maxId) maxId = n;
  }
  const nextId = { value: maxId + 1 };

  const files = fs.readdirSync(ASSETS).filter(f => f.endsWith('.css'));
  for (const file of files) {
    const full = path.join(ASSETS, file);
    let css = fs.readFileSync(full, 'utf8');
    if (css.includes(MARK)) { stats.skippedFiles++; continue; }

    // @layer 先展开：后续 oklch/:has/color-mix 的定位不再受 layer 包裹影响
    css = expandLayers(css, commentRanges(css));

    let skip = commentRanges(css);
    css = convertOklch(css, skip);
    skip = commentRanges(css);
    css = rewriteHas(css, hasMap, nextId, skip);
    skip = commentRanges(css);
    css = addColorMixFallback(css, skip);

    fs.writeFileSync(full, MARK + '\n' + css, 'utf8');
    stats.files++;
    console.log('✓ ' + file);
  }

  if (stats.files > 0 || !fs.existsSync(RULES_FILE)) {
    const rules = [...hasMap.entries()].map(([s, c]) => ({ c, s }));
    const js = '/* generated by scripts/compat-css.js — :has() 构建期重写映射 */\n' +
      'window.__ALMA_HAS_RULES__ = ' + JSON.stringify(rules) + ';\n';
    fs.writeFileSync(RULES_FILE, js, 'utf8');
    console.log('✓ alma-has-rules.js（' + rules.length + ' 条）');
  }

  console.log('— 转换统计 —');
  console.log('  CSS 文件: ' + stats.files + ' 个（跳过已转换 ' + stats.skippedFiles + '）');
  console.log('  oklch: ' + stats.oklch + ' 处；相对颜色跳过 ' + stats.oklchRelative +
    '；解析失败 ' + stats.oklchFailed);
  console.log(':has: ' + stats.has + ' 处；@supports selector 内跳过 ' + stats.hasSkipped +
    '；空参数跳过 ' + stats.hasEmpty);
  console.log('  color-mix fallback: ' + stats.colorMixFallback +
    ' 处；无法解析 ' + stats.colorMixFailed);
  console.log('  @layer 展开: ' + stats.layers + ' 块');
}

main();
