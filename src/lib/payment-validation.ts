export type TransactionItem = { price?: { id?: string }; quantity?: number };

export function containsOnlyExpectedCoursePrice(
  items: TransactionItem[] | undefined,
  expectedPriceId: string,
) {
  if (!items || items.length !== 1) return false;
  const [item] = items;
  return item?.price?.id === expectedPriceId && item.quantity === 1;
}
