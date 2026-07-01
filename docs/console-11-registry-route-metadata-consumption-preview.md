# CONSOLE-11 — Registry route metadata consumption preview

## Objetivo

Consumir `routeMetadata` en la UI del Vertical Registry para mostrar información **read-only** sobre rutas preview y futuras declaradas en CONSOLE-10.

CONSOLE-11 consume routeMetadata solo para visualización read-only.
CONSOLE-11 no activa rutas tenant-aware reales.
CONSOLE-11 no crea navegación productiva.
CONSOLE-11 no mueve /verticals ni /verticals/eva/status.
CONSOLE-11 no toca middleware, auth, layout ni nav global.

## Contexto

- **CONSOLE-10** agregó `routeMetadata` al registry mock (paths preview/workspace/agency, flags de awareness, roles, surfaces).
- **CONSOLE-11** hace visible esa metadata en `VerticalRegistryList` sin cambiar rutas ni navegación global.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Alcance

### Incluido

- Subcomponente `RouteMetadataPreview` en `VerticalRegistryList.tsx`.
- Visualización read-only de:
  - route mode, visibility
  - preview route, workspace route (future), agency route (future)
  - tenant-aware / workspace-aware / agency-aware (yes/no)
  - allowed roles, route surfaces
- Mantener el único link navegable existente: **Open mock status panel** → `entry.statusPanelPath`.
- Validator: `scripts/validate-vertical-registry-route-consumption.mjs`.
- Esta documentación.

### Excluido

- Links navegables a `workspaceStatusPanelPath` o `agencyStatusPanelPath`.
- Botones, acciones, live controls.
- Cambios en mock registry, tipos, rutas `app/`, middleware, auth, nav.
- `package.json`, lockfiles, APIs reales, deploy.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/components/verticals/VerticalRegistryList.tsx` | Consume `routeMetadata` vía `RouteMetadataPreview` |
| `scripts/validate-vertical-registry-route-consumption.mjs` | Validator CONSOLE-11 |
| `docs/console-11-registry-route-metadata-consumption-preview.md` | Este documento |

**Sin cambios:** tipos, mock registry, rutas preview, middleware, auth, layout, nav, `package.json`.

## Qué metadata se consume

Desde `entry.routeMetadata` (CONSOLE-10):

- `routeMode`, `visibility`
- `previewStatusPanelPath`, `workspaceStatusPanelPath`, `agencyStatusPanelPath`
- `tenantAware`, `workspaceAware`, `agencyAware`
- `allowedRoles`, `routeSurface`

También se conserva `entry.statusPanelPath` para el único link preview operativo.

## Cómo se muestra en UI

Subcomponente local `RouteMetadataPreview` dentro de `VerticalRegistryList.tsx`:

- Campos en filas compactas (`FieldRow`, `PathTextRow`, `BoolYesNoRow`).
- Paths futuros workspace/agency como **texto monoespaciado**, sin `<a href>`.
- Awareness flags como **yes/no**.
- Nota: *Future workspace/agency paths are declarative only — not navigable.*

## Qué sigue siendo read-only

- Todo el registry sigue siendo mock local (`listVerticalRegistryEntries`).
- No hay fetch, APIs, live controls ni flag writes.
- El único enlace navegable sigue siendo **Open mock status panel** → `entry.statusPanelPath`.

## Por qué no se crean rutas productivas

- CONSOLE-9/10 definieron paths futuros solo como **metadata declarativa**.
- Rutas productivas workspace/agency requieren auth, middleware, workspace context y nav — fuera de alcance.
- Esta fase solo **consume y muestra** metadata para revisión humana antes de implementar App Router productivo.

## UI — Route metadata consumption

Por cada vertical en el registry, la tarjeta muestra un bloque **Route metadata (read-only)** con:

| Campo UI | Fuente |
| -------- | ------ |
| routeMode | `routeMetadata.routeMode` |
| visibility | `routeMetadata.visibility` |
| preview route | `routeMetadata.previewStatusPanelPath` (texto) |
| workspace route (future) | `routeMetadata.workspaceStatusPanelPath` (texto) |
| agency route (future) | `routeMetadata.agencyStatusPanelPath` (texto) |
| tenant-aware | `routeMetadata.tenantAware` → yes/no |
| workspace-aware | `routeMetadata.workspaceAware` → yes/no |
| agency-aware | `routeMetadata.agencyAware` → yes/no |
| allowedRoles | lista join |
| routeSurface | lista join |

Nota al pie: *Future workspace/agency paths are declarative only — not navigable.*

El link **Open mock status panel** sigue apuntando solo a `entry.statusPanelPath` (`/verticals/eva/status` para Eva).

## Rutas preview actuales (sin cambio)

| Ruta | Estado |
| ---- | ------ |
| `/verticals` | Mock registry list |
| `/verticals/eva/status` | Mock Eva status panel |

## Rutas futuras (solo declarativas en UI)

| Path template | En UI |
| ------------- | ----- |
| `/workspaces/[workspaceId]/verticals/[verticalId]/status` | Texto, no link |
| `/agency/verticals/[tenantId]/[verticalId]/status` | Texto, no link |

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-registry-routes.mjs
```

Salida esperada CONSOLE-11:

```txt
CONSOLE-11 registry route metadata consumption validation PASS
```

## Restricciones respetadas

- No `wa-agent-unilatino`, InsForge, YCloud, GHL, Supabase remoto
- No webhook, decision-engine, native agents, RAG, LLM
- No middleware / auth / layout / No navigation global wiring
- No live controls, flag writes, APIs reales
- No `package.json` / lockfiles
- No rutas nuevas bajo `/workspaces` o `/agency`
- No deploy, no commit en esta fase (revisión humana)

## Riesgos abiertos

1. **Un solo link preview** — usuarios con sesión pueden abrir `/verticals/eva/status` directo; sin contexto tenant (CONSOLE-6/9).
2. **Metadata vs navegación** — la UI muestra paths futuros que aún no existen en App Router.
3. **Slug `eva` en routeParams** — distinto de `verticalId` registry; unificar en fase de rutas reales.

## Siguiente fase recomendada

**CONSOLE-12** — Workspace context guard design (o equivalente): diseñar cómo las rutas tenant-aware validarán membership antes de implementar `page.tsx` productivos.
