# CONSOLE-13 — Workspace context mock boundary

## Objetivo

Crear un boundary mock/read-only para representar **workspace/tenant context** local de la consola, sin auth real, sin middleware, sin Supabase remoto y sin rutas productivas.

CONSOLE-13 crea un workspace context mock/read-only.
CONSOLE-13 no activa workspace real.
CONSOLE-13 no lee sesión real.
CONSOLE-13 no usa Supabase.
CONSOLE-13 no crea rutas tenant-aware reales.
CONSOLE-13 no crea navegación productiva.
CONSOLE-13 no mueve /verticals ni /verticals/eva/status.
CONSOLE-13 no toca middleware, auth, layout ni nav global.
CONSOLE-13 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-10/11** declararon y mostraron `routeMetadata`.
- **CONSOLE-12** resolvió paths template → preview con defaults hardcoded.
- **CONSOLE-13** centraliza tenant/workspace/roles/vertical access en un **context mock** que alimenta `buildVerticalRoutePreview` vía `routeParams`.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/types/workspaces/workspace-context.ts` | **Nuevo** — tipos de contexto mock |
| `src/lib/workspaces/workspace-context.mock.ts` | **Nuevo** — `MOCK_WORKSPACE_CONTEXT` + helpers |
| `src/lib/workspaces/index.ts` | **Nuevo** — barrel export |
| `src/components/verticals/VerticalRegistryList.tsx` | Context preview + `routeParams` desde mock |
| `scripts/validate-workspace-context-mock-boundary.mjs` | Validator CONSOLE-13 |
| `docs/console-13-workspace-context-mock-boundary.md` | Este documento |

**Sin cambios:** `vertical-registry.mock.ts`, tipos registry, rutas `app/verticals/*`, middleware, auth, nav, `package.json`.

## Tipos creados

- `WorkspaceContextMode`, `WorkspaceContextVisibility`, `WorkspaceContextRole`
- `WorkspaceContextTenant`, `WorkspaceContextWorkspace`
- `WorkspaceContextVerticalAccess`, `WorkspaceContextRouteParams`
- `WorkspaceContext` con `isMock: true` y `isReadOnly: true`

## Mock context creado

### Tenant mock

| Campo | Valor |
| ----- | ----- |
| tenantId | `demo-tenant` |
| tenantSlug | `universidad-latino` |
| tenantName | Universidad Latino |

### Workspace mock

| Campo | Valor |
| ----- | ----- |
| workspaceId | `demo-workspace` |
| workspaceSlug | `admisiones` |
| workspaceName | Admisiones Universidad Latino |

### routeParams mock

```ts
{ tenantId: "demo-tenant", workspaceId: "demo-workspace", verticalId: "eva" }
```

### Roles mock

`owner`, `admin`, `agency_admin`, `workspace_admin`, `viewer`

### Vertical access mock

| Campo | Valor |
| ----- | ----- |
| verticalId | `eva-wa-unilatino` |
| routeVerticalId | `eva` |
| visible | `true` |
| allowedRoles | owner, admin, agency_admin, workspace_admin, viewer |

## Cómo se consume en UI

1. `getMockWorkspaceContext()` al inicio de `VerticalRegistryList`.
2. Bloque **Context preview** (discreto, read-only): tenant, workspace, mode, mock, read-only.
3. Por vertical: `buildVerticalRoutePreview({ entry, params: workspaceContext.routeParams })`.
4. Rutas workspace/agency resueltas siguen siendo **texto**, no links.
5. Único link navegable: **Open mock status panel** → `entry.statusPanelPath`.

## Integración con CONSOLE-12

CONSOLE-12 introdujo `buildVerticalRoutePreview` con `DEFAULT_VERTICAL_ROUTE_PREVIEW_PARAMS`. CONSOLE-13 reemplaza el origen de esos params por `workspaceContext.routeParams` del mock boundary — mismos valores demo, pero con contrato explícito de contexto.

## Qué sigue siendo read-only

- Contexto hardcoded; no cookies, no session, no Supabase client.
- Sin botones, dropdowns ni workspace switcher real.
- Sin APIs ni side effects.

## Por qué no se usa auth real

Auth/middleware requieren sesión Supabase y membership workspace — fuera de alcance. CONSOLE-13 define el **contrato** que una fase futura podrá alimentar desde sesión real.

## Por qué no se usa Supabase remoto

El registry vertical y el contexto workspace son mock locales para diseño seguro sin tocar infra heredada.

## Por qué no se crean rutas productivas

Rutas bajo `/workspaces` o `/agency/verticals` implican App Router productivo + guards. CONSOLE-13 solo provee strings preview.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node scripts/validate-workspace-context-mock-boundary.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

Salida esperada CONSOLE-13:

```txt
CONSOLE-13 workspace context mock boundary validation PASS
```

## Restricciones respetadas

- No wa-agent-unilatino, InsForge, YCloud, GHL, Supabase remoto
- No middleware / auth / layout / No navigation global wiring
- No package.json / lockfiles / deploy / APIs reales
- No rutas bajo `src/app/workspaces` ni `src/app/agency/verticals`

## Riesgos abiertos

1. **Contexto demo fijo** — no refleja workspace switcher ni membership real.
2. **Un solo vertical en verticalAccess** — CONSOLE-14 filtrará registry por access.
3. **Slug eva vs eva-wa-unilatino** — verticalAccess separa ambos; unificar en rutas reales.

## Siguiente fase recomendada

**CONSOLE-14** — Workspace-filtered vertical registry mock: filtrar verticales visibles según `workspaceContext.verticalAccess`, mock/read-only, sin auth ni Supabase.
