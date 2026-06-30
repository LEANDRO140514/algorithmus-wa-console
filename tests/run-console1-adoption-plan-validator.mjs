#!/usr/bin/env node
/**
 * CONSOLE-1 — Adoption plan document validator (read-only).
 * Usage: node tests/run-console1-adoption-plan-validator.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLAN_PATH = path.join(ROOT, "docs/console-1-algorithmus-wa-console-adoption-plan.md");

const REQUIRED_PHRASES = [
  "algorithmus-wa-console",
  "wa-agent-unilatino",
  "whatsapp-saas",
  "InsForge",
  "Supabase",
  "Supabase → InsForge",
  "backend heredado/transicional",
  "Fork y evolucionar",
  "KEEP",
  "WRAP",
  "REPLACE",
  "DEFER",
  "DISABLE",
  "Vertical connector contract v0",
  "Webhook routing",
  "Eva primero",
  "Consola observa",
  "decision-engine",
  "OpenRouter",
  "pgvector",
  "CAG",
  "RAG productivo NO",
  "CONSOLE-2",
  "no curdeeclau-monorepo",
  "No usar curdeeclau-monorepo",
];

const FORBIDDEN_RECOMMENDATIONS = [
  { pattern: /usar\s+curdeeclau-monorepo/i, label: "usar curdeeclau-monorepo" },
  { pattern: /entrar\s+a\s+curdeeclau-monorepo/i, label: "entrar a curdeeclau-monorepo" },
  { pattern: /activar\s+live\s+directamente/i, label: "activar live directamente" },
  {
    pattern: /usar\s+(el\s+)?decision-engine\s+(de\s+)?whatsapp-saas\s+para\s+Eva/i,
    label: "usar whatsapp-saas decision-engine para Eva",
  },
  {
    pattern: /migrar\s+todo\s+Supabase\s+de\s+golpe/i,
    label: "migrar todo Supabase de golpe",
  },
  {
    pattern: /conectar\s+doble\s+webhook/i,
    label: "conectar doble webhook",
  },
  {
    pattern: /activar\s+RAG\s+productivo\s+de\s+Eva/i,
    label: "activar RAG productivo de Eva",
  },
];

function hasForbiddenAsRecommendation(content, pattern) {
  const re = new RegExp(pattern.source, pattern.flags.includes("i") ? "gi" : "g");
  let match;
  while ((match = re.exec(content)) !== null) {
    const before = content.slice(Math.max(0, match.index - 28), match.index).toLowerCase();
    if (!/\b(no|sin|not|never|prohibid|evitar|❌)\b[\s.:,*-]*$/i.test(before)) {
      return true;
    }
  }
  return false;
}

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

console.log("CONSOLE-1 — adoption plan validator\n");

if (!fs.existsSync(PLAN_PATH)) {
  console.log(`  FAIL  plan missing: ${PLAN_PATH}`);
  process.exit(1);
}

const content = fs.readFileSync(PLAN_PATH, "utf8");

console.log("Required phrases:");
for (const phrase of REQUIRED_PHRASES) {
  const found =
    content.includes(phrase) ||
    content.toLowerCase().includes(phrase.toLowerCase());
  assert(`contains "${phrase}"`, found);
}

console.log("\nForbidden recommendations:");
for (const { pattern, label } of FORBIDDEN_RECOMMENDATIONS) {
  const match = hasForbiddenAsRecommendation(content, pattern);
  assert(`does not recommend ${label}`, !match, match ? "found as recommendation" : "");
}

console.log("\nStructural checks:");
assert("has keep/wrap/replace table", /KEEP.*WRAP.*REPLACE/s.test(content) || /2\.4/.test(content));
assert("has Supabase migration phases S0", /Fase S0/.test(content));
assert("has MVP section", /2\.10 MVP/.test(content));
assert("has fork checklist", /2\.13 Decision checklist/.test(content));
assert("recommends option B", /B\. Fork y evolucionar.*Recomendado/s.test(content));

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
