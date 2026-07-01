/**
 * Workspace context mock — CONSOLE-13 read-only local boundary.
 * No network, no env, no secrets, no session, no cookies.
 */

import type {
  WorkspaceContext,
  WorkspaceContextRouteParams,
} from "@/types/workspaces/workspace-context";

export const MOCK_WORKSPACE_CONTEXT: WorkspaceContext = {
  mode: "mock",
  visibility: "preview",
  tenant: {
    tenantId: "demo-tenant",
    tenantSlug: "universidad-latino",
    tenantName: "Universidad Latino",
  },
  workspace: {
    workspaceId: "demo-workspace",
    workspaceSlug: "admisiones",
    workspaceName: "Admisiones Universidad Latino",
  },
  roles: [
    "owner",
    "admin",
    "agency_admin",
    "workspace_admin",
    "viewer",
  ],
  verticalAccess: [
    {
      verticalId: "eva-wa-unilatino",
      routeVerticalId: "eva",
      visible: true,
      allowedRoles: [
        "owner",
        "admin",
        "agency_admin",
        "workspace_admin",
        "viewer",
      ],
    },
  ],
  routeParams: {
    tenantId: "demo-tenant",
    workspaceId: "demo-workspace",
    verticalId: "eva",
  },
  isMock: true,
  isReadOnly: true,
};

export function getMockWorkspaceContext(): WorkspaceContext {
  return MOCK_WORKSPACE_CONTEXT;
}

export function getMockVerticalRouteParams(
  verticalId?: string,
): WorkspaceContextRouteParams {
  const context = MOCK_WORKSPACE_CONTEXT;

  if (!verticalId) {
    return { ...context.routeParams };
  }

  const access = context.verticalAccess.find(
    (item) =>
      item.verticalId === verticalId || item.routeVerticalId === verticalId,
  );

  return {
    ...context.routeParams,
    verticalId: access?.routeVerticalId ?? verticalId,
  };
}
