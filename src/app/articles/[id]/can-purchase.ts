export function canPurchase({
  userId,
  authorId,
  price,
  hasUserPurchased,
}: {
  userId: string;
  authorId: string;
  price: number;
  hasUserPurchased: boolean;
}): boolean {
  const isPaid = price > 0;
  const isMyArticle = authorId === userId;

  return isPaid && !isMyArticle && !hasUserPurchased;
}
