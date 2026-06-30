#!/usr/bin/env node
/**
 * CONSOLE-9 — Tenant-aware vertical route design validator (read-only).
 * Usage: node tests/run-console9-tenant-route-design-validator.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_FILES = [
  "docs/console-9-tenant-aware-vertical-route-design.md",
  "tests/run-console9-tenant-route-design-validator.mjs",
];

const DOC_PHRASES = [
  "CONSOLE-9",
  "tenant-aware",
  "agency-aware",
  "workspace-aware",
  "/verticals",
  "/verticals/eva/status",
  "/workspaces/[workspaceId]/verticals/[verticalId]/status",
  "/agency/verticals/[tenantId]/[verticalId]/status",
  "route groups",
  "(main)",
  "(auth)",
  "(agency)",
  "middleware",
  "Supabase session middleware",
  "vertical registry",
  "allowedRoles",
  "workspaceStatusPanelPath",
  "agencyStatusPanelPath",
  "No route move",
  "No middleware change",
  "No auth change",
  "No nav global wiring",
  "No API calls reales",
  "No live controls",
  "CONSOLE-10",
  "Registry route metadata extension mock",
];

const FORBIDDEN_RECOMMENDATIONS = [
  {
    pattern: /usar\s+\/verticals\/eva\/status\s+como\s+ruta\s+productiva\s+final/i,
    label: "usar /verticals/eva/status como ruta productiva final",
  },
  {
    pattern: /(?:conectar|usar)\s+doble\s+webhook/i,
    label: "conectar doble webhook",
  },
  {
    pattern: /usar\s+(el\s+)?native\s+decision-engine\s+para\s+Eva/i,
    label: "usar native decision-engine para Eva",
  },
  {
    pattern: /activar\s+LLM\/RAG/i,
    label: "activar LLM/RAG",
  },
  {
    pattern: /activar\s+live\s+controls/i,
    label: "activar live controls",
  },
];

const GIT_DIFF_FORBIDDEN = [
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "middleware.ts",
  "src/middleware.ts",
  "src/app/verticals/page.tsx",
  "src/app/verticals/eva/status/page.tsx",
  "src/components/verticals/VerticalRegistryList.tsx",
  "src/components/verticals/eva/EvaStatusPanel.tsx",
  "src/lib/verticals/vertical-registry.mock.ts",
  "src/types/verticals/vertical-registry.ts",
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

console.log("CONSOLE-9 — tenant route design validator\n");

console.log("Required files:");
for (const rel of REQUIRED_FILES) {
  assert(rel, fs.existsSync(path.join(ROOT, rel)));
}

const doc = read("docs/console-9-tenant-aware-vertical-route-design.md");

console.log("\nDoc phrases:");
for (const phrase of DOC_PHRASES) {
  assert(
    `doc: "${phrase}"`,
    doc.includes(phrase) || doc.toLowerCase().includes(phrase.toLowerCase()),
  );
}

console.log("\nForbidden recommendations (must NOT appear as advice):");
for (const { pattern, label } of FORBIDDEN_RECOMMENDATIONS) {
  assert(`does not recommend ${label}`, !pattern.test(doc));
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

  const allowedNew = [
    "docs/console-9-tenant-aware-vertical-route-design.md",
    "tests/run-console9-tenant-route-design-validator.mjs",
  ];
  const unexpected = changed.filter((f) => !allowedNew.includes(f));
  assert(
    "only CONSOLE-9 files in diff (if any)",
    unexpected.length === 0,
    unexpected.join(", ") || "ok",
  );
} catch {
  console.log("  WARN  could not run git diff --name-only (skipped)");
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
