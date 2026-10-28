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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "c9a5f9d2-1bf6-4f4c-91c7-a269849f2a99", e._sentryDebugIdIdentifier = "sentry-dbid-c9a5f9d2-1bf6-4f4c-91c7-a269849f2a99");
    })();
  } catch (e) {
  }
}
;
import { U as Utils, C as Color } from "./mermaid.core-BgkBNkch.js";
const channel = (color, channel2) => {
  return Utils.lang.round(Color.parse(color)[channel2]);
};
export {
  channel as c
};
