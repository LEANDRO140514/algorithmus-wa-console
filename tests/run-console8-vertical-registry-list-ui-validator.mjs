#!/usr/bin/env node
/**
 * CONSOLE-8 — Vertical registry list mock UI validator (read-only).
 * Usage: node tests/run-console8-vertical-registry-list-ui-validator.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-8-vertical-registry-list-mock-ui.md",
  "src/components/verticals/VerticalRegistryList.tsx",
  "src/app/verticals/page.tsx",
  "tests/run-console8-vertical-registry-list-ui-validator.mjs",
];

const DOC_PHRASES = [
  "CONSOLE-8",
  "Vertical registry list mock UI",
  "listVerticalRegistryEntries",
  "VERTICAL_REGISTRY_MOCK",
  "mock",
  "read-only",
  "eva-wa-unilatino",
  "universidad-latino",
  "wa-agent-unilatino",
  "InsForge",
  "YCloud",
  "GHL",
  "No API calls reales",
  "No webhook routing",
  "No Supabase migration",
  "No InsForge writes",
  "No live controls",
  "No flag writes",
  "No navigation global wiring",
  "CONSOLE-9",
  "Tenant-aware vertical route design",
];

const COMPONENT_PHRASES = [
  "VerticalRegistryList",
  "listVerticalRegistryEntries",
  "Vertical Registry",
  "Mock read-only data",
  "No live controls",
  "Console observes",
  "Verticals decide",
  "Live controls blocked",
  "Flag writes blocked",
  "No production services are called",
  "statusPanelPath",
  "Open mock status panel",
  "canActivateLive",
  "canChangeWebhook",
  "canAccessSecrets",
  "containsPii",
];

const PAGE_PHRASES = [
  "Verticals — Mock Registry",
  "VerticalRegistryList",
  "mock read-only registry data",
  "does not call production services",
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
  { pattern: /\bsetFlag\b/, label: "setFlag" },
  { pattern: /\bupdateFlag\b/, label: "updateFlag" },
  { pattern: /\bmutate\b/, label: "mutate" },
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

console.log("CONSOLE-8 — vertical registry list UI validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const indexPath = "src/components/verticals/index.ts";
console.log("\nOptional index export:");
if (fs.existsSync(path.join(ROOT, indexPath))) {
  const index = read(indexPath);
  assert("index exports VerticalRegistryList", index.includes("VerticalRegistryList"));
} else {
  console.log("  SKIP  index.ts not present");
}

const doc = read("docs/console-8-vertical-registry-list-mock-ui.md");
console.log("\nDoc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(
    `doc: "${phrase}"`,
    doc.includes(phrase) || doc.toLowerCase().includes(phrase.toLowerCase()),
  );
}

const component = read("src/components/verticals/VerticalRegistryList.tsx");
const page = read("src/app/verticals/page.tsx");
const combined = `${component}\n${page}`;

console.log("\nComponent phrases:");
for (const phrase of COMPONENT_PHRASES) {
  assert(`component: "${phrase}"`, component.includes(phrase));
}

console.log("\nPage phrases:");
for (const phrase of PAGE_PHRASES) {
  assert(`page: "${phrase}"`, page.includes(phrase));
}

console.log("\nComponent/page forbidden (must NOT appear):");
for (const { pattern, label } of FORBIDDEN_PATTERNS) {
  assert(`combined: no ${label}`, !pattern.test(combined));
}

console.log("\nSecret / PII patterns:");
for (const { pattern, label } of SECRET_PATTERNS) {
  assert(`does not contain ${label}`, !pattern.test(`${doc}\n${combined}`));
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
      /middleware|\/\(auth\)\/|\/\(main\)\/layout/i.test(f),
    ),
  );
} catch {
  console.log("  WARN  could not run git diff --name-only (skipped)");
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
