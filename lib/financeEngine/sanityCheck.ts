/**
 * Sanity checks for financial assumptions
 */

import {
  AssumptionInput,
  CompanyInput,
  SanityCheckResult,
  SanityWarning,
} from "@/lib/types";
import { calculateLTV, calculateLTVtoCAC } from "./calculations";

/**
 * Run sanity checks on financial assumptions
 */
export function runSanityChecks(
  company: CompanyInput,
  assumptions: AssumptionInput
): SanityCheckResult {
  const warnings: SanityWarning[] = [];

  // Check churn rate
  if (assumptions.churnRate < 0 || assumptions.churnRate > 1) {
    warnings.push({
      severity: "high",
      field: "churnRate",
      message: "Churn rate must be between 0 and 1 (0% to 100%)",
      suggestion: "Typical SaaS churn rates are 3-7% monthly for SMB, 0.5-1% for enterprise",
    });
  } else if (assumptions.churnRate > 0.15) {
    warnings.push({
      severity: "medium",
      field: "churnRate",
      message: "Churn rate is unusually high (>15% monthly)",
      suggestion: "Consider if this is realistic for your business model",
    });
  }

  // Check ARPU
  if (assumptions.arpu <= 0) {
    warnings.push({
      severity: "high",
      field: "arpu",
      message: "ARPU (Average Revenue Per User) must be positive",
    });
  } else if (assumptions.arpu < 10) {
    warnings.push({
      severity: "low",
      field: "arpu",
      message: "ARPU is very low (<$10)",
      suggestion: "Verify this matches your pricing model",
    });
  }

  // Check CAC and payback
  if (assumptions.cac <= 0 && assumptions.paybackPeriodMonths > 0) {
    warnings.push({
      severity: "medium",
      field: "cac",
      message: "CAC is zero but payback period is set",
      suggestion: "Either set a realistic CAC or set payback to 0",
    });
  }

  // Check LTV:CAC ratio
  if (assumptions.cac > 0 && assumptions.churnRate > 0) {
    const ltv = calculateLTV(assumptions.arpu, assumptions.churnRate);
    const ltvToCac = calculateLTVtoCAC(ltv, assumptions.cac);

    if (ltvToCac < 3) {
      warnings.push({
        severity: "high",
        field: "cac",
        message: `LTV:CAC ratio is ${ltvToCac.toFixed(1)} (< 3:1)`,
        suggestion: "Healthy SaaS businesses typically have LTV:CAC > 3. Consider reducing CAC or improving retention.",
      });
    }
  }

  // Check CAC payback period
  if (assumptions.paybackPeriodMonths > 24) {
    warnings.push({
      severity: "medium",
      field: "paybackPeriodMonths",
      message: "CAC payback period is > 24 months",
      suggestion: "Target payback period is typically 12-18 months for healthy SaaS",
    });
  }

  // Check gross margin
  if (
    assumptions.grossMarginPercent < 0 ||
    assumptions.grossMarginPercent > 100
  ) {
    warnings.push({
      severity: "high",
      field: "grossMarginPercent",
      message: "Gross margin must be between 0% and 100%",
    });
  } else if (assumptions.grossMarginPercent < 50) {
    warnings.push({
      severity: "medium",
      field: "grossMarginPercent",
      message: "Gross margin is below 50%",
      suggestion: "Typical SaaS gross margins are 70-85%",
    });
  }

  // Check starting cash vs burn
  const estimatedMonthlyBurn =
    assumptions.fixedCostsPerMonth + (assumptions.expectedNewCustomersPerMonth * assumptions.cac);
  const estimatedRunway = company.startingCash / estimatedMonthlyBurn;

  if (estimatedRunway < 6) {
    warnings.push({
      severity: "high",
      field: "startingCash",
      message: `Estimated runway is ${estimatedRunway.toFixed(1)} months (< 6 months)`,
      suggestion: "Consider raising more capital or reducing burn",
    });
  } else if (estimatedRunway < 12) {
    warnings.push({
      severity: "medium",
      field: "startingCash",
      message: `Estimated runway is ${estimatedRunway.toFixed(1)} months (< 12 months)`,
      suggestion: "Start planning your next fundraise",
    });
  }

  // Check growth rate
  if (assumptions.expectedNewCustomersPerMonth < 0) {
    warnings.push({
      severity: "high",
      field: "expectedNewCustomersPerMonth",
      message: "Expected new customers cannot be negative",
    });
  }

  // Check expansion revenue
  if (
    assumptions.expansionRevenueRate < 0 ||
    assumptions.expansionRevenueRate > 1
  ) {
    warnings.push({
      severity: "medium",
      field: "expansionRevenueRate",
      message: "Expansion revenue rate should be between 0 and 1 (0% to 100%)",
      suggestion: "Typical expansion rates are 5-25% annually for strong SaaS companies",
    });
  }

  return {
    passed: warnings.filter((w) => w.severity === "high").length === 0,
    warnings,
  };
}

/**
 * Get benchmark ranges for key metrics
 */
export function getBenchmarks(stage: string) {
  const benchmarks: Record<string, any> = {
    PRE_SEED: {
      churnRate: { min: 0.03, max: 0.1, target: 0.05 },
      grossMargin: { min: 60, max: 85, target: 75 },
      ltvToCac: { min: 2, max: 5, target: 3 },
      paybackMonths: { min: 6, max: 18, target: 12 },
    },
    SEED: {
      churnRate: { min: 0.02, max: 0.07, target: 0.04 },
      grossMargin: { min: 65, max: 85, target: 78 },
      ltvToCac: { min: 3, max: 6, target: 4 },
      paybackMonths: { min: 6, max: 15, target: 10 },
    },
    SERIES_A: {
      churnRate: { min: 0.01, max: 0.05, target: 0.03 },
      grossMargin: { min: 70, max: 90, target: 80 },
      ltvToCac: { min: 3, max: 7, target: 5 },
      paybackMonths: { min: 6, max: 12, target: 9 },
    },
  };

  return benchmarks[stage] || benchmarks.SEED;
}
