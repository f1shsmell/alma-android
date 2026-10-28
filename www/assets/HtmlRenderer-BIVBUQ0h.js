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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "de0dbe95-e651-42f3-8d32-b3e3ba94c37c", e._sentryDebugIdIdentifier = "sentry-dbid-de0dbe95-e651-42f3-8d32-b3e3ba94c37c");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import "./ThemeContext-DC9BEsmk.js";
import "./x-CcbWXrDG.js";
import "./createLucideIcon-3XU0ditt.js";
import { u as useTheme } from "./overflow-container-mj8jOZ-y.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-7mJnAivB.js";
function HtmlRenderer({ artifact }) {
  const iframeRef = reactExports.useRef(null);
  const { effectiveTheme } = useTheme();
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!iframeRef.current) return;
    try {
      const themeStyles = `
                <style>
                    :root {
                        color-scheme: ${effectiveTheme === "dark" ? "dark" : "light"};
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        margin: 0;
                        padding: 16px;
                        background: ${effectiveTheme === "dark" ? "#1a1a1a" : "#ffffff"};
                        color: ${effectiveTheme === "dark" ? "#e5e5e5" : "#1a1a1a"};
                    }
                </style>
            `;
      let htmlContent = artifact.content;
      if (!htmlContent.includes("<html") && !htmlContent.includes("<!DOCTYPE")) {
        htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${themeStyles}
</head>
<body>
    ${artifact.content}
</body>
</html>`;
      } else {
        htmlContent = htmlContent.replace("</head>", `${themeStyles}</head>`);
      }
      iframeRef.current.srcdoc = htmlContent;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render HTML");
    }
  }, [artifact.content, effectiveTheme]);
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive text-sm", children: error }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { ref: iframeRef, className: "w-full h-full border-0", sandbox: "allow-scripts", title: artifact.title });
}
export {
  HtmlRenderer
};
