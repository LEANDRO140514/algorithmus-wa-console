# CONSOLE-12 — Tenant route preview contract

Documento de fase: tenant route preview contract.

## Objetivo

Crear un contrato local/mock para **resolver rutas futuras** declaradas en `routeMetadata` (CONSOLE-10) usando parámetros demo, sin crear rutas productivas ni navegación real.

CONSOLE-12 solo resuelve rutas futuras como strings preview.
CONSOLE-12 no crea rutas tenant-aware reales.
CONSOLE-12 no crea navegación productiva.
CONSOLE-12 no mueve /verticals ni /verticals/eva/status.
CONSOLE-12 no toca middleware, auth, layout ni nav global.
CONSOLE-12 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-10** declaró paths template con placeholders `[workspaceId]`, `[tenantId]`, `[verticalId]`.
- **CONSOLE-11** mostró esos templates como texto read-only en la UI.
- **CONSOLE-12** añade un resolver puro que traduce templates a **ejemplos resueltos** para diseño y validación.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/lib/verticals/vertical-route-preview.ts` | **Nuevo** — contrato de resolución mock |
| `src/lib/verticals/index.ts` | Re-export helpers y tipos preview |
| `src/components/verticals/VerticalRegistryList.tsx` | Consume `buildVerticalRoutePreview` |
| `scripts/validate-vertical-route-preview-contract.mjs` | Validator CONSOLE-12 |
| `docs/console-12-tenant-route-preview-contract.md` | Este documento |

**Sin cambios:** `vertical-registry.mock.ts`, tipos registry, rutas `app/verticals/*`, middleware, auth, nav, `package.json`.

## Contrato creado

### Tipos

- `VerticalRoutePreviewInput` — `{ entry, params? }`
- `VerticalRoutePreviewResult` — templates + resolved paths + `isPreviewOnly: true`

### Helper creado

| Función | Propósito |
| ------- | --------- |
| `resolveVerticalRoutePath` | Reemplaza placeholders en un template string |
| `mergeVerticalRoutePreviewParams` | Combina defaults demo + metadata + overrides |
| `buildVerticalRoutePreview` | Construye resultado completo desde registry entry |

## Params mock

```ts
DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS = {
  workspaceId: "demo-workspace",
  tenantId: "demo-tenant",
  verticalId: "eva",
}
```

## Ejemplos de resolución

| Template | Preview resuelto |
| -------- | ---------------- |
| `/workspaces/[workspaceId]/verticals/[verticalId]/status` | `/workspaces/demo-workspace/verticals/eva/status` |
| `/agency/verticals/[tenantId]/[verticalId]/status` | `/agency/verticals/demo-tenant/eva/status` |

Preview operativo existente (sin cambio): `/verticals/eva/status` vía `entry.statusPanelPath`.

## Cómo se consume en UI

`RouteMetadataPreview` en `VerticalRegistryList.tsx` llama `buildVerticalRoutePreview({ entry })` y muestra:

- workspace route template / workspace route preview
- agency route template / agency route preview
- `isPreviewOnly: true`

Nota explícita: **Preview-only route resolution. Future paths are not navigable.**

Único link navegable: **Open mock status panel** → `entry.statusPanelPath`.

## Qué sigue siendo read-only

- Helpers puros: sin `fetch`, sin router, sin `window.location`, sin APIs.
- Paths resueltos son strings de ejemplo; no existen como rutas App Router.
- Sin botones, sin live controls.

## Por qué no se crean rutas productivas

Rutas bajo `/workspaces` o `/agency/verticals` requieren auth, middleware y workspace context. CONSOLE-12 solo entrega el **contrato de resolución** para preview y diseño.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

Salida esperada CONSOLE-12:

```txt
CONSOLE-12 vertical route preview contract validation PASS
```

## Restricciones respetadas

- No `wa-agent-unilatino`, InsForge, YCloud, GHL, Supabase remoto
- No middleware / auth / layout / No navigation global wiring
- No live controls, APIs reales, deploy
- No `package.json` / lockfiles
- No rutas productivas nuevas bajo `src/app/workspaces` ni `src/app/agency/verticals`

## Riesgos abiertos

1. **Params demo fijos** — producción usará workspace/tenant del contexto de sesión.
2. **Slug `eva` vs `eva-wa-unilatino`** — unificar al implementar rutas reales.
3. **UI puede confundir** — paths resueltos parecen navegables; mitigado con labels y nota preview-only.

## Siguiente fase recomendada

**CONSOLE-13** — Workspace context mock boundary: representar workspace/tenant context de forma local/read-only, sin auth real ni rutas productivas.
