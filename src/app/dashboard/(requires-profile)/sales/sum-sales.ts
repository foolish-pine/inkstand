type SalesSummary = {
  totalSalesCount: number;
  totalSalesAmount: number;
};

export function sumSales(
  sales: { salesCount: number; salesAmount: number }[],
): SalesSummary {
  return sales.reduce(
    (acc, curr) => {
      acc.totalSalesCount += curr.salesCount;
      acc.totalSalesAmount += curr.salesAmount;

      return acc;
    },
    {
      totalSalesCount: 0,
      totalSalesAmount: 0,
    },
  );
}
