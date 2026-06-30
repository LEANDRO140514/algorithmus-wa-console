# CONSOLE-4 — Eva vertical connector contract (v0 stub)

## 3.1 Resumen

CONSOLE-4 define un **contrato read-only v0** entre `algorithmus-wa-console` y `wa-agent-unilatino`.

No implementa integración real. Solo tipos, fixture mock, connector stub local y validación documental.

## 3.2 Objetivo

La consola podrá **observar estado del vertical Eva WA** sin controlar runtime: health, flags, CAG mode, knowledge, replay y safety — vía contrato tipado y mock local.

## 3.3 Principio

- **Eva primero** — primer vertical conectado conceptualmente.
- **Webhook YCloud** sigue en `wa-agent-unilatino`.
- **algorithmus-wa-console** observa por contrato/API read-only.
- **No doble webhook** — un solo receptor inbound para Eva.

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

## 3.5 Contract v0 — endpoints conceptuales

| Método | Ruta conceptual | Propósito |
| ------ | --------------- | --------- |
| GET | `GET /health` | Liveness del vertical connector |
| GET | `GET /vertical/status` | Snapshot agregado read-only |
| GET | `/vertical/cag/status` | Modo CAG, categorías, flags shadow |
| GET | `/vertical/knowledge` | Knowledge pack / estrategia CAG |
| GET | `/vertical/replay/latest` | Último resultado de replay/shadow |
| GET | `/vertical/runtime` | WA agent mode, academic engine |
| GET | `/vertical/flags` | Flags visibles (read-only en v0) |

**Aclaración:** estos endpoints son **conceptuales**. No se implementan en `wa-agent-unilatino` en esta fase. No se llaman desde la consola en esta fase.

## 3.6 Payload v0 — modelo conceptual

El snapshot `EvaVerticalStatusSnapshot` agrupa:

| Campo | Descripción |
| ----- | ----------- |
| `verticalId` | Identificador del vertical (`eva-wa-unilatino`) |
| `tenantId` | Tenant lógico (`universidad-latino`) |
| `displayName` | Nombre visible en consola |
| `provider` | WhatsApp provider (`ycloud`) |
| `crm` | CRM (`ghl`) |
| `runtime` | Modo WA agent, academic engine, outbound |
| `ghl` | Sync mode, custom fields, live |
| `llm` | Enabled + mode |
| `cag` | Modo CAG, shadow, response flags, categorías |
| `knowledge` | Source, strategy, RAG productivo |
| `replay` | Último replay/shadow run |
| `safety` | Nivel, read-only, capacidades bloqueadas |
| `flags` | Mapa de flags visibles |
| `timestamps` | `updatedAt`, health `checkedAt` |

## 3.7 Safety

- **No secrets** en payloads del contrato v0.
- **No raw phone numbers** — usar conteos o listas redactadas.
- **No raw WhatsApp payload**.
- **No raw GHL payload**.
- **No full student PII**.
- **`liveAllowedPhones`** redactado si aparece (ej. `["+52***redacted***"]`).
- **Read-only first** — consola observa, no escribe runtime.
- **Default-off controls** — flags de riesgo apagados por defecto en mock.
- **Approval before any future write** — cambios de runtime requieren fase explícita.

## 3.8 Console state machine

Estados observacionales (`EvaConsoleConnectionState`):

| Estado | Significado |
| ------ | ----------- |
| `disconnected` | Sin enlace al vertical |
| `connected_readonly` | Contrato mock/real read-only activo |
| `observing` | Consola muestra snapshot |
| `shadow_visible` | Shadow CAG visible |
| `assistive_shadow_visible` | Comparación asistiva visible |
| `response_enabled_mock_visible` | Flag response mock visible (no outbound) |
| `live_candidate_visible` | Candidato live visible (no activado) |
| `error` | Error de lectura |

Estos estados son **visibles/observacionales**. No activan runtime.

## 3.9 Flags visibles (read-only en v0)

| Flag | Uso |
| ---- | --- |
| `WA_AGENT_MODE` | mock / live_outbound |
| `GHL_SYNC_MODE` | dry_run / live |
| `GHL_WRITE_CUSTOM_FIELDS` | true / false |
| `ACADEMIC_ENGINE_ENABLED` | true / false |
| `EVA_LLM_ENABLED` | true / false |
| `LLM_MODE` | off / shadow / assistive / live |
| `EVA_CAG_SHADOW_LOGGING` | shadow CAG en handler |
| `EVA_CAG_ASSISTIVE_SHADOW` | comparación asistiva |
| `EVA_CAG_RESPONSE_ENABLED` | response mock (default off) |

La consola puede **mostrarlos read-only** en v0. **No puede cambiarlos** en v0.

## 3.10 Implementación local (CONSOLE-4)

| Archivo | Rol |
| ------- | --- |
| `src/types/vertical-connectors/eva-vertical-contract.ts` | Tipos e interfaces |
| `src/lib/vertical-connectors/eva/eva-unilatino.mock.ts` | Fixture `EVA_UNILATINO_MOCK_STATUS` |
| `src/lib/vertical-connectors/eva/eva-vertical-connector.mock.ts` | `createEvaVerticalMockConnector()` |
| `src/lib/vertical-connectors/eva/index.ts` | Exports |

## 3.11 Next phase

**CONSOLE-5 — Eva status panel mock**

UI de consola que consume `createEvaVerticalMockConnector()` sin API real ni cambios de runtime.

Alternativa documentada: CONSOLE-5 — vertical connector UI mock.
