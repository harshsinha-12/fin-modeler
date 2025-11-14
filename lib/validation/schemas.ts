/**
 * Zod validation schemas for API inputs
 */

import { z } from "zod";
import {
  CompanyStage,
  CompanySector,
  PricingModel,
  Department,
  ScenarioType,
} from "@prisma/client";

// ============================================================================
// COMPANY SCHEMAS
// ============================================================================

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100),
  stage: z.nativeEnum(CompanyStage),
  sector: z.nativeEnum(CompanySector),
  country: z.string().length(2, "Use 2-letter country code"),
  currency: z.string().length(3, "Use 3-letter currency code"),
  startingCash: z.number().min(0, "Starting cash cannot be negative"),
  startingMRR: z.number().min(0, "Starting MRR cannot be negative"),
  currentHeadcount: z.number().int().min(0, "Headcount cannot be negative"),
});

export const updateCompanySchema = createCompanySchema.partial();

// ============================================================================
// ASSUMPTION SCHEMAS
// ============================================================================

export const createAssumptionSetSchema = z.object({
  name: z.string().min(1).max(100),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
  months: z.number().int().min(6).max(60, "Max 60 months projection"),

  // Revenue
  pricingModel: z.nativeEnum(PricingModel),
  arpu: z.number().min(0, "ARPU cannot be negative"),
  expectedNewCustomersPerMonth: z.number().min(0),
  expansionRevenueRate: z.number().min(0).max(1),
  churnRate: z.number().min(0).max(1, "Churn rate must be between 0 and 1"),

  // CAC
  cac: z.number().min(0),
  paybackPeriodMonths: z.number().int().min(0),

  // Costs
  grossMarginPercent: z.number().min(0).max(100),
  fixedCostsPerMonth: z.number().min(0),
  variableCostPercentOfRevenue: z.number().min(0).max(1),
});

export const updateAssumptionSetSchema = createAssumptionSetSchema.partial();

// ============================================================================
// HIRING PLAN SCHEMAS
// ============================================================================

export const hiringPlanItemSchema = z.object({
  monthOffset: z.number().int().min(0),
  roleName: z.string().min(1).max(100),
  count: z.number().int().min(1),
  monthlySalaryPerHead: z.number().min(0),
  department: z.nativeEnum(Department),
});

export const createHiringPlanSchema = z.array(hiringPlanItemSchema);

// ============================================================================
// SCENARIO SCHEMAS
// ============================================================================

export const scenarioOverridesSchema = z
  .object({
    customerGrowthMultiplier: z.number().optional(),
    arpuMultiplier: z.number().optional(),
    churnRateAdjustment: z.number().optional(),
    expansionRevenueRateAdjustment: z.number().optional(),
    grossMarginAdjustment: z.number().optional(),
    fixedCostsMultiplier: z.number().optional(),
    variableCostMultiplier: z.number().optional(),
    hiringDelayMonths: z.number().int().optional(),
    salaryMultiplier: z.number().optional(),
    customMonthlyOverrides: z
      .array(
        z.object({
          monthOffset: z.number().int(),
          newCustomers: z.number().optional(),
          fixedCosts: z.number().optional(),
        })
      )
      .optional(),
  })
  .optional();

export const createScenarioSchema = z.object({
  name: z.nativeEnum(ScenarioType),
  description: z.string().optional(),
  overrides: scenarioOverridesSchema,
});

export const updateScenarioSchema = createScenarioSchema.partial();

// ============================================================================
// WORKSPACE SCHEMAS
// ============================================================================

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  defaultCurrency: z.string().length(3).default("USD"),
});

// ============================================================================
// EXPORT SCHEMAS
// ============================================================================

export const exportRequestSchema = z.object({
  scenarioId: z.string().cuid(),
  format: z.enum(["excel", "csv", "pdf"]),
  includeCharts: z.boolean().optional().default(false),
});

// ============================================================================
// AI ASSISTANT SCHEMAS
// ============================================================================

export const assistantRequestSchema = z.object({
  companyId: z.string().cuid(),
  assumptionSetId: z.string().cuid().optional(),
  scenarioId: z.string().cuid().optional(),
  question: z.string().min(1).max(1000),
});
