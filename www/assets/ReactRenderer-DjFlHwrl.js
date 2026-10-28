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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "021cea0b-7d2a-4e58-98e1-e7a4c93506d8", e._sentryDebugIdIdentifier = "sentry-dbid-021cea0b-7d2a-4e58-98e1-e7a4c93506d8");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import "./ThemeContext-DC9BEsmk.js";
import "./x-CcbWXrDG.js";
import "./createLucideIcon-3XU0ditt.js";
import { u as useTheme, C as CircleAlert } from "./overflow-container-mj8jOZ-y.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-7mJnAivB.js";
function ReactRenderer({ artifact }) {
  const iframeRef = reactExports.useRef(null);
  const { effectiveTheme } = useTheme();
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!iframeRef.current) return;
    try {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <style>
        :root {
            color-scheme: ${effectiveTheme === "dark" ? "dark" : "light"};
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 16px;
            background: ${effectiveTheme === "dark" ? "#1a1a1a" : "#ffffff"};
            color: ${effectiveTheme === "dark" ? "#e5e5e5" : "#1a1a1a"};
        }
        .error-boundary {
            color: #ef4444;
            padding: 16px;
            border: 1px solid #ef4444;
            border-radius: 8px;
            background: rgba(239, 68, 68, 0.1);
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react">
        try {
            // User component code
            ${artifact.content}

            // Find the default export or the first function component
            const RenderComponent = typeof App !== 'undefined' ? App :
                             typeof Main !== 'undefined' ? Main :
                             typeof Default !== 'undefined' ? Default : null;

            if (RenderComponent) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(RenderComponent));
            } else {
                document.getElementById('root').innerHTML = '<div class="error-boundary">No component found. Export a component named App, Main, or Default.</div>';
            }
        } catch (error) {
            document.getElementById('root').innerHTML = '<div class="error-boundary">Error: ' + error.message + '</div>';
        }
    <\/script>
</body>
</html>`;
      iframeRef.current.srcdoc = htmlContent;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to render React component");
    }
  }, [artifact.content, effectiveTheme]);
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full p-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-8 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive text-sm text-center", children: error })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { ref: iframeRef, className: "w-full h-full border-0", sandbox: "allow-scripts", title: artifact.title });
}
export {
  ReactRenderer
};
