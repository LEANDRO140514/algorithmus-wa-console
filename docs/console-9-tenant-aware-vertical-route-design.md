# CONSOLE-9 — Tenant-aware vertical route design

## 3.1 Resumen

CONSOLE-9 diseña la ruta futura **tenant-aware / agency-aware** para verticales dentro de `algorithmus-wa-console`.

Esta fase es **diseño y documentación únicamente**:

- No mueve rutas.
- No integra producción.
- No modifica auth, middleware ni navegación global.

## 3.2 Estado actual

### Rutas mock existentes

| Ruta | Archivo |
| ---- | ------- |
| `/verticals` | `src/app/verticals/page.tsx` |
| `/verticals/eva/status` | `src/app/verticals/eva/status/page.tsx` |

### Aclaraciones

- Son rutas **demo / mock / read-only**.
- Están **fuera** de route groups productivos `(main)`, `(auth)`, `(agency)`.
- **Sin navegación global** — no aparecen en sidebar/header de `(main)`.
- **No son rutas finales de producción**.
- **No llaman servicios reales** — registry y connector mock locales (CONSOLE-7/8).

## 3.3 App Router y route groups

### Route groups detectados

| Group | Rutas ejemplo | Layout |
| ----- | ------------- | ------ |
| `(main)` | `/inbox`, `/dashboard`, `/settings` | Workspace header, nav (Inbox, Dashboard, Settings), workspace switcher |
| `(auth)` | `/login`, `/signup` | Auth layout |
| `(agency)` | `/workspaces` | Agency header, super-admin gate |

### Rutas verticales actuales

```
src/app/verticals/page.tsx
src/app/verticals/eva/status/page.tsx
```

Solo heredan `src/app/layout.tsx` (root: theme, toaster). **No** usan `(main)/layout.tsx` ni workspace context.

### Middleware detectado

Archivo: `middleware.ts` (raíz).

Comportamiento documentado (sin secretos):

- **Supabase session middleware** — refresca sesión vía `@supabase/ssr`.
- Matcher amplio: todas las rutas excepto `_next`, `favicon`, `api/`.
- **publicRoutes** solo para páginas auth: `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- Rutas verticales **no son públicas** — sin usuario → redirect `/login`.
- Con sesión válida, `/verticals` y `/verticals/eva/status` pueden abrirse **directo por URL**.
- **Aún no tienen tenant/workspace context propio** — no validan `workspaceId` ni membership.

### Navegación global actual `(main)`

Links en header: Agency (super-admin), Inbox, Dashboard, Settings. **No incluye `/verticals`.**

## 3.4 Problema a resolver

La consola necesita que verticales sean:

- **tenant-aware**
- **workspace-aware**
- **role-aware**
- **multi-vertical**
- compatibles con **agency / super-admin**
- compatibles con **vertical registry**
- compatibles con **read-only connector primero** (CONSOLE-4)

Hoy Eva está registrada en registry mock pero las rutas no resuelven workspace ni permisos.

## 3.5 Opciones de rutas futuras

### Option A — Dev preview routes

```
/verticals
/verticals/eva/status
```

| | |
| - | - |
| **Uso** | Preview mock, desarrollo interno |
| **Veredicto** | Mantener temporalmente; **no usar como ruta productiva final** |

### Option B — Workspace routes

```
/workspaces/[workspaceId]/verticals
/workspaces/[workspaceId]/verticals/[verticalId]
/workspaces/[workspaceId]/verticals/[verticalId]/status
```

| | |
| - | - |
| **Uso** | Tenant/workspace normal, operación diaria del cliente |
| **Veredicto** | **Candidata principal** para operación cliente |

Nota: `(main)` ya resuelve `active workspace` vía cookie/DB — futuras rutas deben alinearse con ese `workspaceId`.

### Option C — Agency routes

```
/agency/verticals
/agency/verticals/[tenantId]/[verticalId]
/agency/verticals/[tenantId]/[verticalId]/status
```

| | |
| - | - |
| **Uso** | Agencia/super-admin, visión cross-tenant, soporte |
| **Veredicto** | **Candidata** para administración Algorithmus/agencia |

Nota: hoy `(agency)` expone `/workspaces` para super-admin — rutas agency verticales deben integrarse sin romper ese flujo.

### Option D — Dashboard embedded routes

```
/dashboard/verticals
/dashboard/verticals/[verticalId]
```

| | |
| - | - |
| **Uso** | Si el producto centraliza todo en dashboard |
| **Veredicto** | Evaluar contra estructura existente — menos explícito que B/C |

## 3.6 Recomendación

### Mantener rutas demo (temporal)

- `/verticals`
- `/verticals/eva/status`

### Diseñar producción futura con dos superficies

1. **Workspace / tenant surface:**

   `/workspaces/[workspaceId]/verticals/[verticalId]/status`

2. **Agency / admin surface:**

   `/agency/verticals/[tenantId]/[verticalId]/status`

**No implementar en CONSOLE-9.**

## 3.7 Registry requirements

El **vertical registry** deberá evolucionar para incluir o resolver:

| Campo | Propósito |
| ----- | --------- |
| `tenantId` | Tenant lógico (ej. `universidad-latino`) |
| `workspaceId` | Workspace Supabase asociado (futuro) |
| `verticalId` | ID estable (`eva-wa-unilatino`) |
| `slug` | Segmento URL amigable |
| `statusPanelPath` | Ruta demo actual (preview) |
| `workspaceStatusPanelPath` | Ruta productiva workspace |
| `agencyStatusPanelPath` | Ruta productiva agency |
| `allowedRoles` | Roles que pueden ver panel |
| `visibility` | tenant / agency / internal |
| `dataMode` | mock → read_only → … |
| `connectionMode` | mock_connector → api_read_only |
| `consoleStatus` | mock_readonly → observing |
| `safety` | Perfil read-only |
| `capabilities` | status_panel, health, etc. |

**No modificar registry en CONSOLE-9** — solo documentar requisitos.

## 3.8 Permission model draft

### Roles conceptuales

| Rol | Alcance |
| --- | ------- |
| `viewer` | Read-only status |
| `agent` | Read-only + handoff context |
| `admin` | Config proposals; no live sin approval |
| `owner` | Approvals dentro del tenant |
| `agency_admin` | Observación/soporte cross-tenant |
| `super_admin` | Gobernanza plataforma |

**No implementar en CONSOLE-9.**

## 3.9 Safety gates for future route activation

Antes de activar rutas productivas:

- [ ] Tenant/workspace resolution
- [ ] Role check
- [ ] Registry lookup
- [ ] Read-only vertical connector
- [ ] Audit log
- [ ] No secrets in payload
- [ ] No raw PII
- [ ] No live controls by default
- [ ] Approval workflow before writes
- [ ] Clear visual environment badges (mock vs prod)

## 3.10 Migration path

| Fase | Entregable |
| ---- | ---------- |
| CONSOLE-9 | Route design (este documento) |
| CONSOLE-10 | Registry route metadata extension mock |
| CONSOLE-11 | Tenant-aware vertical list mock |
| CONSOLE-12 | Agency-aware vertical list mock |
| CONSOLE-13 | Status panel reads route params mock |
| CONSOLE-14 | Read-only API contract planning |

## 3.11 Non-goals

CONSOLE-9 **no** incluye:

- No route move.
- No middleware change.
- No auth change.
- No nav global wiring.
- No Supabase migration.
- No InsForge writes.
- No API calls reales.
- No webhook routing.
- No production integration.
- No live controls.
- No flag writes.
- No native decision-engine for Eva.
- No LLM/RAG activation.

## 3.12 Decision

**CONSOLE-9 decision:**

- **Keep** `/verticals` and `/verticals/eva/status` as isolated mock preview.
- **Do not add** to nav global.
- **Do not move** into route groups yet.
- **Future production routes** should be tenant-aware and agency-aware (Options B + C).
- **Next step:** extend registry mock with route metadata (CONSOLE-10).

No usar `/verticals/eva/status` como **ruta productiva final**.

## 3.13 Next phase

**CONSOLE-10 — Registry route metadata extension mock**

Antes de más UI tenant-aware, el registry debe representar rutas por workspace/agency sin hardcode.

---

## Referencia rápida — rutas futuras

```
# Preview (mantener)
/verticals
/verticals/eva/status

# Producción futura (diseño)
/workspaces/[workspaceId]/verticals/[verticalId]/status
/agency/verticals/[tenantId]/[verticalId]/status
```
