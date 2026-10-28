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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "98b9dbc2-79e8-4428-9dd1-352412566d70", e._sentryDebugIdIdentifier = "sentry-dbid-98b9dbc2-79e8-4428-9dd1-352412566d70");
    })();
  } catch (e) {
  }
}
;
import { s as styles_default, c as classRenderer_v3_unified_default, a as classDiagram_default, C as ClassDB } from "./chunk-B4BG7PRW-DE7kctwY.js";
import { _ as __name } from "./mermaid.core-BgkBNkch.js";
import "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
import "./chunk-FMBD7UC4-CMLHRcRm.js";
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
  parser: classDiagram_default,
  get db() {
    return new ClassDB();
  },
  renderer: classRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.class) {
      cnf.class = {};
    }
    cnf.class.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
