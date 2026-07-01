#!/usr/bin/env node
/**
 * CONSOLE-14 — Workspace-filtered vertical registry validator.
 * Usage: node scripts/validate-workspace-filtered-vertical-registry.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FILTER_PATH = path.join(
  ROOT,
  "src/lib/verticals/vertical-registry-filter.mock.ts",
);
const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/verticals/VerticalRegistryList.tsx",
);
const INDEX_PATH = path.join(ROOT, "src/lib/verticals/index.ts");
const DOC_PATH = path.join(
  ROOT,
  "docs/console-14-workspace-filtered-vertical-registry-mock.md",
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

function hasAnyWorkspaceRole(userRoles, allowedRoles) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

function findVerticalAccess(workspaceContext, entry) {
  const routeVerticalId = entry.routeMetadata?.routeParams?.verticalId;
  return workspaceContext.verticalAccess.find(
    (access) =>
      access.verticalId === entry.verticalId ||
      (routeVerticalId !== undefined &&
        access.routeVerticalId === routeVerticalId),
  );
}

function isVerticalVisibleForWorkspace(workspaceContext, entry) {
  const access = findVerticalAccess(workspaceContext, entry);
  if (!access || !access.visible) {
    return false;
  }
  return hasAnyWorkspaceRole(workspaceContext.roles, access.allowedRoles);
}

function filterVerticalRegistryForWorkspace(input) {
  const { entries, workspaceContext } = input;
  const visibleEntries = [];
  const hiddenEntries = [];

  for (const entry of entries) {
    if (isVerticalVisibleForWorkspace(workspaceContext, entry)) {
      visibleEntries.push(entry);
    } else {
      hiddenEntries.push(entry);
    }
  }

  return {
    visibleEntries,
    hiddenEntries,
    isMock: true,
    isReadOnly: true,
    reason: "workspace_context_mock",
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

function validateFilterLogic() {
  const baseContext = {
    roles: ["viewer"],
    verticalAccess: [
      {
        verticalId: "eva-wa-unilatino",
        routeVerticalId: "eva",
        visible: true,
        allowedRoles: ["viewer", "admin"],
      },
    ],
  };

  const visibleResult = filterVerticalRegistryForWorkspace({
    entries: [makeEntry("eva-wa-unilatino")],
    workspaceContext: baseContext,
  });

  if (visibleResult.visibleEntries.length !== 1) {
    fail("Expected vertical with visible=true and compatible roles to be visible");
  }

  if (visibleResult.isMock !== true || visibleResult.isReadOnly !== true) {
    fail("Filter result must include isMock:true and isReadOnly:true");
  }

  if (visibleResult.reason !== "workspace_context_mock") {
    fail('Filter result reason must be "workspace_context_mock"');
  }

  const noAccessResult = filterVerticalRegistryForWorkspace({
    entries: [makeEntry("other-vertical", "other")],
    workspaceContext: baseContext,
  });

  if (noAccessResult.hiddenEntries.length !== 1) {
    fail("Expected vertical without verticalAccess to be hidden");
  }

  const roleMismatchResult = filterVerticalRegistryForWorkspace({
    entries: [makeEntry("eva-wa-unilatino")],
    workspaceContext: {
      ...baseContext,
      roles: ["operator"],
    },
  });

  if (roleMismatchResult.hiddenEntries.length !== 1) {
    fail("Expected vertical with incompatible roles to be hidden");
  }

  const routeMatchResult = filterVerticalRegistryForWorkspace({
    entries: [makeEntry("unknown-id", "eva")],
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [
        {
          verticalId: "eva-wa-unilatino",
          routeVerticalId: "eva",
          visible: true,
          allowedRoles: ["viewer"],
        },
      ],
    },
  });

  if (routeMatchResult.visibleEntries.length !== 1) {
    fail("Expected match by routeVerticalId against routeParams.verticalId");
  }

  const invisibleAccessResult = filterVerticalRegistryForWorkspace({
    entries: [makeEntry("eva-wa-unilatino")],
    workspaceContext: {
      roles: ["viewer"],
      verticalAccess: [
        {
          verticalId: "eva-wa-unilatino",
          routeVerticalId: "eva",
          visible: false,
          allowedRoles: ["viewer"],
        },
      ],
    },
  });

  if (invisibleAccessResult.hiddenEntries.length !== 1) {
    fail("Expected vertical with visible=false to be hidden");
  }
}

function validateFilterFile() {
  const filter = readFileOrFail(
    FILTER_PATH,
    "vertical-registry-filter.mock.ts",
  );
  if (!filter) {
    return;
  }

  for (const phrase of [
    "hasAnyWorkspaceRole",
    "findVerticalAccess",
    "filterVerticalRegistryForWorkspace",
    "isVerticalVisibleForWorkspace",
    'isMock: true',
    'isReadOnly: true',
    'reason: "workspace_context_mock"',
    "access.verticalId === entry.verticalId",
    "routeVerticalId",
  ]) {
    if (!filter.includes(phrase)) {
      fail(`Filter file missing required phrase: ${phrase}`);
    }
  }

  scanForbidden(filter, FORBIDDEN_PATTERNS, "vertical-registry-filter");
}

function validateIndex() {
  const index = readFileOrFail(INDEX_PATH, "lib/verticals/index.ts");
  if (!index) {
    return;
  }

  for (const phrase of [
    "filterVerticalRegistryForWorkspace",
    "vertical-registry-filter.mock",
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
    "filterVerticalRegistryForWorkspace",
    "visibleEntries",
    "Workspace filter preview",
    "Visible verticals",
    "Hidden verticals",
    'value={filteredRegistry.reason}',
    'label="Mock"',
    'label="Read-only"',
    "getMockWorkspaceContext",
    "workspaceContext.routeParams",
    "buildVerticalRoutePreview",
    "No verticals visible for the current mock workspace context",
    "href={entry.statusPanelPath}",
    "Open mock status panel",
    "Preview-only route resolution. Future paths are declarative only — not navigable.",
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
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-14 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-14",
    "workspace-filtered vertical registry",
    "filterVerticalRegistryForWorkspace",
    "read-only",
    "verticalAccess",
    "routeVerticalId",
    "CONSOLE-14 filtra el Vertical Registry usando workspace context mock/read-only",
    "CONSOLE-14 no activa workspace real",
    "CONSOLE-14 no crea permisos reales",
    "CONSOLE-14 no lee sesión real",
    "CONSOLE-14 no usa Supabase",
    "CONSOLE-14 no crea rutas tenant-aware reales",
    "CONSOLE-14 no crea navegación productiva",
    "CONSOLE-14 no mueve /verticals",
    "CONSOLE-14 no toca middleware, auth, layout ni nav global",
    "CONSOLE-14 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase",
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

console.log("CONSOLE-14 — workspace-filtered vertical registry validator\n");

validateFilterFile();
validateFilterLogic();
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

console.log("CONSOLE-14 workspace-filtered vertical registry validation PASS");
