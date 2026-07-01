/**
 * Vertical registry diagnostics summary — CONSOLE-18 mock/read-only.
 * Aggregates CONSOLE-15 diagnostics without side effects.
 */

import type {
  VerticalAccessDiagnostic,
  VerticalAccessDiagnosticStatus,
  VerticalAccessMatchType,
} from "./vertical-registry-access-diagnostics.mock";

export interface VerticalRegistryDiagnosticsStatusSummary {
  status: VerticalAccessDiagnosticStatus;
  count: number;
}

export interface VerticalRegistryDiagnosticsMatchSummary {
  matchType: VerticalAccessMatchType;
  count: number;
}

export interface VerticalRegistryDiagnosticsRoleSummary {
  contextRoles: string[];
  allowedRoles: string[];
  matchedRoles: string[];
  missingRoles: string[];
}

export interface VerticalRegistryDiagnosticsSummary {
  totalVerticals: number;
  visibleVerticals: number;
  hiddenVerticals: number;
  byStatus: VerticalRegistryDiagnosticsStatusSummary[];
  byMatchType: VerticalRegistryDiagnosticsMatchSummary[];
  roles: VerticalRegistryDiagnosticsRoleSummary;
  isMock: true;
  isReadOnly: true;
  reason: "vertical_registry_diagnostics_summary_mock";
}

const STATUS_ORDER: VerticalAccessDiagnosticStatus[] = [
  "visible",
  "hidden_no_access",
  "hidden_not_visible",
  "hidden_roles_incompatible",
];

const MATCH_ORDER: VerticalAccessMatchType[] = [
  "verticalId",
  "routeVerticalId",
  "none",
];

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function countStatuses(
  diagnostics: VerticalAccessDiagnostic[],
): VerticalRegistryDiagnosticsStatusSummary[] {
  const counts = new Map<VerticalAccessDiagnosticStatus, number>();
  for (const status of STATUS_ORDER) {
    counts.set(status, 0);
  }
  for (const diagnostic of diagnostics) {
    counts.set(diagnostic.status, (counts.get(diagnostic.status) ?? 0) + 1);
  }
  return STATUS_ORDER.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

function countMatchTypes(
  diagnostics: VerticalAccessDiagnostic[],
): VerticalRegistryDiagnosticsMatchSummary[] {
  const counts = new Map<VerticalAccessMatchType, number>();
  for (const matchType of MATCH_ORDER) {
    counts.set(matchType, 0);
  }
  for (const diagnostic of diagnostics) {
    counts.set(
      diagnostic.matchType,
      (counts.get(diagnostic.matchType) ?? 0) + 1,
    );
  }
  return MATCH_ORDER.map((matchType) => ({
    matchType,
    count: counts.get(matchType) ?? 0,
  }));
}

function summarizeRoles(
  diagnostics: VerticalAccessDiagnostic[],
): VerticalRegistryDiagnosticsRoleSummary {
  const contextRoles: string[] = [];
  const allowedRoles: string[] = [];
  const matchedRoles: string[] = [];
  const missingRoles: string[] = [];

  for (const diagnostic of diagnostics) {
    contextRoles.push(...diagnostic.contextRoles);
    allowedRoles.push(...diagnostic.allowedRoles);
    matchedRoles.push(...diagnostic.matchedRoles);
    missingRoles.push(...diagnostic.missingRoles);
  }

  return {
    contextRoles: uniqueSorted(contextRoles),
    allowedRoles: uniqueSorted(allowedRoles),
    matchedRoles: uniqueSorted(matchedRoles),
    missingRoles: uniqueSorted(missingRoles),
  };
}

export function summarizeVerticalRegistryDiagnostics(
  diagnostics: VerticalAccessDiagnostic[],
): VerticalRegistryDiagnosticsSummary {
  const visibleVerticals = diagnostics.filter(
    (diagnostic) => diagnostic.isVisible || diagnostic.status === "visible",
  ).length;
  const totalVerticals = diagnostics.length;

  return {
    totalVerticals,
    visibleVerticals,
    hiddenVerticals: totalVerticals - visibleVerticals,
    byStatus: countStatuses(diagnostics),
    byMatchType: countMatchTypes(diagnostics),
    roles: summarizeRoles(diagnostics),
    isMock: true,
    isReadOnly: true,
    reason: "vertical_registry_diagnostics_summary_mock",
  };
}
