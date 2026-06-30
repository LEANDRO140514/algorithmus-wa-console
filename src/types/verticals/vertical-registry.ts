/**
 * Vertical registry types — CONSOLE-7 mock/read-only.
 * No external dependencies.
 */

export type VerticalId = "eva-wa-unilatino";

export type TenantId = "universidad-latino";

export type VerticalProvider = "ycloud" | "unknown";

export type VerticalCrmProvider = "ghl" | "none" | "unknown";

export type VerticalRuntimeTarget =
  | "insforge"
  | "supabase_legacy"
  | "external"
  | "unknown";

export type VerticalDataMode =
  | "mock"
  | "read_only"
  | "live_read_only"
  | "controlled_write_candidate"
  | "live_write";

export type VerticalConnectionMode =
  | "none"
  | "mock_connector"
  | "api_read_only"
  | "event_replica"
  | "webhook_router"
  | "direct_db";

export type VerticalConsoleStatus =
  | "draft"
  | "mock_readonly"
  | "ready_for_readonly_api"
  | "observing"
  | "blocked"
  | "deprecated";

export type VerticalSafetyLevel = "safe" | "warning" | "blocked" | "unknown";

export type VerticalRouteMode = "preview" | "workspace" | "agency" | "hybrid";

export type VerticalRouteVisibility =
  | "hidden"
  | "preview"
  | "workspace"
  | "agency"
  | "internal";

export type VerticalRouteSurface =
  | "status_panel"
  | "registry_list"
  | "dashboard"
  | "operations"
  | "settings";

export type VerticalRouteRole =
  | "owner"
  | "admin"
  | "agency_admin"
  | "workspace_admin"
  | "operator"
  | "viewer";

export interface VerticalRouteParams {
  workspaceId?: string;
  tenantId?: string;
  verticalId?: string;
}

export interface VerticalRouteMetadata {
  previewStatusPanelPath?: string;
  workspaceStatusPanelPath?: string;
  agencyStatusPanelPath?: string;
  routeMode: VerticalRouteMode;
  visibility: VerticalRouteVisibility;
  allowedRoles: VerticalRouteRole[];
  routeParams: VerticalRouteParams;
  routeSurface: VerticalRouteSurface[];
  tenantAware: boolean;
  workspaceAware: boolean;
  agencyAware: boolean;
}

export type VerticalCapabilityKey =
  | "status_panel"
  | "health"
  | "runtime_flags_readonly"
  | "cag_status_readonly"
  | "knowledge_status_readonly"
  | "replay_status_readonly"
  | "inbox_readonly"
  | "human_handoff"
  | "live_controls"
  | "flag_writes";

export interface VerticalCapability {
  key: VerticalCapabilityKey;
  enabled: boolean;
  mode: string;
}

export interface VerticalSafetyProfile {
  level: VerticalSafetyLevel;
  readOnly: boolean;
  canWriteRuntime: boolean;
  canActivateLive: boolean;
  canChangeWebhook: boolean;
  canAccessSecrets: boolean;
  containsPii: boolean;
  warnings: string[];
}

export interface VerticalRegistryEntry {
  verticalId: VerticalId;
  tenantId: TenantId;
  displayName: string;
  description: string;
  repo: string;
  owner: string;
  provider: VerticalProvider;
  crm: VerticalCrmProvider;
  runtimeTarget: VerticalRuntimeTarget;
  dataMode: VerticalDataMode;
  connectionMode: VerticalConnectionMode;
  consoleStatus: VerticalConsoleStatus;
  statusPanelPath: string;
  routeMetadata: VerticalRouteMetadata;
  capabilities: VerticalCapability[];
  safety: VerticalSafetyProfile;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VerticalRegistry {
  version: string;
  entries: VerticalRegistryEntry[];
  updatedAt: string;
}
