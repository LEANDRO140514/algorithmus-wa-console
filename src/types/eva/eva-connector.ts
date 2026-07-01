/**
 * Eva connector boundary contract — CONSOLE-19 read-only types.
 * Defines what algorithmus-wa-console may observe vs what wa-agent-unilatino owns.
 * No network, no runtime side effects.
 */

export type EvaConnectorVerticalId = "eva-wa-unilatino";

export type EvaConnectorMode = "mock";

export type EvaBoundaryMode = "read_only_contract";

export type EvaRuntimeOwner = "wa-agent-unilatino";

export type EvaConsoleRole = "observe_supervise";

export type EvaVerticalRole = "decide_respond_sync";

export type EvaReadableScope =
  | "status"
  | "health"
  | "lastInboundAt"
  | "lastOutboundAt"
  | "activeFlags"
  | "waMode"
  | "ghlSyncMode"
  | "ghlWriteCustomFields"
  | "academicEngineEnabled"
  | "evaLlmEnabled";

export type EvaUnreadableScope =
  | "secrets"
  | "raw_credentials"
  | "private_keys"
  | "full_user_pii"
  | "ghl_api_key"
  | "ycloud_api_key"
  | "insforge_runtime_secrets";

export type EvaUnwritableScope =
  | "whatsapp_outbound"
  | "ghl_contacts"
  | "ghl_tasks"
  | "ghl_notes"
  | "ghl_custom_fields"
  | "insforge_runtime"
  | "ycloud_config"
  | "source_of_truth"
  | "eva_decisions"
  | "eva_responses"
  | "eva_sync";

export interface EvaConnectorActiveFlags {
  WA_AGENT_MODE: "mock";
  GHL_SYNC_MODE: "dry_run";
  GHL_WRITE_CUSTOM_FIELDS: false;
  ACADEMIC_ENGINE_ENABLED: true;
  EVA_LLM_ENABLED: false;
}

export interface EvaConnectorHealth {
  status: "safe_mock";
  readyForFutureIntegration: true;
  liveRuntimeConnected: false;
}

export interface EvaConnectorSourceOfTruth {
  runtime: EvaRuntimeOwner;
  decisions: EvaRuntimeOwner;
  sync: EvaRuntimeOwner;
  consoleRole: EvaConsoleRole;
}

export interface EvaConnectorLastKnownRuntime {
  observedAt: string;
  connectionState: "mock_disconnected";
  note: string;
}

export interface EvaConnectorBoundaryStatus {
  verticalId: EvaConnectorVerticalId;
  displayName: "Eva WA Universidad Latino";
  connectorMode: EvaConnectorMode;
  boundaryMode: EvaBoundaryMode;
  runtimeOwner: EvaRuntimeOwner;
  consoleRole: EvaConsoleRole;
  verticalRole: EvaVerticalRole;
  liveCallsEnabled: false;
  canRead: EvaReadableScope[];
  cannotRead: EvaUnreadableScope[];
  cannotWrite: EvaUnwritableScope[];
  activeFlags: EvaConnectorActiveFlags;
  sourceOfTruth: EvaConnectorSourceOfTruth;
  health: EvaConnectorHealth;
  lastKnownRuntime: EvaConnectorLastKnownRuntime;
  isMock: true;
  isReadOnly: true;
  reason: "eva_connector_boundary_real_contract_mock";
}
