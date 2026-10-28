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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "26a5953b-ab52-4ad1-b638-914c430e1490", e._sentryDebugIdIdentifier = "sentry-dbid-26a5953b-ab52-4ad1-b638-914c430e1490");
    })();
  } catch (e) {
  }
}
;
import { r as reactExports, j as jsxRuntimeExports } from "./index-CgjOdD6Y.js";
import { i as instance } from "./createLucideIcon-3XU0ditt.js";
import { F as FileQuestionMark } from "./file-question-mark-C5bwgzv-.js";
const UnsupportedPreview = reactExports.memo(function UnsupportedPreview2({ extension }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FileQuestionMark, { className: "size-12 opacity-50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: instance.t("artifactsUi.previewUnavailable") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: instance.t("artifactsUi.fileTypeNotSupported", { extension }) })
    ] })
  ] });
});
export {
  UnsupportedPreview
};
