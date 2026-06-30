#!/usr/bin/env node
/**
 * CONSOLE-10 — Vertical registry route metadata validator (read-only).
 * Usage: node scripts/validate-vertical-registry-routes.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MOCK_PATH = path.join(ROOT, "src/lib/verticals/vertical-registry.mock.ts");
const TYPES_PATH = path.join(ROOT, "src/types/verticals/vertical-registry.ts");
const EVA_PREVIEW_PATH = "/verticals/eva/status";

const FORBIDDEN_PRODUCTIVE_ROUTE_PREFIXES = [
  "src/app/workspaces",
  "src/app/(main)/workspaces",
  "src/app/agency/verticals",
  "src/app/(agency)/verticals",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function loadRegistryMock() {
  const src = fs.readFileSync(MOCK_PATH, "utf8");
  const mockTsStart = src.indexOf("const MOCK_TIMESTAMP");
  const evaStart = src.indexOf("const EVA_REGISTRY_ENTRY");
  const registryStart = src.indexOf("export const VERTICAL_REGISTRY_MOCK");
  const registryEnd = src.indexOf("export function listVerticalRegistryEntries");

  if (
    mockTsStart < 0 ||
    evaStart < 0 ||
    registryStart < 0 ||
    registryEnd < 0
  ) {
    fail("Could not locate mock registry blocks in mock file");
    return null;
  }

  const preamble = src.slice(mockTsStart, evaStart);
  const entryBlock = src
    .slice(evaStart, registryStart)
    .replace(
      /const EVA_REGISTRY_ENTRY:\s*VerticalRegistryEntry\s*=/,
      "const EVA_REGISTRY_ENTRY =",
    );
  const registryBlock = src
    .slice(registryStart, registryEnd)
    .replace(
      /export const VERTICAL_REGISTRY_MOCK:\s*VerticalRegistry\s*=/,
      "const VERTICAL_REGISTRY_MOCK =",
    );

  const executable = `${preamble}\n${entryBlock}\n${registryBlock}\nreturn VERTICAL_REGISTRY_MOCK;`;

  try {
    return new Function(executable)();
  } catch (error) {
    fail(`Failed to evaluate mock registry: ${error.message}`);
    return null;
  }
}

function hasParamReference(meta, key) {
  const params = meta.routeParams ?? {};
  if (params[key]) {
    return true;
  }
  const agencyPath = meta.agencyStatusPanelPath ?? "";
  const workspacePath = meta.workspaceStatusPanelPath ?? "";
  const token = `[${key}]`;
  return agencyPath.includes(token) || workspacePath.includes(token);
}

function validateEntry(entry, index) {
  const label = entry.verticalId ?? `entries[${index}]`;

  if (!entry.routeMetadata) {
    fail(`${label}: missing routeMetadata`);
    return;
  }

  const meta = entry.routeMetadata;

  if (meta.routeMode === "preview" || meta.routeMode === "hybrid") {
    if (!meta.previewStatusPanelPath) {
      fail(
        `${label}: previewStatusPanelPath required when routeMode is ${meta.routeMode}`,
      );
    }
  }

  if (meta.tenantAware && !hasParamReference(meta, "tenantId")) {
    fail(
      `${label}: tenantAware=true but tenantId missing from routeParams and agency path`,
    );
  }

  if (meta.workspaceAware && !hasParamReference(meta, "workspaceId")) {
    fail(
      `${label}: workspaceAware=true but workspaceId missing from routeParams and workspace path`,
    );
  }

  if (meta.agencyAware && !meta.agencyStatusPanelPath) {
    fail(`${label}: agencyAware=true but agencyStatusPanelPath is missing`);
  }

  if (!Array.isArray(meta.allowedRoles) || meta.allowedRoles.length === 0) {
    fail(`${label}: allowedRoles must not be empty`);
  }

  if (!Array.isArray(meta.routeSurface) || meta.routeSurface.length === 0) {
    fail(`${label}: routeSurface must not be empty`);
  }

  if (entry.verticalId === "eva-wa-unilatino") {
    if (meta.previewStatusPanelPath !== EVA_PREVIEW_PATH) {
      fail(
        `${label}: previewStatusPanelPath must remain ${EVA_PREVIEW_PATH} (got ${meta.previewStatusPanelPath})`,
      );
    }
    if (entry.statusPanelPath !== EVA_PREVIEW_PATH) {
      fail(
        `${label}: statusPanelPath must remain ${EVA_PREVIEW_PATH} (got ${entry.statusPanelPath})`,
      );
    }
  }
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
    const isWorkspaceVertical =
      /workspaces\/.*\/verticals\//.test(normalized) ||
      normalized.includes("workspaces/[workspaceId]/verticals");
    const isAgencyVertical =
      /agency\/verticals\//.test(normalized) ||
      normalized.includes("(agency)/verticals");

    if (isWorkspaceVertical || isAgencyVertical) {
      fail(
        `Forbidden productive vertical route detected by CONSOLE-10: ${page}`,
      );
    }
  }

  for (const prefix of FORBIDDEN_PRODUCTIVE_ROUTE_PREFIXES) {
    const full = path.join(ROOT, prefix);
    if (!fs.existsSync(full)) {
      continue;
    }
    const nested = walkAppDir(full, prefix);
    const verticalPages = nested.filter((p) => p.includes("/verticals/"));
    for (const page of verticalPages) {
      fail(`Forbidden vertical route tree under ${prefix}: ${page}`);
    }
  }
}

function validateTypesFile() {
  const types = read("src/types/verticals/vertical-registry.ts");
  const required = [
    "VerticalRouteMode",
    "VerticalRouteVisibility",
    "VerticalRouteSurface",
    "VerticalRouteRole",
    "VerticalRouteParams",
    "VerticalRouteMetadata",
    "routeMetadata: VerticalRouteMetadata",
  ];

  for (const phrase of required) {
    if (!types.includes(phrase)) {
      fail(`Types file missing required symbol: ${phrase}`);
    }
  }
}

console.log("CONSOLE-10 — vertical registry route metadata validator\n");

validateTypesFile();

const registry = loadRegistryMock();
if (registry) {
  if (!Array.isArray(registry.entries) || registry.entries.length === 0) {
    fail("VERTICAL_REGISTRY_MOCK.entries is empty");
  } else {
    registry.entries.forEach((entry, index) => validateEntry(entry, index));
  }
}

validateNoProductiveVerticalRoutes();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-10 registry route metadata validation PASS");
