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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "f7b92000-1634-47f1-a74e-0f7857e75895", e._sentryDebugIdIdentifier = "sentry-dbid-f7b92000-1634-47f1-a74e-0f7857e75895");
    })();
  } catch (e) {
  }
}
;
import { c as baseClone } from "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
var CLONE_SYMBOLS_FLAG = 4;
function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}
export {
  clone as c
};
