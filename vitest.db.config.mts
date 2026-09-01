import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

// DB に接続するテスト専用の設定。ローカルの Supabase（npx supabase start）が
// 起動している必要がある。通常の単体テスト（npm run test）とは分けてある。
export default defineConfig({
  resolve: {
    // 配列で書くのは順序を明示するため。先に一致したものが使われるので、
    // 個別の差し替えを "@/" の総称より前に置く必要がある。
    alias: [
      // 差し替えの理由は各スタブのコメントを参照
      {
        find: /^@\/lib\/current-user$/,
        replacement: `${src}/test/current-user-stub.ts`,
      },
      { find: /^next\/cache$/, replacement: `${src}/test/next-cache-stub.ts` },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.db.test.ts"],
    // 1 つの DB を共有するので、ファイルを並列に走らせない。
    // 並列にすると、あるテストの TRUNCATE が別のテストのデータを消す。
    fileParallelism: false,
    globalSetup: ["./vitest.db.global-setup.ts"],
    setupFiles: ["./vitest.db.setup.ts"],
  },
});
