# CONSOLE-14 — Workspace-filtered vertical registry mock

## Objetivo

Filtrar el **Vertical Registry** usando `workspaceContext.verticalAccess` mock, mostrando solo verticales visibles para el workspace context local — sin auth real, sin permisos reales, sin Supabase ni rutas productivas.

CONSOLE-14 filtra el Vertical Registry usando workspace context mock/read-only.
CONSOLE-14 no activa workspace real.
CONSOLE-14 no crea permisos reales.
CONSOLE-14 no lee sesión real.
CONSOLE-14 no usa Supabase.
CONSOLE-14 no crea rutas tenant-aware reales.
CONSOLE-14 no crea navegación productiva.
CONSOLE-14 no mueve /verticals ni /verticals/eva/status.
CONSOLE-14 no toca middleware, auth, layout ni nav global.
CONSOLE-14 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-13** introdujo `MOCK_WORKSPACE_CONTEXT` con `verticalAccess` y roles.
- **CONSOLE-14** aplica ese contexto para filtrar `listVerticalRegistryEntries()` antes del render.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/lib/verticals/vertical-registry-filter.mock.ts` | **Nuevo** — helper de filtrado mock |
| `src/lib/verticals/index.ts` | Re-export del filtro |
| `src/components/verticals/VerticalRegistryList.tsx` | Lista filtrada + Workspace filter preview |
| `scripts/validate-workspace-filtered-vertical-registry.mjs` | Validator CONSOLE-14 |
| `docs/console-14-workspace-filtered-vertical-registry-mock.md` | Este documento |

**Sin cambios:** `vertical-registry.mock.ts`, workspace context, rutas `app/`, middleware, auth, nav, `package.json`.

## Helper creado

| Función | Propósito |
| ------- | --------- |
| `hasAnyWorkspaceRole` | Intersección pura entre roles de contexto y roles permitidos |
| `findVerticalAccess` | Busca access por `verticalId` o `routeVerticalId` |
| `isVerticalVisibleForWorkspace` | Evalúa visibilidad de un entry |
| `filterVerticalRegistryForWorkspace` | Parte entries en `visibleEntries` / `hiddenEntries` |

## Contrato de filtrado

`WorkspaceVerticalFilterResult`:

- `visibleEntries`, `hiddenEntries`
- `accessByVerticalId`
- `isMock: true`, `isReadOnly: true`, `reason: "workspace_context_mock"`

## Reglas de visibilidad

Un vertical es **visible** si:

1. Existe `verticalAccess` para ese vertical.
2. `verticalAccess.visible === true`.
3. Hay intersección entre `workspaceContext.roles` y `verticalAccess.allowedRoles`.

Es **hidden** si:

- No hay `verticalAccess`, o
- `visible === false`, o
- No hay roles compatibles.

## Matching

| Estrategia | Condición |
| ---------- | --------- |
| Por `verticalId` | `access.verticalId === entry.verticalId` |
| Por `routeVerticalId` | `access.routeVerticalId === entry.routeMetadata.routeParams.verticalId` |

## Cómo usa workspaceContext.verticalAccess

`filterVerticalRegistryForWorkspace({ entries, workspaceContext })` itera el registry mock y consulta `verticalAccess` del contexto mock CONSOLE-13.

## Cómo se consume en UI

1. `getMockWorkspaceContext()` + `listVerticalRegistryEntries()`.
2. `filterVerticalRegistryForWorkspace(...)`.
3. Bloque **Workspace filter preview**: visible/hidden counts, filter mode, mock, read-only.
4. Cards renderizadas solo desde `visibleEntries`.
5. Estado vacío: *No verticals visible for the current mock workspace context.*
6. CONSOLE-11/12/13 intactos: context preview, route preview, único link → `statusPanelPath`.

Con el mock actual, **Eva WA** (`eva-wa-unilatino`) permanece visible.

## Qué sigue siendo read-only

- Filtrado puro en memoria; no modifica entries originales.
- Sin APIs, session, cookies, Supabase.
- Sin botones ni cambio de contexto.

## Por qué no se usa auth real

RBAC real requiere sesión y membership; CONSOLE-14 simula el boundary con datos hardcoded.

## Por qué no se usa Supabase remoto

El registry y el contexto son mock locales para diseño seguro.

## Por qué no se crean rutas productivas

El filtro solo afecta qué cards se muestran en `/verticals`; no crea App Router bajo `/workspaces` o `/agency`.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node scripts/validate-workspace-context-mock-boundary.mjs
node scripts/validate-workspace-filtered-vertical-registry.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

Salida esperada CONSOLE-14:

```txt
CONSOLE-14 workspace-filtered vertical registry validation PASS
```

## Restricciones respetadas

- No wa-agent-unilatino, InsForge, YCloud, GHL, Supabase remoto
- No middleware / auth / layout / No navigation global wiring
- No package.json / lockfiles / deploy / APIs reales
- No rutas productivas nuevas

## Riesgos abiertos

1. **Un solo vertical en registry** — hidden count será 0 hasta agregar más entries.
2. **Sin diagnóstico por vertical** — CONSOLE-15 mostrará por qué visible/oculto.
3. **Roles mock amplios** — producción tendrá roles reales más restrictivos.

## Siguiente fase recomendada

**CONSOLE-15** — Vertical registry access diagnostics mock: diagnósticos read-only de visibilidad por vertical, sin auth ni permisos reales.
