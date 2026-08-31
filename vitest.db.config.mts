import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// DB に接続するテスト専用の設定。ローカルの Supabase（npx supabase start）が
// 起動している必要がある。通常の単体テスト（npm run test）とは分けてある。
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // 理由は src/test/next-cache-stub.ts のコメントを参照
      "next/cache": fileURLToPath(
        new URL("./src/test/next-cache-stub.ts", import.meta.url),
      ),
    },
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
