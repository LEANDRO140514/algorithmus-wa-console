/**
 * Vertical registry mock — CONSOLE-7 read-only local data.
 * No network, no env, no secrets, no PII.
 */

import type {
  TenantId,
  VerticalId,
  VerticalRegistry,
  VerticalRegistryEntry,
} from "@/types/verticals/vertical-registry";

const MOCK_TIMESTAMP = "2026-06-24T12:00:00.000Z";

const EVA_REGISTRY_ENTRY: VerticalRegistryEntry = {
  verticalId: "eva-wa-unilatino",
  tenantId: "universidad-latino",
  displayName: "Eva WA Universidad Latino",
  description:
    "First robust WhatsApp vertical connected to Algorithmus WA Console as mock/read-only preview.",
  repo: "wa-agent-unilatino",
  owner: "LEANDRO140514",
  provider: "ycloud",
  crm: "ghl",
  runtimeTarget: "insforge",
  dataMode: "mock",
  connectionMode: "mock_connector",
  consoleStatus: "mock_readonly",
  statusPanelPath: "/verticals/eva/status",
  tags: ["eva", "universidad-latino", "whatsapp", "ycloud", "ghl", "cag"],
  capabilities: [
    { key: "status_panel", enabled: true, mode: "mock" },
    { key: "health", enabled: true, mode: "mock" },
    { key: "runtime_flags_readonly", enabled: true, mode: "mock" },
    { key: "cag_status_readonly", enabled: true, mode: "mock" },
    { key: "knowledge_status_readonly", enabled: true, mode: "mock" },
    { key: "replay_status_readonly", enabled: true, mode: "mock" },
    { key: "inbox_readonly", enabled: false, mode: "not_connected" },
    { key: "human_handoff", enabled: false, mode: "not_connected" },
    { key: "live_controls", enabled: false, mode: "blocked" },
    { key: "flag_writes", enabled: false, mode: "blocked" },
  ],
  safety: {
    level: "safe",
    readOnly: true,
    canWriteRuntime: false,
    canActivateLive: false,
    canChangeWebhook: false,
    canAccessSecrets: false,
    containsPii: false,
    warnings: [],
  },
  createdAt: MOCK_TIMESTAMP,
  updatedAt: MOCK_TIMESTAMP,
};

export const VERTICAL_REGISTRY_MOCK: VerticalRegistry = {
  version: "mock-console-7",
  entries: [EVA_REGISTRY_ENTRY],
  updatedAt: MOCK_TIMESTAMP,
};

export function listVerticalRegistryEntries(): VerticalRegistryEntry[] {
  return [...VERTICAL_REGISTRY_MOCK.entries];
}

export function getVerticalRegistryEntry(
  verticalId: VerticalId,
): VerticalRegistryEntry | undefined {
  return VERTICAL_REGISTRY_MOCK.entries.find(
    (entry) => entry.verticalId === verticalId,
  );
}

export function getVerticalRegistryEntriesByTenant(
  tenantId: TenantId,
): VerticalRegistryEntry[] {
  return VERTICAL_REGISTRY_MOCK.entries.filter(
    (entry) => entry.tenantId === tenantId,
  );
}

export function getEvaVerticalRegistryEntry(): VerticalRegistryEntry {
  const entry = getVerticalRegistryEntry("eva-wa-unilatino");
  if (!entry) {
    throw new Error("Eva vertical registry entry not found in mock registry");
  }
  return entry;
}
