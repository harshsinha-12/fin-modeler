/**
 * API Route: /api/assumptions
 * Create and manage assumption sets
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import {
  createAssumptionSetSchema,
  createHiringPlanSchema,
} from "@/lib/validation/schemas";
import { checkWorkspaceAccess, canEdit } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";

/**
 * POST /api/assumptions
 * Create a new assumption set with hiring plan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, hiringPlan, ...assumptionData } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get company to check workspace
    const company = await prisma.companyProfile.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check permissions
    const canUserEdit = await canEdit(user.id, company.workspaceId);
    if (!canUserEdit) {
      return NextResponse.json(
        { error: "You don't have permission to create assumptions" },
        { status: 403 }
      );
    }

    // Validate data
    const validatedAssumptions = createAssumptionSetSchema.parse(assumptionData);
    const validatedHiringPlan = hiringPlan
      ? createHiringPlanSchema.parse(hiringPlan)
      : [];

    // Create assumption set with hiring plan
    const assumptionSet = await prisma.assumptionSet.create({
      data: {
        ...validatedAssumptions,
        companyId,
        hiringPlan: {
          create: validatedHiringPlan,
        },
      },
      include: {
        hiringPlan: true,
      },
    });

    await logAuditEvent(company.workspaceId, user.id, "create_assumption_set", {
      assumptionSetId: assumptionSet.id,
      companyId,
    });

    return NextResponse.json({ assumptionSet }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assumption set:", error);
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
