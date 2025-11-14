/**
 * API Route: /api/exports/[format]
 * Export projections in various formats
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { generateExcelExport, generateCSVExport } from "@/lib/export/excel";
import { generatePDF } from "@/lib/pdf/generator";
import { checkWorkspaceAccess } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";
import type { MonthlyProjection, ProjectionSummary } from "@/lib/types";

/**
 * POST /api/exports/[format]
 * format can be: excel, csv, pdf
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { format: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scenarioId } = body;

    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }

    const format = params.format.toLowerCase();
    if (!["excel", "csv", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get scenario with projections
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: {
        projections: {
          orderBy: { monthIndex: "asc" },
        },
        assumptionSet: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const company = scenario.assumptionSet.company;

    // Check access
    const hasAccess = await checkWorkspaceAccess(user.id, company.workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (scenario.projections.length === 0) {
      return NextResponse.json(
        { error: "No projections found. Run projections first." },
        { status: 400 }
      );
    }

    // Convert projections to expected format
    const projections: MonthlyProjection[] = scenario.projections.map((p) => ({
      monthIndex: p.monthIndex,
      month: p.month,
      startingCash: p.startingCash,
      endingCash: p.endingCash,
      netBurn: p.netBurn,
      runwayMonths: p.runwayMonths,
      newCustomers: p.newCustomers,
      churnedCustomers: p.churnedCustomers,
      activeCustomers: p.activeCustomers,
      mrr: p.mrr,
      revenue: p.revenue,
      cogs: p.cogs,
      grossProfit: p.grossProfit,
      salaryCosts: p.salaryCosts,
      fixedCosts: p.fixedCosts,
      variableCosts: p.variableCosts,
      totalOpex: p.totalOpex,
      headcount: p.headcount,
    }));

    // Generate summary (simplified)
    const firstProj = projections[0];
    const lastProj = projections[projections.length - 1];
    const summary: ProjectionSummary = {
      scenarioName: scenario.name,
      startingMRR: firstProj.mrr,
      endingMRR: lastProj.mrr,
      mrrGrowthPercent:
        ((lastProj.mrr - firstProj.mrr) / firstProj.mrr) * 100,
      peakBurn: Math.max(...projections.map((p) => p.netBurn)),
      peakBurnMonth:
        projections.find(
          (p) => p.netBurn === Math.max(...projections.map((x) => x.netBurn))
        )?.month || "",
      avgMonthlyBurn:
        projections.reduce((sum, p) => sum + p.netBurn, 0) /
        projections.length,
      startingCash: firstProj.startingCash,
      endingCash: lastProj.endingCash,
      totalCashBurned:
        firstProj.startingCash - lastProj.endingCash,
      zeroCashMonth: projections.find((p) => p.endingCash <= 0)?.month || null,
      minRunway: null,
      totalRevenue: projections.reduce((sum, p) => sum + p.revenue, 0),
      startingHeadcount: firstProj.headcount,
      endingHeadcount: lastProj.headcount,
      ltv: null,
      cacPaybackMonths: scenario.assumptionSet.paybackPeriodMonths,
    };

    const exportOptions = {
      projections,
      summary,
      companyName: company.name,
      scenarioName: scenario.name,
    };

    let fileData: Buffer | string;
    let mimeType: string;
    let fileName: string;

    // Generate export based on format
    switch (format) {
      case "excel":
        fileData = generateExcelExport(exportOptions);
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = `${company.name}-${scenario.name}-projections.xlsx`;
        await logAuditEvent(company.workspaceId, user.id, "export_excel", {
          scenarioId,
        });
        break;

      case "csv":
        fileData = generateCSVExport(exportOptions);
        mimeType = "text/csv";
        fileName = `${company.name}-${scenario.name}-projections.csv`;
        await logAuditEvent(company.workspaceId, user.id, "export_csv", {
          scenarioId,
        });
        break;

      case "pdf":
        fileData = await generatePDF(exportOptions);
        mimeType = "application/pdf";
        fileName = `${company.name}-${scenario.name}-summary.pdf`;
        await logAuditEvent(company.workspaceId, user.id, "export_pdf", {
          scenarioId,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // Return file
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating export:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
