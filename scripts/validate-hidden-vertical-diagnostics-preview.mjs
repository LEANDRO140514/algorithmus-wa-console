#!/usr/bin/env node
/**
 * CONSOLE-16 — Hidden vertical diagnostics preview validator.
 * Usage: node scripts/validate-hidden-vertical-diagnostics-preview.mjs
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
  "docs/console-16-hidden-vertical-diagnostics-preview.md",
);
const VALIDATOR_PATH = path.join(
  ROOT,
  "scripts/validate-hidden-vertical-diagnostics-preview.mjs",
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

const PRIOR_VALIDATORS = [
  "scripts/validate-vertical-registry-routes.mjs",
  "scripts/validate-vertical-registry-route-consumption.mjs",
  "scripts/validate-vertical-route-preview-contract.mjs",
  "scripts/validate-workspace-context-mock-boundary.mjs",
  "scripts/validate-workspace-filtered-vertical-registry.mjs",
  "scripts/validate-vertical-registry-access-diagnostics.mjs",
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
  const { access, matchType } = findAccessWithMatchType(workspaceContext, entry);
  const contextRoles = [...workspaceContext.roles];
  const allowedRoles = access ? [...access.allowedRoles] : [];
  const matchedRoles = allowedRoles.filter((role) => contextRoles.includes(role));
  const missingRoles = allowedRoles.filter((role) => !contextRoles.includes(role));
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
    status,
    matchType,
    accessFound,
    accessVisible,
    rolesCompatible,
    matchedRoles,
    missingRoles,
    isVisible: status === "visible",
  };
}

function isVerticalVisibleForWorkspace(workspaceContext, entry) {
  const { access } = findAccessWithMatchType(workspaceContext, entry);
  if (!access || !access.visible) {
    return false;
  }
  return hasAnyWorkspaceRole(workspaceContext.roles, access.allowedRoles);
}

function makeEntry(verticalId, routeVerticalId = "eva") {
  return {
    verticalId,
    displayName: verticalId,
    routeMetadata: {
      routeParams: { verticalId: routeVerticalId },
    },
  };
}

function validateHiddenDiagnosticsLogic() {
  const baseAccess = {
    verticalId: "eva-wa-unilatino",
    routeVerticalId: "eva",
    visible: true,
    allowedRoles: ["viewer", "admin"],
  };

  const hiddenEntry = makeEntry("other-vertical", "other");
  const workspaceContext = {
    roles: ["viewer"],
    verticalAccess: [baseAccess],
  };

  if (isVerticalVisibleForWorkspace(workspaceContext, hiddenEntry)) {
    fail("Expected other-vertical to be hidden in filter logic");
  }

  const hiddenDiag = diagnoseVerticalAccess({
    entry: hiddenEntry,
    workspaceContext,
  });

  if (hiddenDiag.isVisible) {
    fail("Hidden entry diagnostic must not have isVisible true");
  }
  if (hiddenDiag.status !== "hidden_no_access") {
    fail("Expected hidden_no_access for entry without verticalAccess match");
  }

  const notVisibleDiag = diagnoseVerticalAccess({
    entry: makeEntry("eva-wa-unilatino"),
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [{ ...baseAccess, visible: false }],
    },
  });

  if (notVisibleDiag.status !== "hidden_not_visible") {
    fail("Expected hidden_not_visible status in diagnostics logic");
  }

  const rolesDiag = diagnoseVerticalAccess({
    entry: makeEntry("eva-wa-unilatino"),
    workspaceContext: {
      roles: ["operator"],
      verticalAccess: [baseAccess],
    },
  });

  if (rolesDiag.status !== "hidden_roles_incompatible") {
    fail("Expected hidden_roles_incompatible status in diagnostics logic");
  }
}

function extractHiddenSection(component) {
  const start = component.indexOf("function HiddenVerticalDiagnosticsPreview");
  if (start === -1) {
    return "";
  }
  const end = component.indexOf("function RouteMetadataPreview", start);
  if (end === -1) {
    return component.slice(start);
  }
  return component.slice(start, end);
}

function validateComponent() {
  const component = readFileOrFail(COMPONENT_PATH, "VerticalRegistryList.tsx");
  if (!component) {
    return;
  }

  const hiddenSection = extractHiddenSection(component);

  for (const phrase of [
    "hiddenEntries",
    "Hidden vertical diagnostics preview",
    'label="Hidden verticals"',
    "No hidden verticals for the current mock workspace context",
    "diagnoseVerticalAccess",
    "filteredRegistry.hiddenEntries",
    'label="Status"',
    'label="Match"',
    'label="Access found"',
    'label="Roles compatible"',
    'label="Matched roles"',
    'label="Missing roles"',
    'label="Read-only"',
    "filterVerticalRegistryForWorkspace",
    "Access diagnostics",
    "href={entry.statusPanelPath}",
    "Open mock status panel",
  ]) {
    if (!component.includes(phrase)) {
      fail(`Component missing required phrase: ${phrase}`);
    }
  }

  if (!hiddenSection.includes("diagnoseVerticalAccess")) {
    fail("Hidden diagnostics section must use diagnoseVerticalAccess");
  }

  if (hiddenSection.includes("<a")) {
    fail("Hidden diagnostics section must not contain navigable links");
  }

  if (hiddenSection.includes("Open mock status panel")) {
    fail("Hidden entries must not show Open mock status panel link");
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
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-16 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-16",
    "hidden vertical",
    "hiddenEntries",
    "diagnoseVerticalAccess",
    "hidden_no_access",
    "hidden_not_visible",
    "hidden_roles_incompatible",
    "CONSOLE-16 muestra diagnostics mock/read-only de verticales ocultos",
    "CONSOLE-16 reutiliza el filtro de CONSOLE-14",
    "CONSOLE-16 reutiliza diagnostics de CONSOLE-15",
    "CONSOLE-16 no activa workspace real",
    "CONSOLE-16 no crea permisos reales",
    "CONSOLE-16 no lee sesión real",
    "CONSOLE-16 no usa Supabase",
    "CONSOLE-16 no crea rutas tenant-aware reales",
    "CONSOLE-16 no crea navegación productiva",
    "CONSOLE-16 no muestra links para hidden entries",
    "CONSOLE-16 no mueve /verticals",
    "CONSOLE-16 no toca middleware, auth, layout ni nav global",
    "CONSOLE-16 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
  ]) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validatePriorConsoleCompatibility() {
  for (const rel of PRIOR_VALIDATORS) {
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

function validateSelfExists() {
  if (!fs.existsSync(VALIDATOR_PATH)) {
    fail("validate-hidden-vertical-diagnostics-preview.mjs not found");
  }
}

console.log("CONSOLE-16 — hidden vertical diagnostics preview validator\n");

validateSelfExists();
validateHiddenDiagnosticsLogic();
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

console.log("CONSOLE-16 hidden vertical diagnostics preview validation PASS");
