#!/usr/bin/env node
/**
 * CONSOLE-12 — Vertical route preview contract validator.
 * Usage: node scripts/validate-vertical-route-preview-contract.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CONTRACT_PATH = path.join(
  ROOT,
  "src/lib/verticals/vertical-route-preview.ts",
);
const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const DOC_PATH = path.join(
  ROOT,
  "docs/console-12-tenant-route-preview-contract.md",
);
const INDEX_PATH = path.join(ROOT, "src/lib/verticals/index.ts");

const EVA_WORKSPACE_RESOLVED =
  "/workspaces/demo-workspace/verticals/eva/status";
const EVA_AGENCY_RESOLVED = "/agency/verticals/demo-tenant/eva/status";
const EVA_PREVIEW_PATH = "/verticals/eva/status";

const REQUIRED_CONTRACT_EXPORTS = [
  "DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS",
  "resolveVerticalRoutePath",
  "buildVerticalRoutePreview",
  "isPreviewOnly: true",
  "[workspaceId]",
  "[tenantId]",
  "[verticalId]",
];

const REQUIRED_UI_PHRASES = [
  "buildVerticalRoutePreview",
  "workspace route (future)",
  "workspace route preview",
  "agency route (future)",
  "agency route preview",
  "Preview-only route resolution. Future paths are declarative only — not navigable.",
  "href={entry.statusPanelPath}",
  "Open mock status panel",
];

const REQUIRED_DOC_PHRASES = [
  "CONSOLE-12",
  "tenant route preview contract",
  "resolveVerticalRoutePath",
  "buildVerticalRoutePreview",
  "demo-workspace",
  "demo-tenant",
  "read-only",
  "CONSOLE-12 solo resuelve rutas futuras como strings preview",
  "CONSOLE-12 no crea rutas tenant-aware reales",
  "CONSOLE-12 no crea navegación productiva",
  "CONSOLE-12 no mueve /verticals",
  "CONSOLE-12 no toca middleware, auth, layout ni nav global",
  "CONSOLE-12 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
];

const FORBIDDEN_ROUTE_DIRS = [
  "src/app/workspaces",
  "src/app/agency/verticals",
];

const FORBIDDEN_PATTERNS = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  { pattern: /\bcreateClient\b/, label: "createClient" },
  { pattern: /\bsupabase\b/i, label: "supabase" },
  { pattern: /\bprocess\.env\b/, label: "process.env" },
  { pattern: /<button\b/i, label: "<button>" },
  { pattern: /href=\{[^}]*resolvedWorkspaceStatusPanelPath/, label: "href to resolved workspace path" },
  { pattern: /href=\{[^}]*resolvedAgencyStatusPanelPath/, label: "href to resolved agency path" },
  { pattern: /href=["']\/workspaces\//, label: "href to /workspaces/" },
  { pattern: /href=["']\/agency\/verticals\//, label: "href to /agency/verticals/" },
  { pattern: /\bfrom\s+["']next\/link["']/, label: "next/link import" },
  { pattern: /\buseRouter\b/, label: "useRouter" },
];

const errors = [];

function fail(message) {
  errors.push(message);
}

const DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS = {
  workspaceId: "demo-workspace",
  tenantId: "demo-tenant",
  verticalId: "eva",
};

function resolveVerticalRoutePath(pathValue, params = DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS) {
  if (!pathValue) {
    return undefined;
  }
  const merged = { ...DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS, ...params };
  return pathValue.replace(/\[([^\]]+)\]/g, (_match, key) => {
    const resolved = merged[key];
    return resolved ?? _match;
  });
}

function validateContractFile() {
  if (!fs.existsSync(CONTRACT_PATH)) {
    fail("src/lib/verticals/vertical-route-preview.ts not found");
    return;
  }

  const contract = fs.readFileSync(CONTRACT_PATH, "utf8");

  for (const phrase of REQUIRED_CONTRACT_EXPORTS) {
    if (!contract.includes(phrase)) {
      fail(`Contract missing required symbol: ${phrase}`);
    }
  }

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(contract)) {
      fail(`Contract contains forbidden pattern: ${label}`);
    }
  }
}

function validateResolutionLogic() {
  const workspaceTemplate =
    "/workspaces/[workspaceId]/verticals/[verticalId]/status";
  const agencyTemplate = "/agency/verticals/[tenantId]/[verticalId]/status";

  const resolvedWorkspace = resolveVerticalRoutePath(workspaceTemplate);
  const resolvedAgency = resolveVerticalRoutePath(agencyTemplate);

  if (resolvedWorkspace !== EVA_WORKSPACE_RESOLVED) {
    fail(
      `Workspace resolution expected ${EVA_WORKSPACE_RESOLVED}, got ${resolvedWorkspace}`,
    );
  }

  if (resolvedAgency !== EVA_AGENCY_RESOLVED) {
    fail(
      `Agency resolution expected ${EVA_AGENCY_RESOLVED}, got ${resolvedAgency}`,
    );
  }

  if (!resolvedWorkspace.includes("demo-workspace")) {
    fail("[workspaceId] placeholder was not replaced with demo-workspace");
  }

  if (!resolvedAgency.includes("demo-tenant")) {
    fail("[tenantId] placeholder was not replaced with demo-tenant");
  }

  if (!resolvedWorkspace.endsWith("/eva/status")) {
    fail("[verticalId] placeholder was not replaced with eva in workspace path");
  }

  const preview = resolveVerticalRoutePath(EVA_PREVIEW_PATH);
  if (preview !== EVA_PREVIEW_PATH) {
    fail(`Preview path without placeholders must remain unchanged: ${preview}`);
  }
}

function validateIndexExports() {
  const index = fs.readFileSync(INDEX_PATH, "utf8");
  for (const symbol of [
    "buildVerticalRoutePreview",
    "resolveVerticalRoutePath",
    "vertical-route-preview",
  ]) {
    if (!index.includes(symbol)) {
      fail(`index.ts missing export reference: ${symbol}`);
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

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(component)) {
      fail(`Component contains forbidden pattern: ${label}`);
    }
  }

  const anchorMatches = [...component.matchAll(/<a\b[^>]*href=\{([^}]+)\}/g)];
  for (const match of anchorMatches) {
    const hrefExpr = match[1].trim();
    if (hrefExpr !== "entry.statusPanelPath") {
      fail(`Only entry.statusPanelPath may be used in href, found: ${hrefExpr}`);
    }
  }
}

function validateDoc() {
  if (!fs.existsSync(DOC_PATH)) {
    fail("CONSOLE-12 documentation not found");
    return;
  }

  const doc = fs.readFileSync(DOC_PATH, "utf8");
  for (const phrase of REQUIRED_DOC_PHRASES) {
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

console.log("CONSOLE-12 — vertical route preview contract validator\n");

validateContractFile();
validateResolutionLogic();
validateIndexExports();
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

console.log("CONSOLE-12 vertical route preview contract validation PASS");
