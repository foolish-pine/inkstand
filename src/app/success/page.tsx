import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PurchaseStatus, PurchaseStatusPending } from "./purchase-status";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/current-user";
import { stripe } from "@/lib/stripe";

async function SuccessContent({
  searchParams,
}: Pick<PageProps<"/success">, "searchParams">) {
  const { session_id: sessionId } = await searchParams;

  if (typeof sessionId !== "string") redirect("/");

  const user = await requireUser();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const buyerId = session.metadata?.buyerId;
  const articleId = session.metadata?.articleId;

  if (!buyerId || !articleId) throw new Error("metadata is missing.");

  if (user.id !== buyerId) redirect("/");

  if (session.payment_status === "paid")
    return <PurchaseStatus articleId={articleId} sessionId={sessionId} />;

  redirect(`/articles/${articleId}`);
}

export default function Success({ searchParams }: PageProps<"/success">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="border-rule border p-10 text-center">
          <Suspense fallback={<PurchaseStatusPending />}>
            <SuccessContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
