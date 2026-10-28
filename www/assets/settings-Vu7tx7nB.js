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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "078965a3-dfa0-47ef-b85f-f381c3eacebf", e._sentryDebugIdIdentifier = "sentry-dbid-078965a3-dfa0-47ef-b85f-f381c3eacebf");
    })();
  } catch (e) {
  }
}
;
import { j as jsxRuntimeExports, R as React, r as reactExports } from "./index-CgjOdD6Y.js";
import { a as client } from "./client-BGW_um_Z.js";
import { i as initObservability, S as SWRConfig, s as swrConfig, T as ThemeProvider, b as usePostHog, d as Toaster } from "./ThemeContext-DC9BEsmk.js";
import "./createLucideIcon-3XU0ditt.js";
import "./clipboard-polyfill-Dc-rDY6K.js";
import { C as ConditionalPostHogProvider } from "./ConditionalPostHogProvider-DUq_pvB0.js";
import { S as SettingsWindow, P as PluginInputBoxModal, a as PluginQuickPickModal, b as PluginConfirmModal, c as PluginNotificationListener } from "./PluginNotificationListener-scvFi9tf.js";
import { P as PlatformProvider } from "./PlatformContext-CrasNQRo.js";
import { u as useTheme } from "./overflow-container-mj8jOZ-y.js";
import "./index-7mJnAivB.js";
import "./x-CcbWXrDG.js";
import "./preload-helper-D4tMVkJm.js";
import "./label-hzvhGvL9.js";
import "./wand-sparkles-BbMFNLc9.js";
import "./TwemojiIcon-CIMlZ5Vl.js";
import "./index-DN2Gz6Bt.js";
import "./apiClient-tX7iz454.js";
import "./loader-circle-DiP-R-ZO.js";
import "./slider-BVnwZRlC.js";
import "./pencil-DC0BaoJb.js";
import "./trash-2-RgRY4jyV.js";
import "./image-m7_DgCTW.js";
import "./alma-icon-C6VWCCBG.js";
import "./addLeadingZeros-PaOGjOu2.js";
initObservability();
function SettingsPageView() {
  const posthog = usePostHog();
  reactExports.useEffect(() => {
    if (posthog) {
      posthog.capture("$pageview", {
        $current_url: "/settings"
      });
    }
  }, [posthog]);
  return null;
}
function ThemedToaster() {
  const { effectiveTheme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", theme: effectiveTheme });
}
function SettingsApp() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SWRConfig, { value: swrConfig, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConditionalPostHogProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemeProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPageView, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsWindow, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedToaster, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PluginInputBoxModal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PluginQuickPickModal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PluginConfirmModal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PluginNotificationListener, {})
  ] }) }) }) });
}
function Root() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsApp, {});
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root, {}) })
);
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
