#!/usr/bin/env node
/**
 * CONSOLE-5 — Eva status panel mock validator (read-only).
 * Usage: node tests/run-console5-eva-status-panel-validator.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-5-eva-status-panel-mock.md",
  "src/components/verticals/eva/EvaStatusPanel.tsx",
  "tests/run-console5-eva-status-panel-validator.mjs",
];

const ROUTE_CANDIDATES = [
  "src/app/verticals/eva/status/page.tsx",
  "app/verticals/eva/status/page.tsx",
  "src/pages/verticals/eva/status.tsx",
  "pages/verticals/eva/status.tsx",
];

const DOC_PHRASES = [
  "CONSOLE-5",
  "mock",
  "read-only",
  "wa-agent-unilatino",
  "createEvaVerticalMockConnector",
  "No API calls reales",
  "No webhook routing",
  "No Supabase migration",
  "No InsForge writes",
  "No live controls",
  "No flag writes",
  "CONSOLE-6",
];

const COMPONENT_PHRASES = [
  "EvaStatusPanel",
  "createEvaVerticalMockConnector",
  "Eva WA Universidad Latino",
  "Read-only",
  "Mock data",
  "No live controls",
  "Eva first",
  "console observes",
  "CAG response disabled",
  "LLM off",
  "RAG productive false",
  "WA_AGENT_MODE",
  "GHL_SYNC_MODE",
  "EVA_CAG_RESPONSE_ENABLED",
  "ragProductive",
  "responseEnabled",
  "canActivateLive",
  "secretsIncluded",
];

const COMPONENT_FORBIDDEN = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  { pattern: /\bcreateClient\b/, label: "createClient" },
  { pattern: /\bsupabase\b/i, label: "supabase" },
  { pattern: /\bprocess\.env\b/, label: "process.env" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bdocument\.cookie\b/, label: "document.cookie" },
  { pattern: /\blive\s+activation\b/i, label: "live activation" },
  { pattern: /\bsetFlag\b/, label: "setFlag" },
  { pattern: /\bupdateFlag\b/, label: "updateFlag" },
  { pattern: /\bmutate\b/, label: "mutate" },
  { pattern: /\bPOST\b/, label: "POST" },
  { pattern: /\bPUT\b/, label: "PUT" },
  { pattern: /\bDELETE\b/, label: "DELETE" },
];

const SECRET_PATTERNS = [
  { pattern: /\+52\d{10,}/, label: "raw MX phone (+52...)" },
  { pattern: /\bsk-[a-zA-Z0-9]{10,}/, label: "sk- secret" },
  { pattern: /\bghp_[a-zA-Z0-9]{10,}/, label: "ghp_ secret" },
  { pattern: /\bxoxb-[a-zA-Z0-9-]{10,}/, label: "xoxb- secret" },
  { pattern: /\beyJ[a-zA-Z0-9_-]{20,}/, label: "JWT-like secret" },
  { pattern: /SUPABASE_SERVICE_ROLE_KEY/, label: "SUPABASE_SERVICE_ROLE_KEY" },
  { pattern: /GHL_PRIVATE/, label: "GHL_PRIVATE" },
  { pattern: /YCLOUD_API/, label: "YCLOUD_API" },
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

console.log("CONSOLE-5 — Eva status panel mock validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const routePath = ROUTE_CANDIDATES.find((r) => fs.existsSync(path.join(ROOT, r)));
console.log("\nDemo route:");
assert(
  "at least one demo route exists",
  Boolean(routePath),
  routePath ?? "none found",
);
if (routePath) {
  assert(`route: ${routePath}`, true);
}

const doc = read("docs/console-5-eva-status-panel-mock.md");
console.log("\nDoc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(
    `doc: "${phrase}"`,
    doc.includes(phrase) || doc.toLowerCase().includes(phrase.toLowerCase()),
  );
}

const component = read("src/components/verticals/eva/EvaStatusPanel.tsx");
console.log("\nComponent phrases:");
for (const phrase of COMPONENT_PHRASES) {
  assert(`component: "${phrase}"`, component.includes(phrase));
}

console.log("\nComponent forbidden (must NOT appear):");
for (const { pattern, label } of COMPONENT_FORBIDDEN) {
  assert(`component: no ${label}`, !pattern.test(component));
}

const reviewFiles = [
  doc,
  component,
  routePath ? read(routePath) : "",
  fs.existsSync(path.join(ROOT, "src/components/verticals/eva/index.ts"))
    ? read("src/components/verticals/eva/index.ts")
    : "",
].join("\n");

console.log("\nSecret / PII patterns (CONSOLE-5 files):");
for (const { pattern, label } of SECRET_PATTERNS) {
  assert(`does not contain ${label}`, !pattern.test(reviewFiles));
}

console.log("\nGit diff scope:");
try {
  const diffNames = execSync("git diff --name-only", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const changed = diffNames ? diffNames.split("\n") : [];
  assert("package.json not in git diff", !changed.includes("package.json"));
  assert(
    "no lockfile in git diff",
    !changed.some((f) =>
      /package-lock|pnpm-lock|yarn\.lock/.test(f),
    ),
  );
} catch {
  console.log("  WARN  could not run git diff --name-only (skipped)");
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
