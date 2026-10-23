import type {
  Category,
  Allocation,
  MonthlyIncome,
  Transaction,
  Asset,
  Account,
  BudgetSummary,
  CategoryProgress,
  AccountTransferSummary,
  CategoryType,
} from '../types';

export function calculateBudgetSummary(
  incomes: MonthlyIncome[],
  allocations: Allocation[],
  categories: Category[],
  transactions: Transaction[]
): BudgetSummary {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // totalIncome = jumlah monthly_incomes bulan itu
  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);

  let needsSubtotal = 0;
  let wantsSubtotal = 0;
  let savingsSubtotal = 0;

  for (const alloc of allocations) {
    const cat = categoryMap.get(alloc.categoryId);
    const amount = alloc.amount || 0;
    if (!cat) continue;

    if (cat.type === 'needs') {
      needsSubtotal += amount;
    } else if (cat.type === 'wants') {
      wantsSubtotal += amount;
    } else if (cat.type === 'savings') {
      savingsSubtotal += amount;
    }
  }

  // budgetedExpenses = jumlah allocations kategori bertipe needs dan wants
  const budgetedExpenses = needsSubtotal + wantsSubtotal;
  // monthlySavings = jumlah allocations kategori bertipe savings
  const monthlySavings = savingsSubtotal;

  // nonAllocated = totalIncome - (budgetedExpenses + monthlySavings)
  const totalAllocated = budgetedExpenses + monthlySavings;
  const nonAllocated = totalIncome - totalAllocated;

  // allocatedPercent = (budgetedExpenses + monthlySavings) / totalIncome
  const allocatedPercent = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

  // totalSpending = jumlah transactions pada bulan itu
  const totalSpending = transactions.reduce((sum, trx) => sum + (trx.amount || 0), 0);

  const needsPercent = totalIncome > 0 ? (needsSubtotal / totalIncome) * 100 : 0;
  const wantsPercent = totalIncome > 0 ? (wantsSubtotal / totalIncome) * 100 : 0;
  const savingsPercent = totalIncome > 0 ? (savingsSubtotal / totalIncome) * 100 : 0;

  return {
    totalIncome,
    budgetedExpenses,
    monthlySavings,
    nonAllocated,
    allocatedPercent,
    totalSpending,
    needsSubtotal,
    wantsSubtotal,
    savingsSubtotal,
    needsPercent,
    wantsPercent,
    savingsPercent,
  };
}

export function calculateCategoryProgress(
  categories: Category[],
  allocations: Allocation[],
  transactions: Transaction[]
): CategoryProgress[] {
  const allocMap = new Map<string, number>(allocations.map((a) => [a.categoryId, a.amount || 0]));

  // Calculate realization per category
  const realizationMap = new Map<string, number>();
  for (const trx of transactions) {
    const current = realizationMap.get(trx.categoryId) || 0;
    realizationMap.set(trx.categoryId, current + (trx.amount || 0));
  }

  return categories.map((category) => {
    const allocation = allocMap.get(category.id) || 0;
    const realization = realizationMap.get(category.id) || 0;
    const remaining = allocation - realization;

    // usagePercent = realization / allocation (0 bila allocation 0)
    const ratio = allocation > 0 ? realization / allocation : 0;
    const usagePercent = Math.round(ratio * 100);

    // Warna progress bar: hijau < 80%, kuning 80-99%, merah >= 100%
    let statusColor: 'green' | 'yellow' | 'red' = 'green';
    if (usagePercent >= 100) {
      statusColor = 'red';
    } else if (usagePercent >= 80) {
      statusColor = 'yellow';
    }

    return {
      category,
      allocation,
      realization,
      usagePercent,
      remaining,
      statusColor,
    };
  });
}

export function calculateAccountTransfers(
  accounts: Account[],
  categories: Category[],
  allocations: Allocation[],
  totalIncome: number
): AccountTransferSummary[] {
  const allocMap = new Map<string, number>(allocations.map((a) => [a.categoryId, a.amount || 0]));

  return accounts.map((account) => {
    const accountCategories = categories.filter((c) => c.accountId === account.id);
    let totalTransfer = 0;
    const typeTotals: Record<CategoryType, number> = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    for (const cat of accountCategories) {
      const amount = allocMap.get(cat.id) || 0;
      totalTransfer += amount;
      typeTotals[cat.type] += amount;
    }

    const percentage = totalIncome > 0 ? (totalTransfer / totalIncome) * 100 : 0;

    const categoryTypeBreakdown: { type: CategoryType; percentage: number }[] = [];
    (['needs', 'wants', 'savings'] as CategoryType[]).forEach((type) => {
      const typeTotal = typeTotals[type];
      if (typeTotal > 0) {
        const typePercent = totalIncome > 0 ? (typeTotal / totalIncome) * 100 : 0;
        categoryTypeBreakdown.push({
          type,
          percentage: typePercent,
        });
      }
    });

    return {
      account,
      amount: totalTransfer,
      percentage,
      categoryTypeBreakdown,
    };
  });
}

export function calculatePaydayCountdown(
  paydayDay: number,
  currentDate: Date = new Date()
): { daysRemaining: number; isPaydayToday: boolean; paydayDate: Date } {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  if (currentDay === paydayDay) {
    return {
      daysRemaining: 0,
      isPaydayToday: true,
      paydayDate: new Date(currentYear, currentMonth, paydayDay),
    };
  }

  let targetYear = currentYear;
  let targetMonth = currentMonth;

  if (currentDay > paydayDay) {
    // Payday is next month
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  // Handle month length (e.g. Feb 28/29, or 30 days)
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const effectivePayday = Math.min(paydayDay, daysInTargetMonth);

  const targetDate = new Date(targetYear, targetMonth, effectivePayday);
  const diffTime = targetDate.getTime() - new Date(currentYear, currentMonth, currentDay).getTime();
  const daysRemaining = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  return {
    daysRemaining,
    isPaydayToday: false,
    paydayDate: targetDate,
  };
}

export function calculateAssetProgress(
  assets: Asset[],
  target: number
): { totalAsset: number; progressPercent: number } {
  const totalAsset = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const progressPercent = target > 0 ? Math.round((totalAsset / target) * 100) : 0;
  return { totalAsset, progressPercent };
}

export function prepareCopyFromPreviousMonth(
  prevIncomes: MonthlyIncome[],
  prevAllocations: Allocation[],
  targetYear: number,
  targetMonth: number
): {
  newIncomes: { year: number; month: number; incomeSourceId: string; amount: number }[];
  newAllocations: { year: number; month: number; categoryId: string; amount: number }[];
} {
  return {
    newIncomes: prevIncomes.map((inc) => ({
      year: targetYear,
      month: targetMonth,
      incomeSourceId: inc.incomeSourceId,
      amount: inc.amount,
    })),
    newAllocations: prevAllocations.map((alloc) => ({
      year: targetYear,
      month: targetMonth,
      categoryId: alloc.categoryId,
      amount: alloc.amount,
    })),
  };
}

