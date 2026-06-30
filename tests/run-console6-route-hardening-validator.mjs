#!/usr/bin/env node
/**
 * CONSOLE-6 — Eva status route hardening validator (read-only).
 * Usage: node tests/run-console6-route-hardening-validator.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-6-eva-status-route-hardening-review.md",
  "src/app/verticals/eva/status/page.tsx",
  "src/components/verticals/eva/EvaStatusPanel.tsx",
  "tests/run-console6-route-hardening-validator.mjs",
];

const DOC_PHRASES = [
  "CONSOLE-6",
  "/verticals/eva/status",
  "src/app/verticals/eva/status/page.tsx",
  "App Router",
  "route groups",
  "(main)",
  "(auth)",
  "(agency)",
  "mock",
  "read-only",
  "createEvaVerticalMockConnector",
  "No producción",
  "No API real",
  "No live controls",
  "No navegación global",
  "middleware",
  "auth",
  "tenant-aware",
  "agency-aware",
  "CONSOLE-7",
  "Vertical registry mock",
];

const PAGE_COMPONENT_PHRASES = [
  "Eva WA Status",
  "Mock",
  "read-only",
  "No live controls",
  "createEvaVerticalMockConnector",
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

console.log("CONSOLE-6 — route hardening validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const doc = read("docs/console-6-eva-status-route-hardening-review.md");
console.log("\nDoc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(
    `doc: "${phrase}"`,
    doc.includes(phrase) || doc.toLowerCase().includes(phrase.toLowerCase()),
  );
}

const page = read("src/app/verticals/eva/status/page.tsx");
const component = read("src/components/verticals/eva/EvaStatusPanel.tsx");
const combined = `${page}\n${component}`;

console.log("\nPage/component phrases (combined):");
for (const phrase of PAGE_COMPONENT_PHRASES) {
  assert(
    `page+component: "${phrase}"`,
    combined.includes(phrase) || combined.includes(phrase.replace("read-only", "Read-only")),
  );
}

console.log("\nPage/component forbidden (must NOT appear):");
for (const { pattern, label } of FORBIDDEN_PATTERNS) {
  assert(`page+component: no ${label}`, !pattern.test(combined));
}

console.log("\nSecret / PII patterns:");
for (const { pattern, label } of SECRET_PATTERNS) {
  assert(`does not contain ${label}`, !pattern.test(combined));
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
} catch {
  console.log("  WARN  could not run git diff --name-only (skipped)");
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
