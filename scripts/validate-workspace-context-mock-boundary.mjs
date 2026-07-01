#!/usr/bin/env node
/**
 * CONSOLE-13 — Workspace context mock boundary validator.
 * Usage: node scripts/validate-workspace-context-mock-boundary.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TYPES_PATH = path.join(ROOT, "src/types/workspaces/workspace-context.ts");
const MOCK_PATH = path.join(ROOT, "src/lib/workspaces/workspace-context.mock.ts");
const INDEX_PATH = path.join(ROOT, "src/lib/workspaces/index.ts");
const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const DOC_PATH = path.join(
  ROOT,
  "docs/console-13-workspace-context-mock-boundary.md",
);

const FORBIDDEN_ROUTE_DIRS = [
  "src/app/workspaces",
  "src/app/agency/verticals",
];

const FORBIDDEN_IMPORT_PATTERNS = [
  { pattern: /from\s+['"]@?supabase/i, label: "supabase import" },
  { pattern: /\bcreateClient\s*\(/, label: "createClient(" },
  { pattern: /from\s+['"]next\/auth['"]/, label: "next/auth import" },
  { pattern: /\bcookies\s*\(/, label: "cookies()" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bdocument\.cookie\b/, label: "document.cookie" },
  { pattern: /\bgetSession\s*\(/, label: "getSession(" },
  { pattern: /\buseSession\s*\(/, label: "useSession(" },
];

const FORBIDDEN_COMPONENT_PATTERNS = [
  ...FORBIDDEN_IMPORT_PATTERNS,
  { pattern: /href=["']\/workspaces\//, label: "href to /workspaces/" },
  { pattern: /href=["']\/agency\/verticals\//, label: "href to /agency/verticals/" },
  { pattern: /<button\b/i, label: "<button>" },
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function readFileOrFail(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} not found`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function scanForbidden(content, patterns, scope) {
  for (const { pattern, label } of patterns) {
    if (pattern.test(content)) {
      fail(`${scope} contains forbidden pattern: ${label}`);
    }
  }
}

function validateTypes() {
  const types = readFileOrFail(TYPES_PATH, "workspace-context.ts");
  if (!types) {
    return;
  }

  for (const phrase of [
    "WorkspaceContext",
    "WorkspaceContextMode",
    "WorkspaceContextTenant",
    "WorkspaceContextWorkspace",
    "WorkspaceContextVerticalAccess",
    "WorkspaceContextRouteParams",
    "isMock: true",
    "isReadOnly: true",
  ]) {
    if (!types.includes(phrase)) {
      fail(`Types missing required symbol: ${phrase}`);
    }
  }

  scanForbidden(types, FORBIDDEN_IMPORT_PATTERNS, "workspace-context types");
}

function validateMock() {
  const mock = readFileOrFail(MOCK_PATH, "workspace-context.mock.ts");
  if (!mock) {
    return;
  }

  for (const phrase of [
    "MOCK_WORKSPACE_CONTEXT",
    "getMockWorkspaceContext",
    "getMockVerticalRouteParams",
    'tenantId: "demo-tenant"',
    'workspaceId: "demo-workspace"',
    'verticalId: "eva"',
    "isMock: true",
    "isReadOnly: true",
    "Universidad Latino",
    "Admisiones Universidad Latino",
    "eva-wa-unilatino",
  ]) {
    if (!mock.includes(phrase)) {
      fail(`Mock missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(mock, FORBIDDEN_IMPORT_PATTERNS, "workspace-context mock");
}

function validateIndex() {
  const index = readFileOrFail(INDEX_PATH, "lib/workspaces/index.ts");
  if (!index) {
    return;
  }

  for (const phrase of [
    "getMockWorkspaceContext",
    "MOCK_WORKSPACE_CONTEXT",
    "workspace-context.mock",
  ]) {
    if (!index.includes(phrase)) {
      fail(`workspaces index missing: ${phrase}`);
    }
  }
}

function validateComponent() {
  const component = readFileOrFail(COMPONENT_PATH, "VerticalRegistryList.tsx");
  if (!component) {
    return;
  }

  for (const phrase of [
    "getMockWorkspaceContext",
    "workspaceContext.routeParams",
    "buildVerticalRoutePreview",
    "Context preview",
    'label="Read-only"',
    'label="Mock"',
    "href={entry.statusPanelPath}",
    "Open mock status panel",
    "Preview-only route resolution. Future paths are declarative only — not navigable.",
  ]) {
    if (!component.includes(phrase)) {
      fail(`Component missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(component, FORBIDDEN_COMPONENT_PATTERNS, "VerticalRegistryList");

  const anchorMatches = [...component.matchAll(/<a\b[^>]*href=\{([^}]+)\}/g)];
  for (const match of anchorMatches) {
    if (match[1].trim() !== "entry.statusPanelPath") {
      fail(`Only entry.statusPanelPath may be href, found: ${match[1].trim()}`);
    }
  }
}

function validateDoc() {
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-13 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-13",
    "workspace context mock boundary",
    "read-only",
    "getMockWorkspaceContext",
    "routeParams",
    "CONSOLE-13 crea un workspace context mock/read-only",
    "CONSOLE-13 no activa workspace real",
    "CONSOLE-13 no lee sesión real",
    "CONSOLE-13 no usa Supabase",
    "CONSOLE-13 no crea rutas tenant-aware reales",
    "CONSOLE-13 no crea navegación productiva",
    "CONSOLE-13 no mueve /verticals",
    "CONSOLE-13 no toca middleware, auth, layout ni nav global",
    "CONSOLE-13 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
  ]) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validateForbiddenRoutes() {
  for (const rel of FORBIDDEN_ROUTE_DIRS) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      fail(`Forbidden productive route directory exists: ${rel}`);
    }
  }
}

console.log("CONSOLE-13 — workspace context mock boundary validator\n");

validateTypes();
validateMock();
validateIndex();
validateComponent();
validateDoc();
validateForbiddenRoutes();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-13 workspace context mock boundary validation PASS");
