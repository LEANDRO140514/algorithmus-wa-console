/**
 * Vertical registry — CONSOLE-7 mock exports.
 */

export {
  VERTICAL_REGISTRY_MOCK,
  getEvaVerticalRegistryEntry,
  getVerticalRegistryEntriesByTenant,
  getVerticalRegistryEntry,
  listVerticalRegistryEntries,
} from "./vertical-registry.mock";

export {
  DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS,
  buildVerticalRoutePreview,
  mergeVerticalRoutePreviewParams,
  resolveVerticalRoutePath,
} from "./vertical-route-preview";

export type {
  VerticalRoutePreviewInput,
  VerticalRoutePreviewResult,
} from "./vertical-route-preview";

export {
  filterVerticalRegistryForWorkspace,
  findVerticalAccess,
  hasAnyWorkspaceRole,
  isVerticalVisibleForWorkspace,
} from "./vertical-registry-filter.mock";

export type {
  WorkspaceVerticalFilterInput,
  WorkspaceVerticalFilterResult,
} from "./vertical-registry-filter.mock";

export {
  diagnoseVerticalAccess,
  diagnoseVerticalRegistryAccess,
  getMatchedWorkspaceRoles,
  getMissingWorkspaceRoles,
} from "./vertical-registry-access-diagnostics.mock";

export type {
  VerticalAccessDiagnostic,
  VerticalAccessDiagnosticInput,
  VerticalAccessDiagnosticStatus,
  VerticalAccessMatchType,
} from "./vertical-registry-access-diagnostics.mock";

export { summarizeVerticalRegistryDiagnostics } from "./vertical-registry-diagnostics-summary.mock";

export type {
  VerticalRegistryDiagnosticsMatchSummary,
  VerticalRegistryDiagnosticsRoleSummary,
  VerticalRegistryDiagnosticsStatusSummary,
  VerticalRegistryDiagnosticsSummary,
} from "./vertical-registry-diagnostics-summary.mock";

export type {
  VerticalCapability,
  VerticalCapabilityKey,
  VerticalConnectionMode,
  VerticalConsoleStatus,
  VerticalDataMode,
  VerticalRegistry,
  VerticalRegistryEntry,
  VerticalRouteMetadata,
  VerticalRouteMode,
  VerticalRouteParams,
  VerticalRouteRole,
  VerticalRouteSurface,
  VerticalRouteVisibility,
  VerticalSafetyProfile,
} from "@/types/verticals/vertical-registry";
