/**
 * Eva connector boundary mock — CONSOLE-19 read-only contract.
 * algorithmus-wa-console observes; wa-agent-unilatino decides/responds/syncs.
 * Pure sync helper — no network, no env, no side effects.
 */

import type { EvaConnectorBoundaryStatus } from "@/types/eva/eva-connector";

export const EVA_CONNECTOR_BOUNDARY_MOCK: EvaConnectorBoundaryStatus = {
  verticalId: "eva-wa-unilatino",
  displayName: "Eva WA Universidad Latino",
  connectorMode: "mock",
  boundaryMode: "read_only_contract",
  runtimeOwner: "wa-agent-unilatino",
  consoleRole: "observe_supervise",
  verticalRole: "decide_respond_sync",
  liveCallsEnabled: false,
  canRead: [
    "status",
    "health",
    "lastInboundAt",
    "lastOutboundAt",
    "activeFlags",
    "waMode",
    "ghlSyncMode",
    "ghlWriteCustomFields",
    "academicEngineEnabled",
    "evaLlmEnabled",
  ],
  cannotRead: [
    "secrets",
    "raw_credentials",
    "private_keys",
    "full_user_pii",
    "ghl_api_key",
    "ycloud_api_key",
    "insforge_runtime_secrets",
  ],
  cannotWrite: [
    "whatsapp_outbound",
    "ghl_contacts",
    "ghl_tasks",
    "ghl_notes",
    "ghl_custom_fields",
    "insforge_runtime",
    "ycloud_config",
    "source_of_truth",
    "eva_decisions",
    "eva_responses",
    "eva_sync",
  ],
  activeFlags: {
    WA_AGENT_MODE: "mock",
    GHL_SYNC_MODE: "dry_run",
    GHL_WRITE_CUSTOM_FIELDS: false,
    ACADEMIC_ENGINE_ENABLED: true,
    EVA_LLM_ENABLED: false,
  },
  sourceOfTruth: {
    runtime: "wa-agent-unilatino",
    decisions: "wa-agent-unilatino",
    sync: "wa-agent-unilatino",
    consoleRole: "observe_supervise",
  },
  health: {
    status: "safe_mock",
    readyForFutureIntegration: true,
    liveRuntimeConnected: false,
  },
  lastKnownRuntime: {
    observedAt: "2026-06-24T00:00:00.000Z",
    connectionState: "mock_disconnected",
    note:
      "Console boundary contract only — wa-agent-unilatino is the Eva brain; no live runtime connected.",
  },
  isMock: true,
  isReadOnly: true,
  reason: "eva_connector_boundary_real_contract_mock",
};

export function getEvaConnectorBoundaryStatus(): EvaConnectorBoundaryStatus {
  return EVA_CONNECTOR_BOUNDARY_MOCK;
}
