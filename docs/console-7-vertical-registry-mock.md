# CONSOLE-7 — Vertical registry mock

## 3.1 Resumen

CONSOLE-7 crea un **Vertical registry mock** read-only para preparar `algorithmus-wa-console` como control plane **multi-vertical**.

No integra APIs reales ni modifica runtime de verticales.

## 3.2 Objetivo

Evitar que Eva quede como único vertical hardcodeado.

Preparar una estructura donde la consola pueda:

- listar verticales registrados;
- ver estado conceptual y capacidades;
- enlazar a paneles de estado (mock).

## 3.3 Primer vertical registrado

| Campo | Valor |
| ----- | ----- |
| verticalId | `eva-wa-unilatino` |
| tenantId | `universidad-latino` |
| displayName | Eva WA Universidad Latino |
| repo | `wa-agent-unilatino` |
| provider | `ycloud` |
| crm | `ghl` |
| runtimeTarget | InsForge |
| consoleStatus | `mock_readonly` |
| statusPanelPath | `/verticals/eva/status` |

## 3.4 Non-goals

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

## 3.5 Registry model

Campos de `VerticalRegistryEntry`:

| Campo | Descripción |
| ----- | ----------- |
| verticalId | Identificador estable del vertical |
| tenantId | Tenant lógico asociado |
| displayName | Nombre visible en consola |
| description | Resumen corto |
| repo | Repositorio del vertical |
| owner | Propietario/org GitHub |
| provider | WhatsApp provider |
| crm | CRM integrado |
| runtimeTarget | Destino runtime (InsForge, legacy, etc.) |
| dataMode | Modo de datos |
| connectionMode | Modo de conexión consola ↔ vertical |
| consoleStatus | Estado en consola |
| statusPanelPath | Ruta al panel de estado |
| capabilities | Capacidades habilitadas/bloqueadas |
| safety | Perfil de seguridad read-only |
| tags | Etiquetas de búsqueda |
| createdAt | ISO timestamp |
| updatedAt | ISO timestamp |

`VerticalRegistry` agrupa `version`, `entries`, `updatedAt`.

## 3.6 Data modes

| Modo | Uso |
| ---- | --- |
| `mock` | Datos fixture local |
| `read_only` | API read-only futura |
| `live_read_only` | Producción observacional |
| `controlled_write_candidate` | Candidato a escritura aprobada |
| `live_write` | Escritura productiva (no en CONSOLE-7) |

**CONSOLE-7:** solo `mock`.

## 3.7 Connection modes

| Modo | Uso |
| ---- | --- |
| `none` | Sin conexión |
| `mock_connector` | Connector mock local (CONSOLE-4) |
| `api_read_only` | API vertical read-only |
| `event_replica` | Réplica de eventos |
| `webhook_router` | Routing webhook (no Eva) |
| `direct_db` | Acceso DB directo (evitar) |

**CONSOLE-7:** `mock_connector`.

## 3.8 Console status

| Estado | Uso |
| ------ | --- |
| `draft` | Borrador |
| `mock_readonly` | Preview mock |
| `ready_for_readonly_api` | Listo para API read-only |
| `observing` | Observación activa |
| `blocked` | Bloqueado |
| `deprecated` | Deprecado |

**Eva en CONSOLE-7:** `mock_readonly`.

## 3.9 Safety rules

- Registry **no contiene secrets**.
- Registry **no contiene teléfonos reales**.
- Registry **no contiene payloads** WhatsApp/GHL.
- Registry **no contiene PII** estudiantil.
- Registry **no habilita live**.
- Registry **no cambia flags**.
- Registry **no controla runtime**.
- Registry **solo describe** verticales.

## 3.10 Future use

El registry podrá alimentar después:

- listado de verticales;
- selector de vertical;
- panel de estado;
- rutas tenant-aware;
- permisos agency/workspace;
- health cards;
- vertical connector real read-only.

## 3.11 Implementación local

| Archivo | Rol |
| ------- | --- |
| `src/types/verticals/vertical-registry.ts` | Tipos |
| `src/lib/verticals/vertical-registry.mock.ts` | Mock + funciones read-only |
| `src/lib/verticals/index.ts` | Exports |

## 3.12 Next phase

**CONSOLE-8 — Vertical registry list mock UI**

Mostrar lista de verticales mock antes de conectar paneles al registry.

Alternativa: CONSOLE-8 — Eva status panel registry integration.
