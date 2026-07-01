#!/usr/bin/env node
/**
 * CONSOLE-20 — Eva connector boundary status preview validator.
 * Usage: node scripts/validate-eva-connector-boundary-status-preview.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const COMPONENT_PATH = path.join(
  ROOT,
  "src/components/eva/EvaConnectorBoundaryPreview.tsx",
);
const PAGE_PATH = path.join(ROOT, "src/app/verticals/eva/status/page.tsx");
const DOC_PATH = path.join(
  ROOT,
  "docs/console-20-eva-connector-boundary-status-preview.md",
);
const VALIDATOR_PATH = path.join(
  ROOT,
  "scripts/validate-eva-connector-boundary-status-preview.mjs",
);

const FORBIDDEN_PATTERNS = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\baxios\b/, label: "axios" },
  { pattern: /\buseEffect\s*\(/, label: "useEffect" },
  { pattern: /href=["']\/workspaces\//, label: "href to /workspaces/" },
  { pattern: /href=["']\/agency\//, label: "href to /agency/" },
];

const LIVE_BUTTON_PATTERNS = [
  { pattern: />\s*Activate\s+live/i, label: "Activate live button" },
  { pattern: />\s*Enable\s+live/i, label: "Enable live button" },
  { pattern: /onClick=.*live/i, label: "live onClick handler" },
];

const REQUIRED_UI_STRINGS = [
  "Eva connector boundary",
  "wa-agent-unilatino",
  "observe_supervise",
  "decide_respond_sync",
  "read_only_contract",
  "Live calls enabled",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function readFileOrFail(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} not found: ${relative(filePath)}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function assertIncludes(content, needle, label) {
  if (!content.includes(needle)) {
    fail(`${label} missing required value: ${needle}`);
  }
}

function scanForbidden(content, patterns, scope) {
  for (const { pattern, label } of patterns) {
    if (pattern.test(content)) {
      fail(`${scope} contains forbidden pattern: ${label}`);
    }
  }
}

function gitDiffIncludes(fileName) {
  try {
    const out = execSync("git diff HEAD --name-only", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const staged = execSync("git diff --cached --name-only", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const combined = `${out}\n${staged}`;
    return combined
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .includes(fileName);
  } catch {
    return false;
  }
}

console.log("CONSOLE-20 — Eva connector boundary status preview validator\n");

const componentContent = readFileOrFail(COMPONENT_PATH, "Component");
const pageContent = readFileOrFail(PAGE_PATH, "Page");
readFileOrFail(DOC_PATH, "Doc");
readFileOrFail(VALIDATOR_PATH, "Validator");

const combinedUi = `${componentContent}\n${pageContent}`;

if (componentContent) {
  assertIncludes(
    componentContent,
    "getEvaConnectorBoundaryStatus",
    "Component",
  );
  assertIncludes(componentContent, 'from "@/lib/eva"', "Component");
}

if (pageContent) {
  assertIncludes(pageContent, "EvaConnectorBoundaryPreview", "Page");
}

for (const needle of REQUIRED_UI_STRINGS) {
  assertIncludes(combinedUi, needle, "UI");
}

scanForbidden(combinedUi, FORBIDDEN_PATTERNS, "UI files");
scanForbidden(combinedUi, LIVE_BUTTON_PATTERNS, "UI files");

if (fs.existsSync(path.join(ROOT, ".env.local"))) {
  fail(".env.local exists — must not be created in CONSOLE-20");
}

if (gitDiffIncludes("package.json")) {
  fail("package.json was modified");
}

if (gitDiffIncludes("package-lock.json")) {
  fail("package-lock.json was modified");
}

if (errors.length > 0) {
  console.error("Failures:");
  for (const message of errors) {
    console.error(`  FAIL  ${message}`);
  }
  console.error(`\nResult: ${errors.length} failed`);
  process.exit(1);
}

console.log("  PASS  EvaConnectorBoundaryPreview.tsx exists");
console.log("  PASS  docs/console-20-eva-connector-boundary-status-preview.md exists");
console.log("  PASS  validator exists");
console.log("  PASS  page renders EvaConnectorBoundaryPreview");
console.log("  PASS  component uses getEvaConnectorBoundaryStatus");
console.log("  PASS  required UI strings");
console.log("  PASS  no fetch/axios/useEffect");
console.log("  PASS  no live buttons / workspace/agency hrefs");
console.log("  PASS  no .env.local");
console.log("  PASS  package.json not modified");
console.log("  PASS  package-lock.json not modified");
console.log("\nCONSOLE-20 eva connector boundary status preview validation PASS");
