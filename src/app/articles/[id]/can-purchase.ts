export function canPurchase({
  userId,
  authorId,
  price,
  hasPurchased,
}: {
  userId: string | null; // 未ログインの閲覧者。ログインすれば買えるので 返り値は true になる。
  authorId: string;
  price: number;
  hasPurchased: boolean;
}): boolean {
  const isPaid = price > 0;
  const isMyArticle = authorId === userId;

  return isPaid && !isMyArticle && !hasPurchased;
}
