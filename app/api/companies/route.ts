/**
 * API Route: /api/companies
 * Create and list companies
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { createCompanySchema } from "@/lib/validation/schemas";
import { checkWorkspaceAccess, canEdit } from "@/lib/auth/auth-helpers";
import { logAuditEvent } from "@/lib/audit/logger";

/**
 * GET /api/companies?workspaceId=xxx
 * List all companies in a workspace
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get companies
    const companies = await prisma.companyProfile.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, ...companyData } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can edit
    const canUserEdit = await canEdit(user.id, workspaceId);
    if (!canUserEdit) {
      return NextResponse.json(
        { error: "You don't have permission to create companies" },
        { status: 403 }
      );
    }

    // Validate input
    const validatedData = createCompanySchema.parse(companyData);

    // Create company
    const company = await prisma.companyProfile.create({
      data: {
        ...validatedData,
        workspaceId,
      },
    });

    // Log audit event
    await logAuditEvent(workspaceId, user.id, "create_company", {
      companyId: company.id,
      companyName: company.name,
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);
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
