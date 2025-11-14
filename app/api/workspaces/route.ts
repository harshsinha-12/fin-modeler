/**
 * API Route: /api/workspaces
 * Manage workspaces
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { createWorkspaceSchema } from "@/lib/validation/schemas";
import { WorkspaceRole } from "@prisma/client";

/**
 * GET /api/workspaces
 * Get all workspaces for the current user
 */
export async function GET(request: NextRequest) {
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

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            companies: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createWorkspaceSchema.parse(body);

    // Check if slug is already taken
    const existing = await prisma.workspace.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Workspace slug already taken" },
        { status: 409 }
      );
    }

    // Create workspace with user as owner
    const workspace = await prisma.workspace.create({
      data: {
        ...validatedData,
        members: {
          create: {
            userId: user.id,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating workspace:", error);
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
