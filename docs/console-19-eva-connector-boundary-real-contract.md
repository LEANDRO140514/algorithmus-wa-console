# CONSOLE-19 — Eva connector boundary real contract

## Objetivo

Crear el **contrato local/read-only** que define la frontera futura entre `algorithmus-wa-console` y `wa-agent-unilatino`.

CONSOLE-19 modela qué podrá observar la consola y qué tiene prohibido hacer.
CONSOLE-19 no conecta servicios reales.
CONSOLE-19 no llama InsForge, YCloud ni GHL.
CONSOLE-19 no toca `wa-agent-unilatino`.
CONSOLE-19 no activa live calls.
CONSOLE-19 no crea secrets ni `.env.local`.
CONSOLE-19 no toca middleware, auth, layout ni navegación global.
CONSOLE-19 no mueve `/verticals` ni `/verticals/eva/status`.
CONSOLE-19 no crea rutas bajo `/workspaces` ni `/agency`.

## Contexto arquitectónico

| Sistema | Rol |
| ------- | --- |
| **algorithmus-wa-console** | Control-plane: observa, diagnostica, opera y supervisa |
| **wa-agent-unilatino** | Cerebro vertical Eva WA Universidad Latino: decide, responde y sincroniza |

Principio rector: **la consola no es el cerebro de Eva**. Solo prepara supervisión futura sin sustituir al vertical.

Relación con fases previas:

- **CONSOLE-4/5** — contrato y panel mock del conector Eva (`vertical-connectors/eva`)
- **CONSOLE-18** — summary diagnostics del registry
- **CONSOLE-19** — contrato explícito de frontera console ↔ vertical brain

## Archivos creados

| Archivo | Acción |
| ------- | ------ |
| `src/types/eva/eva-connector.ts` | Tipos del contrato de frontera |
| `src/lib/eva/eva-connector.mock.ts` | Mock + `getEvaConnectorBoundaryStatus()` |
| `src/lib/eva/index.ts` | Barrel exports |
| `scripts/validate-eva-connector-boundary-contract.mjs` | Validator CONSOLE-19 |
| `docs/console-19-eva-connector-boundary-real-contract.md` | Este documento |

## Contrato de frontera

`EvaConnectorBoundaryStatus` modela:

- Identidad: `verticalId`, `displayName`
- Modos: `connectorMode`, `boundaryMode`, `liveCallsEnabled`
- Roles: `runtimeOwner`, `consoleRole`, `verticalRole`
- Alcance: `canRead`, `cannotRead`, `cannotWrite`
- Estado: `activeFlags`, `sourceOfTruth`, `health`, `lastKnownRuntime`
- Seguridad: `isMock`, `isReadOnly`, `reason`

Helper principal:

```ts
getEvaConnectorBoundaryStatus(): EvaConnectorBoundaryStatus
```

Puro, sync, sin side effects ni llamadas externas.

## Qué puede leer la consola (`canRead`)

- `status`
- `health`
- `lastInboundAt`
- `lastOutboundAt`
- `activeFlags`
- `waMode`
- `ghlSyncMode`
- `ghlWriteCustomFields`
- `academicEngineEnabled`
- `evaLlmEnabled`

## Qué no puede leer (`cannotRead`)

- `secrets`
- `raw_credentials`
- `private_keys`
- `full_user_pii`
- `ghl_api_key`
- `ycloud_api_key`
- `insforge_runtime_secrets`

## Qué no puede escribir (`cannotWrite`)

- `whatsapp_outbound`
- `ghl_contacts`
- `ghl_tasks`
- `ghl_notes`
- `ghl_custom_fields`
- `insforge_runtime`
- `ycloud_config`
- `source_of_truth`
- `eva_decisions`
- `eva_responses`
- `eva_sync`

## Flags mock (`activeFlags`)

| Flag | Valor mock |
| ---- | ---------- |
| `WA_AGENT_MODE` | `mock` |
| `GHL_SYNC_MODE` | `dry_run` |
| `GHL_WRITE_CUSTOM_FIELDS` | `false` |
| `ACADEMIC_ENGINE_ENABLED` | `true` |
| `EVA_LLM_ENABLED` | `false` |

## Por qué no hay live calls todavía

- El runtime real vive en `wa-agent-unilatino`, no en la consola.
- `liveCallsEnabled: false` y `health.liveRuntimeConnected: false` dejan explícito que no hay integración activa.
- `health.readyForFutureIntegration: true` indica que el contrato está listo para una fase posterior sin activar nada hoy.

## Estado mock/read-only

- `connectorMode: "mock"`
- `boundaryMode: "read_only_contract"`
- `isMock: true`
- `isReadOnly: true`
- `reason: "eva_connector_boundary_real_contract_mock"`

## Relación con wa-agent-unilatino

- `runtimeOwner`, `sourceOfTruth.runtime`, `sourceOfTruth.decisions` y `sourceOfTruth.sync` apuntan a `wa-agent-unilatino`.
- La consola (`consoleRole: "observe_supervise"`) nunca escribe decisiones, respuestas ni sync.
- El vertical (`verticalRole: "decide_respond_sync"`) conserva ownership del cerebro Eva.

## UI

CONSOLE-19 **no modifica UI** en esta fase. El panel existente en `/verticals/eva/status` (CONSOLE-5) sigue usando el mock de `vertical-connectors/eva`. Un preview compacto del boundary puede agregarse en CONSOLE-20.

## Validaciones ejecutadas

```bash
node scripts/validate-eva-connector-boundary-contract.mjs
node scripts/validate-vertical-registry-diagnostics-summary.mjs
node scripts/validate-hidden-vertical-diagnostics-preview.mjs
```

## Restricciones respetadas

- No `wa-agent-unilatino`, InsForge, YCloud, GHL, Supabase remoto
- No `package.json` / `package-lock.json` / `.env.local`
- No middleware, auth, layout, nav global
- No rutas productivas nuevas, no deploy, no APIs reales

## Riesgos abiertos

- El contrato CONSOLE-19 es declarativo; aún no está cableado al panel Eva ni al registry.
- `lastKnownRuntime` usa timestamp mock fijo hasta integración futura.
- Divergencia posible entre `vertical-connectors/eva` (CONSOLE-4) y `lib/eva` (CONSOLE-19) hasta unificación en CONSOLE-20+.

## Siguiente fase recomendada — CONSOLE-20

Sugerencias para CONSOLE-20:

1. Preview read-only compacto del boundary en `/verticals/eva/status`
2. Alinear naming entre `vertical-connectors/eva` y `lib/eva`
3. Documentar mapping contrato → campos del status snapshot
4. Seguir sin live calls ni escritura desde consola
