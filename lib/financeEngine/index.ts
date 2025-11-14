/**
 * Financial Engine - Core Projection Logic
 * Pure TypeScript module with no framework dependencies
 */

import {
  CompanyInput,
  AssumptionInput,
  HiringPlanItemInput,
  ScenarioOverrides,
  MonthlyProjection,
  ProjectionSummary,
  FinancialModelInput,
  FinancialModelOutput,
} from "@/lib/types";
import {
  calculateActiveCustomers,
  calculateRevenue,
  calculateCosts,
  calculateRunway,
} from "./calculations";
import { addMonths, formatMonth } from "./utils";

/**
 * Main function to run a financial scenario
 */
export function runScenario(input: FinancialModelInput): FinancialModelOutput {
  const { company, assumptions, hiringPlan, scenarioOverrides } = input;
  const projections: MonthlyProjection[] = [];

  // Apply scenario overrides to assumptions
  const effectiveAssumptions = applyScenarioOverrides(
    assumptions,
    scenarioOverrides
  );

  // Initialize starting state
  let currentCash = company.startingCash;
  let currentActiveCustomers = assumptions.startingMRR / assumptions.arpu || 0;

  // Run month-by-month projections
  for (let monthIndex = 0; monthIndex < assumptions.months; monthIndex++) {
    const month = addMonths(assumptions.startMonth, monthIndex);

    // Calculate customers
    const { newCustomers, churnedCustomers, activeCustomers } =
      calculateActiveCustomers(
        currentActiveCustomers,
        effectiveAssumptions,
        monthIndex,
        scenarioOverrides
      );

    // Calculate revenue
    const { mrr, revenue } = calculateRevenue(
      activeCustomers,
      effectiveAssumptions
    );

    // Calculate costs
    const { cogs, grossProfit, salaryCosts, fixedCosts, variableCosts, totalOpex } =
      calculateCosts(
        revenue,
        monthIndex,
        hiringPlan,
        effectiveAssumptions,
        scenarioOverrides
      );

    // Calculate cash flow
    const netBurn = totalOpex - revenue;
    const startingCash = currentCash;
    const endingCash = startingCash - netBurn;

    // Calculate runway
    const runwayMonths = calculateRunway(endingCash, netBurn);

    // Calculate headcount
    const headcount = calculateHeadcount(monthIndex, hiringPlan, scenarioOverrides);

    // Store projection
    const projection: MonthlyProjection = {
      monthIndex,
      month,
      startingCash,
      endingCash,
      netBurn,
      runwayMonths,
      newCustomers,
      churnedCustomers,
      activeCustomers,
      mrr,
      revenue,
      cogs,
      grossProfit,
      salaryCosts,
      fixedCosts,
      variableCosts,
      totalOpex,
      headcount,
    };

    projections.push(projection);

    // Update state for next month
    currentCash = endingCash;
    currentActiveCustomers = activeCustomers;
  }

  // Generate summary
  const summary = generateSummary(projections, assumptions);

  return { projections, summary };
}

/**
 * Apply scenario overrides to base assumptions
 */
function applyScenarioOverrides(
  assumptions: AssumptionInput,
  overrides?: ScenarioOverrides
): AssumptionInput {
  if (!overrides) return assumptions;

  return {
    ...assumptions,
    arpu: assumptions.arpu * (overrides.arpuMultiplier ?? 1),
    churnRate: Math.max(
      0,
      Math.min(
        1,
        assumptions.churnRate + (overrides.churnRateAdjustment ?? 0)
      )
    ),
    expansionRevenueRate:
      assumptions.expansionRevenueRate +
      (overrides.expansionRevenueRateAdjustment ?? 0),
    grossMarginPercent:
      assumptions.grossMarginPercent + (overrides.grossMarginAdjustment ?? 0),
    fixedCostsPerMonth:
      assumptions.fixedCostsPerMonth * (overrides.fixedCostsMultiplier ?? 1),
    variableCostPercentOfRevenue:
      assumptions.variableCostPercentOfRevenue *
      (overrides.variableCostMultiplier ?? 1),
  };
}

/**
 * Calculate headcount based on hiring plan
 */
function calculateHeadcount(
  monthIndex: number,
  hiringPlan: HiringPlanItemInput[],
  overrides?: ScenarioOverrides
): number {
  const delayMonths = overrides?.hiringDelayMonths ?? 0;

  return hiringPlan
    .filter((item) => item.monthOffset <= monthIndex - delayMonths)
    .reduce((sum, item) => sum + item.count, 0);
}

/**
 * Generate projection summary
 */
function generateSummary(
  projections: MonthlyProjection[],
  assumptions: AssumptionInput
): ProjectionSummary {
  if (projections.length === 0) {
    throw new Error("Cannot generate summary from empty projections");
  }

  const firstProjection = projections[0];
  const lastProjection = projections[projections.length - 1];

  // Find peak burn
  const burnProjections = projections
    .filter((p) => p.netBurn > 0)
    .sort((a, b) => b.netBurn - a.netBurn);
  const peakBurnProjection = burnProjections[0] || lastProjection;

  // Calculate total metrics
  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
  const totalBurn = projections.reduce(
    (sum, p) => sum + Math.max(0, p.netBurn),
    0
  );
  const avgMonthlyBurn =
    burnProjections.length > 0
      ? burnProjections.reduce((sum, p) => sum + p.netBurn, 0) /
        burnProjections.length
      : 0;

  // Find when cash runs out
  const zeroCashProjection = projections.find((p) => p.endingCash <= 0);

  // Find minimum runway
  const validRunways = projections
    .map((p) => p.runwayMonths)
    .filter((r): r is number => r !== null);
  const minRunway = validRunways.length > 0 ? Math.min(...validRunways) : null;

  // Calculate MRR growth
  const mrrGrowth =
    firstProjection.mrr > 0
      ? ((lastProjection.mrr - firstProjection.mrr) / firstProjection.mrr) * 100
      : 0;

  // Calculate LTV
  const avgMRR =
    projections.reduce((sum, p) => sum + p.mrr, 0) / projections.length;
  const avgChurnRate = assumptions.churnRate;
  const ltv = avgChurnRate > 0 ? avgMRR / avgChurnRate : null;

  return {
    scenarioName: "BASE" as any,
    startingMRR: firstProjection.mrr,
    endingMRR: lastProjection.mrr,
    mrrGrowthPercent: mrrGrowth,
    peakBurn: peakBurnProjection.netBurn,
    peakBurnMonth: peakBurnProjection.month,
    avgMonthlyBurn,
    startingCash: firstProjection.startingCash,
    endingCash: lastProjection.endingCash,
    totalCashBurned: totalBurn,
    zeroCashMonth: zeroCashProjection?.month ?? null,
    minRunway,
    totalRevenue,
    startingHeadcount: firstProjection.headcount,
    endingHeadcount: lastProjection.headcount,
    ltv,
    cacPaybackMonths: assumptions.paybackPeriodMonths,
  };
}

export * from "./calculations";
export * from "./utils";
export * from "./sanityCheck";
