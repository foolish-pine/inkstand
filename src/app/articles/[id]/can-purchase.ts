export function canPurchase({
  userId,
  authorId,
  price,
  hasPurchased,
}: {
  userId: string;
  authorId: string;
  price: number;
  hasPurchased: boolean;
}): boolean {
  const isPaid = price > 0;
  const isMyArticle = authorId === userId;

  return isPaid && !isMyArticle && !hasPurchased;
}
