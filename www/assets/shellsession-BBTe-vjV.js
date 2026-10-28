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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "24e220d6-c272-43c9-8cc7-b2c6ecc80e6c", e._sentryDebugIdIdentifier = "sentry-dbid-24e220d6-c272-43c9-8cc7-b2c6ecc80e6c");
    })();
  } catch (e) {
  }
}
;
import shellscript from "./shellscript-BuYUI_cp.js";
const lang = Object.freeze(JSON.parse('{"displayName":"Shell Session","fileTypes":["sh-session"],"name":"shellsession","patterns":[{"captures":{"1":{"name":"entity.other.prompt-prefix.shell-session"},"2":{"name":"punctuation.separator.prompt.shell-session"},"3":{"name":"source.shell","patterns":[{"include":"source.shell"}]}},"match":"^(?:((?:\\\\(\\\\S+\\\\)\\\\s*)?(?:sh\\\\S*?|\\\\w+\\\\S+[:@]\\\\S+(?:\\\\s+\\\\S+)?|\\\\[\\\\S+?[:@]\\\\N+?].*?))\\\\s*)?([#$%>❯➜\\\\p{Greek}])\\\\s+(.*)$"},{"match":"^.+$","name":"meta.output.shell-session"}],"scopeName":"text.shell-session","embeddedLangs":["shellscript"],"aliases":["console"]}'));
const shellsession = [
  ...shellscript,
  lang
];
export {
  shellsession as default
};
