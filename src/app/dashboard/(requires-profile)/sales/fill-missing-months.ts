type MonthlySales = {
  month: string;
  salesCount: number;
  salesAmount: number;
};

export function fillMissingMonths({
  range,
  salesByMonth,
}: {
  range: string[];
  salesByMonth: MonthlySales[];
}): MonthlySales[] {
  return range.map((month) => {
    const sales = salesByMonth.find(
      (monthlySales) => monthlySales.month === month,
    ) ?? {
      salesCount: 0,
      salesAmount: 0,
    };

    return {
      month,
      salesCount: sales.salesCount,
      salesAmount: sales.salesAmount,
    };
  });
}
