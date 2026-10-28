!(function() {
  try {
    var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
    e.SENTRY_RELEASE = { id: "alma@0.4.213" };
  } catch (e2) {
  }
})();
;
{
  try {
    (function() {
      var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {}, n = new e.Error().stack;
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "31600a68-57a9-48bb-b9e2-e137bc539eda", e._sentryDebugIdIdentifier = "sentry-dbid-31600a68-57a9-48bb-b9e2-e137bc539eda");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports, R as React } from "./index-CgjOdD6Y.js";
import { a as client } from "./client-BGW_um_Z.js";
import { a as useI18n, E as ExternalLink, B as Button, C as Copy, e as Square, k as copyImageFromUrlToClipboard, i as initObservability, S as SWRConfig, s as swrConfig, T as ThemeProvider } from "./ThemeContext-DC9BEsmk.js";
import "./createLucideIcon-3XU0ditt.js";
import "./clipboard-polyfill-Dc-rDY6K.js";
import { C as ConditionalPostHogProvider } from "./ConditionalPostHogProvider-DUq_pvB0.js";
import { X } from "./x-CcbWXrDG.js";
import "./preload-helper-D4tMVkJm.js";
import { u as usePlatformContext, W as WindowControls, P as PlatformProvider } from "./PlatformContext-CrasNQRo.js";
import { W as WandSparkles, C as Check, D as Download, A as ArrowUpRight } from "./wand-sparkles-BbMFNLc9.js";
import { a as ChevronLeft, C as ChevronRight, b as Circle, P as Pencil } from "./pencil-DC0BaoJb.js";
import { M as MousePointer2 } from "./mouse-pointer-2-D1rxBsgx.js";
import { U as Undo2, R as Redo2 } from "./undo-2-0Mw7t7EX.js";
import { T as Trash2 } from "./trash-2-RgRY4jyV.js";
import { L as LoaderCircle } from "./loader-circle-DiP-R-ZO.js";
import "./index-7mJnAivB.js";
const MAX_CANVAS_SIDE = 2200;
const isLightColor = (hex) => {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
};
const bboxOf = (r) => {
  if (r.type === "brush") {
    const xs = r.points.map((p) => p.x);
    const ys = r.points.map((p) => p.y);
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  }
  return { minX: Math.min(r.a.x, r.b.x), minY: Math.min(r.a.y, r.b.y), maxX: Math.max(r.a.x, r.b.x), maxY: Math.max(r.a.y, r.b.y) };
};
const badgeAnchorOf = (r) => {
  if (r.type === "brush") return r.points[0] ?? { x: 0, y: 0 };
  if (r.type === "arrow") return r.a;
  return { x: Math.min(r.a.x, r.b.x), y: Math.min(r.a.y, r.b.y) };
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const fitContain = (boxW, boxH, aspect) => {
  if (boxW <= 0 || boxH <= 0 || !isFinite(aspect) || aspect <= 0) return { ox: 0, oy: 0, rw: boxW, rh: boxH };
  if (aspect > boxW / boxH) {
    const rh = boxW / aspect;
    return { ox: 0, oy: (boxH - rh) / 2, rw: boxW, rh };
  }
  const rw = boxH * aspect;
  return { ox: (boxW - rw) / 2, oy: 0, rw, rh: boxH };
};
const HIT_PAD = 0.015;
const hitTestRegions = (regions, p) => {
  for (let i = regions.length - 1; i >= 0; i--) {
    const b = bboxOf(regions[i]);
    if (p.x >= b.minX - HIT_PAD && p.x <= b.maxX + HIT_PAD && p.y >= b.minY - HIT_PAD && p.y <= b.maxY + HIT_PAD) {
      return regions[i].id;
    }
  }
  return null;
};
const cloneGeometry = (g) => g.type === "brush" ? { type: "brush", points: g.points.map((p) => ({ ...p })) } : { type: g.type, a: { ...g.a }, b: { ...g.b } };
const applyTranslate = (r, orig, dx, dy) => {
  if (r.type === "brush" && orig.type === "brush") {
    r.points = orig.points.map((p) => ({ x: clamp01(p.x + dx), y: clamp01(p.y + dy) }));
  } else if (r.type !== "brush" && orig.type !== "brush") {
    r.a = { x: clamp01(orig.a.x + dx), y: clamp01(orig.a.y + dy) };
    r.b = { x: clamp01(orig.b.x + dx), y: clamp01(orig.b.y + dy) };
  }
};
function drawRegion(ctx, region, w, h, badgeR) {
  const px = (p) => ({ x: p.x * w, y: p.y * h });
  ctx.strokeStyle = region.color;
  ctx.fillStyle = region.color;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = region.width;
  if (region.type === "brush") {
    if (region.points.length) {
      ctx.beginPath();
      region.points.forEach((p, i) => {
        const { x, y } = px(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  } else if (region.type === "rect") {
    const a = px(region.a);
    const b = px(region.b);
    ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  } else if (region.type === "ellipse") {
    const a = px(region.a);
    const b = px(region.b);
    ctx.beginPath();
    ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (region.type === "arrow") {
    const a = px(region.a);
    const b = px(region.b);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const head = Math.max(region.width * 3.5, 10);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - head * Math.cos(angle - Math.PI / 6), b.y - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(b.x - head * Math.cos(angle + Math.PI / 6), b.y - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }
  const anchor = px(badgeAnchorOf(region));
  const cx = Math.max(badgeR, Math.min(w - badgeR, anchor.x));
  const cy = Math.max(badgeR, Math.min(h - badgeR, anchor.y));
  ctx.beginPath();
  ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = region.color;
  ctx.fill();
  ctx.lineWidth = Math.max(2, badgeR * 0.12);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.stroke();
  ctx.fillStyle = isLightColor(region.color) ? "#111111" : "#ffffff";
  ctx.font = `700 ${Math.round(badgeR * 1.25)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(region.index), cx, cy + badgeR * 0.05);
  ctx.textAlign = "start";
}
const ImageAnnotator = reactExports.forwardRef(function ImageAnnotator2({ imageUrl, tool, color, strokeScale = 6e-3, onChange, className, regionPlaceholder, removeRegionLabel }, ref) {
  const canvasRef = reactExports.useRef(null);
  const imgRef = reactExports.useRef(null);
  const [natural, setNatural] = reactExports.useState(null);
  const regionsRef = reactExports.useRef([]);
  const redoRef = reactExports.useRef([]);
  const draftRef = reactExports.useRef(null);
  const drawingRef = reactExports.useRef(false);
  const idRef = reactExports.useRef(0);
  const [regionList, setRegionList] = reactExports.useState([]);
  const [canvasBox, setCanvasBox] = reactExports.useState({ w: 0, h: 0 });
  const [focusId, setFocusId] = reactExports.useState(null);
  const inputRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const moveDragRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!focusId) return;
    inputRefs.current.get(focusId)?.focus({ preventScroll: true });
    setFocusId(null);
  }, [focusId, regionList]);
  const sync = reactExports.useCallback(() => {
    setRegionList([...regionsRef.current]);
    onChange?.({
      canUndo: regionsRef.current.length > 0,
      canRedo: redoRef.current.length > 0,
      regions: regionsRef.current.map((r) => ({ id: r.id, index: r.index, color: r.color, label: r.label }))
    });
  }, [onChange]);
  const badgeRadius = natural ? Math.max(10, Math.round(Math.min(natural.w, natural.h) * 0.022)) : 14;
  const repaint = reactExports.useCallback(
    (forExport = false) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !natural) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const r of regionsRef.current) drawRegion(ctx, r, canvas.width, canvas.height, badgeRadius);
      const d = draftRef.current;
      if (d) drawRegion(ctx, { ...d, index: regionsRef.current.length + 1 }, canvas.width, canvas.height, badgeRadius);
      if (!forExport && selectedId) {
        const sel = regionsRef.current.find((r) => r.id === selectedId);
        if (sel) {
          const b = bboxOf(sel);
          const pad = Math.max(6, badgeRadius * 0.5);
          ctx.save();
          ctx.setLineDash([7, 4]);
          ctx.lineWidth = Math.max(2, badgeRadius * 0.18);
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.strokeRect(
            b.minX * canvas.width - pad,
            b.minY * canvas.height - pad,
            (b.maxX - b.minX) * canvas.width + pad * 2,
            (b.maxY - b.minY) * canvas.height + pad * 2
          );
          ctx.restore();
        }
      }
    },
    [natural, badgeRadius, selectedId]
  );
  reactExports.useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      const ratio = Math.min(1, MAX_CANVAS_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      setNatural({ w: Math.round(img.naturalWidth * ratio), h: Math.round(img.naturalHeight * ratio) });
      regionsRef.current = [];
      redoRef.current = [];
      draftRef.current = null;
      idRef.current = 0;
      setFocusId(null);
      setSelectedId(null);
      moveDragRef.current = null;
      sync();
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl, sync]);
  reactExports.useEffect(() => {
    if (natural) repaint();
  }, [natural, repaint]);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => setCanvasBox({ w: canvas.clientWidth, h: canvas.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [natural]);
  const strokeWidth = natural ? Math.max(2, Math.round(Math.min(natural.w, natural.h) * strokeScale)) : 3;
  const toNorm = reactExports.useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas || !natural) return null;
      const rect = canvas.getBoundingClientRect();
      const { ox, oy, rw, rh } = fitContain(rect.width, rect.height, natural.w / natural.h);
      return { x: clamp01((e.clientX - rect.left - ox) / rw), y: clamp01((e.clientY - rect.top - oy) / rh) };
    },
    [natural]
  );
  const handlePointerDown = reactExports.useCallback(
    (e) => {
      const p = toNorm(e);
      if (!p) return;
      if (tool === "select") {
        const hitId = hitTestRegions(regionsRef.current, p);
        setSelectedId(hitId);
        if (hitId) {
          const r = regionsRef.current.find((x) => x.id === hitId);
          if (r) {
            moveDragRef.current = { id: hitId, start: p, orig: cloneGeometry(r) };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      if (tool === "brush") draftRef.current = { type: "brush", color, width: strokeWidth, points: [p] };
      else draftRef.current = { type: tool, color, width: strokeWidth, a: p, b: p };
      repaint();
    },
    [tool, color, strokeWidth, toNorm, repaint]
  );
  const handlePointerMove = reactExports.useCallback(
    (e) => {
      if (moveDragRef.current) {
        const p2 = toNorm(e);
        if (!p2) return;
        const { id, start, orig } = moveDragRef.current;
        const r = regionsRef.current.find((x) => x.id === id);
        if (r) {
          applyTranslate(r, orig, p2.x - start.x, p2.y - start.y);
          repaint();
          setRegionList([...regionsRef.current]);
        }
        return;
      }
      if (!drawingRef.current || !draftRef.current) return;
      const p = toNorm(e);
      if (!p) return;
      const d = draftRef.current;
      if (d.type === "brush") d.points.push(p);
      else d.b = p;
      repaint();
    },
    [toNorm, repaint]
  );
  const handlePointerUp = reactExports.useCallback(
    (e) => {
      if (moveDragRef.current) {
        moveDragRef.current = null;
        sync();
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
        }
        return;
      }
      if (!drawingRef.current || !draftRef.current) return;
      drawingRef.current = false;
      const d = draftRef.current;
      draftRef.current = null;
      const tiny = d.type !== "brush" && Math.abs(d.a.x - d.b.x) < 0.01 && Math.abs(d.a.y - d.b.y) < 0.01;
      const emptyBrush = d.type === "brush" && d.points.length < 2;
      if (tiny || emptyBrush) {
        repaint();
        return;
      }
      const id = `r${++idRef.current}`;
      const region = { ...d, id, index: regionsRef.current.length + 1, label: "" };
      regionsRef.current = [...regionsRef.current, region];
      redoRef.current = [];
      setFocusId(id);
      repaint();
      sync();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
      }
    },
    [repaint, sync]
  );
  const setLabel = reactExports.useCallback(
    (id, label) => {
      const r = regionsRef.current.find((x) => x.id === id);
      if (!r) return;
      r.label = label;
      sync();
    },
    [sync]
  );
  const renumber = reactExports.useCallback(() => {
    regionsRef.current.forEach((r, i) => {
      r.index = i + 1;
    });
  }, []);
  const removeRegion = reactExports.useCallback(
    (id) => {
      if (!regionsRef.current.some((r) => r.id === id)) return;
      regionsRef.current = regionsRef.current.filter((r) => r.id !== id);
      setSelectedId((prev) => prev === id ? null : prev);
      renumber();
      repaint();
      sync();
    },
    [renumber, repaint, sync]
  );
  reactExports.useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const ae = document.activeElement;
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;
      e.preventDefault();
      removeRegion(selectedId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeRegion]);
  reactExports.useEffect(() => {
    if (tool !== "select") setSelectedId(null);
  }, [tool]);
  reactExports.useEffect(() => {
    if (!selectedId) return;
    const onDocPointerDown = (e) => {
      const canvas = canvasRef.current;
      if (canvas && e.target instanceof Node && canvas.contains(e.target)) return;
      setSelectedId(null);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [selectedId]);
  reactExports.useImperativeHandle(
    ref,
    () => ({
      flatten: () => {
        const canvas = canvasRef.current;
        if (!canvas || !natural) return null;
        repaint(true);
        let url = null;
        try {
          url = canvas.toDataURL("image/png");
        } catch {
          url = null;
        }
        repaint();
        return url;
      },
      undo: () => {
        const last = regionsRef.current[regionsRef.current.length - 1];
        if (!last) return;
        regionsRef.current = regionsRef.current.slice(0, -1);
        redoRef.current = [...redoRef.current, last];
        renumber();
        repaint();
        sync();
      },
      redo: () => {
        const next = redoRef.current[redoRef.current.length - 1];
        if (!next) return;
        redoRef.current = redoRef.current.slice(0, -1);
        regionsRef.current = [...regionsRef.current, next];
        renumber();
        repaint();
        sync();
      },
      clear: () => {
        if (regionsRef.current.length === 0) return;
        redoRef.current = [...regionsRef.current.slice().reverse(), ...redoRef.current];
        regionsRef.current = [];
        draftRef.current = null;
        setSelectedId(null);
        repaint();
        sync();
      }
    }),
    [natural, repaint, sync, renumber]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, style: { position: "relative", display: "inline-flex", maxWidth: "100%", maxHeight: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        width: natural?.w || 1,
        height: natural?.h || 1,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        style: {
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          borderRadius: 8,
          touchAction: "none",
          cursor: tool === "select" ? "default" : "crosshair",
          display: natural ? "block" : "none"
        }
      }
    ),
    (() => {
      const fit = fitContain(canvasBox.w, canvasBox.h, natural ? natural.w / natural.h : 1);
      return regionList.map((r) => {
        const box = bboxOf(r);
        const below = box.maxY < 0.84;
        const left = fit.ox + box.minX * fit.rw;
        const top = fit.oy + (below ? box.maxY : box.minY) * fit.rh;
        const light = isLightColor(r.color);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "group/chip",
            style: {
              position: "absolute",
              left: Math.max(0, Math.min(left, Math.max(0, canvasBox.w - 60))),
              top,
              transform: below ? "translateY(8px)" : "translateY(calc(-100% - 8px))",
              zIndex: 20,
              maxWidth: Math.max(140, canvasBox.w * 0.6)
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 shadow-lg backdrop-blur-md",
                style: { background: "rgba(10,10,12,0.72)", border: `1px solid ${r.color}` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[11px] font-bold",
                      style: { background: r.color, color: light ? "#111" : "#fff" },
                      children: r.index
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      value: r.label,
                      ref: (el) => {
                        if (el) inputRefs.current.set(r.id, el);
                        else inputRefs.current.delete(r.id);
                      },
                      onChange: (e) => setLabel(r.id, e.target.value),
                      onPointerDown: (e) => e.stopPropagation(),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === "Escape") e.target.blur();
                      },
                      placeholder: regionPlaceholder,
                      className: "w-44 max-w-[40vw] bg-transparent text-white placeholder:text-white/40 text-[13px] outline-none"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onPointerDown: (e) => e.stopPropagation(),
                      onClick: () => removeRegion(r.id),
                      title: removeRegionLabel,
                      className: "flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-white/45 hover:text-white hover:bg-white/15 opacity-0 transition-opacity group-hover/chip:opacity-100",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                    }
                  )
                ]
              }
            )
          },
          r.id
        );
      });
    })()
  ] });
});
const ANNO_COLORS = ["#ef4444", "#f59e0b", "#84cc16", "#06b6d4", "#d946ef", "#ffffff"];
const ANNO_TOOLS = [
  { tool: "select", Icon: MousePointer2, labelKey: "select" },
  { tool: "rect", Icon: Square, labelKey: "rect" },
  { tool: "ellipse", Icon: Circle, labelKey: "ellipse" },
  { tool: "brush", Icon: Pencil, labelKey: "brush" },
  { tool: "arrow", Icon: ArrowUpRight, labelKey: "arrow" }
];
const circledNumber = (n) => n >= 1 && n <= 20 ? "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"[n - 1] : `${n}.`;
function buildEditInstruction(regions, overallNote, sourcePath, L) {
  const lines = regions.filter((r) => r.label.trim()).map((r) => `${circledNumber(r.index)} ${r.label.trim()}`);
  const visible = [];
  if (lines.length) visible.push(`**${L.visibleHeader}**

${lines.join("  \n")}`);
  const note = overallNote.trim();
  if (note) visible.push(`${L.overallLabel}${note}`);
  const cardData = JSON.stringify({
    r: regions.filter((r) => r.label.trim()).map((r) => ({ i: r.index, c: r.color, l: r.label.trim() })),
    n: overallNote.trim() || void 0
  });
  const reminder = [`alma-image-edit:${cardData}`, L.directive];
  if (sourcePath) reminder.push(`${L.sourcePathLabel}${sourcePath}`);
  return `${visible.join("\n\n")}

<system-reminder>
${reminder.join("\n")}
</system-reminder>`;
}
function buildMermaidEditInstruction(regions, overallNote, mermaidSource, L) {
  const lines = regions.filter((r) => r.label.trim()).map((r) => `${circledNumber(r.index)} ${r.label.trim()}`);
  const visible = [];
  if (lines.length) visible.push(`**${L.visibleHeader}**

${lines.join("  \n")}`);
  const note = overallNote.trim();
  if (note) visible.push(`${L.overallLabel}${note}`);
  const cardData = JSON.stringify({
    r: regions.filter((r) => r.label.trim()).map((r) => ({ i: r.index, c: r.color, l: r.label.trim() })),
    n: note || void 0
  });
  const reminder = [`alma-mermaid-edit:${cardData}`, L.directive, `${L.sourceLabel}
\`\`\`mermaid
${mermaidSource}
\`\`\``];
  return `${visible.join("\n\n")}

<system-reminder>
${reminder.join("\n")}
</system-reminder>`;
}
const PAGE_SIZE = 30;
async function fetchImageUrl(baseURL, imageId) {
  try {
    const response = await fetch(`${baseURL}/api/gallery/images/${imageId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}
function LightboxWindow() {
  const { t } = useI18n();
  const [images, setImages] = reactExports.useState([]);
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [totalCount, setTotalCount] = reactExports.useState(0);
  const [hasMore, setHasMore] = reactExports.useState(false);
  const [imageUrl, setImageUrl] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [loadError, setLoadError] = reactExports.useState(null);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  const [copySuccess, setCopySuccess] = reactExports.useState(false);
  const [baseURL, setBaseURL] = reactExports.useState("");
  const isLoadingMoreRef = reactExports.useRef(false);
  const pendingAdvanceRef = reactExports.useRef(false);
  const prevImagesLengthRef = reactExports.useRef(0);
  const { isMac } = usePlatformContext();
  const imageMetadata = images[currentIndex] || null;
  const annotatorRef = reactExports.useRef(null);
  const [annotateMode, setAnnotateMode] = reactExports.useState(false);
  const [annoTool, setAnnoTool] = reactExports.useState("rect");
  const [annoColor, setAnnoColor] = reactExports.useState(ANNO_COLORS[0]);
  const [overallNote, setOverallNote] = reactExports.useState("");
  const [annoState, setAnnoState] = reactExports.useState({ canUndo: false, canRedo: false, regions: [] });
  const [isApplying, setIsApplying] = reactExports.useState(false);
  const canAnnotate = !!imageMetadata?.threadId && !!imageUrl && !loadError;
  const labeledCount = annoState.regions.filter((r) => r.label.trim()).length;
  const exitAnnotate = reactExports.useCallback(() => {
    setAnnotateMode(false);
    setOverallNote("");
    setAnnoState({ canUndo: false, canRedo: false, regions: [] });
  }, []);
  const annotateNavInitRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!annotateNavInitRef.current) {
      annotateNavInitRef.current = true;
      return;
    }
    setAnnotateMode(false);
    setOverallNote("");
  }, [currentIndex]);
  const handleApplyEdit = reactExports.useCallback(async () => {
    if (!annotatorRef.current || !imageMetadata?.threadId || isApplying) return;
    if (labeledCount === 0 && !overallNote.trim()) return;
    setIsApplying(true);
    try {
      const dataUrl = annotatorRef.current.flatten();
      if (!dataUrl) throw new Error("Failed to flatten annotations");
      const blob = await (await fetch(dataUrl)).blob();
      const resp = await fetch(`${baseURL}/api/attachments/image`, {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/png" },
        body: blob
      });
      if (!resp.ok) throw new Error(`upload failed: HTTP ${resp.status}`);
      const { url, mediaType, filePath } = await resp.json();
      const instruction = imageMetadata.mermaidSource ? buildMermaidEditInstruction(annoState.regions, overallNote, imageMetadata.mermaidSource, {
        directive: t("chat.mermaidAnnotate.prompt.directive"),
        sourceLabel: t("chat.mermaidAnnotate.prompt.sourceLabel"),
        visibleHeader: t("chat.mermaidAnnotate.prompt.visibleHeader"),
        overallLabel: t("chat.imageAnnotate.prompt.overallLabel")
      }) : buildEditInstruction(annoState.regions, overallNote, filePath, {
        directive: t("chat.imageAnnotate.prompt.directive"),
        sourcePathLabel: t("chat.imageAnnotate.prompt.sourcePathLabel"),
        visibleHeader: t("chat.imageAnnotate.prompt.visibleHeader"),
        overallLabel: t("chat.imageAnnotate.prompt.overallLabel")
      });
      await window.lightboxWindow?.editImageInThread?.({
        threadId: imageMetadata.threadId,
        imageUrl: url,
        mediaType: mediaType || "image/png",
        instruction
      });
      window.lightboxWindow?.close?.();
    } catch (error) {
      console.error("Failed to apply annotated edit:", error);
      setIsApplying(false);
    }
  }, [annoState.regions, overallNote, labeledCount, imageMetadata, baseURL, isApplying, t]);
  const [transform, setTransform] = reactExports.useState({ scale: 1, x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = reactExports.useState(false);
  const imageContainerRef = reactExports.useRef(null);
  const lastTouchDistance = reactExports.useRef(null);
  const lastTouchCenter = reactExports.useRef(null);
  const isDragging = reactExports.useRef(false);
  const lastDragPosition = reactExports.useRef(null);
  const isPinching = reactExports.useRef(false);
  const scale = transform.scale;
  const position = { x: transform.x, y: transform.y };
  reactExports.useEffect(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, [currentIndex]);
  reactExports.useEffect(() => {
    const init = async () => {
      const info = await window.apiServer.getInfo();
      if (info.baseURL) {
        setBaseURL(info.baseURL);
      }
    };
    init();
  }, []);
  const applyLightboxParams = reactExports.useCallback((params) => {
    setImages(params.images);
    setCurrentIndex(Math.min(Math.max(params.currentIndex, 0), Math.max(params.images.length - 1, 0)));
    setImageUrl(null);
    setLoadError(null);
    setIsLoading(params.images.length > 0);
    setTotalCount(params.totalCount ?? params.images.length);
    setHasMore(params.hasMore ?? false);
    if (params.annotate) setAnnotateMode(true);
  }, []);
  reactExports.useEffect(() => {
    if (!window.lightboxWindow?.onUpdate) return;
    let cancelled = false;
    const unsubscribe = window.lightboxWindow.onUpdate(applyLightboxParams);
    window.lightboxWindow.getInitialParams().then((params) => {
      if (!cancelled && params) {
        applyLightboxParams(params);
      }
    }).catch((error) => {
      console.error("Failed to load initial lightbox params:", error);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applyLightboxParams]);
  reactExports.useEffect(() => {
    if (images.length === 0) {
      setImageUrl(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }
    const currentImage = images[currentIndex];
    if (!currentImage) {
      setImageUrl(null);
      setLoadError("Image not found");
      setIsLoading(false);
      return;
    }
    setImageUrl(null);
    setLoadError(null);
    if (currentImage.url) {
      setImageUrl(currentImage.url);
      setIsLoading(false);
      return;
    }
    if (!baseURL) {
      setIsLoading(true);
      return;
    }
    const currentImageId = currentImage.id;
    let cancelled = false;
    setIsLoading(true);
    fetchImageUrl(baseURL, currentImageId).then((url) => {
      if (cancelled) return;
      if (url) {
        setImageUrl(url);
        setLoadError(null);
      } else {
        setImageUrl(null);
        setLoadError("Failed to load image");
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [baseURL, images, currentIndex]);
  const loadMoreImages = reactExports.useCallback(async () => {
    if (!baseURL || !hasMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`${baseURL}/api/gallery/images?limit=${PAGE_SIZE}&offset=${images.length}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        setImages((prev) => [...prev, ...data.images]);
        setHasMore(data.hasMore ?? false);
        if (typeof data.total === "number") {
          setTotalCount(data.total);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more images:", err);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [baseURL, hasMore, images.length]);
  reactExports.useEffect(() => {
    if (hasMore && currentIndex >= images.length - 5) {
      loadMoreImages();
    }
  }, [currentIndex, images.length, hasMore, loadMoreImages]);
  reactExports.useEffect(() => {
    if (pendingAdvanceRef.current && images.length > prevImagesLengthRef.current) {
      pendingAdvanceRef.current = false;
      setCurrentIndex(prevImagesLengthRef.current);
    }
    prevImagesLengthRef.current = images.length;
  }, [images.length]);
  const handleClose = reactExports.useCallback(() => {
    if (window.lightboxWindow?.close) {
      window.lightboxWindow.close();
    } else {
      window.close();
    }
  }, []);
  const handlePrev = reactExports.useCallback(() => {
    setCurrentIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);
  const handleNext = reactExports.useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === images.length - 1) {
        if (hasMore) {
          pendingAdvanceRef.current = true;
          loadMoreImages();
          return prev;
        }
        return 0;
      }
      return prev + 1;
    });
  }, [images.length, hasMore, loadMoreImages]);
  const handleWheel = reactExports.useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * delta, 0.5), 5)
    }));
  }, []);
  const handleTouchStart = reactExports.useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching.current = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    } else if (e.touches.length === 1) {
      isDragging.current = true;
      lastDragPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);
  const handleTouchMove = reactExports.useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null && lastTouchCenter.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const currentCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
      const scaleRatio = distance / lastTouchDistance.current;
      const panDeltaX = currentCenter.x - lastTouchCenter.current.x;
      const panDeltaY = currentCenter.y - lastTouchCenter.current.y;
      const container = imageContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;
        const pinchX = currentCenter.x - containerCenterX;
        const pinchY = currentCenter.y - containerCenterY;
        setTransform((prev) => {
          const newScale = Math.min(Math.max(prev.scale * scaleRatio, 0.5), 5);
          const actualRatio = newScale / prev.scale;
          return {
            scale: newScale,
            x: pinchX * (1 - actualRatio) + prev.x * actualRatio + panDeltaX,
            y: pinchY * (1 - actualRatio) + prev.y * actualRatio + panDeltaY
          };
        });
      }
      lastTouchDistance.current = distance;
      lastTouchCenter.current = currentCenter;
    } else if (e.touches.length === 1 && isDragging.current && lastDragPosition.current) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastDragPosition.current.x;
      const deltaY = e.touches[0].clientY - lastDragPosition.current.y;
      lastDragPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform((prev) => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  }, []);
  const handleTouchEnd = reactExports.useCallback(() => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
    isDragging.current = false;
    lastDragPosition.current = null;
    isPinching.current = false;
  }, []);
  const handleMouseDown = reactExports.useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    lastDragPosition.current = { x: e.clientX, y: e.clientY };
  }, []);
  const handleMouseMove = reactExports.useCallback((e) => {
    if (isDragging.current && lastDragPosition.current) {
      const deltaX = e.clientX - lastDragPosition.current.x;
      const deltaY = e.clientY - lastDragPosition.current.y;
      lastDragPosition.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  }, []);
  const handleMouseUp = reactExports.useCallback(() => {
    isDragging.current = false;
    setIsDraggingState(false);
    lastDragPosition.current = null;
  }, []);
  const lastTapTime = reactExports.useRef(0);
  const handleDoubleTap = reactExports.useCallback(() => {
    if (isPinching.current) return;
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (scale > 1) {
        setTransform({ scale: 1, x: 0, y: 0 });
      } else {
        setTransform((prev) => ({ ...prev, scale: 2 }));
      }
    }
    lastTapTime.current = now;
  }, [scale]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handlePrev, handleNext]);
  const handleNavigateToThread = reactExports.useCallback(() => {
    if (imageMetadata?.threadId && window.lightboxWindow?.navigateToThread) {
      window.lightboxWindow.navigateToThread(imageMetadata.threadId);
    }
  }, [imageMetadata]);
  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const extension = blob.type.split("/")[1]?.split("+")[0] || "png";
      const filename = imageMetadata?.filename || `image-${Date.now()}.${extension}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      const success = await copyImageFromUrlToClipboard(imageUrl);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      }
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `lightbox-shell h-screen bg-transparent flex flex-col relative overflow-hidden ${isMac ? "rounded-[26px]" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-0 bg-black/95 ${isMac ? "rounded-[26px]" : ""}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-black/50 relative z-10", style: { WebkitAppRegion: "drag" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", style: { WebkitAppRegion: "no-drag" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/70 text-sm", children: [
          images.length > 0 ? `${currentIndex + 1} / ${totalCount || images.length}` : "-",
          isLoadingMore && " ..."
        ] }),
        imageMetadata?.threadTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors", onClick: handleNavigateToThread, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
          imageMetadata.threadTitle
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", style: { WebkitAppRegion: "no-drag" }, children: [
        canAnnotate && !annotateMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "text-white/80 hover:text-white hover:bg-white/10 gap-1.5 h-8",
            onClick: () => setAnnotateMode(true),
            title: t("chat.imageAnnotate.buttonTitle"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: t("chat.imageAnnotate.button") })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "text-white/70 hover:text-white hover:bg-white/10",
            onClick: handleCopy,
            disabled: !imageUrl,
            title: t("chat.imageMenu.copyImage"),
            children: copySuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "text-white/70 hover:text-white hover:bg-white/10",
            onClick: handleDownload,
            disabled: !imageUrl,
            title: t("chat.imageMenu.saveImage"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" })
          }
        ),
        isMac ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "text-white/70 hover:text-white hover:bg-white/10", onClick: handleClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WindowControls, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: imageContainerRef,
        className: "flex-1 min-h-0 flex items-center justify-center p-4 relative z-10 overflow-hidden",
        style: { touchAction: "none" },
        onWheel: handleWheel,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        onClick: handleDoubleTap,
        children: [
          images.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "absolute left-4 z-10 text-white/70 hover:text-white hover:bg-white/10 w-12 h-12",
              onClick: (e) => {
                e.stopPropagation();
                handlePrev();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-8 h-8" })
            }
          ),
          loadError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/60 text-sm", children: loadError }) : isLoading || !imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: imageUrl,
              alt: imageMetadata?.filename || "Image",
              className: "max-w-[calc(100%-120px)] max-h-full object-contain rounded-lg select-none",
              style: {
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: scale === 1 ? "transform 0.2s ease-out" : "none",
                cursor: isDraggingState ? "grabbing" : "grab",
                willChange: "transform"
              },
              draggable: false,
              onError: () => {
                setImageUrl(null);
                setLoadError("Failed to load image");
              }
            }
          ),
          images.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "absolute right-4 z-10 text-white/70 hover:text-white hover:bg-white/10 w-12 h-12",
              onClick: (e) => {
                e.stopPropagation();
                handleNext();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-8 h-8" })
            }
          )
        ]
      }
    ),
    annotateMode && imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-40 flex flex-col bg-black/95", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-black/60 flex-wrap", style: { WebkitAppRegion: "drag" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", style: { WebkitAppRegion: "no-drag" }, children: [
          ANNO_TOOLS.map(({ tool, Icon, labelKey }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAnnoTool(tool),
              title: t(`chat.imageAnnotate.tool.${labelKey}`),
              className: `flex items-center justify-center w-8 h-8 rounded-md transition-colors ${annoTool === tool ? "bg-white/90 text-black" : "text-white/70 hover:text-white hover:bg-white/10"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" })
            },
            tool
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-white/20 mx-1" }),
          ANNO_COLORS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAnnoColor(c),
              title: t("chat.imageAnnotate.color"),
              className: `w-6 h-6 rounded-full border-2 transition-transform ${annoColor === c ? "scale-110 border-white" : "border-white/30 hover:scale-105"}`,
              style: { backgroundColor: c }
            },
            c
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-white/20 mx-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => annotatorRef.current?.undo(),
              disabled: !annoState.canUndo,
              title: t("chat.imageAnnotate.undo"),
              className: "flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => annotatorRef.current?.redo(),
              disabled: !annoState.canRedo,
              title: t("chat.imageAnnotate.redo"),
              className: "flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => annotatorRef.current?.clear(),
              disabled: annoState.regions.length === 0,
              title: t("chat.imageAnnotate.clearAll"),
              className: "flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: exitAnnotate,
            className: "text-white/70 hover:text-white text-sm px-2 py-1 rounded-md hover:bg-white/10",
            style: { WebkitAppRegion: "no-drag" },
            children: t("chat.imageAnnotate.exit")
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ImageAnnotator,
          {
            ref: annotatorRef,
            imageUrl,
            tool: annoTool,
            color: annoColor,
            onChange: setAnnoState,
            className: "max-w-full max-h-full",
            regionPlaceholder: t("chat.imageAnnotate.regionPlaceholder"),
            removeRegionLabel: t("chat.imageAnnotate.removeRegion")
          }
        ),
        annoState.regions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur-sm", children: t("chat.imageAnnotate.canvasHint") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-black/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: overallNote,
            onChange: (e) => setOverallNote(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleApplyEdit();
              }
            },
            placeholder: t("chat.imageAnnotate.overallNotePlaceholder"),
            className: "flex-1 rounded-lg bg-white/8 text-white placeholder:text-white/35 text-sm px-3 py-2 outline-none focus:bg-white/12 border border-white/10"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleApplyEdit,
            disabled: isApplying || labeledCount === 0 && !overallNote.trim(),
            className: "h-10 gap-1.5 bg-white text-black hover:bg-white/90 disabled:opacity-40",
            title: labeledCount === 0 && !overallNote.trim() ? t("chat.imageAnnotate.applyDisabledHint") : t("chat.imageAnnotate.applyShortcut"),
            children: [
              isApplying ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "w-4 h-4" }),
              t("chat.imageAnnotate.apply"),
              labeledCount > 0 ? ` (${labeledCount})` : ""
            ]
          }
        )
      ] }) })
    ] }),
    imageMetadata?.createdAt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-black/50 text-center relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50 text-xs", children: new Date(imageMetadata.createdAt).toLocaleString() }) })
  ] });
}
initObservability();
function LightboxApp() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SWRConfig, { value: swrConfig, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConditionalPostHogProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LightboxWindow, {}) }) }) }) });
}
function Root() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LightboxApp, {});
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root, {}) })
);
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
