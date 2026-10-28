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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "65cfe639-9769-4c9d-82d4-b92df97c9c26", e._sentryDebugIdIdentifier = "sentry-dbid-65cfe639-9769-4c9d-82d4-b92df97c9c26");
    })();
  } catch (e) {
  }
}
;
import { _ as __name } from "./mermaid.core-BgkBNkch.js";
function populateCommonDb(ast, db) {
  if (ast.accDescr) {
    db.setAccDescription?.(ast.accDescr);
  }
  if (ast.accTitle) {
    db.setAccTitle?.(ast.accTitle);
  }
  if (ast.title) {
    db.setDiagramTitle?.(ast.title);
  }
}
__name(populateCommonDb, "populateCommonDb");
export {
  populateCommonDb as p
};
