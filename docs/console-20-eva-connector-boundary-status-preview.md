# CONSOLE-20 — Eva connector boundary status preview

## Objetivo

Mostrar un **preview compacto/read-only** del contrato Eva connector boundary (CONSOLE-19) en `/verticals/eva/status`, consumiendo `getEvaConnectorBoundaryStatus()`.

CONSOLE-20 no conecta servicios reales.
CONSOLE-20 no llama InsForge, YCloud ni GHL.
CONSOLE-20 no toca `wa-agent-unilatino`.
CONSOLE-20 no activa live calls.
CONSOLE-20 no crea secrets ni `.env.local`.
CONSOLE-20 no toca middleware, auth, layout ni navegación global.
CONSOLE-20 no mueve `/verticals` ni `/verticals/eva/status`.
CONSOLE-20 no crea rutas nuevas ni links nuevos.

## Estado base

- **CONSOLE-19** — contrato `EvaConnectorBoundaryStatus` + `getEvaConnectorBoundaryStatus()`
- Ruta existente: `/verticals/eva/status` (CONSOLE-5/6)
- Panel existente: `EvaStatusPanel` (mock vertical-connectors/eva)

## Qué se muestra en UI

Sección **Eva connector boundary** debajo del status mock existente:

- Runtime owner, console role, vertical role
- Boundary mode, connector mode
- Live calls enabled (false), runtime connected (false), ready for future integration (true)
- Flags: WA_AGENT_MODE, GHL_SYNC_MODE, GHL_WRITE_CUSTOM_FIELDS, ACADEMIC_ENGINE_ENABLED, EVA_LLM_ENABLED
- Can read (lista completa del contrato)
- Cannot write (lista completa del contrato)
- Badges Mock / Read-only / No live calls
- Nota: la consola no es el cerebro de Eva; `wa-agent-unilatino` es runtime owner

## Por qué sigue siendo read-only

- Componente server-safe sin `fetch`, `axios`, `useEffect` ni hooks
- Solo lee `getEvaConnectorBoundaryStatus()` (mock sync puro)
- Sin botones, sin links nuevos, sin acciones live
- `liveCallsEnabled: false` y `health.liveRuntimeConnected: false` visibles en UI

## Archivos creados / modificados

| Archivo | Acción |
| ------- | ------ |
| `src/components/eva/EvaConnectorBoundaryPreview.tsx` | **Nuevo** — preview compacto |
| `src/app/verticals/eva/status/page.tsx` | Renderiza preview debajo de `EvaStatusPanel` |
| `scripts/validate-eva-connector-boundary-status-preview.mjs` | Validator CONSOLE-20 |
| `docs/console-20-eva-connector-boundary-status-preview.md` | Este documento |

## Validaciones

```bash
node scripts/validate-eva-connector-boundary-status-preview.mjs
node scripts/validate-eva-connector-boundary-contract.mjs
node scripts/validate-vertical-registry-diagnostics-summary.mjs
```

Verificación visual: `http://localhost:3001/verticals/eva/status` debe contener `Eva connector boundary`.

## Restricciones respetadas

- No `wa-agent-unilatino`, InsForge, YCloud, GHL, Supabase remoto
- No `package.json` / `package-lock.json` / `.env.local`
- No middleware, auth, layout, nav global
- No rutas productivas nuevas, no deploy

## Próximos pasos sugeridos — CONSOLE-21

1. Alinear naming entre `vertical-connectors/eva` y `lib/eva` en documentación o barrel
2. Mapping explícito contrato → campos del status snapshot
3. Referencia cruzada desde `/verticals` registry hacia boundary preview (solo si no agrega links productivos)
4. Seguir sin live calls ni escritura desde consola
