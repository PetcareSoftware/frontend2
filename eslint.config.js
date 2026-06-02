import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "warn",
    }
  },
  {
    files: ["**/*{js,vue}"],
    extends: pluginVue.configs["flat/essential"],
    rules: {
      "vue/multi-word-component-names": "off",
    }
  },
  {
    files: ["*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": "warn",
    }
  },
]);
