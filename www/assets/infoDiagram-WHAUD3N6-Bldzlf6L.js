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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "26c2aaae-87cf-458a-8bab-7937bf4e18db", e._sentryDebugIdIdentifier = "sentry-dbid-26c2aaae-87cf-458a-8bab-7937bf4e18db");
    })();
  } catch (e) {
  }
}
;
import { _ as __name, l as log, K as selectSvgElement, e as configureSvgSize, L as package_default } from "./mermaid.core-BgkBNkch.js";
import { p as parse } from "./treemap-KMMF4GRG-DYy8RRPs.js";
import "./preload-helper-D4tMVkJm.js";
import "./index-CgjOdD6Y.js";
import "./mermaid-NA5CF7SZ-BKZ7k0hP.js";
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
import "./_baseUniq-D3PdqHEC.js";
import "./_basePickBy-CzvsaC8x.js";
import "./clone-CjqfNXzE.js";
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: package_default.version + ""
};
var getVersion = /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = /* @__PURE__ */ __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
