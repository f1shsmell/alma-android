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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "dff3d2a8-72c3-4326-85b3-6475b6705246", e._sentryDebugIdIdentifier = "sentry-dbid-dff3d2a8-72c3-4326-85b3-6475b6705246");
    })();
  } catch (e) {
  }
}
;
import html from "./html-VTng6Vto.js";
import ruby from "./ruby-CaHNP7TX.js";
import "./javascript-DrSVEBdm.js";
import "./css-O7cACgXX.js";
import "./haml-DoTItWye.js";
import "./xml-Dg6uJPOR.js";
import "./java-K8k2pC9c.js";
import "./sql-Of1N2pL5.js";
import "./graphql-lR3s-TM5.js";
import "./typescript-9BfFvZ7f.js";
import "./jsx-E-9jsAKX.js";
import "./tsx-CmRYddu3.js";
import "./cpp-CQzZNgmb.js";
import "./regexp-De5ERZ0M.js";
import "./glsl-CJEMk6C7.js";
import "./c-BNHmdg96.js";
import "./shellscript-BuYUI_cp.js";
import "./lua-DAGtTj63.js";
import "./yaml-D9eMs5h0.js";
const lang = Object.freeze(JSON.parse('{"displayName":"ERB","fileTypes":["erb","rhtml","html.erb"],"injections":{"text.html.erb - (meta.embedded.block.erb | meta.embedded.line.erb | comment)":{"patterns":[{"begin":"^(\\\\s*)(?=<%+#(?![^%]*%>))","beginCaptures":{"0":{"name":"punctuation.whitespace.comment.leading.erb"}},"end":"(?!\\\\G)(\\\\s*$\\\\n)?","endCaptures":{"0":{"name":"punctuation.whitespace.comment.trailing.erb"}},"patterns":[{"include":"#comment"}]},{"begin":"^(\\\\s*)(?=<%(?![^%]*%>))","beginCaptures":{"0":{"name":"punctuation.whitespace.embedded.leading.erb"}},"end":"(?!\\\\G)(\\\\s*$\\\\n)?","endCaptures":{"0":{"name":"punctuation.whitespace.embedded.trailing.erb"}},"patterns":[{"include":"#tags"}]},{"include":"#comment"},{"include":"#tags"}]}},"name":"erb","patterns":[{"include":"text.html.basic"}],"repository":{"comment":{"patterns":[{"begin":"<%+#","beginCaptures":{"0":{"name":"punctuation.definition.comment.begin.erb"}},"end":"%>","endCaptures":{"0":{"name":"punctuation.definition.comment.end.erb"}},"name":"comment.block.erb"}]},"tags":{"patterns":[{"begin":"<%+(?!>)[-=]?(?![^%]*%>)","beginCaptures":{"0":{"name":"punctuation.section.embedded.begin.erb"}},"contentName":"source.ruby","end":"(-?%)>","endCaptures":{"0":{"name":"punctuation.section.embedded.end.erb"},"1":{"name":"source.ruby"}},"name":"meta.embedded.block.erb","patterns":[{"captures":{"1":{"name":"punctuation.definition.comment.erb"}},"match":"(#).*?(?=-?%>)","name":"comment.line.number-sign.erb"},{"include":"source.ruby"}]},{"begin":"<%+(?!>)[-=]?","beginCaptures":{"0":{"name":"punctuation.section.embedded.begin.erb"}},"contentName":"source.ruby","end":"(-?%)>","endCaptures":{"0":{"name":"punctuation.section.embedded.end.erb"},"1":{"name":"source.ruby"}},"name":"meta.embedded.line.erb","patterns":[{"captures":{"1":{"name":"punctuation.definition.comment.erb"}},"match":"(#).*?(?=-?%>)","name":"comment.line.number-sign.erb"},{"include":"source.ruby"}]}]}},"scopeName":"text.html.erb","embeddedLangs":["html","ruby"]}'));
const erb = [
  ...html,
  ...ruby,
  lang
];
export {
  erb as default
};
