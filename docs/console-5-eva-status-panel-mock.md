# CONSOLE-5 — Eva status panel mock

## 3.1 Resumen

CONSOLE-5 crea un **panel mock/read-only** para mostrar estado de Eva WA dentro de `algorithmus-wa-console`.

Usa exclusivamente el connector mock creado en CONSOLE-4 (`createEvaVerticalMockConnector`).

## 3.2 Objetivo

Permitir visualizar, **sin integración real**, cómo la consola mostrará el estado del primer vertical:

**wa-agent-unilatino** / **Eva WA Universidad Latino**.

## 3.3 Non-goals

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

## 3.4 Data source

| Campo | Valor |
| ----- | ----- |
| Fuente | `createEvaVerticalMockConnector()` |
| Tipo | mock local |
| Modo | read-only |
| fetch | No |
| axios | No |
| Supabase | No |
| process.env | No |
| secrets | No |

## 3.5 Panel sections

El panel `EvaStatusPanel` muestra:

1. **Identity** — displayName, verticalId, tenantId, provider, crm
2. **Connection** — connectionState
3. **Health** — status, message, checkedAt
4. **Runtime** — WA_AGENT_MODE, academicEngineEnabled, outboundReal
5. **GHL** — syncMode, customFieldsEnabled, live
6. **LLM** — enabled, mode
7. **CAG** — mode, shadow flags, response flags, categorías
8. **Knowledge** — source, strategy, ragProductive, version, contentHash
9. **Replay** — status, lastRunLabel, passed, failed
10. **Flags** — todos los flags como key/value read-only
11. **Safety** — level, capacidades bloqueadas, warnings

## 3.6 Safety UI rules

- No mostrar teléfonos reales.
- No mostrar tokens.
- No mostrar payloads raw.
- No mostrar PII.
- No botones live.
- No toggles editables.
- Todos los flags son **read-only**.
- Riesgos se muestran como alertas visuales/textuales solamente.

Etiquetas visibles obligatorias:

- Read-only
- Mock data
- No live controls
- Eva first — console observes
- CAG response disabled
- LLM off
- RAG productive false

## 3.7 Expected user journey

Usuario entra al panel Eva (`/verticals/eva/status`) y ve:

| Campo | Valor esperado |
| ----- | -------------- |
| Nombre | Eva WA Universidad Latino |
| Conexión | connected_readonly |
| WA_AGENT_MODE | mock |
| GHL | dry_run |
| LLM | off |
| CAG | assistive_shadow |
| CAG response | disabled |
| RAG productive | false |
| Replay | pass |
| Safety | safe |

## 3.8 Implementación

| Archivo | Rol |
| ------- | --- |
| `src/components/verticals/eva/EvaStatusPanel.tsx` | Componente read-only |
| `src/components/verticals/eva/index.ts` | Barrel local |
| `src/app/verticals/eva/status/page.tsx` | Ruta demo (sin nav global) |

## 3.9 Next phase

**CONSOLE-6 — Eva status panel route wiring**

Integrar la ruta demo en navegación/workspace de forma controlada, revisar auth y layout — solo si no se expone como ruta productiva en CONSOLE-5.

Alternativa: CONSOLE-6 — Eva status panel hardening and route review.
