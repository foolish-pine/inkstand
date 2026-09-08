import { DrizzleQueryError } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import Stripe from "stripe";
import { buildReceipt } from "./build-receipt";
import { parseSession } from "./parse-session";
import { createPurchase } from "@/lib/dal/stripe-webhook";
import { requireEnv } from "@/lib/require-env";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";

const stripeWebhookSecret = requireEnv(
  process.env.STRIPE_WEBHOOK_SECRET,
  "STRIPE_WEBHOOK_SECRET",
);
const origin = requireEnv(process.env.APP_URL, "APP_URL");

const acknowledgeUnprocessable = ({
  eventId,
  sessionId,
  message,
}: {
  eventId: string;
  sessionId: string;
  message: string;
}) => {
  console.error(`Event ID: ${eventId}, Session ID: ${sessionId}, ${message}`);

  return NextResponse.json({ error: message }, { status: 200 });
};

const acknowledgeEmailFailure = ({
  eventId,
  sessionId,
  message,
}: {
  eventId: string;
  sessionId: string;
  message: string;
}) => {
  console.error(`Event ID: ${eventId}, Session ID: ${sessionId}, ${message}`);

  return NextResponse.json({ message }, { status: 200 });
};

export async function POST(req: NextRequest) {
  // 署名は Stripe が送ってきたバイト列そのものに対して計算されている。
  // req.json() で受けて組み立て直すと本文が変わり、検証が必ず失敗する。
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig)
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const data = parseSession(session);
      if (!data.success) {
        return acknowledgeUnprocessable({
          eventId: event.id,
          sessionId: session.id,
          message: data.message,
        });
      }

      const {
        buyerId,
        buyerEmail,
        articleId,
        articleTitle,
        paymentAmount,
        stripePaymentIntentId,
      } = data;

      try {
        const purchase = await createPurchase({
          buyerId,
          articleId,
          paymentAmount,
          stripePaymentIntentId,
        });

        if (!purchase) {
          // Stripeはステータスコード200のレスポンスに対してリクエストを再送しない。
          // createPurchaseがundefinedを返す、つまり該当のpurchase行がすでに存在する場合、
          // 再送不要なので200を返す。
          return NextResponse.json(
            { message: "Purchase has already existed" },
            { status: 200 },
          );
        }
      } catch (e) {
        if (
          e instanceof DrizzleQueryError &&
          e.cause instanceof postgres.PostgresError &&
          e.cause.code === "23503" &&
          e.cause.constraint_name === "purchases_article_id_articles_id_fk"
        ) {
          return acknowledgeUnprocessable({
            eventId: event.id,
            sessionId: session.id,
            message: "Missing target article",
          });
        }

        throw e;
      }
      const receiptBody = buildReceipt({
        buyerEmail,
        articleId,
        articleTitle,
        paymentAmount,
        origin,
      });

      if (!receiptBody)
        return acknowledgeEmailFailure({
          eventId: event.id,
          sessionId: session.id,
          message: "buyerEmail is missing",
        });

      const { error } = await resend.emails.send(receiptBody);

      if (error)
        return acknowledgeEmailFailure({
          eventId: event.id,
          sessionId: session.id,
          message: `${error.name}: ${error.message}`,
        });

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
