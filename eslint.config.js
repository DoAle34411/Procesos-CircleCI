import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,     // allows 'console', 'process', etc.
        ...globals.jest      // allows 'test', 'expect', etc.
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      // add custom rules if needed
    }
  }
];
