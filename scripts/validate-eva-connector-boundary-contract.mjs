#!/usr/bin/env node
/**
 * CONSOLE-19 — Eva connector boundary real contract validator.
 * Usage: node scripts/validate-eva-connector-boundary-contract.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TYPES_PATH = path.join(ROOT, "src/types/eva/eva-connector.ts");
const MOCK_PATH = path.join(ROOT, "src/lib/eva/eva-connector.mock.ts");
const INDEX_PATH = path.join(ROOT, "src/lib/eva/index.ts");
const DOC_PATH = path.join(
  ROOT,
  "docs/console-19-eva-connector-boundary-real-contract.md",
);
const VALIDATOR_PATH = path.join(
  ROOT,
  "scripts/validate-eva-connector-boundary-contract.mjs",
);

const FORBIDDEN_PATTERNS = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  {
    pattern: /https?:\/\/[^\s"']*insforge/i,
    label: "real InsForge URL",
  },
  {
    pattern: /https?:\/\/[^\s"']*ycloud/i,
    label: "real YCloud URL",
  },
  {
    pattern: /https?:\/\/[^\s"']*gohighlevel|https?:\/\/[^\s"']*ghl/i,
    label: "real GHL URL",
  },
];

const REQUIRED_CANNOT_WRITE = [
  "whatsapp_outbound",
  "ghl_contacts",
  "ghl_tasks",
  "insforge_runtime",
  "ycloud_config",
  "source_of_truth",
  "eva_decisions",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function readFileOrFail(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} not found: ${relative(filePath)}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function assertIncludes(content, needle, label) {
  if (!content.includes(needle)) {
    fail(`${label} missing required value: ${needle}`);
  }
}

function scanForbidden(content, scope) {
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      fail(`${scope} contains forbidden pattern: ${label}`);
    }
  }
}

function gitDiffIncludes(fileName) {
  try {
    const out = execSync("git diff HEAD --name-only", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const staged = execSync("git diff --cached --name-only", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const combined = `${out}\n${staged}`;
    return combined
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .includes(fileName);
  } catch {
    return false;
  }
}

console.log("CONSOLE-19 — Eva connector boundary real contract validator\n");

const typesContent = readFileOrFail(TYPES_PATH, "Types file");
const mockContent = readFileOrFail(MOCK_PATH, "Mock file");
const indexContent = readFileOrFail(INDEX_PATH, "Index file");
readFileOrFail(DOC_PATH, "Doc file");
readFileOrFail(VALIDATOR_PATH, "Validator file");

if (mockContent) {
  assertIncludes(mockContent, '"eva-wa-unilatino"', "Mock");
  assertIncludes(mockContent, 'runtimeOwner: "wa-agent-unilatino"', "Mock");
  assertIncludes(mockContent, 'consoleRole: "observe_supervise"', "Mock");
  assertIncludes(mockContent, 'verticalRole: "decide_respond_sync"', "Mock");
  assertIncludes(mockContent, "liveCallsEnabled: false", "Mock");
  assertIncludes(mockContent, "isMock: true", "Mock");
  assertIncludes(mockContent, "isReadOnly: true", "Mock");
  assertIncludes(
    mockContent,
    'reason: "eva_connector_boundary_real_contract_mock"',
    "Mock",
  );

  for (const scope of REQUIRED_CANNOT_WRITE) {
    assertIncludes(mockContent, `"${scope}"`, `Mock cannotWrite`);
  }

  if (!mockContent.includes("export function getEvaConnectorBoundaryStatus")) {
    fail("Mock missing getEvaConnectorBoundaryStatus()");
  }
}

if (indexContent) {
  assertIncludes(indexContent, "getEvaConnectorBoundaryStatus", "Index");
  assertIncludes(indexContent, "EVA_CONNECTOR_BOUNDARY_MOCK", "Index");
}

if (typesContent) {
  assertIncludes(typesContent, "EvaConnectorBoundaryStatus", "Types");
  assertIncludes(typesContent, "canRead", "Types");
  assertIncludes(typesContent, "cannotRead", "Types");
  assertIncludes(typesContent, "cannotWrite", "Types");
}

const combinedEvaLib = `${typesContent}\n${mockContent}\n${indexContent}`;
scanForbidden(combinedEvaLib, "Eva connector boundary files");

if (fs.existsSync(path.join(ROOT, ".env.local"))) {
  fail(".env.local exists — must not be created in CONSOLE-19");
}

if (gitDiffIncludes("package.json")) {
  fail("package.json was modified");
}

if (gitDiffIncludes("package-lock.json")) {
  fail("package-lock.json was modified");
}

if (errors.length > 0) {
  console.error("Failures:");
  for (const message of errors) {
    console.error(`  FAIL  ${message}`);
  }
  console.error(`\nResult: ${errors.length} failed`);
  process.exit(1);
}

console.log("  PASS  src/types/eva/eva-connector.ts exists");
console.log("  PASS  src/lib/eva/eva-connector.mock.ts exists");
console.log("  PASS  src/lib/eva/index.ts exists");
console.log("  PASS  docs/console-19-eva-connector-boundary-real-contract.md exists");
console.log("  PASS  verticalId eva-wa-unilatino");
console.log("  PASS  runtimeOwner wa-agent-unilatino");
console.log("  PASS  consoleRole observe_supervise");
console.log("  PASS  verticalRole decide_respond_sync");
console.log("  PASS  liveCallsEnabled false");
console.log("  PASS  isMock true / isReadOnly true");
console.log("  PASS  cannotWrite scopes");
console.log("  PASS  no fetch/axios/real service URLs");
console.log("  PASS  no .env.local");
console.log("  PASS  package.json not modified");
console.log("  PASS  package-lock.json not modified");
console.log("\nCONSOLE-19 eva connector boundary contract validation PASS");
