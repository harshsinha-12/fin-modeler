/**
 * API Route: /api/assistant
 * AI assistant for financial advice
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { askFinanceAssistant } from "@/lib/ai/assistant";
import { checkWorkspaceAccess } from "@/lib/auth/auth-helpers";
import { assistantRequestSchema } from "@/lib/validation/schemas";

/**
 * POST /api/assistant
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate input
    const validatedData = assistantRequestSchema.parse(body);
    const { companyId, scenarioId, question } = validatedData;

    // Get company to check workspace
    const company = await prisma.companyProfile.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check access
    const hasAccess = await checkWorkspaceAccess(user.id, company.workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get context if scenario provided
    let context;
    if (scenarioId) {
      const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
          projections: {
            orderBy: { monthIndex: "asc" },
          },
        },
      });

      if (scenario && scenario.projections.length > 0) {
        const firstProj = scenario.projections[0];
        const lastProj = scenario.projections[scenario.projections.length - 1];

        context = {
          currentProjections: scenario.projections.map((p) => ({
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
          })),
          currentSummary: {
            scenarioName: scenario.name,
            startingMRR: firstProj.mrr,
            endingMRR: lastProj.mrr,
            mrrGrowthPercent:
              ((lastProj.mrr - firstProj.mrr) / firstProj.mrr) * 100,
            peakBurn: Math.max(...scenario.projections.map((p) => p.netBurn)),
            peakBurnMonth:
              scenario.projections.find(
                (p) =>
                  p.netBurn ===
                  Math.max(...scenario.projections.map((x) => x.netBurn))
              )?.month || "",
            avgMonthlyBurn:
              scenario.projections.reduce((sum, p) => sum + p.netBurn, 0) /
              scenario.projections.length,
            startingCash: firstProj.startingCash,
            endingCash: lastProj.endingCash,
            totalCashBurned: firstProj.startingCash - lastProj.endingCash,
            zeroCashMonth:
              scenario.projections.find((p) => p.endingCash <= 0)?.month ||
              null,
            minRunway: null,
            totalRevenue: scenario.projections.reduce(
              (sum, p) => sum + p.revenue,
              0
            ),
            startingHeadcount: firstProj.headcount,
            endingHeadcount: lastProj.headcount,
            ltv: null,
            cacPaybackMonths: 12,
          },
        };
      }
    }

    // Ask the assistant
    const response = await askFinanceAssistant({
      workspaceId: company.workspaceId,
      companyId,
      scenarioId,
      question,
      context,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error asking assistant:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
