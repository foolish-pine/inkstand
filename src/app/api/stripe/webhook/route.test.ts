import { NextRequest } from "next/server";
import Stripe from "stripe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { requireEnv } from "@/lib/require-env";

const stripeWebhookSecret = requireEnv(
  process.env.STRIPE_WEBHOOK_SECRET,
  "STRIPE_WEBHOOK_SECRET",
);

const stripeForTest = new Stripe("sk_test_dummy");

// 署名を計算する本文と、実際に送る本文を別々に渡せるようにしてある。
// 同じなら正常なリクエスト、違えば「署名は正しいが本文が書き換えられた」
// リクエストになる。
function buildRequestFromBody({
  sentBody,
  signedBody = sentBody,
  secret = stripeWebhookSecret,
}: {
  sentBody: string;
  signedBody?: string;
  secret?: string;
}) {
  const signature = stripeForTest.webhooks.generateTestHeaderString({
    payload: signedBody,
    secret,
  });

  return new NextRequest("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    body: sentBody,
    headers: { "stripe-signature": signature },
  });
}

function buildRequest(payload: unknown, secret = stripeWebhookSecret) {
  return buildRequestFromBody({ sentBody: JSON.stringify(payload), secret });
}

const unhandledEvent = {
  id: "evt_test_1",
  object: "event",
  // 対応する種別にすると createPurchase に到達してしまうため、
  // 未対応のイベントタイプを設定する
  type: "product.updated",
  created: Math.floor(Date.now() / 1000),
  livemode: false,
  pending_webhooks: 0,
  request: { id: null, idempotency_key: null },
  data: { object: {} },
};

describe("POST /api/stripe/webhook", () => {
  // console.error のスパイをテストをまたいで残さない。残すと、後続のテストで
  // 本当に起きたエラーが握り潰されて見えなくなる。
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("署名が正しい場合は 200 を返す", async () => {
    const res = await POST(buildRequest(unhandledEvent));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
  });
  it("署名が不正な場合は 400 を返す", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(buildRequest(unhandledEvent, "whsec_wrong_secret"));

    expect(res.status).toBe(400);
  });
  it("stripe-signature ヘッダーが無い場合は 400 を返す", async () => {
    const req = new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify(unhandledEvent),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });
  it("署名は正しいが本文が書き換えられている場合は 400 を返す", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const signedBody = JSON.stringify(unhandledEvent);

    const res = await POST(
      buildRequestFromBody({
        signedBody,
        sentBody: signedBody.replace("evt_test_1", "cs_test_tampered"),
      }),
    );

    expect(res.status).toBe(400);
  });

  // 署名は受け取ったバイト列そのものに対して計算されている。ハンドラが本文を
  // 一度 JSON へ戻して組み立て直すと（req.json() を使うと）バイト列が変わり、
  // 署名が合わなくなる。
  //
  // ただし JSON.stringify の出力をそのまま送っていると、組み立て直しても同じ
  // 文字列に戻るため、この違いが表に出ない。インデント付きの本文にすると必ず
  // 変わるので、req.text() で受けていることをここで固定できる。
  it("インデント付きの本文でも、そのまま検証されて 200 を返す", async () => {
    const res = await POST(
      buildRequestFromBody({
        sentBody: JSON.stringify(unhandledEvent, null, 2),
      }),
    );

    expect(res.status).toBe(200);
  });
});
