#!/usr/bin/env node
/**
 * CONSOLE-2 — Fork baseline validator (read-only).
 * Usage: node tests/run-console2-fork-baseline-validator.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-0-whatsapp-saas-audit.md",
  "docs/console-1-algorithmus-wa-console-adoption-plan.md",
  "docs/console-2-fork-rename-baseline.md",
  "tests/run-console1-adoption-plan-validator.mjs",
  "tests/run-console2-fork-baseline-validator.mjs",
];

const DOC_TERMS = [
  "algorithmus-wa-console",
  "wa-agent-unilatino",
  "whatsapp-saas",
  "Supabase",
  "InsForge",
  "backend heredado",
  "control plane",
  "Eva primero",
  "No doble webhook",
  "CONSOLE-3",
];

const CONSOLE2_PHRASES = [
  "No se modificó funcionalidad",
  "No se instalaron dependencias",
  "No se ejecutaron migraciones",
  "No se tocó producción",
  "No se tocó wa-agent-unilatino",
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

console.log("CONSOLE-2 — fork baseline validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  const full = path.join(ROOT, rel);
  assert(rel, fs.existsSync(full), fs.existsSync(full) ? "" : "missing");
}

const allDocs = REQUIRED_FILES.filter((f) => f.startsWith("docs/")).map((f) =>
  fs.readFileSync(path.join(ROOT, f), "utf8"),
);
const combined = allDocs.join("\n");

console.log("\nKey terms across docs:");
for (const term of DOC_TERMS) {
  assert(
    `contains "${term}"`,
    combined.includes(term) || combined.toLowerCase().includes(term.toLowerCase()),
  );
}

const console2 = fs.readFileSync(
  path.join(ROOT, "docs/console-2-fork-rename-baseline.md"),
  "utf8",
);

console.log("\nCONSOLE-2 baseline phrases:");
for (const phrase of CONSOLE2_PHRASES) {
  assert(`console-2: "${phrase}"`, console2.includes(phrase));
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
