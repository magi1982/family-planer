// Security lint for the built card bundle. innerHTML is used deliberately (templates); every interpolated
// value is escaped with esc() or validated server-side, see SECURITY.md. The rule stays on as a warning so
// new sinks are visible in review; eval-like constructs are errors.
import nounsanitized from "eslint-plugin-no-unsanitized";

export default [{
  files: ["**/*.js"],
  languageOptions: {
    ecmaVersion: 2022, sourceType: "module",
    globals: { window: "readonly", document: "readonly", customElements: "readonly", HTMLElement: "readonly",
      localStorage: "readonly", location: "readonly", history: "readonly", CustomEvent: "readonly", Event: "readonly",
      URL: "readonly", Image: "readonly", setTimeout: "readonly", clearTimeout: "readonly", setInterval: "readonly",
      clearInterval: "readonly", getComputedStyle: "readonly", console: "readonly" },
  },
  plugins: { "no-unsanitized": nounsanitized },
  rules: {
    "no-unsanitized/property": "warn", "no-unsanitized/method": "error",
    "no-eval": "error", "no-implied-eval": "error", "no-new-func": "error", "no-script-url": "error", "no-undef": "error",
  },
}];
