/**
 * API Route: /api/projections/run
 * Run financial projections for a scenario
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { runScenario } from "@/lib/financeEngine";
import { checkWorkspaceAccess } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";
import type { ScenarioOverrides } from "@/lib/types";

/**
 * POST /api/projections/run
 * Run projections for a scenario
 */
export async function POST(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get scenario with all related data
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: {
        assumptionSet: {
          include: {
            company: true,
            hiringPlan: {
              orderBy: { monthOffset: "asc" },
            },
          },
        },
      },
    });

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const { assumptionSet } = scenario;
    const company = assumptionSet.company;

    // Check access
    const hasAccess = await checkWorkspaceAccess(user.id, company.workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare input for financial engine
    const input = {
      company: {
        name: company.name,
        stage: company.stage,
        sector: company.sector,
        country: company.country,
        currency: company.currency,
        startingCash: company.startingCash,
        startingMRR: company.startingMRR,
        currentHeadcount: company.currentHeadcount,
      },
      assumptions: {
        name: assumptionSet.name,
        startMonth: assumptionSet.startMonth,
        months: assumptionSet.months,
        pricingModel: assumptionSet.pricingModel,
        arpu: assumptionSet.arpu,
        expectedNewCustomersPerMonth:
          assumptionSet.expectedNewCustomersPerMonth,
        expansionRevenueRate: assumptionSet.expansionRevenueRate,
        churnRate: assumptionSet.churnRate,
        cac: assumptionSet.cac,
        paybackPeriodMonths: assumptionSet.paybackPeriodMonths,
        grossMarginPercent: assumptionSet.grossMarginPercent,
        fixedCostsPerMonth: assumptionSet.fixedCostsPerMonth,
        variableCostPercentOfRevenue:
          assumptionSet.variableCostPercentOfRevenue,
      },
      hiringPlan: assumptionSet.hiringPlan.map((item) => ({
        monthOffset: item.monthOffset,
        roleName: item.roleName,
        count: item.count,
        monthlySalaryPerHead: item.monthlySalaryPerHead,
        department: item.department,
      })),
      scenarioOverrides: scenario.overrides as ScenarioOverrides | undefined,
    };

    // Run the financial engine
    const result = runScenario(input);

    // Delete existing projections for this scenario
    await prisma.projection.deleteMany({
      where: { scenarioId },
    });

    // Store projections
    await prisma.projection.createMany({
      data: result.projections.map((p) => ({
        scenarioId,
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
    });

    // Log audit event
    await logAuditEvent(company.workspaceId, user.id, "run_projection", {
      scenarioId,
      companyId: company.id,
      projectionCount: result.projections.length,
    });

    return NextResponse.json({
      projections: result.projections,
      summary: result.summary,
    });
  } catch (error) {
    console.error("Error running projections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
