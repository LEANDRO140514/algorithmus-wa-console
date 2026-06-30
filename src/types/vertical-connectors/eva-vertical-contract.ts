/**
 * Eva WA vertical connector contract v0 (read-only).
 * CONSOLE-4 — types only; no network, no runtime side effects.
 */

export type EvaVerticalId = "eva-wa-unilatino";

export type EvaTenantId = "universidad-latino";

export type EvaProvider = "ycloud";

export type EvaCrmProvider = "ghl";

export type EvaRuntimeMode = "mock" | "live_outbound" | "unknown";

export type EvaGhlSyncMode = "dry_run" | "live" | "unknown";

export type EvaLlmMode = "off" | "shadow" | "assistive" | "live" | "unknown";

export type EvaCagMode =
  | "off"
  | "shadow"
  | "assistive_shadow"
  | "response_enabled_mock"
  | "response_enabled_live"
  | "unknown";

export type EvaReplayStatus = "pass" | "fail" | "not_run" | "unknown";

export type EvaConsoleConnectionState =
  | "disconnected"
  | "connected_readonly"
  | "observing"
  | "shadow_visible"
  | "assistive_shadow_visible"
  | "response_enabled_mock_visible"
  | "live_candidate_visible"
  | "error";

export type EvaSafetyLevel = "safe" | "warning" | "blocked" | "unknown";

export type EvaHealthStatus = "ok" | "degraded" | "error" | "unknown";

export interface EvaVerticalHealth {
  status: EvaHealthStatus;
  message: string;
  checkedAt: string;
}

export interface EvaVerticalRuntimeStatus {
  waAgentMode: EvaRuntimeMode;
  academicEngineEnabled: boolean;
  outboundReal: boolean;
}

export interface EvaVerticalGhlStatus {
  syncMode: EvaGhlSyncMode;
  customFieldsEnabled: boolean;
  live: boolean;
}

export interface EvaVerticalLlmStatus {
  enabled: boolean;
  mode: EvaLlmMode;
}

export interface EvaVerticalCagStatus {
  mode: EvaCagMode;
  shadowLoggingEnabled: boolean;
  assistiveShadowEnabled: boolean;
  responseEnabled: boolean;
  finalResponseModified: boolean;
  allowedCategories: string[];
  blockedCategories: string[];
  partialCategories: string[];
}

export interface EvaVerticalKnowledgeStatus {
  source: string;
  strategy: string;
  ragProductive: boolean;
  version: string;
  contentHash: string;
}

export interface EvaVerticalReplayStatusPayload {
  status: EvaReplayStatus;
  lastRunLabel: string;
  passed: boolean;
  failed: boolean;
}

export interface EvaVerticalSafetyStatus {
  level: EvaSafetyLevel;
  readOnly: boolean;
  canWriteRuntime: boolean;
  canActivateLive: boolean;
  canChangeWebhook: boolean;
  piiRedacted: boolean;
  secretsIncluded: boolean;
  warnings: string[];
}

export interface EvaVerticalFlags {
  WA_AGENT_MODE: string;
  GHL_SYNC_MODE: string;
  GHL_WRITE_CUSTOM_FIELDS: string;
  ACADEMIC_ENGINE_ENABLED: string;
  EVA_LLM_ENABLED: string;
  LLM_MODE: string;
  EVA_CAG_SHADOW_LOGGING: string;
  EVA_CAG_ASSISTIVE_SHADOW: string;
  EVA_CAG_RESPONSE_ENABLED: string;
}

export interface EvaVerticalStatusSnapshot {
  verticalId: EvaVerticalId;
  tenantId: EvaTenantId;
  displayName: string;
  provider: EvaProvider;
  crm: EvaCrmProvider;
  connectionState: EvaConsoleConnectionState;
  health: EvaVerticalHealth;
  runtime: EvaVerticalRuntimeStatus;
  ghl: EvaVerticalGhlStatus;
  llm: EvaVerticalLlmStatus;
  cag: EvaVerticalCagStatus;
  knowledge: EvaVerticalKnowledgeStatus;
  replay: EvaVerticalReplayStatusPayload;
  flags: EvaVerticalFlags;
  safety: EvaVerticalSafetyStatus;
  updatedAt: string;
}

export interface EvaVerticalConnector {
  getHealth(): Promise<EvaVerticalHealth>;
  getStatus(): Promise<EvaVerticalStatusSnapshot>;
  getCagStatus(): Promise<EvaVerticalCagStatus>;
  getKnowledgeStatus(): Promise<EvaVerticalKnowledgeStatus>;
  getLatestReplayStatus(): Promise<EvaVerticalReplayStatusPayload>;
  getRuntimeStatus(): Promise<EvaVerticalRuntimeStatus>;
  getFlags(): Promise<EvaVerticalFlags>;
}
