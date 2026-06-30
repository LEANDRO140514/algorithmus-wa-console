# CONSOLE-10 — Registry route metadata extension mock

## Objetivo

Extender el Vertical Registry mock para que cada vertical declare **metadata de rutas futuras** (preview, workspace-aware, agency-aware) sin mover rutas reales ni activar navegación productiva.

CONSOLE-10 no activa rutas tenant-aware reales.
CONSOLE-10 no mueve `/verticals` ni `/verticals/eva/status`.
CONSOLE-10 solo declara metadata mock/read-only para rutas futuras.

## Contexto

- **CONSOLE-7** introdujo el registry mock y tipos base.
- **CONSOLE-8** añadió la UI de lista en `/verticals`.
- **CONSOLE-9** documentó el diseño tenant-aware/agency-aware sin implementar rutas productivas.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

`wa-agent-unilatino` sigue siendo el cerebro de Eva WA; la consola solo declara capacidades futuras en metadata.

## Alcance

### Incluido

- Tipos `VerticalRouteMetadata` y relacionados en el registry.
- Campo `routeMetadata` en `VerticalRegistryEntry`.
- Metadata mock para Eva WA Universidad Latino.
- Línea read-only opcional en `VerticalRegistryList` (preview route + route mode).
- Validator local: `scripts/validate-vertical-registry-routes.mjs`.
- Esta documentación.

### Excluido

- Mover rutas preview existentes.
- Crear rutas bajo `app/workspaces` o `app/agency`.
- Auth, middleware, layout global, navegación global.
- APIs reales, webhooks, InsForge, YCloud, GHL, Supabase remoto.
- Live controls, flag writes, deploy, migraciones.
- Cambios en `package.json` o lockfiles.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/types/verticals/vertical-registry.ts` | Tipos de route metadata + `routeMetadata` en entry |
| `src/lib/verticals/vertical-registry.mock.ts` | `routeMetadata` Eva + version `mock-console-10` |
| `src/lib/verticals/index.ts` | Re-export de tipos de rutas |
| `src/components/verticals/VerticalRegistryList.tsx` | Línea read-only preview route / route mode |
| `scripts/validate-vertical-registry-routes.mjs` | Validator CONSOLE-10 |
| `docs/console-10-registry-route-metadata-extension-mock.md` | Este documento |

**Sin cambios:** `src/app/verticals/page.tsx`, `src/app/verticals/eva/status/page.tsx`, middleware, auth, nav, `package.json`.

## Metadata agregada

### Tipos nuevos

- `VerticalRouteMode` — `preview` | `workspace` | `agency` | `hybrid`
- `VerticalRouteVisibility` — `hidden` | `preview` | `workspace` | `agency` | `internal`
- `VerticalRouteSurface` — `status_panel`, `registry_list`, `dashboard`, `operations`, `settings`
- `VerticalRouteRole` — `owner`, `admin`, `agency_admin`, `workspace_admin`, `operator`, `viewer`
- `VerticalRouteParams` — placeholders `workspaceId`, `tenantId`, `verticalId`
- `VerticalRouteMetadata` — paths preview/workspace/agency, flags de awareness, roles y surfaces

### Eva WA — `routeMetadata` (mock)

| Campo | Valor |
| ----- | ----- |
| `previewStatusPanelPath` | `/verticals/eva/status` |
| `workspaceStatusPanelPath` | `/workspaces/[workspaceId]/verticals/[verticalId]/status` |
| `agencyStatusPanelPath` | `/agency/verticals/[tenantId]/[verticalId]/status` |
| `routeMode` | `preview` |
| `visibility` | `preview` |
| `allowedRoles` | owner, admin, agency_admin, workspace_admin, viewer |
| `routeParams` | workspaceId, tenantId, verticalId (`eva`) |
| `routeSurface` | status_panel, registry_list |
| `tenantAware` | `true` (capacidad futura) |
| `workspaceAware` | `true` (capacidad futura) |
| `agencyAware` | `true` (capacidad futura) |

`routeMode: "preview"` confirma que las rutas reales siguen siendo las preview aisladas de CONSOLE-5/8.

## Rutas preview actuales (sin cambio)

| Ruta | Propósito |
| ---- | --------- |
| `/verticals` | Lista registry mock |
| `/verticals/eva/status` | Panel status Eva mock |

Ambas fuera de route groups productivos `(main)` / `(agency)` y sin link en nav global.

## Rutas futuras declaradas (no implementadas)

| Contexto | Path template |
| -------- | ------------- |
| Workspace / tenant | `/workspaces/[workspaceId]/verticals/[verticalId]/status` |
| Agency / admin | `/agency/verticals/[tenantId]/[verticalId]/status` |

Solo existen como strings en `routeMetadata`; no hay `page.tsx` productivos bajo esos árboles.

## Por qué no se movieron rutas

1. CONSOLE-9 cerró el **diseño**; CONSOLE-10 solo **declara** metadata.
2. Mover rutas implicaría middleware, auth, workspace context y nav — fuera de alcance.
3. Las preview actuales siguen siendo el sandbox seguro para validar UI mock sin romper `(main)`.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
```

El script verifica:

1. Cada vertical tiene `routeMetadata`.
2. `previewStatusPanelPath` cuando `routeMode` es `preview` o `hybrid`.
3. Coherencia `tenantAware` / `workspaceAware` / `agencyAware` con params y paths.
4. `allowedRoles` y `routeSurface` no vacíos.
5. Preview Eva sigue en `/verticals/eva/status`.
6. No hay rutas productivas nuevas bajo `workspaces` / `agency` verticals.

Salida esperada:

```txt
CONSOLE-10 registry route metadata validation PASS
```

Opcional (si `node_modules` disponible):

```bash
npm run typecheck
npm run lint
```

## Restricciones respetadas

- No `wa-agent-unilatino`
- No InsForge / YCloud / GHL / Supabase remoto
- No webhook, decision-engine, native agents, RAG, LLM
- No secrets ni env real
- No `package.json` / lockfiles
- No middleware / auth / layout / nav global
- No rutas movidas ni productivas nuevas
- No deploy ni migraciones
- No commit en esta fase (revisión humana primero)

## Riesgos abiertos

1. **Doble fuente de path** — `statusPanelPath` y `routeMetadata.previewStatusPanelPath` deben mantenerse alineados hasta CONSOLE-11+.
2. **Middleware sin contexto tenant** — las preview requieren sesión pero no validan workspace/tenant (documentado en CONSOLE-6/9).
3. **Slug `eva` vs `eva-wa-unilatino`** — `routeParams.verticalId` usa slug corto `eva`; al implementar rutas reales habrá que unificar convención.
4. **Consumo UI limitado** — la lista solo muestra preview route y route mode; paths workspace/agency aún no se renderizan (CONSOLE-11).

## Siguiente fase recomendada

**CONSOLE-11 — Registry route metadata consumption preview**

- Leer `routeMetadata` en la UI del registry.
- Mostrar rutas preview y futuras como información read-only.
- Sin links productivos workspace/agency ni live controls.
