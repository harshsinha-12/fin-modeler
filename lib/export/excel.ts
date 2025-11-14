/**
 * Excel export functionality using xlsx library
 */

import * as XLSX from "xlsx";
import { MonthlyProjection, ProjectionSummary } from "@/lib/types";

export interface ExcelExportOptions {
  projections: MonthlyProjection[];
  summary: ProjectionSummary;
  companyName: string;
  scenarioName: string;
}

/**
 * Generate Excel file from projections
 */
export function generateExcelExport(options: ExcelExportOptions): Buffer {
  const { projections, summary, companyName, scenarioName } = options;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // ========== Summary Sheet ==========
  const summaryData = [
    ["FinModeler Financial Projection"],
    ["Company:", companyName],
    ["Scenario:", scenarioName],
    ["Generated:", new Date().toLocaleDateString()],
    [],
    ["Key Metrics"],
    ["Starting MRR", summary.startingMRR],
    ["Ending MRR", summary.endingMRR],
    ["MRR Growth %", summary.mrrGrowthPercent.toFixed(1) + "%"],
    [],
    ["Cash Metrics"],
    ["Starting Cash", summary.startingCash],
    ["Ending Cash", summary.endingCash],
    ["Total Cash Burned", summary.totalCashBurned],
    ["Peak Monthly Burn", summary.peakBurn],
    ["Peak Burn Month", summary.peakBurnMonth],
    ["Zero Cash Month", summary.zeroCashMonth || "N/A"],
    ["Min Runway (months)", summary.minRunway?.toFixed(1) || "N/A"],
    [],
    ["Revenue"],
    ["Total Revenue", summary.totalRevenue],
    [],
    ["Team"],
    ["Starting Headcount", summary.startingHeadcount],
    ["Ending Headcount", summary.endingHeadcount],
    [],
    ["Unit Economics"],
    ["LTV", summary.ltv?.toFixed(0) || "N/A"],
    ["CAC Payback (months)", summary.cacPaybackMonths],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // ========== Projections Sheet ==========
  const projectionsData = [
    [
      "Month",
      "Month Index",
      "Starting Cash",
      "Ending Cash",
      "Net Burn",
      "Runway (months)",
      "New Customers",
      "Churned Customers",
      "Active Customers",
      "MRR",
      "Revenue",
      "COGS",
      "Gross Profit",
      "Salary Costs",
      "Fixed Costs",
      "Variable Costs",
      "Total OpEx",
      "Headcount",
    ],
    ...projections.map((p) => [
      p.month,
      p.monthIndex,
      p.startingCash,
      p.endingCash,
      p.netBurn,
      p.runwayMonths ?? "",
      p.newCustomers,
      p.churnedCustomers,
      p.activeCustomers,
      p.mrr,
      p.revenue,
      p.cogs,
      p.grossProfit,
      p.salaryCosts,
      p.fixedCosts,
      p.variableCosts,
      p.totalOpex,
      p.headcount,
    ]),
  ];

  const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
  XLSX.utils.book_append_sheet(workbook, projectionsSheet, "Projections");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

/**
 * Generate CSV from projections
 */
export function generateCSVExport(options: ExcelExportOptions): string {
  const { projections } = options;

  const headers = [
    "Month",
    "Month Index",
    "Starting Cash",
    "Ending Cash",
    "Net Burn",
    "Runway",
    "New Customers",
    "Churned Customers",
    "Active Customers",
    "MRR",
    "Revenue",
    "COGS",
    "Gross Profit",
    "Salary Costs",
    "Fixed Costs",
    "Variable Costs",
    "Total OpEx",
    "Headcount",
  ];

  const rows = projections.map((p) => [
    p.month,
    p.monthIndex,
    p.startingCash,
    p.endingCash,
    p.netBurn,
    p.runwayMonths ?? "",
    p.newCustomers,
    p.churnedCustomers,
    p.activeCustomers,
    p.mrr,
    p.revenue,
    p.cogs,
    p.grossProfit,
    p.salaryCosts,
    p.fixedCosts,
    p.variableCosts,
    p.totalOpex,
    p.headcount,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
