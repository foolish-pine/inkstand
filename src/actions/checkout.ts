"use server";

import { notFound, redirect } from "next/navigation";
import { getString } from "./form-data";
import { canPurchase } from "@/app/articles/[id]/can-purchase";
import { requireUser } from "@/lib/current-user";
import { getArticleForCheckout } from "@/lib/dal/checkout";
import { hasPurchasedArticle } from "@/lib/dal/my-purchases";
import { requireEnv } from "@/lib/require-env";
import { stripe } from "@/lib/stripe";

export async function createCheckout(formData: FormData): Promise<void> {
  const user = await requireUser();

  const articleId = getString(formData, "articleId");

  const article = await getArticleForCheckout(articleId);

  if (!article) notFound();

  if (
    !canPurchase({
      userId: user.id,
      authorId: article.authorId,
      price: article.price,
      hasPurchased: await hasPurchasedArticle(articleId),
    })
  )
    notFound();

  const origin = requireEnv(process.env.APP_URL, "APP_URL");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    managed_payments: { enabled: false }, // これがないとエラーになる
    line_items: [
      {
        price_data: {
          currency: "jpy",
          unit_amount: article.price,
          product_data: {
            name: article.title,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      buyerId: user.id,
      articleId,
    },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/articles/${articleId}`,
  });

  if (!session.url) throw new Error("Checkout URL の取得に失敗しました");

  redirect(session.url);
}

// クライアントコンポーネントから購入の反映を確認するための入口。
// DAL を直接 import すると next/headers まで連鎖してブラウザで壊れるため、
// "use server" のここを経由する。認可は DAL の requireUser() が持つ。
export async function checkPurchased(articleId: string): Promise<boolean> {
  return await hasPurchasedArticle(articleId);
}
