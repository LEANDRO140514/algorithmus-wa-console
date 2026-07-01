/**
 * Vertical route preview contract — CONSOLE-12 read-only local resolver.
 * Pure helpers: no network, no env, no side effects.
 */

import type {
  VerticalRegistryEntry,
  VerticalRouteMetadata,
  VerticalRouteParams,
} from "@/types/verticals/vertical-registry";

export interface VerticalRoutePreviewInput {
  entry: VerticalRegistryEntry;
  params?: Partial<VerticalRouteParams>;
}

export interface VerticalRoutePreviewResult {
  previewStatusPanelPath?: string;
  workspaceStatusPanelPath?: string;
  agencyStatusPanelPath?: string;
  resolvedWorkspaceStatusPanelPath?: string;
  resolvedAgencyStatusPanelPath?: string;
  routeMode: VerticalRouteMetadata["routeMode"];
  visibility: VerticalRouteMetadata["visibility"];
  tenantAware: boolean;
  workspaceAware: boolean;
  agencyAware: boolean;
  isPreviewOnly: true;
}

export const DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS = {
  workspaceId: "demo-workspace",
  tenantId: "demo-tenant",
  verticalId: "eva",
} as const;

const PLACEHOLDER_PATTERN = /\[([^\]]+)\]/g;

/** Replaces route placeholders: [workspaceId], [tenantId], [verticalId] */

function normalizeParamValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const bracketMatch = value.match(/^\[([^\]]+)\]$/);
  return bracketMatch ? undefined : value;
}

export function mergeVerticalRoutePreviewParams(
  entry: VerticalRegistryEntry,
  params?: Partial<VerticalRouteParams>,
): VerticalRouteParams {
  const fromMetadata = entry.routeMetadata.routeParams ?? {};
  return {
    workspaceId:
      params?.workspaceId ??
      normalizeParamValue(fromMetadata.workspaceId) ??
      DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS.workspaceId,
    tenantId:
      params?.tenantId ??
      normalizeParamValue(fromMetadata.tenantId) ??
      DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS.tenantId,
    verticalId:
      params?.verticalId ??
      normalizeParamValue(fromMetadata.verticalId) ??
      DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS.verticalId,
  };
}

export function resolveVerticalRoutePath(
  path: string | undefined,
  params: Partial<VerticalRouteParams> = DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS,
): string | undefined {
  if (!path) {
    return undefined;
  }

  const merged = {
    ...DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS,
    ...params,
  };

  return path.replace(PLACEHOLDER_PATTERN, (_match, key: string) => {
    const resolved = merged[key as keyof VerticalRouteParams];
    if (resolved) {
      return resolved;
    }
    return _match;
  });
}

export function buildVerticalRoutePreview(
  input: VerticalRoutePreviewInput,
): VerticalRoutePreviewResult {
  const { entry, params } = input;
  const meta = entry.routeMetadata;
  const effectiveParams = mergeVerticalRoutePreviewParams(entry, params);

  return {
    previewStatusPanelPath:
      meta.previewStatusPanelPath ?? entry.statusPanelPath,
    workspaceStatusPanelPath: meta.workspaceStatusPanelPath,
    agencyStatusPanelPath: meta.agencyStatusPanelPath,
    resolvedWorkspaceStatusPanelPath: resolveVerticalRoutePath(
      meta.workspaceStatusPanelPath,
      effectiveParams,
    ),
    resolvedAgencyStatusPanelPath: resolveVerticalRoutePath(
      meta.agencyStatusPanelPath,
      effectiveParams,
    ),
    routeMode: meta.routeMode,
    visibility: meta.visibility,
    tenantAware: meta.tenantAware,
    workspaceAware: meta.workspaceAware,
    agencyAware: meta.agencyAware,
    isPreviewOnly: true,
  };
}
