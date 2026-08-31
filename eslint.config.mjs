import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "import/first": "error",
      "import/order": [
        "error",
        { alphabetize: { order: "asc" }, "newlines-between": "never" },
      ],
      // 同じモジュールからの import が 2 行に分かれるのを防ぐ。
      "import/no-duplicates": "error",
      // 既定は warning だが、npm run lint が落ちないため見落とし続けた。
      // 意図的に使わないものは _ 始まりにする。
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
