import type { NextConfig } from "next";

// next/image は許可したホストの画像しか最適化しない。許可するのは Supabase
// Storage の images バケットの公開パスだけに絞る。ホスト名をベタ書きすると
// リポジトリが 1 つの Supabase プロジェクトに固定されるので、環境変数から作る。
// 値が無ければここで落とす（src/lib/require-env.ts と同じ考え方。next.config は
// アプリのコードを import しないので、判定だけ書き写している）。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined.");

// protocol と port も URL から取る。E2E はローカルの Supabase
// （http://127.0.0.1:54321）を見るので、https 固定だと画像が出ない。
const { protocol, hostname, port } = new URL(supabaseUrl);

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: protocol === "http:" ? "http" : "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
  },
};

export default nextConfig;
