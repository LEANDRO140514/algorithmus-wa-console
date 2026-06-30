# CONSOLE-8 — Vertical registry list mock UI

## 3.1 Resumen

CONSOLE-8 crea una **UI mock/read-only** para listar verticales registrados en `algorithmus-wa-console`.

Usa exclusivamente el registry mock creado en CONSOLE-7 (`listVerticalRegistryEntries()`).

## 3.2 Objetivo

Pasar de un panel hardcodeado de Eva a una **base visual multi-vertical** preparada para escalar.

## 3.3 Data source

| Campo | Valor |
| ----- | ----- |
| Fuente | `listVerticalRegistryEntries()` |
| Registry | `VERTICAL_REGISTRY_MOCK` |
| Modo | mock / read-only |
| fetch | No |
| axios | No |
| Supabase | No |
| InsForge | No |
| process.env | No |
| secrets | No |

## 3.4 Primer vertical mostrado

**Eva WA Universidad Latino**

| Campo | Valor |
| ----- | ----- |
| verticalId | `eva-wa-unilatino` |
| tenantId | `universidad-latino` |
| repo | `wa-agent-unilatino` |
| runtimeTarget | InsForge |
| provider | YCloud (`ycloud`) |
| CRM | GHL (`ghl`) |
| status | `mock_readonly` |
| path | `/verticals/eva/status` |

## 3.5 Non-goals

Esta fase **no** incluye:

- No API calls reales.
- No webhook routing.
- No Supabase migration.
- No InsForge writes.
- No GHL writes.
- No YCloud writes.
- No activation of CAG response.
- No LLM/RAG activation.
- No native decision-engine for Eva.
- No production integration.
- No live controls.
- No flag writes.
- No navigation global wiring.
- No auth/middleware changes.

## 3.6 UI behavior

`VerticalRegistryList` muestra por vertical:

- displayName, description, verticalId, tenantId
- repo, owner, provider, crm, runtimeTarget
- dataMode, connectionMode, consoleStatus, tags
- capabilities principales
- safety level, readOnly, canActivateLive, canChangeWebhook, canAccessSecrets, containsPii
- enlace visual a `statusPanelPath`

Resumen agregado: total verticales, mock count, read-only count, live controls blocked count.

## 3.7 Safety UI rules

- No botones live.
- No toggles editables.
- No formularios de escritura.
- No PII, teléfonos ni tokens.
- Links solo a rutas mock/read-only.
- Badges: mock, read-only, blocked.

Etiquetas obligatorias: Mock read-only data, No live controls, Console observes, Verticals decide, Live controls blocked, Flag writes blocked, No production services are called.

## 3.8 Route

| Ruta | Archivo |
| ---- | ------- |
| `/verticals` | `src/app/verticals/page.tsx` |

Fuera de route groups productivos. Sin navegación global. Sin cambios middleware/auth.

## 3.9 Future use

- tenant-aware vertical list
- agency-aware vertical list
- vertical registry real read-only
- status panel routing
- health cards
- permissions/roles
- approval workflow

## 3.10 Next phase

**CONSOLE-9 — Tenant-aware vertical route design**

Decidir rutas por tenant/workspace/agency antes de navegación global o producción.

Alternativa: CONSOLE-9 — Registry to Eva status panel linking review.

## Entregables CONSOLE-8

| Archivo | Rol |
| ------- | --- |
| `src/components/verticals/VerticalRegistryList.tsx` | Lista mock |
| `src/components/verticals/index.ts` | Barrel local |
| `src/app/verticals/page.tsx` | Ruta demo `/verticals` |
| `tests/run-console8-vertical-registry-list-ui-validator.mjs` | Validador |
