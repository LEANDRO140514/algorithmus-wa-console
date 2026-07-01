# CONSOLE-18 — Vertical registry diagnostics summary mock

## Objetivo

Agregar un **resumen agregado mock/read-only** del Vertical Registry basado en los diagnostics de CONSOLE-15/16 — totales, conteos por status/match type y resumen de roles.

CONSOLE-18 agrega summary mock/read-only del registry.
CONSOLE-18 reutiliza diagnostics de CONSOLE-15.
CONSOLE-18 incluye hidden diagnostics de CONSOLE-16.
CONSOLE-18 no activa workspace real.
CONSOLE-18 no crea permisos reales.
CONSOLE-18 no lee sesión real.
CONSOLE-18 no usa Supabase remoto.
CONSOLE-18 no crea rutas tenant-aware reales.
CONSOLE-18 no crea navegación productiva.
CONSOLE-18 no muestra links nuevos.
CONSOLE-18 no mueve /verticals ni /verticals/eva/status.
CONSOLE-18 no toca middleware, auth, layout ni nav global.
CONSOLE-18 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-14** — filtro workspace (`visibleEntries` / `hiddenEntries`)
- **CONSOLE-15** — `diagnoseVerticalAccess` por vertical
- **CONSOLE-16** — hidden diagnostics preview
- **CONSOLE-17** — preview local estabilizado sin Supabase env
- **CONSOLE-18** — capa de resumen agregado sobre todos los diagnostics

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/lib/verticals/vertical-registry-diagnostics-summary.mock.ts` | **Nuevo** — helper de summary |
| `src/lib/verticals/index.ts` | Re-export |
| `src/components/verticals/VerticalRegistryList.tsx` | Sección Registry diagnostics summary |
| `scripts/validate-vertical-registry-diagnostics-summary.mjs` | Validator CONSOLE-18 |
| `docs/console-18-vertical-registry-diagnostics-summary-mock.md` | Este documento |

## Helper creado

`summarizeVerticalRegistryDiagnostics(diagnostics: VerticalAccessDiagnostic[])`

Usa diagnostics de `vertical-registry-access-diagnostics.mock.ts` sin mutarlos.

## Contrato del summary

`VerticalRegistryDiagnosticsSummary`:

- `totalVerticals`, `visibleVerticals`, `hiddenVerticals`
- `byStatus[]` — visible, hidden_no_access, hidden_not_visible, hidden_roles_incompatible
- `byMatchType[]` — verticalId, routeVerticalId, none
- `roles` — contextRoles, allowedRoles, matchedRoles, missingRoles (únicos ordenados)
- `isMock: true`, `isReadOnly: true`, `reason: "vertical_registry_diagnostics_summary_mock"`

## Cómo usa CONSOLE-15 y CONSOLE-16

```ts
const registryDiagnostics = diagnoseVerticalRegistryAccess(entries, workspaceContext);
const summary = summarizeVerticalRegistryDiagnostics(registryDiagnostics);
```

Incluye diagnostics de verticales visibles y ocultos en un solo arreglo.

## UI

Sección **Registry diagnostics summary** (después de Workspace filter preview):

- Total / Visible / Hidden verticals
- By status (4 filas)
- By match type (3 filas)
- Roles: Context, Allowed, Matched, Missing
- Mode, Mock, Read-only

## Qué sigue siendo mock/read-only

Sin APIs, Supabase, auth, cookies, links nuevos ni botones live.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node scripts/validate-workspace-context-mock-boundary.mjs
node scripts/validate-workspace-filtered-vertical-registry.mjs
node scripts/validate-vertical-registry-access-diagnostics.mjs
node scripts/validate-hidden-vertical-diagnostics-preview.mjs
node scripts/validate-console17-local-preview-check.mjs
node scripts/validate-vertical-registry-diagnostics-summary.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

## Restricciones respetadas

- No wa-agent-unilatino, InsForge, YCloud, GHL, Supabase remoto
- No middleware/auth/layout global
- No `package.json` / lockfiles / `.env.local`
- No rutas productivas nuevas
- No commit automático

## Riesgos abiertos

- Mock registry con un solo vertical: muchos conteos hidden en 0
- Otras rutas `(main)` con `createClient()` directo siguen fuera de scope

## Siguiente fase recomendada

**CONSOLE-19 — Registry summary visual polish and compact layout**

Ordenar visualmente las secciones del dashboard mock antes de datos reales.
