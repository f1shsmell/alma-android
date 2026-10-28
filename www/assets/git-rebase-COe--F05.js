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
      n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "5ff2fced-8429-43b2-95cb-15251b87ea2d", e._sentryDebugIdIdentifier = "sentry-dbid-5ff2fced-8429-43b2-95cb-15251b87ea2d");
    })();
  } catch (e) {
  }
}
;
import shellscript from "./shellscript-BuYUI_cp.js";
const lang = Object.freeze(JSON.parse('{"displayName":"Git Rebase Message","name":"git-rebase","patterns":[{"captures":{"1":{"name":"punctuation.definition.comment.git-rebase"}},"match":"^\\\\s*(#).*$\\\\n?","name":"comment.line.number-sign.git-rebase"},{"captures":{"1":{"name":"support.function.git-rebase"},"2":{"name":"constant.sha.git-rebase"},"3":{"name":"meta.commit-message.git-rebase"}},"match":"^\\\\s*(pick|p|reword|r|edit|e|squash|s|fixup|f|drop|d)\\\\s+([0-9a-f]+)\\\\s+(.*)$","name":"meta.commit-command.git-rebase"},{"captures":{"1":{"name":"support.function.git-rebase"},"2":{"patterns":[{"include":"source.shell"}]}},"match":"^\\\\s*(exec|x)\\\\s+(.*)$","name":"meta.commit-command.git-rebase"},{"captures":{"1":{"name":"support.function.git-rebase"}},"match":"^\\\\s*(b(?:reak|))\\\\s*$","name":"meta.commit-command.git-rebase"}],"scopeName":"text.git-rebase","embeddedLangs":["shellscript"]}'));
const gitRebase = [
  ...shellscript,
  lang
];
export {
  gitRebase as default
};
