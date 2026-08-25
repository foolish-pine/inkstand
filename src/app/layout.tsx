import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "inkstand",
  description: "有料記事プラットフォーム",
};

// 最初の描画より前に data-theme を確定させ、色が切り替わるちらつきを防ぐ。
// React のハイドレーションを待つと、一瞬ライトが見えてからダークになる。
const applyStoredTheme = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // 上のスクリプトが React より先に data-theme を付けるため、
      // サーバーが返した <html> とクライアントの <html> は必ず食い違う。
      // 意図した差分なので、この要素に限って警告を抑制する。
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyStoredTheme }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <div className="fixed right-4 bottom-4">
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
