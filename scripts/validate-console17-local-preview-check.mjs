#!/usr/bin/env node
/**
 * CONSOLE-17 — Local dashboard preview check doc validator.
 * Usage: node scripts/validate-console17-local-preview-check.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DOC_PATH = path.join(ROOT, "docs/console-17-local-dashboard-preview-check.md");
const VALIDATOR_PATH = path.join(
  ROOT,
  "scripts/validate-console17-local-preview-check.mjs",
);

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

function validateDoc() {
  const doc = readFileOrFail(DOC_PATH, "CONSOLE-17 documentation");
  if (!doc) {
    return;
  }

  for (const phrase of [
    "CONSOLE-17",
    "9e519bb",
    "package-lock.json",
    "npm ci",
    "npm run dev",
    "/verticals",
    "/verticals/eva/status",
    "Context preview",
    "Workspace filter preview",
    "Access diagnostics",
    "Hidden vertical diagnostics preview",
    "Open mock status panel",
    "No hidden verticals for the current mock workspace context",
    "Eva WA Status",
    "read-only",
    "CONSOLE-17 solo valida preview local",
    "CONSOLE-17 no activa producción",
    "CONSOLE-17 no toca wa-agent-unilatino",
    "CONSOLE-17 no toca InsForge, YCloud, GHL ni Supabase remoto",
    "CONSOLE-17 no crea rutas productivas",
    "CONSOLE-17 no crea navegación live",
    "CONSOLE-17 no hace deploy",
    "Resultado final",
    "Siguiente fase",
    "CONSOLE-17A",
    "ThemeProvider",
    "script tag",
    "CONSOLE-17B",
    "Supabase env missing",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "no .env.local",
    "no Supabase remoto",
    "no secrets reales",
    "Local preview: Supabase env not configured",
  ]) {
    if (!doc.includes(phrase)) {
      fail(`Documentation missing required phrase: ${phrase}`);
    }
  }
}

function validateSelfExists() {
  if (!fs.existsSync(VALIDATOR_PATH)) {
    fail("validate-console17-local-preview-check.mjs not found");
  }
}

function validateMainLayoutGuard() {
  const layoutPath = path.join(ROOT, "src/app/(main)/layout.tsx");
  const layout = readFileOrFail(layoutPath, "MainLayout");
  if (!layout) {
    return;
  }

  for (const phrase of [
    "hasSupabaseServerEnv",
    "Local preview: Supabase env not configured",
  ]) {
    if (!layout.includes(phrase)) {
      fail(`MainLayout missing required phrase: ${phrase}`);
    }
  }

  const guardIndex = layout.indexOf("if (!hasSupabaseServerEnv())");
  const createClientIndex = layout.indexOf("await createClient()");
  if (guardIndex === -1 || createClientIndex === -1 || guardIndex > createClientIndex) {
    fail("MainLayout guard must run before createClient()");
  }
}

console.log("CONSOLE-17 — local dashboard preview check validator\n");

validateSelfExists();
validateDoc();
validateMainLayoutGuard();

if (errors.length > 0) {
  console.error("Validation errors:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("CONSOLE-17 local dashboard preview check validation PASS");
