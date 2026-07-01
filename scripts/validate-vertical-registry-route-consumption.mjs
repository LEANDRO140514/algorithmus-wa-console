#!/usr/bin/env node
/**
 * CONSOLE-11 — Vertical registry route metadata consumption validator.
 * Usage: node scripts/validate-vertical-registry-route-consumption.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const DOC_PATH = path.join(
  ROOT,
  "docs/console-11-registry-route-metadata-consumption-preview.md",
);

const REQUIRED_UI_PHRASES = [
  "RouteMetadataPreview",
  "routeMetadata",
  "VerticalRouteMetadata",
  "routeMode",
  "visibility",
  "previewStatusPanelPath",
  "workspaceStatusPanelPath",
  "agencyStatusPanelPath",
  "preview route",
  "workspace route (future)",
  "agency route (future)",
  "tenant-aware",
  "workspace-aware",
  "agency-aware",
  "allowedRoles",
  "routeSurface",
  "declarative only — not navigable",
  "Open mock status panel",
  "statusPanelPath",
  "href={entry.statusPanelPath}",
];

const REQUIRED_DOC_PHRASES = [
  "CONSOLE-11",
  "route metadata consumption",
  "read-only",
  "routeMetadata",
  "previewStatusPanelPath",
  "workspaceStatusPanelPath",
  "agencyStatusPanelPath",
  "No navigation global",
  "No live controls",
  "CONSOLE-10",
  "CONSOLE-11 consume routeMetadata solo para visualización read-only",
  "CONSOLE-11 no activa rutas tenant-aware reales",
  "CONSOLE-11 no crea navegación productiva",
  "CONSOLE-11 no mueve /verticals",
  "CONSOLE-11 no toca middleware, auth, layout ni nav global",
];

const EVA_PREVIEW_PATH = "/verticals/eva/status";

const FORBIDDEN_ROUTE_FILES = [
  "src/app/workspaces/[workspaceId]/verticals/[verticalId]/status/page.tsx",
  "src/app/agency/verticals/[tenantId]/[verticalId]/status/page.tsx",
];

const FORBIDDEN_COMPONENT_PATTERNS = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  { pattern: /\bcreateClient\b/, label: "createClient" },
  { pattern: /\bsupabase\b/i, label: "supabase" },
  { pattern: /\bprocess\.env\b/, label: "process.env" },
  { pattern: /<button\b/i, label: "<button>" },
  { pattern: /href=\{[^}]*workspaceStatusPanelPath/, label: "href to workspace path" },
  { pattern: /href=\{[^}]*agencyStatusPanelPath/, label: "href to agency path" },
  { pattern: /href=["']\/workspaces\//, label: "href to /workspaces/" },
  {
    pattern: /href=["']\/agency\/verticals\//,
    label: "href to /agency/verticals/",
  },
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function walkAppDir(dir, relative = "") {
  const results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = relative ? `${relative}/${name}` : name;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkAppDir(full, rel));
    } else if (name === "page.tsx" || name === "page.ts") {
      results.push(rel.replace(/\\/g, "/"));
    }
  }
  return results;
}

function validateNoProductiveVerticalRoutes() {
  const appRoot = path.join(ROOT, "src/app");
  const pages = walkAppDir(appRoot, "src/app");

  for (const page of pages) {
    const normalized = page.replace(/^src\/app\//, "");
    const isWorkspaceVertical = /workspaces\/.*\/verticals\//.test(normalized);
    const isAgencyVertical = /agency\/verticals\//.test(normalized);

    if (isWorkspaceVertical || isAgencyVertical) {
      fail(`Forbidden productive vertical route: ${page}`);
    }
  }
}

function validateComponent() {
  if (!fs.existsSync(COMPONENT_PATH)) {
    fail("VerticalRegistryList.tsx not found");
    return;
  }

  const component = fs.readFileSync(COMPONENT_PATH, "utf8");

  for (const phrase of REQUIRED_UI_PHRASES) {
    if (!component.includes(phrase)) {
      fail(`Component missing required phrase: ${phrase}`);
    }
  }

  for (const { pattern, label } of FORBIDDEN_COMPONENT_PATTERNS) {
    if (pattern.test(component)) {
      fail(`Component contains forbidden pattern: ${label}`);
    }
  }

  const anchorMatches = [...component.matchAll(/<a\b[^>]*href=\{([^}]+)\}/g)];
  for (const match of anchorMatches) {
    const hrefExpr = match[1].trim();
    if (
      hrefExpr.includes("workspaceStatusPanelPath") ||
      hrefExpr.includes("agencyStatusPanelPath")
    ) {
      fail(`Navigable anchor must not use future route path: ${hrefExpr}`);
    }
  }

  if (!component.includes("href={entry.statusPanelPath}")) {
    fail("Preview link must use entry.statusPanelPath only");
  }
}

function validateDoc() {
  if (!fs.existsSync(DOC_PATH)) {
    fail("CONSOLE-11 documentation not found");
    return;
  }

  const doc = fs.readFileSync(DOC_PATH, "utf8");
  for (const phrase of REQUIRED_DOC_PHRASES) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validateMockPreviewPath() {
  const mock = read("src/lib/verticals/vertical-registry.mock.ts");
  if (!mock.includes(`previewStatusPanelPath: "${EVA_PREVIEW_PATH}"`)) {
    fail(`Eva previewStatusPanelPath must remain ${EVA_PREVIEW_PATH}`);
  }
  if (!mock.includes(`statusPanelPath: "${EVA_PREVIEW_PATH}"`)) {
    fail(`Eva statusPanelPath must remain ${EVA_PREVIEW_PATH}`);
  }
}

function validateForbiddenRouteFiles() {
  for (const rel of FORBIDDEN_ROUTE_FILES) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      fail(`Forbidden productive route file created: ${rel}`);
    }
  }
}

function validateScope() {
  const forbiddenInDiff = [
    "package.json",
    "package-lock.json",
    "middleware.ts",
    "src/app/layout.tsx",
    "src/app/(main)/layout.tsx",
    "src/app/verticals/page.tsx",
    "src/app/verticals/eva/status/page.tsx",
  ];

  for (const rel of forbiddenInDiff) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) {
      continue;
    }
  }

  validateNoProductiveVerticalRoutes();
}

console.log("CONSOLE-11 — vertical registry route metadata consumption validator\n");

validateComponent();
validateDoc();
validateMockPreviewPath();
validateForbiddenRouteFiles();
validateScope();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-11 registry route metadata consumption validation PASS");
