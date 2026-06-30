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

export type {
  VerticalCapability,
  VerticalCapabilityKey,
  VerticalConnectionMode,
  VerticalConsoleStatus,
  VerticalDataMode,
  VerticalRegistry,
  VerticalRegistryEntry,
  VerticalSafetyProfile,
} from "@/types/verticals/vertical-registry";
