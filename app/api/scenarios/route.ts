/**
 * API Route: /api/scenarios
 * Create and manage scenarios
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { createScenarioSchema } from "@/lib/validation/schemas";
import { checkWorkspaceAccess, canEdit } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";

/**
 * GET /api/scenarios?assumptionSetId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assumptionSetId =
      request.nextUrl.searchParams.get("assumptionSetId");
    if (!assumptionSetId) {
      return NextResponse.json(
        { error: "assumptionSetId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get assumption set to check workspace
    const assumptionSet = await prisma.assumptionSet.findUnique({
      where: { id: assumptionSetId },
      include: {
        company: true,
      },
    });

    if (!assumptionSet) {
      return NextResponse.json(
        { error: "Assumption set not found" },
        { status: 404 }
      );
    }

    const hasAccess = await checkWorkspaceAccess(
      user.id,
      assumptionSet.company.workspaceId
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const scenarios = await prisma.scenario.findMany({
      where: { assumptionSetId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenarios
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assumptionSetId, ...scenarioData } = body;

    if (!assumptionSetId) {
      return NextResponse.json(
        { error: "assumptionSetId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get assumption set to check workspace
    const assumptionSet = await prisma.assumptionSet.findUnique({
      where: { id: assumptionSetId },
      include: {
        company: true,
      },
    });

    if (!assumptionSet) {
      return NextResponse.json(
        { error: "Assumption set not found" },
        { status: 404 }
      );
    }

    const canUserEdit = await canEdit(
      user.id,
      assumptionSet.company.workspaceId
    );
    if (!canUserEdit) {
      return NextResponse.json(
        { error: "You don't have permission to create scenarios" },
        { status: 403 }
      );
    }

    // Validate
    const validatedData = createScenarioSchema.parse(scenarioData);

    // If this is marked as default, unset other defaults
    if (scenarioData.isDefault) {
      await prisma.scenario.updateMany({
        where: { assumptionSetId },
        data: { isDefault: false },
      });
    }

    const scenario = await prisma.scenario.create({
      data: {
        ...validatedData,
        assumptionSetId,
        overrides: validatedData.overrides
          ? JSON.parse(JSON.stringify(validatedData.overrides))
          : undefined,
      },
    });

    await logAuditEvent(
      assumptionSet.company.workspaceId,
      user.id,
      "create_scenario",
      {
        scenarioId: scenario.id,
        assumptionSetId,
      }
    );

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating scenario:", error);
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
