/**
 * Eva connector boundary — CONSOLE-19 exports.
 */

export {
  EVA_CONNECTOR_BOUNDARY_MOCK,
  getEvaConnectorBoundaryStatus,
} from "./eva-connector.mock";

export type {
  EvaBoundaryMode,
  EvaConnectorActiveFlags,
  EvaConnectorBoundaryStatus,
  EvaConnectorHealth,
  EvaConnectorLastKnownRuntime,
  EvaConnectorMode,
  EvaConnectorSourceOfTruth,
  EvaConnectorVerticalId,
  EvaConsoleRole,
  EvaReadableScope,
  EvaRuntimeOwner,
  EvaUnreadableScope,
  EvaUnwritableScope,
  EvaVerticalRole,
} from "@/types/eva/eva-connector";
