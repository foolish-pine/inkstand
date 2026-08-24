"use client";

import { useEffect } from "react";
import { Wordmark } from "@/components/wordmark";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="font-display mt-12 text-3xl tracking-wide">
          問題が発生しました
        </h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          処理を完了できませんでした。しばらく待ってからもう一度お試しください。
        </p>
        {error.digest && (
          <p className="text-muted mt-6 font-mono text-xs">
            エラーID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={retry}
          className="bg-foreground text-background focus-visible:outline-accent mt-10 w-full cursor-pointer py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          もう一度試す
        </button>
      </div>
    </main>
  );
}
