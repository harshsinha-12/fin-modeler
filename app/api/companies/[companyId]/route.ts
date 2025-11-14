/**
 * API Route: /api/companies/[companyId]
 * Get, update, and delete a specific company
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { updateCompanySchema } from "@/lib/validation/schemas";
import { checkWorkspaceAccess, canEdit } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";

/**
 * GET /api/companies/[companyId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await prisma.companyProfile.findUnique({
      where: { id: params.companyId },
      include: {
        assumptionSets: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check access
    const hasAccess = await checkWorkspaceAccess(user.id, company.workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[companyId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await prisma.companyProfile.findUnique({
      where: { id: params.companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check permissions
    const canUserEdit = await canEdit(user.id, company.workspaceId);
    if (!canUserEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this company" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const updatedCompany = await prisma.companyProfile.update({
      where: { id: params.companyId },
      data: validatedData,
    });

    await logAuditEvent(company.workspaceId, user.id, "update_company", {
      companyId: company.id,
      changes: validatedData,
    });

    return NextResponse.json({ company: updatedCompany });
  } catch (error: any) {
    console.error("Error updating company:", error);
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
