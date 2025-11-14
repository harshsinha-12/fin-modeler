/**
 * Audit logging utilities
 */

import { prisma } from "@/lib/db/prisma";

export type AuditAction =
  | "create_company"
  | "update_company"
  | "delete_company"
  | "create_assumption_set"
  | "update_assumption_set"
  | "delete_assumption_set"
  | "create_scenario"
  | "update_scenario"
  | "delete_scenario"
  | "run_projection"
  | "export_excel"
  | "export_csv"
  | "export_pdf"
  | "invite_member"
  | "remove_member"
  | "update_member_role";

/**
 * Log an audit event
 */
export async function logAuditEvent(
  workspaceId: string,
  userId: string | null,
  action: AuditAction,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    // Log but don't throw - audit logging shouldn't break the app
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Get recent audit logs for a workspace
 */
export async function getRecentAuditLogs(
  workspaceId: string,
  limit: number = 20
) {
  return prisma.auditLog.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  workspaceId: string,
  resourceId: string,
  limit: number = 20
) {
  return prisma.auditLog.findMany({
    where: {
      workspaceId,
      metadata: {
        path: ["resourceId"],
        equals: resourceId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
