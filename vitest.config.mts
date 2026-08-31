import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig の paths（@/* -> ./src/*）を Vitest 側にも合わせる
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // サーバー側ロジックのテストが中心のため既定は node。
    // コンポーネントをテストするファイルは、先頭に次の 1 行を書いて jsdom に切り替える:
    //   // @vitest-environment jsdom
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
