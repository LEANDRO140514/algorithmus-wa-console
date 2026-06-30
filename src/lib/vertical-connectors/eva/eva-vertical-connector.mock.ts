/**
 * Eva vertical connector mock — local read-only stub.
 * CONSOLE-4 — no network I/O, no external SDKs, no env reads.
 */

import type {
  EvaVerticalCagStatus,
  EvaVerticalConnector,
  EvaVerticalFlags,
  EvaVerticalHealth,
  EvaVerticalKnowledgeStatus,
  EvaVerticalReplayStatusPayload,
  EvaVerticalRuntimeStatus,
  EvaVerticalStatusSnapshot,
} from "@/types/vertical-connectors/eva-vertical-contract";

import { EVA_UNILATINO_MOCK_STATUS } from "./eva-unilatino.mock";

export function createEvaVerticalMockConnector(): EvaVerticalConnector {
  const snapshot: EvaVerticalStatusSnapshot = EVA_UNILATINO_MOCK_STATUS;

  return {
    async getHealth(): Promise<EvaVerticalHealth> {
      return snapshot.health;
    },

    async getStatus(): Promise<EvaVerticalStatusSnapshot> {
      return snapshot;
    },

    async getCagStatus(): Promise<EvaVerticalCagStatus> {
      return snapshot.cag;
    },

    async getKnowledgeStatus(): Promise<EvaVerticalKnowledgeStatus> {
      return snapshot.knowledge;
    },

    async getLatestReplayStatus(): Promise<EvaVerticalReplayStatusPayload> {
      return snapshot.replay;
    },

    async getRuntimeStatus(): Promise<EvaVerticalRuntimeStatus> {
      return snapshot.runtime;
    },

    async getFlags(): Promise<EvaVerticalFlags> {
      return snapshot.flags;
    },
  };
}
