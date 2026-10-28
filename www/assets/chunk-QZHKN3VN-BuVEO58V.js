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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "bd5f7800-0d93-4add-99dd-52923fa0435a", e._sentryDebugIdIdentifier = "sentry-dbid-bd5f7800-0d93-4add-99dd-52923fa0435a");
    })();
  } catch (e) {
  }
}
;
import { _ as __name } from "./mermaid.core-BgkBNkch.js";
var ImperativeState = class {
  /**
   * @param init - Function that creates the default state.
   */
  constructor(init) {
    this.init = init;
    this.records = this.init();
  }
  static {
    __name(this, "ImperativeState");
  }
  reset() {
    this.records = this.init();
  }
};
export {
  ImperativeState as I
};
