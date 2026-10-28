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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "7ec95d56-ac96-4556-be0e-44720a6e6788", e._sentryDebugIdIdentifier = "sentry-dbid-7ec95d56-ac96-4556-be0e-44720a6e6788");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import { B as Button } from "./ThemeContext-DC9BEsmk.js";
import { C as CircleAlert, O as OverflowContainer } from "./overflow-container-mj8jOZ-y.js";
import { Z as ZoomOut, b as ZoomIn } from "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
import { R as RotateCcw } from "./label-hzvhGvL9.js";
import "./createLucideIcon-3XU0ditt.js";
import "./x-CcbWXrDG.js";
import "./index-7mJnAivB.js";
import "./preload-helper-D4tMVkJm.js";
import "./wand-sparkles-BbMFNLc9.js";
import "./image-m7_DgCTW.js";
import "./useLiveCoding-C7HXNyqq.js";
import "./loader-circle-DiP-R-ZO.js";
import "./artifactWorkspaceContextDef-DolVKi0N.js";
function SvgRenderer({ artifact }) {
  const [scale, setScale] = reactExports.useState(1);
  const [error, setError] = reactExports.useState(null);
  const sanitizedSvg = reactExports.useMemo(() => {
    try {
      if (!artifact.content.includes("<svg")) {
        throw new Error("Invalid SVG: missing <svg> tag");
      }
      let svg = artifact.content;
      svg = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      svg = svg.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
      return svg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render SVG");
      return null;
    }
  }, [artifact.content]);
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleReset = () => setScale(1);
  if (error || !sanitizedSvg) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full p-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-8 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive text-sm text-center", children: error || "Failed to render SVG" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 p-2 border-b border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: handleZoomOut, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "size-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground w-12 text-center", children: [
        Math.round(scale * 100),
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: handleZoomIn, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "size-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: handleReset, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OverflowContainer, { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-4 min-h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "transition-transform duration-200",
        style: { transform: `scale(${scale})`, transformOrigin: "center" },
        dangerouslySetInnerHTML: { __html: sanitizedSvg }
      }
    ) }) })
  ] });
}
export {
  SvgRenderer
};
