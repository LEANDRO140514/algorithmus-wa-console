/**
 * Vertical registry workspace filter — CONSOLE-14 mock/read-only.
 * Pure helpers: no network, no auth, no side effects.
 */

import type { VerticalRegistryEntry } from "@/types/verticals/vertical-registry";
import type {
  WorkspaceContext,
  WorkspaceContextRole,
  WorkspaceContextVerticalAccess,
} from "@/types/workspaces/workspace-context";

export interface WorkspaceVerticalFilterInput {
  entries: VerticalRegistryEntry[];
  workspaceContext: WorkspaceContext;
}

export interface WorkspaceVerticalFilterResult {
  visibleEntries: VerticalRegistryEntry[];
  hiddenEntries: VerticalRegistryEntry[];
  accessByVerticalId: Record<string, WorkspaceContextVerticalAccess | undefined>;
  isMock: true;
  isReadOnly: true;
  reason: "workspace_context_mock";
}

export function hasAnyWorkspaceRole(
  userRoles: WorkspaceContextRole[],
  allowedRoles: WorkspaceContextRole[],
): boolean {
  return userRoles.some((role) => allowedRoles.includes(role));
}

export function findVerticalAccess(
  workspaceContext: WorkspaceContext,
  entry: VerticalRegistryEntry,
): WorkspaceContextVerticalAccess | undefined {
  const routeVerticalId = entry.routeMetadata.routeParams?.verticalId;

  return workspaceContext.verticalAccess.find(
    (access) =>
      access.verticalId === entry.verticalId ||
      (routeVerticalId !== undefined &&
        access.routeVerticalId === routeVerticalId),
  );
}

export function isVerticalVisibleForWorkspace(
  workspaceContext: WorkspaceContext,
  entry: VerticalRegistryEntry,
): boolean {
  const access = findVerticalAccess(workspaceContext, entry);
  if (!access || !access.visible) {
    return false;
  }

  return hasAnyWorkspaceRole(workspaceContext.roles, access.allowedRoles);
}

export function filterVerticalRegistryForWorkspace(
  input: WorkspaceVerticalFilterInput,
): WorkspaceVerticalFilterResult {
  const { entries, workspaceContext } = input;
  const visibleEntries: VerticalRegistryEntry[] = [];
  const hiddenEntries: VerticalRegistryEntry[] = [];
  const accessByVerticalId: Record<
    string,
    WorkspaceContextVerticalAccess | undefined
  > = {};

  for (const entry of entries) {
    const access = findVerticalAccess(workspaceContext, entry);
    accessByVerticalId[entry.verticalId] = access;

    if (isVerticalVisibleForWorkspace(workspaceContext, entry)) {
      visibleEntries.push(entry);
    } else {
      hiddenEntries.push(entry);
    }
  }

  return {
    visibleEntries,
    hiddenEntries,
    accessByVerticalId,
    isMock: true,
    isReadOnly: true,
    reason: "workspace_context_mock",
  };
}
