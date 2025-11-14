/**
 * Financial Calculations - Pure functions for financial metrics
 */

import {
  AssumptionInput,
  HiringPlanItemInput,
  ScenarioOverrides,
} from "@/lib/types";

/**
 * Calculate active customers for a given month
 */
export function calculateActiveCustomers(
  previousActiveCustomers: number,
  assumptions: AssumptionInput,
  monthIndex: number,
  overrides?: ScenarioOverrides
): {
  newCustomers: number;
  churnedCustomers: number;
  activeCustomers: number;
} {
  // Check for custom monthly overrides
  const customOverride = overrides?.customMonthlyOverrides?.find(
    (o) => o.monthOffset === monthIndex
  );

  // Calculate new customers
  let newCustomers = assumptions.expectedNewCustomersPerMonth;

  // Apply growth multiplier from scenario overrides
  if (overrides?.customerGrowthMultiplier) {
    newCustomers *= overrides.customerGrowthMultiplier;
  }

  // Apply custom override if exists
  if (customOverride?.newCustomers !== undefined) {
    newCustomers = customOverride.newCustomers;
  }

  // Calculate churned customers
  const churnedCustomers = previousActiveCustomers * assumptions.churnRate;

  // Calculate net active customers
  const activeCustomers = Math.max(
    0,
    previousActiveCustomers + newCustomers - churnedCustomers
  );

  return {
    newCustomers,
    churnedCustomers,
    activeCustomers,
  };
}

/**
 * Calculate revenue for a given month
 */
export function calculateRevenue(
  activeCustomers: number,
  assumptions: AssumptionInput
): {
  mrr: number;
  revenue: number;
} {
  // Base MRR from active customers
  const baseMRR = activeCustomers * assumptions.arpu;

  // Add expansion revenue (upsells, cross-sells)
  const expansionRevenue = baseMRR * assumptions.expansionRevenueRate;

  const mrr = baseMRR + expansionRevenue;
  const revenue = mrr; // For monthly model, MRR = Revenue

  return { mrr, revenue };
}

/**
 * Calculate all costs for a given month
 */
export function calculateCosts(
  revenue: number,
  monthIndex: number,
  hiringPlan: HiringPlanItemInput[],
  assumptions: AssumptionInput,
  overrides?: ScenarioOverrides
): {
  cogs: number;
  grossProfit: number;
  salaryCosts: number;
  fixedCosts: number;
  variableCosts: number;
  totalOpex: number;
} {
  // Cost of Goods Sold
  const grossMarginDecimal = assumptions.grossMarginPercent / 100;
  const cogs = revenue * (1 - grossMarginDecimal);
  const grossProfit = revenue - cogs;

  // Variable costs (percentage of revenue)
  const variableCosts = revenue * assumptions.variableCostPercentOfRevenue;

  // Fixed costs
  const customOverride = overrides?.customMonthlyOverrides?.find(
    (o) => o.monthOffset === monthIndex
  );
  let fixedCosts = customOverride?.fixedCosts ?? assumptions.fixedCostsPerMonth;

  // Salary costs from hiring plan
  const delayMonths = overrides?.hiringDelayMonths ?? 0;
  const salaryMultiplier = overrides?.salaryMultiplier ?? 1;

  const salaryCosts = hiringPlan
    .filter((item) => item.monthOffset <= monthIndex - delayMonths)
    .reduce(
      (sum, item) => sum + item.count * item.monthlySalaryPerHead * salaryMultiplier,
      0
    );

  // Total operating expenses
  const totalOpex = cogs + variableCosts + fixedCosts + salaryCosts;

  return {
    cogs,
    grossProfit,
    salaryCosts,
    fixedCosts,
    variableCosts,
    totalOpex,
  };
}

/**
 * Calculate runway in months
 */
export function calculateRunway(
  currentCash: number,
  monthlyBurn: number
): number | null {
  if (currentCash <= 0) return 0;
  if (monthlyBurn <= 0) return null; // Profitable or break-even

  return currentCash / monthlyBurn;
}

/**
 * Calculate Customer Acquisition Cost (CAC)
 */
export function calculateCAC(
  salesAndMarketingCosts: number,
  newCustomers: number
): number {
  if (newCustomers === 0) return 0;
  return salesAndMarketingCosts / newCustomers;
}

/**
 * Calculate Lifetime Value (LTV)
 */
export function calculateLTV(arpu: number, churnRate: number): number {
  if (churnRate === 0) return Infinity;
  return arpu / churnRate;
}

/**
 * Calculate LTV:CAC ratio
 */
export function calculateLTVtoCAC(ltv: number, cac: number): number {
  if (cac === 0) return Infinity;
  return ltv / cac;
}

/**
 * Calculate burn multiple
 */
export function calculateBurnMultiple(
  netBurn: number,
  netNewARR: number
): number {
  if (netNewARR === 0) return Infinity;
  return netBurn / netNewARR;
}
