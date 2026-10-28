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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "4bd91e1f-7a5f-4b71-a0b0-cc215bc5212b", e._sentryDebugIdIdentifier = "sentry-dbid-4bd91e1f-7a5f-4b71-a0b0-cc215bc5212b");
    })();
  } catch (e) {
  }
}
;
import { i as installRendererFetchTimeoutGuard, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import { a as client } from "./client-BGW_um_Z.js";
import "./createLucideIcon-3XU0ditt.js";
import "./clipboard-polyfill-Dc-rDY6K.js";
import { i as initObservability } from "./ThemeContext-DC9BEsmk.js";
import "./generative-ui-block-Brez-TTi.js";
import { setupDefaultGenerativeUIComponents } from "./index-pgR_N5hE.js";
import { A as App } from "./App-CHUt1SP7.js";
import "./index-7mJnAivB.js";
import "./x-CcbWXrDG.js";
import "./preload-helper-D4tMVkJm.js";
import "./artifactWorkspaceContextDef-DolVKi0N.js";
import "./loader-circle-DiP-R-ZO.js";
import "./PluginNotificationListener-scvFi9tf.js";
import "./label-hzvhGvL9.js";
import "./wand-sparkles-BbMFNLc9.js";
import "./overflow-container-mj8jOZ-y.js";
import "./PlatformContext-CrasNQRo.js";
import "./TwemojiIcon-CIMlZ5Vl.js";
import "./index-DN2Gz6Bt.js";
import "./apiClient-tX7iz454.js";
import "./slider-BVnwZRlC.js";
import "./pencil-DC0BaoJb.js";
import "./trash-2-RgRY4jyV.js";
import "./image-m7_DgCTW.js";
import "./alma-icon-C6VWCCBG.js";
import "./addLeadingZeros-PaOGjOu2.js";
import "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
import "./useLiveCoding-C7HXNyqq.js";
import "./ExecutionHistory-Cj3Cvp6z.js";
import "./en-US-CNS5Ke8U.js";
import "./undo-2-0Mw7t7EX.js";
import "./v4-BPoTv6EE.js";
import "./ConditionalPostHogProvider-DUq_pvB0.js";
installRendererFetchTimeoutGuard();
setupDefaultGenerativeUIComponents();
initObservability();
client.createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsxRuntimeExports.jsx(App, {}));
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
