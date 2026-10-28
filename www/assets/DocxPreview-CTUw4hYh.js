const __vite__mapDeps = (i, m = __vite__mapDeps, d = m.f || (m.f = ["./index-Cy1kvmKY.js", "./index-CgjOdD6Y.js", "./index-BfOkhBvY.css", "./PluginNotificationListener-scvFi9tf.js", "./createLucideIcon-3XU0ditt.js", "./ThemeContext-DC9BEsmk.js", "./x-CcbWXrDG.js", "./index-7mJnAivB.js", "./preload-helper-D4tMVkJm.js", "./label-hzvhGvL9.js", "./wand-sparkles-BbMFNLc9.js", "./overflow-container-mj8jOZ-y.js", "./PlatformContext-CrasNQRo.js", "./TwemojiIcon-CIMlZ5Vl.js", "./index-DN2Gz6Bt.js", "./apiClient-tX7iz454.js", "./loader-circle-DiP-R-ZO.js", "./slider-BVnwZRlC.js", "./pencil-DC0BaoJb.js", "./trash-2-RgRY4jyV.js", "./image-m7_DgCTW.js", "./alma-icon-C6VWCCBG.js", "./addLeadingZeros-PaOGjOu2.js", "./PluginNotificationListener-DrKknvT7.css"])) => i.map((i2) => d[i2]);
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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "db40c21c-d38c-48f1-86b1-69d58c3dc4c3", e._sentryDebugIdIdentifier = "sentry-dbid-db40c21c-d38c-48f1-86b1-69d58c3dc4c3");
    })();
  } catch (e) {
  }
}
;
import { _ as __vitePreload } from "./preload-helper-D4tMVkJm.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import { u as useTheme, O as OverflowContainer } from "./overflow-container-mj8jOZ-y.js";
import "./ThemeContext-DC9BEsmk.js";
import "./x-CcbWXrDG.js";
import "./createLucideIcon-3XU0ditt.js";
import { L as LoaderCircle } from "./loader-circle-DiP-R-ZO.js";
import "./index-7mJnAivB.js";
const DocxPreview = reactExports.memo(function DocxPreview2({ src }) {
  const [htmlContent, setHtmlContent] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const { effectiveTheme } = useTheme();
  reactExports.useEffect(() => {
    let mounted = true;
    const loadDocx = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(src);
        if (!response.ok) throw new Error("Failed to fetch document");
        const arrayBuffer = await response.arrayBuffer();
        const mammoth = await __vitePreload(() => import("./index-Cy1kvmKY.js").then((n) => n.i), true ? __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]) : void 0, import.meta.url);
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (mounted) {
          setHtmlContent(result.value);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load document");
          setIsLoading(false);
        }
      }
    };
    loadDocx();
    return () => {
      mounted = false;
    };
  }, [src]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-muted-foreground" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Failed to load document: ",
      error
    ] }) });
  }
  const isDark = effectiveTheme === "dark";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(OverflowContainer, { className: "h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
                    .docx-content {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: ${isDark ? "#e5e5e5" : "#1a1a1a"};
                        padding: 24px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .docx-content h1, .docx-content h2, .docx-content h3,
                    .docx-content h4, .docx-content h5, .docx-content h6 {
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                    }
                    .docx-content p {
                        margin: 0.5em 0;
                    }
                    .docx-content table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 16px 0;
                    }
                    .docx-content th, .docx-content td {
                        border: 1px solid ${isDark ? "#404040" : "#e0e0e0"};
                        padding: 8px 12px;
                        text-align: left;
                    }
                    .docx-content th {
                        background: ${isDark ? "#2a2a2a" : "#f5f5f5"};
                    }
                    .docx-content img {
                        max-width: 100%;
                        height: auto;
                    }
                    .docx-content ul, .docx-content ol {
                        padding-left: 2em;
                        margin: 0.5em 0;
                    }
                    .docx-content li {
                        margin: 0.25em 0;
                    }
                ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "docx-content", dangerouslySetInnerHTML: { __html: htmlContent || "" } })
  ] });
});
export {
  DocxPreview
};
