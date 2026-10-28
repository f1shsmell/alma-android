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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "f7328dde-9073-4927-a9a6-4de77dc7e965", e._sentryDebugIdIdentifier = "sentry-dbid-f7328dde-9073-4927-a9a6-4de77dc7e965");
    })();
  } catch (e) {
  }
}
;
import { W as WebPlugin } from "./connected-D8mcBngn.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-CgjOdD6Y.js";
import "./apiClient-tX7iz454.js";
class BrowserWeb extends WebPlugin {
  constructor() {
    super();
    this._lastWindow = null;
  }
  async open(options) {
    this._lastWindow = window.open(options.url, options.windowName || "_blank");
  }
  async close() {
    return new Promise((resolve, reject) => {
      if (this._lastWindow != null) {
        this._lastWindow.close();
        this._lastWindow = null;
        resolve();
      } else {
        reject("No active window to close!");
      }
    });
  }
}
const Browser = new BrowserWeb();
export {
  Browser,
  BrowserWeb
};
