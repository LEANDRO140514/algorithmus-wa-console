#!/usr/bin/env node
/**
 * CONSOLE-7 — Vertical registry mock validator (read-only).
 * Usage: node tests/run-console7-vertical-registry-validator.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-7-vertical-registry-mock.md",
  "src/types/verticals/vertical-registry.ts",
  "src/lib/verticals/vertical-registry.mock.ts",
  "src/lib/verticals/index.ts",
  "tests/run-console7-vertical-registry-validator.mjs",
];

const DOC_PHRASES = [
  "CONSOLE-7",
  "Vertical registry mock",
  "multi-vertical",
  "eva-wa-unilatino",
  "universidad-latino",
  "wa-agent-unilatino",
  "ycloud",
  "ghl",
  "InsForge",
  "mock",
  "read-only",
  "No API calls reales",
  "No webhook routing",
  "No Supabase migration",
  "No InsForge writes",
  "No live controls",
  "No flag writes",
  "CONSOLE-8",
  "Vertical registry list mock UI",
];

const TYPES_PHRASES = [
  "VerticalRegistryEntry",
  "VerticalRegistry",
  "VerticalDataMode",
  "VerticalConnectionMode",
  "VerticalConsoleStatus",
  '"eva-wa-unilatino"',
  '"universidad-latino"',
  '"mock"',
  '"mock_connector"',
  '"mock_readonly"',
  '"insforge"',
];

const MOCK_PHRASES = [
  "VERTICAL_REGISTRY_MOCK",
  "listVerticalRegistryEntries",
  "getVerticalRegistryEntry",
  "getVerticalRegistryEntriesByTenant",
  "getEvaVerticalRegistryEntry",
  "Eva WA Universidad Latino",
  '"/verticals/eva/status"',
  "live_controls",
  "flag_writes",
  "canActivateLive: false",
  "canChangeWebhook: false",
  "canAccessSecrets: false",
  "containsPii: false",
];

const FORBIDDEN_PATTERNS = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  { pattern: /\bcreateClient\b/, label: "createClient" },
  { pattern: /\bsupabase\b/i, label: "supabase" },
  { pattern: /\bprocess\.env\b/, label: "process.env" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bdocument\.cookie\b/, label: "document.cookie" },
  { pattern: /\bPOST\b/, label: "POST" },
  { pattern: /\bPUT\b/, label: "PUT" },
  { pattern: /\bDELETE\b/, label: "DELETE" },
  { pattern: /\blive\s+activation\b/i, label: "live activation" },
  { pattern: /\benableLive\b/, label: "enableLive" },
  { pattern: /\benableCag\b/, label: "enableCag" },
  { pattern: /\benableLLM\b/, label: "enableLLM" },
  { pattern: /\benableRag\b/i, label: "enableRag" },
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

const GIT_DIFF_FORBIDDEN = [
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "middleware.ts",
  "src/middleware.ts",
  "src/app/verticals/eva/status/page.tsx",
  "src/components/verticals/eva/EvaStatusPanel.tsx",
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

console.log("CONSOLE-7 — vertical registry mock validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const doc = read("docs/console-7-vertical-registry-mock.md");
console.log("\nDoc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(
    `doc: "${phrase}"`,
    doc.includes(phrase) || doc.toLowerCase().includes(phrase.toLowerCase()),
  );
}

const types = read("src/types/verticals/vertical-registry.ts");
console.log("\nTypes file phrases:");
for (const phrase of TYPES_PHRASES) {
  assert(`types: "${phrase}"`, types.includes(phrase));
}

const mock = read("src/lib/verticals/vertical-registry.mock.ts");
const index = read("src/lib/verticals/index.ts");
const reviewText = `${mock}\n${index}`;

console.log("\nMock registry phrases:");
for (const phrase of MOCK_PHRASES) {
  assert(`mock: "${phrase}"`, reviewText.includes(phrase));
}

console.log("\nRegistry forbidden (must NOT appear):");
for (const { pattern, label } of FORBIDDEN_PATTERNS) {
  assert(`registry: no ${label}`, !pattern.test(reviewText));
}

console.log("\nSecret / PII patterns:");
for (const { pattern, label } of SECRET_PATTERNS) {
  assert(`does not contain ${label}`, !pattern.test(`${doc}\n${types}\n${reviewText}`));
}

console.log("\nGit diff scope:");
try {
  const diffNames = execSync("git diff --name-only", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const changed = diffNames ? diffNames.split(/\r?\n/).filter(Boolean) : [];

  for (const forbidden of GIT_DIFF_FORBIDDEN) {
    assert(`${forbidden} not in git diff`, !changed.includes(forbidden));
  }

  assert(
    "supabase/ not in git diff",
    !changed.some((f) => f.startsWith("supabase/")),
  );

  assert(
    "no existing API route changes in diff",
    !changed.some((f) => /src\/app\/api\//.test(f)),
  );

  assert(
    "no auth layout/nav changes in diff",
    !changed.some((f) =>
      /middleware|\/\(auth\)\/|\/\(main\)\/layout|nav/i.test(f),
    ),
  );
} catch {
  console.log("  WARN  could not run git diff --name-only (skipped)");
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
