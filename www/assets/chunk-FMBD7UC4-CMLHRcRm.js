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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "f876fbd8-1b73-4396-b6d9-a49f1c0bc93a", e._sentryDebugIdIdentifier = "sentry-dbid-f876fbd8-1b73-4396-b6d9-a49f1c0bc93a");
    })();
  } catch (e) {
  }
}
;
import { _ as __name } from "./mermaid.core-BgkBNkch.js";
var getIconStyles = /* @__PURE__ */ __name(() => `
  /* Font Awesome icon styling - consolidated */
  .label-icon {
    display: inline-block;
    height: 1em;
    overflow: visible;
    vertical-align: -0.125em;
  }
  
  .node .label-icon path {
    fill: currentColor;
    stroke: revert;
    stroke-width: revert;
  }
`, "getIconStyles");
export {
  getIconStyles as g
};
