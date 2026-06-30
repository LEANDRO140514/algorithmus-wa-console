#!/usr/bin/env node
/**
 * CONSOLE-4 — Eva vertical connector contract validator (read-only).
 * Usage: node tests/run-console4-eva-connector-contract-validator.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-4-eva-vertical-connector-contract.md",
  "src/types/vertical-connectors/eva-vertical-contract.ts",
  "src/lib/vertical-connectors/eva/eva-unilatino.mock.ts",
  "src/lib/vertical-connectors/eva/eva-vertical-connector.mock.ts",
  "src/lib/vertical-connectors/eva/index.ts",
];

const DOC_PHRASES = [
  "CONSOLE-4",
  "read-only",
  "wa-agent-unilatino",
  "algorithmus-wa-console",
  "Eva primero",
  "No doble webhook",
  "No API calls reales",
  "No Supabase migration",
  "No InsForge writes",
  "No native decision-engine for Eva",
  "No LLM/RAG activation",
  "GET /health",
  "GET /vertical/status",
  "Console state machine",
  "CONSOLE-5",
];

const TYPES_PHRASES = [
  "EvaVerticalStatusSnapshot",
  "EvaVerticalConnector",
  "EvaConsoleConnectionState",
  "EvaCagMode",
  '"eva-wa-unilatino"',
  '"universidad-latino"',
  '"ycloud"',
  '"ghl"',
];

const FIXTURE_PHRASES = [
  "EVA_UNILATINO_MOCK_STATUS",
  '"mock"',
  '"dry_run"',
  '"off"',
  '"assistive_shadow"',
  "ragProductive: false",
  "responseEnabled: false",
  "finalResponseModified: false",
  "readOnly: true",
  "canActivateLive: false",
  "secretsIncluded: false",
];

const CONNECTOR_PHRASES = [
  "createEvaVerticalMockConnector",
  "getHealth",
  "getStatus",
  "getCagStatus",
  "getKnowledgeStatus",
  "getLatestReplayStatus",
  "getRuntimeStatus",
  "getFlags",
];

const CONNECTOR_FORBIDDEN = ["fetch", "axios", "supabase", "process.env"];

const INDEX_PHRASES = [
  "EVA_UNILATINO_MOCK_STATUS",
  "createEvaVerticalMockConnector",
];

const FORBIDDEN_PATTERNS = [
  { pattern: /curdeeclau-monorepo/i, label: "curdeeclau-monorepo" },
  { pattern: /\blive\s+activation\b/i, label: "live activation" },
  {
    pattern: /mode:\s*["']response_enabled_live["']/i,
    label: "response_enabled_live as active default",
  },
  { pattern: /\+52\d{8,}/, label: "raw phone number (+52...)" },
  { pattern: /\bsk-[a-zA-Z0-9]{10,}/, label: "sk- secret" },
  { pattern: /\bghp_[a-zA-Z0-9]{10,}/, label: "ghp_ secret" },
  { pattern: /\bxoxb-[a-zA-Z0-9-]{10,}/, label: "xoxb- secret" },
  { pattern: /\beyJ[a-zA-Z0-9_-]{20,}/, label: "JWT-like secret" },
  { pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/, label: "SUPABASE_SERVICE_ROLE_KEY value" },
  { pattern: /GHL.*private.*token/i, label: "GHL private token" },
  { pattern: /YCLOUD.*API.*key\s*=\s*\S+/i, label: "YCLOUD API key value" },
];

let passed = 0;
let failed = 0;

function assert(name, ok, detail = "") {
  if (ok) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.log(`  FAIL  ${name}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

console.log("CONSOLE-4 — Eva vertical connector contract validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const doc = read("docs/console-4-eva-vertical-connector-contract.md");
console.log("\nContract doc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(`doc: "${phrase}"`, doc.includes(phrase));
}

const types = read("src/types/vertical-connectors/eva-vertical-contract.ts");
console.log("\nTypes file phrases:");
for (const phrase of TYPES_PHRASES) {
  assert(`types: "${phrase}"`, types.includes(phrase));
}

const fixture = read("src/lib/vertical-connectors/eva/eva-unilatino.mock.ts");
console.log("\nFixture phrases:");
for (const phrase of FIXTURE_PHRASES) {
  assert(`fixture: "${phrase}"`, fixture.includes(phrase));
}

const connector = read(
  "src/lib/vertical-connectors/eva/eva-vertical-connector.mock.ts",
);
console.log("\nConnector mock methods:");
for (const phrase of CONNECTOR_PHRASES) {
  assert(`connector: "${phrase}"`, connector.includes(phrase));
}

console.log("\nConnector mock forbidden (must NOT appear):");
for (const term of CONNECTOR_FORBIDDEN) {
  assert(`connector: no ${term}`, !connector.toLowerCase().includes(term));
}

const index = read("src/lib/vertical-connectors/eva/index.ts");
console.log("\nIndex exports:");
for (const phrase of INDEX_PHRASES) {
  assert(`index: "${phrase}"`, index.includes(phrase));
}

const reviewText = [doc, types, fixture, connector, index].join("\n");
console.log("\nForbidden patterns across CONSOLE-4 files:");
for (const { pattern, label } of FORBIDDEN_PATTERNS) {
  assert(`does not contain ${label}`, !pattern.test(reviewText));
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
