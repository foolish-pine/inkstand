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
      // DB へのアクセスは DAL（src/lib/dal）からだけにする。
      // ここを通らないとデータに触れない、という境界があってはじめて
      // 「DAL の関数が認可を持つ」ことに意味が出る。ディレクトリを作るだけでは
      // 隣に直接クエリを書く人を止められない。
      //
      // 禁止するのは DB クライアント（@/db）だけで、@/db/schema は許す。
      // テーブル定義は「説明」であってクエリを実行する力を持たない。
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/db",
              message:
                "DB へのアクセスは src/lib/dal からのみ。ページや Server Action からは DAL の関数を呼んでください。",
            },
          ],
        },
      ],
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
  {
    // DAL 自身と、テストの基盤は対象外。フィクスチャは他人のデータを含めて
    // 用意する必要があり DAL では作れない。setup はテスト間の TRUNCATE に使う。
    files: [
      "src/lib/dal/**/*.ts",
      "src/test/fixtures.ts",
      "vitest.db.setup.ts",
    ],
    rules: { "no-restricted-imports": "off" },
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
