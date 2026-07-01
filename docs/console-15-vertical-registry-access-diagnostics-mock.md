# CONSOLE-15 — Vertical registry access diagnostics mock

## Objetivo

Mostrar **diagnósticos mock/read-only** que explican por qué un vertical del registry es visible u oculto según el filtro de **CONSOLE-14**, sin auth real, permisos reales, Supabase ni rutas productivas.

CONSOLE-15 muestra diagnostics mock/read-only de acceso por vertical.
CONSOLE-15 explica el filtro de CONSOLE-14.
CONSOLE-15 no activa workspace real.
CONSOLE-15 no crea permisos reales.
CONSOLE-15 no lee sesión real.
CONSOLE-15 no usa Supabase.
CONSOLE-15 no crea rutas tenant-aware reales.
CONSOLE-15 no crea navegación productiva.
CONSOLE-15 no mueve /verticals ni /verticals/eva/status.
CONSOLE-15 no toca middleware, auth, layout ni nav global.
CONSOLE-15 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-13** definió `MOCK_WORKSPACE_CONTEXT` con `verticalAccess` y roles.
- **CONSOLE-14** filtró el registry con `filterVerticalRegistryForWorkspace`.
- **CONSOLE-15** añade `diagnoseVerticalAccess` para explicar cada decisión de visibilidad en la UI.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/lib/verticals/vertical-registry-access-diagnostics.mock.ts` | **Nuevo** — helper de diagnostics mock |
| `src/lib/verticals/index.ts` | Re-export del helper |
| `src/components/verticals/VerticalRegistryList.tsx` | Bloque Access diagnostics por vertical visible |
| `scripts/validate-vertical-registry-access-diagnostics.mjs` | Validator CONSOLE-15 |
| `docs/console-15-vertical-registry-access-diagnostics-mock.md` | Este documento |

**Sin cambios:** `vertical-registry.mock.ts`, workspace context types/mock, rutas `app/`, middleware, auth, nav, `package.json`, lockfiles.

## Helper creado

| Función | Propósito |
| ------- | --------- |
| `getMatchedWorkspaceRoles` | Roles del contexto que están en `allowedRoles` |
| `getMissingWorkspaceRoles` | Roles permitidos que el contexto no tiene |
| `diagnoseVerticalAccess` | Diagnóstico completo para un entry + workspace context |
| `diagnoseVerticalRegistryAccess` | Diagnósticos para una lista de entries |

Reutiliza `hasAnyWorkspaceRole` de `vertical-registry-filter.mock.ts` para coherencia con CONSOLE-14.

## Contrato de diagnostics

`VerticalAccessDiagnostic`:

- `verticalId`, `routeVerticalId?`
- `matchType`: `verticalId` | `routeVerticalId` | `none`
- `access?`, `accessFound`, `accessVisible`
- `contextRoles`, `allowedRoles`, `matchedRoles`, `missingRoles`
- `rolesCompatible`, `status`, `isVisible`
- `isMock: true`, `isReadOnly: true`, `reason: "workspace_access_diagnostics_mock"`

## Status soportados

| Status | Condición |
| ------ | --------- |
| `visible` | Access encontrado, `visible === true`, roles compatibles |
| `hidden_no_access` | No hay entrada en `verticalAccess` |
| `hidden_not_visible` | Access existe pero `visible === false` |
| `hidden_roles_incompatible` | Access visible pero sin intersección de roles |

`isVisible` es `true` solo cuando `status === "visible"`.

## Match por verticalId

Prioridad 1: `access.verticalId === entry.verticalId` → `matchType: "verticalId"`.

## Match por routeVerticalId

Prioridad 2 (si no hubo match por verticalId): `access.routeVerticalId === entry.routeMetadata.routeParams.verticalId` → `matchType: "routeVerticalId"`.

## Match none

Si no hay coincidencia → `matchType: "none"`, `status: "hidden_no_access"`.

## Roles compatibles y faltantes

- `matchedRoles`: intersección entre `workspaceContext.roles` y `access.allowedRoles`.
- `missingRoles`: roles en `allowedRoles` que no están en el contexto.
- `rolesCompatible`: al menos un rol coincidente cuando hay access visible.

## Cómo usa workspaceContext.verticalAccess

`diagnoseVerticalAccess({ entry, workspaceContext })` lee el mismo `verticalAccess` mock que CONSOLE-14, con prioridad explícita verticalId → routeVerticalId.

## Consumo en UI

`VerticalRegistryList`:

1. Obtiene `workspaceContext` mock (CONSOLE-13).
2. Filtra con `filterVerticalRegistryForWorkspace` (CONSOLE-14).
3. Para cada `visibleEntry`, llama `diagnoseVerticalAccess` y muestra bloque **Access diagnostics** (status, match, access found/visible, roles compatible, matched/missing roles, mock/read-only).
4. Workspace filter preview incluye `Diagnostics mode: workspace_access_diagnostics_mock`.

Solo verticales visibles muestran diagnostics detallados en esta fase. El conteo de hidden sigue en el filter preview.

## Qué sigue siendo read-only

- Sin APIs, Supabase, auth, cookies, sesión.
- Sin botones, dropdowns ni navegación nueva.
- Único link navegable: `entry.statusPanelPath`.
- Rutas workspace/agency resueltas siguen siendo texto.

## Por qué no auth / Supabase / permisos reales

La consola aún opera en modo observación mock. Los diagnostics explican el contrato futuro sin activar RBAC ni leer tenant real.

## Por qué no rutas productivas

CONSOLE-15 documenta visibilidad; no introduce `/workspaces` ni `/agency/verticals` navegables.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node scripts/validate-workspace-context-mock-boundary.mjs
node scripts/validate-workspace-filtered-vertical-registry.mjs
node scripts/validate-vertical-registry-access-diagnostics.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

## Restricciones respetadas

- No wa-agent-unilatino, InsForge, YCloud, GHL, Supabase remoto.
- No middleware, auth, layout global, nav global.
- No `package.json` ni lockfiles.
- No rutas productivas nuevas bajo `/workspaces` o `/agency`.
- No commit automático — revisión humana primero.

## Riesgos abiertos

- Diagnostics solo para entries visibles; ocultos sin detalle hasta CONSOLE-16.
- Lógica duplicada mínima entre filter y diagnostics (match priority explícita en diagnostics).
- Mock context fijo; cambios de tenant real requerirán fase posterior.

## Siguiente fase recomendada

**CONSOLE-16 — Hidden vertical diagnostics preview**

Mostrar diagnósticos read-only también para verticales ocultos por workspace context mock, sin auth real, permisos reales, Supabase ni rutas productivas.
