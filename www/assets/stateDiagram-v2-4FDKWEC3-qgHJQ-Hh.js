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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "8b715b89-be69-4156-9797-9fd89fe73ede", e._sentryDebugIdIdentifier = "sentry-dbid-8b715b89-be69-4156-9797-9fd89fe73ede");
    })();
  } catch (e) {
  }
}
;
import { s as styles_default, b as stateRenderer_v3_unified_default, a as stateDiagram_default, S as StateDB } from "./chunk-DI55MBZ5-BJQiTe1a.js";
import { _ as __name } from "./mermaid.core-BgkBNkch.js";
import "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
import "./chunk-55IACEB6-COYZcwoY.js";
import "./chunk-QN33PNHL-FR8sI-jj.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-CgjOdD6Y.js";
import "./ThemeContext-DC9BEsmk.js";
import "./createLucideIcon-3XU0ditt.js";
import "./x-CcbWXrDG.js";
import "./index-7mJnAivB.js";
import "./label-hzvhGvL9.js";
import "./wand-sparkles-BbMFNLc9.js";
import "./overflow-container-mj8jOZ-y.js";
import "./image-m7_DgCTW.js";
import "./useLiveCoding-C7HXNyqq.js";
import "./loader-circle-DiP-R-ZO.js";
import "./artifactWorkspaceContextDef-DolVKi0N.js";
var diagram = {
  parser: stateDiagram_default,
  get db() {
    return new StateDB(2);
  },
  renderer: stateRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
