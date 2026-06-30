/**
 * Eva WA Universidad Latino — mock status fixture (read-only).
 * CONSOLE-4 — no secrets, no PII, no real API payloads.
 */

import type { EvaVerticalStatusSnapshot } from "@/types/vertical-connectors/eva-vertical-contract";

const MOCK_TIMESTAMP = "2026-06-24T12:00:00.000Z";

export const EVA_UNILATINO_MOCK_STATUS: EvaVerticalStatusSnapshot = {
  verticalId: "eva-wa-unilatino",
  tenantId: "universidad-latino",
  displayName: "Eva WA Universidad Latino",
  provider: "ycloud",
  crm: "ghl",
  connectionState: "connected_readonly",
  health: {
    status: "ok",
    message: "Mock read-only connector status",
    checkedAt: MOCK_TIMESTAMP,
  },
  runtime: {
    waAgentMode: "mock",
    academicEngineEnabled: true,
    outboundReal: false,
  },
  ghl: {
    syncMode: "dry_run",
    customFieldsEnabled: false,
    live: false,
  },
  llm: {
    enabled: false,
    mode: "off",
  },
  cag: {
    mode: "assistive_shadow",
    shadowLoggingEnabled: true,
    assistiveShadowEnabled: true,
    responseEnabled: false,
    finalResponseModified: false,
    allowedCategories: [
      "location",
      "rvoe",
      "online_programs",
      "not_offered",
    ],
    blockedCategories: [
      "pricing_exact",
      "scholarship_guarantee",
      "personal_data_request",
    ],
    partialCategories: ["promotions_general"],
  },
  knowledge: {
    source: "wa-agent-unilatino",
    strategy: "CAG",
    ragProductive: false,
    version: "mock-console-4",
    contentHash: "mock-redacted",
  },
  replay: {
    status: "pass",
    lastRunLabel: "mock-console-4",
    passed: true,
    failed: false,
  },
  flags: {
    WA_AGENT_MODE: "mock",
    GHL_SYNC_MODE: "dry_run",
    GHL_WRITE_CUSTOM_FIELDS: "false",
    ACADEMIC_ENGINE_ENABLED: "true",
    EVA_LLM_ENABLED: "false",
    LLM_MODE: "off",
    EVA_CAG_SHADOW_LOGGING: "true",
    EVA_CAG_ASSISTIVE_SHADOW: "true",
    EVA_CAG_RESPONSE_ENABLED: "false",
  },
  safety: {
    level: "safe",
    readOnly: true,
    canWriteRuntime: false,
    canActivateLive: false,
    canChangeWebhook: false,
    piiRedacted: true,
    secretsIncluded: false,
    warnings: [],
  },
  updatedAt: MOCK_TIMESTAMP,
};
