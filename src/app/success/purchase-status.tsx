"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkPurchased } from "@/actions/checkout";

const POLL_INTERVAL_MS = 2000;
const MAX_RETRIES = 10;

// 学習用プロジェクトなので実在しないドメインを使う。RFC 2606 で予約されており、
// 誤って送信されても誰にも届かない。運用するなら実在の窓口に差し替える。
const SUPPORT_EMAIL = "support@example.com";

// Suspense の fallback と、確認中の状態の両方から使う。同じ見た目にしておくと、
// サーバーの応答が届いた瞬間に画面が切り替わったように見えない。
export function PurchaseStatusPending() {
  return (
    <>
      <p className="font-display text-lg tracking-wide">
        お支払いを確認しています
      </p>
      <p className="text-muted mt-4 text-sm leading-relaxed">
        ブラウザを閉じずにしばらくお待ちください。
      </p>
      <div
        className="bg-rule mx-auto mt-8 h-1 w-24 animate-pulse"
        aria-hidden
      />
    </>
  );
}

export function PurchaseStatus({
  articleId,
  sessionId,
}: {
  articleId: string;
  sessionId: string;
}) {
  const [status, setStatus] = useState<"pending" | "success" | "unconfirmed">(
    "pending",
  );

  useEffect(() => {
    let count = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelled) return;

      try {
        const result = await checkPurchased(articleId);

        if (cancelled) return;

        if (result) {
          setStatus("success");
          return;
        }
      } catch (e) {
        console.error(e);
      } finally {
        count++;
      }

      if (count >= MAX_RETRIES) {
        setStatus("unconfirmed");
        return;
      }

      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [articleId]);

  if (status === "pending") return <PurchaseStatusPending />;

  if (status === "unconfirmed")
    return (
      <>
        <p className="font-display text-lg tracking-wide">
          お支払いを受け付けました
        </p>
        <p className="text-muted mt-4 text-sm leading-relaxed">
          購入手続きにお時間を要しています。お手数をおかけしますが、下記の
          session_id を添えて
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("購入が反映されない件")}&body=${encodeURIComponent(`session_id: ${sessionId}`)}`}
            className="text-foreground focus-visible:outline-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            カスタマーサポート
          </a>
          までお問い合わせください。
        </p>
        <p className="border-rule text-muted mt-8 border-t pt-6 text-xs break-all">
          session_id: {sessionId}
        </p>
      </>
    );

  return (
    <>
      <p className="font-display text-lg tracking-wide">購入が完了しました</p>
      <p className="text-muted mt-4 text-sm leading-relaxed">
        続きをお読みいただけます。
      </p>
      <Link
        href={`/articles/${articleId}`}
        className="bg-foreground text-background focus-visible:outline-accent mt-8 inline-block cursor-pointer px-10 py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        記事を読む
      </Link>
    </>
  );
}
