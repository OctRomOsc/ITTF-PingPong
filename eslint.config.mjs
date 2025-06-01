import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    files: ["dist/esm/**/*.js"],
    plugins: { js, "import": importPlugin },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // Enforce explicit extension in import statements
      "import/extensions": [
        "error",
        "always",
        {
          "js": "always"
        }
      ],
    }
  },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
]);
