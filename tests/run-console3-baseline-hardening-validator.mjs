#!/usr/bin/env node
/**
 * CONSOLE-3 — Baseline hardening validator (read-only).
 * Usage: node tests/run-console3-baseline-hardening-validator.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "README.md",
  "docs/console-0-whatsapp-saas-audit.md",
  "docs/console-1-algorithmus-wa-console-adoption-plan.md",
  "docs/console-2-fork-rename-baseline.md",
  "docs/console-3-repository-baseline-hardening.md",
  "docs/console-env-safety.md",
  "tests/run-console1-adoption-plan-validator.mjs",
  "tests/run-console2-fork-baseline-validator.mjs",
];

const README_PHRASES = [
  "Algorithmus WA Console",
  "Forked from",
  "wa-agent-unilatino",
  "Supabase",
  "InsForge",
  "No double webhook",
  "No native decision-engine for Eva",
];

const CONSOLE3_PHRASES = [
  "No functional change",
  "Console observes",
  "Vertical decides",
  "Eva first",
  "Read-only vertical connector",
  "Supabase remains inherited/transitional",
  "InsForge-first",
  "No duplicate inbound processing",
  "CONSOLE-4",
];

const ENV_SAFETY_PHRASES = [
  "Do not commit secrets",
  ".env",
  ".env.example",
  "Supabase",
  "InsForge",
  "YCloud",
  "OpenRouter",
  "GHL",
  "No double webhook",
];

const FORBIDDEN_RECOMMENDATIONS = [
  { pattern: /activating\s+live/i, label: "activating live" },
  { pattern: /running\s+migrations/i, label: "running migrations" },
  {
    pattern: /use\s+(the\s+)?native\s+decision-engine\s+for\s+Eva/i,
    label: "using native decision-engine for Eva",
  },
  {
    pattern: /(?:usar|use|entrar\s+a)\s+curdeeclau-monorepo/i,
    label: "curdeeclau-monorepo",
  },
  {
    pattern: /turn(?:ing)?\s+on\s+LLM\/RAG\s+for\s+Eva/i,
    label: "turning on LLM/RAG for Eva",
  },
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

console.log("CONSOLE-3 — baseline hardening validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const readme = read("README.md");
console.log("\nREADME phrases:");
for (const phrase of README_PHRASES) {
  assert(`README: "${phrase}"`, readme.includes(phrase));
}

const console3 = read("docs/console-3-repository-baseline-hardening.md");
console.log("\nCONSOLE-3 doc phrases:");
for (const phrase of CONSOLE3_PHRASES) {
  assert(`console-3: "${phrase}"`, console3.includes(phrase));
}

const envSafety = read("docs/console-env-safety.md");
console.log("\nEnv safety doc phrases:");
for (const phrase of ENV_SAFETY_PHRASES) {
  assert(`env-safety: "${phrase}"`, envSafety.includes(phrase));
}

const reviewText = [readme, console3, envSafety].join("\n");
console.log("\nForbidden recommendations (must NOT appear):");
for (const { pattern, label } of FORBIDDEN_RECOMMENDATIONS) {
  assert(`does not recommend ${label}`, !pattern.test(reviewText));
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
