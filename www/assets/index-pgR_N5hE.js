!(function() {
  try {
    var e2 = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
    e2.SENTRY_RELEASE = { id: "alma@0.4.213" };
  } catch (e3) {
  }
})();
;
{
  try {
    (function() {
      var e2 = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {}, n = new e2.Error().stack;
      n && (e2._sentryDebugIds = e2._sentryDebugIds || {}, e2._sentryDebugIds[n] = "fadbfa0d-d56d-4787-9d61-d9ac90e30f6f", e2._sentryDebugIdIdentifier = "sentry-dbid-fadbfa0d-d56d-4787-9d61-d9ac90e30f6f");
    })();
  } catch (e2) {
  }
}
;
import { r as registerGenerativeUIComponent, W as WidgetRenderer, P as PieChart, B as BarChart } from "./generative-ui-block-Brez-TTi.js";
import { C, a, G, b, c, g, d, e, i, f } from "./generative-ui-block-Brez-TTi.js";
import "./index-CgjOdD6Y.js";
import "./artifactWorkspaceContextDef-DolVKi0N.js";
import "./loader-circle-DiP-R-ZO.js";
import "./createLucideIcon-3XU0ditt.js";
let initialized = false;
function setupDefaultGenerativeUIComponents() {
  if (initialized) return;
  initialized = true;
  registerGenerativeUIComponent({
    name: "widgetRenderer",
    description: "Renders interactive HTML/SVG visualizations in a sandboxed iframe. Use for algorithm visualizations, diagrams, interactive widgets, simulations, math plots, and any visual explanation.",
    render: WidgetRenderer
  });
  registerGenerativeUIComponent({
    name: "pieChart",
    description: "Controlled Generative UI that displays data as a pie chart.",
    render: PieChart
  });
  registerGenerativeUIComponent({
    name: "barChart",
    description: "Controlled Generative UI that displays data as a bar chart.",
    render: BarChart
  });
}
export {
  BarChart,
  C as CHART_COLORS,
  a as CHART_CONFIG,
  G as GenerativeUIBlock,
  PieChart,
  WidgetRenderer,
  b as assembleDocument,
  c as clearGenerativeUIRegistry,
  g as getAllGenerativeUIComponents,
  d as getGenerativeUIComponent,
  e as getRegistrySize,
  i as isGenerativeUITool,
  registerGenerativeUIComponent,
  setupDefaultGenerativeUIComponents,
  f as unregisterGenerativeUIComponent
};
