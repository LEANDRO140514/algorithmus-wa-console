/**
 * Workspace context types — CONSOLE-13 mock/read-only local contract.
 * No Supabase, no auth, no session, no APIs.
 */

export type WorkspaceContextMode = "mock" | "session" | "agency" | "unknown";

export type WorkspaceContextVisibility =
  | "preview"
  | "workspace"
  | "agency"
  | "internal";

export type WorkspaceContextRole =
  | "owner"
  | "admin"
  | "agency_admin"
  | "workspace_admin"
  | "operator"
  | "viewer";

export interface WorkspaceContextTenant {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
}

export interface WorkspaceContextWorkspace {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
}

export interface WorkspaceContextVerticalAccess {
  verticalId: string;
  routeVerticalId: string;
  visible: boolean;
  allowedRoles: WorkspaceContextRole[];
}

export interface WorkspaceContextRouteParams {
  tenantId: string;
  workspaceId: string;
  verticalId: string;
}

export interface WorkspaceContext {
  mode: WorkspaceContextMode;
  visibility: WorkspaceContextVisibility;
  tenant: WorkspaceContextTenant;
  workspace: WorkspaceContextWorkspace;
  roles: WorkspaceContextRole[];
  verticalAccess: WorkspaceContextVerticalAccess[];
  routeParams: WorkspaceContextRouteParams;
  isMock: true;
  isReadOnly: true;
}
