/**
 * Domain Types for FinModeler
 * These types correspond to Prisma models and financial engine inputs/outputs
 */

import {
  CompanyStage,
  CompanySector,
  PricingModel,
  Department,
  ScenarioType,
  WorkspaceRole
} from "@prisma/client";

// ============================================================================
// COMPANY & WORKSPACE TYPES
// ============================================================================

export interface CompanyInput {
  name: string;
  stage: CompanyStage;
  sector: CompanySector;
  country: string;
  currency: string;
  startingCash: number;
  startingMRR: number;
  currentHeadcount: number;
}

export interface WorkspaceWithMembers {
  id: string;
  name: string;
  slug: string;
  defaultCurrency: string;
  members: {
    userId: string;
    role: WorkspaceRole;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

// ============================================================================
// ASSUMPTIONS TYPES
// ============================================================================

export interface AssumptionInput {
  name: string;
  startMonth: string; // YYYY-MM
  months: number;

  // Revenue
  pricingModel: PricingModel;
  arpu: number;
  expectedNewCustomersPerMonth: number;
  expansionRevenueRate: number;
  churnRate: number;

  // CAC
  cac: number;
  paybackPeriodMonths: number;

  // Costs
  grossMarginPercent: number;
  fixedCostsPerMonth: number;
  variableCostPercentOfRevenue: number;
}

export interface HiringPlanItemInput {
  monthOffset: number;
  roleName: string;
  count: number;
  monthlySalaryPerHead: number;
  department: Department;
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export interface ScenarioOverrides {
  // Growth multipliers
  customerGrowthMultiplier?: number;

  // Revenue adjustments
  arpuMultiplier?: number;
  churnRateAdjustment?: number;
  expansionRevenueRateAdjustment?: number;

  // Cost adjustments
  grossMarginAdjustment?: number;
  fixedCostsMultiplier?: number;
  variableCostMultiplier?: number;

  // Hiring adjustments
  hiringDelayMonths?: number;
  salaryMultiplier?: number;

  // Custom overrides for specific months
  customMonthlyOverrides?: {
    monthOffset: number;
    newCustomers?: number;
    fixedCosts?: number;
  }[];
}

export interface ScenarioInput {
  name: ScenarioType;
  description?: string;
  overrides?: ScenarioOverrides;
}

// ============================================================================
// PROJECTION TYPES
// ============================================================================

export interface MonthlyProjection {
  monthIndex: number;
  month: string; // YYYY-MM

  // Cash
  startingCash: number;
  endingCash: number;
  netBurn: number;
  runwayMonths: number | null;

  // Customers
  newCustomers: number;
  churnedCustomers: number;
  activeCustomers: number;

  // Revenue
  mrr: number;
  revenue: number;

  // Costs
  cogs: number;
  grossProfit: number;
  salaryCosts: number;
  fixedCosts: number;
  variableCosts: number;
  totalOpex: number;

  // Team
  headcount: number;
}

export interface ProjectionSummary {
  scenarioName: ScenarioType;

  // Key metrics
  startingMRR: number;
  endingMRR: number;
  mrrGrowthPercent: number;

  // Burn analysis
  peakBurn: number;
  peakBurnMonth: string;
  avgMonthlyBurn: number;

  // Cash analysis
  startingCash: number;
  endingCash: number;
  totalCashBurned: number;
  zeroCashMonth: string | null;
  minRunway: number | null;

  // Revenue
  totalRevenue: number;

  // Team
  startingHeadcount: number;
  endingHeadcount: number;

  // Unit economics
  ltv: number | null;
  cacPaybackMonths: number;
}

// ============================================================================
// FINANCIAL ENGINE INPUT
// ============================================================================

export interface FinancialModelInput {
  company: CompanyInput;
  assumptions: AssumptionInput;
  hiringPlan: HiringPlanItemInput[];
  scenarioOverrides?: ScenarioOverrides;
}

export interface FinancialModelOutput {
  projections: MonthlyProjection[];
  summary: ProjectionSummary;
}

// ============================================================================
// SANITY CHECK TYPES
// ============================================================================

export interface SanityCheckResult {
  passed: boolean;
  warnings: SanityWarning[];
}

export interface SanityWarning {
  severity: "low" | "medium" | "high";
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AssistantRequest {
  workspaceId: string;
  companyId: string;
  assumptionSetId?: string;
  scenarioId?: string;
  question: string;
  context?: {
    currentProjections?: MonthlyProjection[];
    currentSummary?: ProjectionSummary;
  };
}

export interface AssistantResponse {
  answer: string;
  suggestions?: string[];
  relatedMetrics?: {
    name: string;
    value: string | number;
    change?: string;
  }[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportRequest {
  scenarioId: string;
  format: "excel" | "csv" | "pdf";
  includeCharts?: boolean;
}

export interface ExportResult {
  fileName: string;
  mimeType: string;
  data: Buffer | string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  workspaceId: string;
  userId?: string;
  eventName: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Currency = "USD" | "EUR" | "GBP" | "CAD";

export interface DateRange {
  startMonth: string;
  endMonth: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
