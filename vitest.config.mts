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
    // モジュールのトップレベルで requireEnv() を呼ぶファイル（src/lib/stripe.ts
    // など）は、鍵が無いと import した瞬間に落ちる。本番でリクエストを待たずに
    // 気づけるのが狙いなので、テスト側にダミーを与えて成立させる。
    // 実物ではない値だけを置く。ステップ11 の CI でも同じものが要る。
    // DATABASE_URL は接続先ではなく、@/db を import できるようにするための値。
    // postgres.js は最初のクエリまで接続しないので、実際に DB を触らない
    // テストならこれで足りる。DB を触るテストは *.db.test.ts に置く。
    env: {
      DATABASE_URL: "postgres://unused:unused@127.0.0.1:1/unused",
      STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_dummy",
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // DB に接続するテストは vitest.db.config.mts が担当する（npm run test:db）
    exclude: ["src/**/*.db.test.ts"],
  },
});
