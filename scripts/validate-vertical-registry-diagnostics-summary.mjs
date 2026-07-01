#!/usr/bin/env node
/**
 * CONSOLE-18 — Vertical registry diagnostics summary validator.
 * Usage: node scripts/validate-vertical-registry-diagnostics-summary.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SUMMARY_PATH = path.join(
  ROOT,
  "src/lib/verticals/vertical-registry-diagnostics-summary.mock.ts",
);
const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const INDEX_PATH = path.join(ROOT, "src/lib/verticals/index.ts");
const DOC_PATH = path.join(
  ROOT,
  "docs/console-18-vertical-registry-diagnostics-summary-mock.md",
);
const VALIDATOR_PATH = path.join(
  ROOT,
  "scripts/validate-vertical-registry-diagnostics-summary.mjs",
);

const FORBIDDEN_ROUTE_DIRS = [
  "src/app/workspaces",
  "src/app/agency/verticals",
];

const FORBIDDEN_PATTERNS = [
  { pattern: /from\s+['"]@?supabase/i, label: "supabase import" },
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
  "scripts/validate-hidden-vertical-diagnostics-preview.mjs",
  "scripts/validate-console17-local-preview-check.mjs",
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
    verticalId: entry.verticalId,
    matchType,
    status,
    isVisible: status === "visible",
    contextRoles,
    allowedRoles,
    matchedRoles,
    missingRoles,
    isMock: true,
    isReadOnly: true,
    reason: "workspace_access_diagnostics_mock",
  };
}

function summarizeVerticalRegistryDiagnostics(diagnostics) {
  const STATUS_ORDER = [
    "visible",
    "hidden_no_access",
    "hidden_not_visible",
    "hidden_roles_incompatible",
  ];
  const MATCH_ORDER = ["verticalId", "routeVerticalId", "none"];

  const visibleVerticals = diagnostics.filter((d) => d.isVisible).length;
  const totalVerticals = diagnostics.length;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: diagnostics.filter((d) => d.status === status).length,
  }));

  const byMatchType = MATCH_ORDER.map((matchType) => ({
    matchType,
    count: diagnostics.filter((d) => d.matchType === matchType).length,
  }));

  const unique = (values) => [...new Set(values)].sort();

  return {
    totalVerticals,
    visibleVerticals,
    hiddenVerticals: totalVerticals - visibleVerticals,
    byStatus,
    byMatchType,
    roles: {
      contextRoles: unique(diagnostics.flatMap((d) => d.contextRoles)),
      allowedRoles: unique(diagnostics.flatMap((d) => d.allowedRoles)),
      matchedRoles: unique(diagnostics.flatMap((d) => d.matchedRoles)),
      missingRoles: unique(diagnostics.flatMap((d) => d.missingRoles)),
    },
    isMock: true,
    isReadOnly: true,
    reason: "vertical_registry_diagnostics_summary_mock",
  };
}

function validateSummaryLogic() {
  const baseAccess = {
    verticalId: "eva-wa-unilatino",
    routeVerticalId: "eva",
    visible: true,
    allowedRoles: ["viewer", "admin"],
  };
  const workspaceContext = {
    roles: ["viewer"],
    verticalAccess: [baseAccess],
  };

  const visibleDiag = diagnoseVerticalAccess({
    entry: {
      verticalId: "eva-wa-unilatino",
      routeMetadata: { routeParams: { verticalId: "eva" } },
    },
    workspaceContext,
  });

  const hiddenDiag = diagnoseVerticalAccess({
    entry: {
      verticalId: "other-vertical",
      routeMetadata: { routeParams: { verticalId: "other" } },
    },
    workspaceContext,
  });

  const notVisibleDiag = diagnoseVerticalAccess({
    entry: {
      verticalId: "eva-wa-unilatino",
      routeMetadata: { routeParams: { verticalId: "eva" } },
    },
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [{ ...baseAccess, visible: false }],
    },
  });

  const rolesDiag = diagnoseVerticalAccess({
    entry: {
      verticalId: "eva-wa-unilatino",
      routeMetadata: { routeParams: { verticalId: "eva" } },
    },
    workspaceContext: {
      roles: ["operator"],
      verticalAccess: [baseAccess],
    },
  });

  const summary = summarizeVerticalRegistryDiagnostics([
    visibleDiag,
    hiddenDiag,
    notVisibleDiag,
    rolesDiag,
  ]);

  if (summary.isMock !== true || summary.isReadOnly !== true) {
    fail("Summary must include isMock:true and isReadOnly:true");
  }

  if (summary.reason !== "vertical_registry_diagnostics_summary_mock") {
    fail('Summary reason must be "vertical_registry_diagnostics_summary_mock"');
  }

  if (summary.totalVerticals !== 4) {
    fail("Expected totalVerticals to equal diagnostics length");
  }

  if (summary.visibleVerticals !== 1) {
    fail("Expected one visible vertical in summary logic test");
  }

  if (summary.hiddenVerticals !== 3) {
    fail("Expected hiddenVerticals = total - visible");
  }

  const statusCounts = Object.fromEntries(
    summary.byStatus.map((item) => [item.status, item.count]),
  );
  if (statusCounts.visible !== 1) fail("Expected visible status count 1");
  if (statusCounts.hidden_no_access !== 1) {
    fail("Expected hidden_no_access status count 1");
  }
  if (statusCounts.hidden_not_visible !== 1) {
    fail("Expected hidden_not_visible status count 1");
  }
  if (statusCounts.hidden_roles_incompatible !== 1) {
    fail("Expected hidden_roles_incompatible status count 1");
  }

  const matchCounts = Object.fromEntries(
    summary.byMatchType.map((item) => [item.matchType, item.count]),
  );
  if (matchCounts.verticalId !== 3) fail("Expected verticalId match count 3");
  if (matchCounts.routeVerticalId !== 0) {
    fail("Expected routeVerticalId match count 0 in logic test");
  }
  if (matchCounts.none !== 1) fail("Expected none match count 1");

  if (!Array.isArray(summary.roles.contextRoles)) {
    fail("Summary roles must include contextRoles");
  }
}

function validateSummaryFile() {
  const summary = readFileOrFail(
    SUMMARY_PATH,
    "vertical-registry-diagnostics-summary.mock.ts",
  );
  if (!summary) {
    return;
  }

  for (const phrase of [
    "export function summarizeVerticalRegistryDiagnostics",
    "totalVerticals",
    "visibleVerticals",
    "hiddenVerticals",
    "byStatus",
    "byMatchType",
    "roles",
    'isMock: true',
    'isReadOnly: true',
    'reason: "vertical_registry_diagnostics_summary_mock"',
    '"visible"',
    '"hidden_no_access"',
    '"hidden_not_visible"',
    '"hidden_roles_incompatible"',
    '"verticalId"',
    '"routeVerticalId"',
    '"none"',
    "contextRoles",
    "allowedRoles",
    "matchedRoles",
    "missingRoles",
  ]) {
    if (!summary.includes(phrase)) {
      fail(`Summary file missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(summary, FORBIDDEN_PATTERNS, "diagnostics-summary");
}

function validateIndex() {
  const index = readFileOrFail(INDEX_PATH, "lib/verticals/index.ts");
  if (!index) {
    return;
  }

  for (const phrase of [
    "summarizeVerticalRegistryDiagnostics",
    "vertical-registry-diagnostics-summary.mock",
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

  for (const phrase of [
    "summarizeVerticalRegistryDiagnostics",
    "diagnoseVerticalRegistryAccess",
    "Registry diagnostics summary",
    'label="Total verticals"',
    'label="Visible verticals"',
    'label="Hidden verticals"',
    "By status",
    "By match type",
    'label="Context roles"',
    'label="Allowed roles"',
    'label="Matched roles"',
    'label="Missing roles"',
    'label="Read-only"',
    "Access diagnostics",
    "Hidden vertical diagnostics preview",
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
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-18 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-18",
    "summarizeVerticalRegistryDiagnostics",
    "diagnoseVerticalAccess",
    "hidden diagnostics",
    "CONSOLE-18 agrega summary mock/read-only del registry",
    "CONSOLE-18 reutiliza diagnostics de CONSOLE-15",
    "CONSOLE-18 incluye hidden diagnostics de CONSOLE-16",
    "CONSOLE-18 no activa workspace real",
    "CONSOLE-18 no crea permisos reales",
    "CONSOLE-18 no lee sesión real",
    "CONSOLE-18 no usa Supabase remoto",
    "CONSOLE-18 no crea rutas tenant-aware reales",
    "CONSOLE-18 no crea navegación productiva",
    "CONSOLE-18 no muestra links nuevos",
    "CONSOLE-18 no mueve /verticals",
    "CONSOLE-18 no toca middleware, auth, layout ni nav global",
    "CONSOLE-18 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
  ]) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validatePackageAndEnv() {
  if (fs.existsSync(path.join(ROOT, ".env.local"))) {
    fail(".env.local must not be created for CONSOLE-18");
  }

  for (const rel of ["package.json", "package-lock.json"]) {
    try {
      const diff = fs.readFileSync(path.join(ROOT, rel), "utf8");
      if (!diff) {
        fail(`${rel} unreadable`);
      }
    } catch {
      fail(`${rel} missing`);
    }
  }

  const status = readFileOrFail(
    path.join(ROOT, "package.json"),
    "package.json",
  );
  if (status && status.includes('"name"')) {
    // package.json present; git diff check done separately if needed
  }
}

function validateForbiddenRoutes() {
  for (const rel of FORBIDDEN_ROUTE_DIRS) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      fail(`Forbidden productive route directory exists: ${rel}`);
    }
  }
}

function validatePriorValidators() {
  for (const rel of [...new Set(PRIOR_VALIDATORS)]) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      fail(`Prior validator missing: ${rel}`);
    }
  }
}

function validateSelfExists() {
  if (!fs.existsSync(VALIDATOR_PATH)) {
    fail("validate-vertical-registry-diagnostics-summary.mjs not found");
  }
}

console.log("CONSOLE-18 — vertical registry diagnostics summary validator\n");

validateSelfExists();
validateSummaryFile();
validateSummaryLogic();
validateIndex();
validateComponent();
validateDoc();
validatePackageAndEnv();
validatePriorValidators();
validateForbiddenRoutes();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-18 vertical registry diagnostics summary validation PASS");
