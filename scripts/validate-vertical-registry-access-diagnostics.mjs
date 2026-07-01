#!/usr/bin/env node
/**
 * CONSOLE-15 — Vertical registry access diagnostics validator.
 * Usage: node scripts/validate-vertical-registry-access-diagnostics.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DIAGNOSTICS_PATH = path.join(
  ROOT,
  "src/lib/verticals/vertical-registry-access-diagnostics.mock.ts",
);
const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const INDEX_PATH = path.join(ROOT, "src/lib/verticals/index.ts");
const DOC_PATH = path.join(
  ROOT,
  "docs/console-15-vertical-registry-access-diagnostics-mock.md",
);

const FORBIDDEN_ROUTE_DIRS = [
  "src/app/workspaces",
  "src/app/agency/verticals",
];

const FORBIDDEN_PATTERNS = [
  { pattern: /from\s+['"]@?supabase/i, label: "supabase import" },
  { pattern: /from\s+['"]next\/auth['"]/, label: "next/auth import" },
  { pattern: /\bcookies\s*\(/, label: "cookies()" },
  { pattern: /\bgetSession\s*\(/, label: "getSession(" },
  { pattern: /\buseSession\s*\(/, label: "useSession(" },
  { pattern: /href=["']\/workspaces\//, label: "href to /workspaces/" },
  { pattern: /href=["']\/agency\/verticals\//, label: "href to /agency/verticals/" },
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

function hasAnyWorkspaceRole(userRoles, allowedRoles) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

function getMatchedWorkspaceRoles(contextRoles, allowedRoles) {
  return allowedRoles.filter((role) => contextRoles.includes(role));
}

function getMissingWorkspaceRoles(contextRoles, allowedRoles) {
  return allowedRoles.filter((role) => !contextRoles.includes(role));
}

function findAccessWithMatchType(workspaceContext, entry) {
  const routeVerticalId = entry.routeMetadata?.routeParams?.verticalId;
  const byVerticalId = workspaceContext.verticalAccess.find(
    (access) => access.verticalId === entry.verticalId,
  );
  if (byVerticalId) {
    return { access: byVerticalId, matchType: "verticalId" };
  }
  if (routeVerticalId !== undefined) {
    const byRoute = workspaceContext.verticalAccess.find(
      (access) => access.routeVerticalId === routeVerticalId,
    );
    if (byRoute) {
      return { access: byRoute, matchType: "routeVerticalId" };
    }
  }
  return { access: undefined, matchType: "none" };
}

function diagnoseVerticalAccess(input) {
  const { entry, workspaceContext } = input;
  const routeVerticalId = entry.routeMetadata?.routeParams?.verticalId;
  const { access, matchType } = findAccessWithMatchType(workspaceContext, entry);
  const contextRoles = [...workspaceContext.roles];
  const allowedRoles = access ? [...access.allowedRoles] : [];
  const matchedRoles = getMatchedWorkspaceRoles(contextRoles, allowedRoles);
  const missingRoles = getMissingWorkspaceRoles(contextRoles, allowedRoles);
  const accessFound = access !== undefined;
  const accessVisible = access?.visible ?? false;
  const rolesCompatible =
    accessFound && accessVisible
      ? hasAnyWorkspaceRole(contextRoles, allowedRoles)
      : false;

  let status;
  if (!accessFound) {
    status = "hidden_no_access";
  } else if (!accessVisible) {
    status = "hidden_not_visible";
  } else if (!rolesCompatible) {
    status = "hidden_roles_incompatible";
  } else {
    status = "visible";
  }

  return {
    verticalId: entry.verticalId,
    routeVerticalId,
    matchType,
    access,
    accessFound,
    accessVisible,
    contextRoles,
    allowedRoles,
    matchedRoles,
    missingRoles,
    rolesCompatible,
    status,
    isVisible: status === "visible",
    isMock: true,
    isReadOnly: true,
    reason: "workspace_access_diagnostics_mock",
  };
}

function makeEntry(verticalId, routeVerticalId = "eva") {
  return {
    verticalId,
    routeMetadata: {
      routeParams: { verticalId: routeVerticalId },
    },
  };
}

function validateDiagnosticsLogic() {
  const baseAccess = {
    verticalId: "eva-wa-unilatino",
    routeVerticalId: "eva",
    visible: true,
    allowedRoles: ["viewer", "admin"],
  };

  const visibleDiag = diagnoseVerticalAccess({
    entry: makeEntry("eva-wa-unilatino"),
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [baseAccess],
    },
  });

  if (visibleDiag.isMock !== true) {
    fail("Diagnostic must return isMock: true");
  }
  if (visibleDiag.isReadOnly !== true) {
    fail("Diagnostic must return isReadOnly: true");
  }
  if (visibleDiag.reason !== "workspace_access_diagnostics_mock") {
    fail('Diagnostic reason must be "workspace_access_diagnostics_mock"');
  }
  if (visibleDiag.status !== "visible") {
    fail("Expected status visible for compatible access");
  }
  if (!visibleDiag.isVisible) {
    fail("isVisible must be true when status is visible");
  }
  if (visibleDiag.matchType !== "verticalId") {
    fail("Expected matchType verticalId when verticalId matches");
  }

  const routeMatchDiag = diagnoseVerticalAccess({
    entry: makeEntry("unknown-id", "eva"),
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [baseAccess],
    },
  });

  if (routeMatchDiag.matchType !== "routeVerticalId") {
    fail("Expected matchType routeVerticalId when routeParams.verticalId matches");
  }
  if (routeMatchDiag.status !== "visible") {
    fail("Expected visible status for routeVerticalId match with compatible roles");
  }

  const noAccessDiag = diagnoseVerticalAccess({
    entry: makeEntry("other-vertical", "other"),
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [baseAccess],
    },
  });

  if (noAccessDiag.matchType !== "none") {
    fail("Expected matchType none when no access matches");
  }
  if (noAccessDiag.status !== "hidden_no_access") {
    fail("Expected status hidden_no_access when access not found");
  }

  const notVisibleDiag = diagnoseVerticalAccess({
    entry: makeEntry("eva-wa-unilatino"),
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [{ ...baseAccess, visible: false }],
    },
  });

  if (notVisibleDiag.status !== "hidden_not_visible") {
    fail("Expected status hidden_not_visible when access.visible is false");
  }

  const rolesDiag = diagnoseVerticalAccess({
    entry: makeEntry("eva-wa-unilatino"),
    workspaceContext: {
      roles: ["operator"],
      verticalAccess: [baseAccess],
    },
  });

  if (rolesDiag.status !== "hidden_roles_incompatible") {
    fail("Expected status hidden_roles_incompatible when roles do not intersect");
  }
  if (rolesDiag.matchedRoles.length !== 0) {
    fail("Expected empty matchedRoles when roles incompatible");
  }
  if (rolesDiag.missingRoles.length !== baseAccess.allowedRoles.length) {
    fail("Expected missingRoles to list all allowed roles when context has none");
  }
}

function validateDiagnosticsFile() {
  const diagnostics = readFileOrFail(
    DIAGNOSTICS_PATH,
    "vertical-registry-access-diagnostics.mock.ts",
  );
  if (!diagnostics) {
    return;
  }

  for (const phrase of [
    "export function getMatchedWorkspaceRoles",
    "export function getMissingWorkspaceRoles",
    "export function diagnoseVerticalAccess",
    "export function diagnoseVerticalRegistryAccess",
    'isMock: true',
    'isReadOnly: true',
    'reason: "workspace_access_diagnostics_mock"',
    '"visible"',
    '"hidden_no_access"',
    '"hidden_not_visible"',
    '"hidden_roles_incompatible"',
    '"verticalId"',
    '"routeVerticalId"',
    '"none"',
    "hasAnyWorkspaceRole",
  ]) {
    if (!diagnostics.includes(phrase)) {
      fail(`Diagnostics file missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(diagnostics, FORBIDDEN_PATTERNS, "access-diagnostics");
}

function validateIndex() {
  const index = readFileOrFail(INDEX_PATH, "lib/verticals/index.ts");
  if (!index) {
    return;
  }

  for (const phrase of [
    "diagnoseVerticalAccess",
    "diagnoseVerticalRegistryAccess",
    "vertical-registry-access-diagnostics.mock",
  ]) {
    if (!index.includes(phrase)) {
      fail(`verticals index missing: ${phrase}`);
    }
  }
}

function validateComponent() {
  const component = readFileOrFail(COMPONENT_PATH, "VerticalRegistryList.tsx");
  if (!component) {
    return;
  }

  const usesDiagnostics =
    component.includes("diagnoseVerticalAccess") ||
    component.includes("diagnoseVerticalRegistryAccess");

  if (!usesDiagnostics) {
    fail("VerticalRegistryList must consume diagnoseVerticalAccess or diagnoseVerticalRegistryAccess");
  }

  for (const phrase of [
    "Access diagnostics",
    'label="Status"',
    'label="Match"',
    'label="Access found"',
    'label="Roles compatible"',
    'label="Matched roles"',
    'label="Missing roles"',
    'label="Read-only"',
    "workspace_access_diagnostics_mock",
    "filterVerticalRegistryForWorkspace",
    "href={entry.statusPanelPath}",
  ]) {
    if (!component.includes(phrase)) {
      fail(`Component missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(component, FORBIDDEN_PATTERNS, "VerticalRegistryList");

  const anchorMatches = [...component.matchAll(/<a\b[^>]*href=\{([^}]+)\}/g)];
  for (const match of anchorMatches) {
    if (match[1].trim() !== "entry.statusPanelPath") {
      fail(`Only entry.statusPanelPath may be href, found: ${match[1].trim()}`);
    }
  }
}

function validateDoc() {
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-15 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-15",
    "access diagnostics",
    "diagnoseVerticalAccess",
    "read-only",
    "verticalAccess",
    "routeVerticalId",
    "CONSOLE-15 muestra diagnostics mock/read-only de acceso por vertical",
    "CONSOLE-15 explica el filtro de CONSOLE-14",
    "CONSOLE-15 no activa workspace real",
    "CONSOLE-15 no crea permisos reales",
    "CONSOLE-15 no lee sesión real",
    "CONSOLE-15 no usa Supabase",
    "CONSOLE-15 no crea rutas tenant-aware reales",
    "CONSOLE-15 no crea navegación productiva",
    "CONSOLE-15 no mueve /verticals",
    "CONSOLE-15 no toca middleware, auth, layout ni nav global",
    "CONSOLE-15 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
  ]) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validatePriorConsoleCompatibility() {
  const priorValidators = [
    "scripts/validate-vertical-registry-routes.mjs",
    "scripts/validate-vertical-registry-route-consumption.mjs",
    "scripts/validate-vertical-route-preview-contract.mjs",
    "scripts/validate-workspace-context-mock-boundary.mjs",
    "scripts/validate-workspace-filtered-vertical-registry.mjs",
  ];

  for (const rel of priorValidators) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      fail(`Prior validator missing (CONSOLE compatibility): ${rel}`);
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

console.log("CONSOLE-15 — vertical registry access diagnostics validator\n");

validateDiagnosticsFile();
validateDiagnosticsLogic();
validateIndex();
validateComponent();
validateDoc();
validatePriorConsoleCompatibility();
validateForbiddenRoutes();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-15 vertical registry access diagnostics validation PASS");
