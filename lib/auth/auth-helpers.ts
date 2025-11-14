/**
 * Auth helper functions for workspace and permission checks
 */

import { WorkspaceRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Check if user has access to workspace
 */
export async function checkWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return !!member;
}

/**
 * Check if user has specific role in workspace
 */
export async function checkWorkspaceRole(
  userId: string,
  workspaceId: string,
  requiredRole: WorkspaceRole | WorkspaceRole[]
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) return false;

  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];
  return requiredRoles.includes(member.role);
}

/**
 * Get user's role in workspace
 */
export async function getUserWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return member?.role ?? null;
}

/**
 * Get all workspaces for user
 */
export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Check if user can edit (is OWNER or EDITOR)
 */
export async function canEdit(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  return checkWorkspaceRole(userId, workspaceId, [
    WorkspaceRole.OWNER,
    WorkspaceRole.EDITOR,
  ]);
}

/**
 * Check if user is owner
 */
export async function isOwner(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  return checkWorkspaceRole(userId, workspaceId, WorkspaceRole.OWNER);
}

/**
 * Create or get default workspace for user
 */
export async function getOrCreateDefaultWorkspace(
  userId: string,
  userEmail: string
) {
  // Check if user has any workspaces
  const existingWorkspaces = await getUserWorkspaces(userId);

  if (existingWorkspaces.length > 0) {
    return existingWorkspaces[0];
  }

  // Create default workspace
  const slug = `${userEmail.split("@")[0]}-workspace-${Date.now()}`;

  return prisma.workspace.create({
    data: {
      name: "My Workspace",
      slug,
      members: {
        create: {
          userId,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });
}
