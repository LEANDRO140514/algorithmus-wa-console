/**
 * Vertical registry access diagnostics — CONSOLE-15 mock/read-only.
 * Explains CONSOLE-14 filter results without side effects.
 */

import type { VerticalRegistryEntry } from "@/types/verticals/vertical-registry";
import type {
  WorkspaceContext,
  WorkspaceContextRole,
  WorkspaceContextVerticalAccess,
} from "@/types/workspaces/workspace-context";
import { hasAnyWorkspaceRole } from "./vertical-registry-filter.mock";

export type VerticalAccessMatchType = "verticalId" | "routeVerticalId" | "none";

export type VerticalAccessDiagnosticStatus =
  | "visible"
  | "hidden_no_access"
  | "hidden_not_visible"
  | "hidden_roles_incompatible";

export interface VerticalAccessDiagnosticInput {
  entry: VerticalRegistryEntry;
  workspaceContext: WorkspaceContext;
}

export interface VerticalAccessDiagnostic {
  verticalId: string;
  routeVerticalId?: string;
  matchType: VerticalAccessMatchType;
  access?: WorkspaceContextVerticalAccess;
  accessFound: boolean;
  accessVisible: boolean;
  contextRoles: WorkspaceContextRole[];
  allowedRoles: WorkspaceContextRole[];
  matchedRoles: WorkspaceContextRole[];
  missingRoles: WorkspaceContextRole[];
  rolesCompatible: boolean;
  status: VerticalAccessDiagnosticStatus;
  isVisible: boolean;
  isMock: true;
  isReadOnly: true;
  reason: "workspace_access_diagnostics_mock";
}

function findAccessWithMatchType(
  workspaceContext: WorkspaceContext,
  entry: VerticalRegistryEntry,
): {
  access?: WorkspaceContextVerticalAccess;
  matchType: VerticalAccessMatchType;
} {
  const routeVerticalId = entry.routeMetadata.routeParams?.verticalId;
  const byVerticalId = workspaceContext.verticalAccess.find(
    (access) => access.verticalId === entry.verticalId,
  );

  if (byVerticalId) {
    return { access: byVerticalId, matchType: "verticalId" };
  }

  if (routeVerticalId !== undefined) {
    const byRouteVerticalId = workspaceContext.verticalAccess.find(
      (access) => access.routeVerticalId === routeVerticalId,
    );
    if (byRouteVerticalId) {
      return { access: byRouteVerticalId, matchType: "routeVerticalId" };
    }
  }

  return { access: undefined, matchType: "none" };
}

export function getMatchedWorkspaceRoles(
  contextRoles: WorkspaceContextRole[],
  allowedRoles: WorkspaceContextRole[],
): WorkspaceContextRole[] {
  return allowedRoles.filter((role) => contextRoles.includes(role));
}

export function getMissingWorkspaceRoles(
  contextRoles: WorkspaceContextRole[],
  allowedRoles: WorkspaceContextRole[],
): WorkspaceContextRole[] {
  return allowedRoles.filter((role) => !contextRoles.includes(role));
}

export function diagnoseVerticalAccess(
  input: VerticalAccessDiagnosticInput,
): VerticalAccessDiagnostic {
  const { entry, workspaceContext } = input;
  const routeVerticalId = entry.routeMetadata.routeParams?.verticalId;
  const { access, matchType } = findAccessWithMatchType(workspaceContext, entry);
  const contextRoles = [...workspaceContext.roles];
  const allowedRoles = access ? [...access.allowedRoles] : [];
  const matchedRoles = getMatchedWorkspaceRoles(contextRoles, allowedRoles);
  const missingRoles = getMissingWorkspaceRoles(contextRoles, allowedRoles);
  const accessFound = access !== undefined;
  const accessVisible = access?.visible ?? false;
  const rolesCompatible =
    accessFound && accessVisible
      ? hasAnyWorkspaceRole(contextRoles, allowedRoles)
      : false;

  let status: VerticalAccessDiagnosticStatus;
  if (!accessFound) {
    status = "hidden_no_access";
  } else if (!accessVisible) {
    status = "hidden_not_visible";
  } else if (!rolesCompatible) {
    status = "hidden_roles_incompatible";
  } else {
    status = "visible";
  }

  return {
    verticalId: entry.verticalId,
    routeVerticalId,
    matchType,
    access,
    accessFound,
    accessVisible,
    contextRoles,
    allowedRoles,
    matchedRoles,
    missingRoles,
    rolesCompatible,
    status,
    isVisible: status === "visible",
    isMock: true,
    isReadOnly: true,
    reason: "workspace_access_diagnostics_mock",
  };
}

export function diagnoseVerticalRegistryAccess(
  entries: VerticalRegistryEntry[],
  workspaceContext: WorkspaceContext,
): VerticalAccessDiagnostic[] {
  return entries.map((entry) =>
    diagnoseVerticalAccess({ entry, workspaceContext }),
  );
}
