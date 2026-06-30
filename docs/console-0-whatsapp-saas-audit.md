# CONSOLE-0 — whatsapp-saas Audit for algorithmus-wa-console

**Estado:** Auditoría read-only completada  
**Fecha:** 2026-06-24  
**Repo auditado:** https://github.com/Carlos-Dominguez-faber/whatsapp-saas  
**Clone local:** `C:/Users/vonde/Proyectos/algorithmus-wa-console-audit`  
**HEAD auditado:** `f910676` — `chore: remove dead transcription.ts`  
**Vertical de referencia:** `wa-agent-unilatino` @ `c8a29c1` (línea 8B cerrada)

---

## 9.1 Resumen ejecutivo

**Objetivo:** Evaluar si `whatsapp-saas` sirve como base para **algorithmus-wa-console** — consola SaaS de inbox, tenants, control plane y supervisión de verticales WhatsApp.

**Hallazgo principal:** El repo es una **plataforma multi-tenant madura** de inbox WhatsApp con UI operable, motor conversacional LLM propio, KB vectorial (RAG), integraciones YCloud + HighLevel, y capa agency/super-admin. **Sí sirve como base de consola/control-plane**, pero **no debe ser el cerebro principal** del vertical Eva (`wa-agent-unilatino`), que ya tiene runtime InsForge, intents determinísticos, CAG shadow/assistive y gates de seguridad más estrictos.

**Decisión CONSOLE-0:** No fork todavía. No modificaciones funcionales. Solo auditoría.

**Arquitectura confirmada:**

```txt
Algorithmus WA Console = whatsapp-saas (consola/inbox/SaaS)
                     + wa-agent-unilatino (primer vertical robusto conectado)

No usar curdeeclau-monorepo para esta línea.
```

---

## 9.2 Stack detectado

| Área | Resultado | Evidencia |
|------|-----------|-----------|
| **Frontend** | Next.js 16 App Router + React 19 + TypeScript | `package.json`, `src/app/` |
| **Estilos** | Tailwind CSS 3.4 + shadcn/ui (Radix) + Geist font | `tailwind.config.ts`, `src/components/ui/` |
| **Backend** | Next.js API routes (serverless en Vercel) | `src/app/api/**` |
| **DB** | Supabase PostgreSQL + pgvector + pg_trgm + pgcrypto | `supabase/migrations/`, README |
| **ORM** | Sin Prisma/Drizzle — SQL migrations + Supabase client directo | — |
| **Auth** | Supabase Auth (SSR cookies) + middleware | `middleware.ts`, `src/lib/supabase/` |
| **IA / LLM** | OpenRouter via Vercel AI SDK (`ai`, `@ai-sdk/openai`) | `openrouter.ts`, `setter.ts`, `kb-service.ts` |
| **WhatsApp** | **YCloud** (webhook inbound + outbound client) | `api/webhooks/ycloud`, `ycloud-client.ts` |
| **CRM** | HighLevel (PIT por workspace, webhooks, calendar tools) | `highlevel-client.ts`, `schedule-highlevel.ts` |
| **Agents/rules** | 3 tipos agente/workspace + prompts versionados + automation_rules | `agents.sql`, `automation_rules.sql` |
| **KB / RAG** | pgvector embeddings via OpenRouter `text-embedding-3-small` | `kb-service.ts`, `kb_match` migrations |
| **Inbox** | Sí — WhatsApp Web-style, realtime, buffer, handoff | `src/features/inbox/`, `inbox/page.tsx` |
| **Tenants** | Sí — `workspaces` + `memberships` + RLS + roles | `foundation.sql`, `workspace-switcher.tsx` |
| **Agency** | Sí — super admin, multi-workspace management | `src/features/agency/`, `(agency)/workspaces` |
| **Deploy** | Vercel + Supabase + pg_cron/pg_net para buffer flush | README, `supabase/cron/` |
| **Testing** | Playwright script en package.json; **sin specs en repo** | `test:e2e` script only |
| **Package manager** | npm (`package-lock.json`) | — |

**Tamaño aproximado:** ~194 archivos `.ts`/`.tsx` en `src/` (excl. node_modules).

---

## 9.3 Estructura del repo

```
algorithmus-wa-console-audit/
├── package.json              # forge-app, Next 16, Supabase, AI SDK
├── middleware.ts             # Supabase auth gate
├── .env.local.example
├── README.md                 # "Agente WhatsApp — Inbox Conversacional con IA"
├── scripts/
│   ├── setup.mjs             # instalador one-click
│   └── seed-admin.mjs
├── supabase/
│   ├── migrations/           # 18+ SQL migrations (foundation → agents → KB → RLS hardening)
│   └── cron/                 # buffer-flush pg_cron
├── public/avatars/
└── src/
    ├── app/
    │   ├── (auth)/           # login, signup, reset-password
    │   ├── (main)/           # dashboard, inbox, settings, onboarding
    │   ├── (agency)/         # super-admin workspaces
    │   ├── api/
    │   │   ├── webhooks/ycloud, highlevel
    │   │   ├── conversations/[id]/*
    │   │   ├── workspace/[id]/*  # agents, kb, templates, integrations, automations
    │   │   ├── internal/buffer/process
    │   │   └── cron/buffer-flush
    │   └── ui/               # component showcase
    ├── features/
    │   ├── inbox/            # ★ core: webhook, buffer, LLM, dispatch, CRM panel
    │   ├── agents/           # setter/soporte/agendamiento UI + config
    │   ├── settings/         # integrations, templates, KB tab, team, tools
    │   ├── tools/            # schedule, webhook, check-availability, echo
    │   ├── workspace/        # switcher, active workspace
    │   ├── agency/           # create/manage client workspaces
    │   ├── dashboard/        # metrics
    │   ├── auth/, onboarding/
    │   └── ui-kit/
    ├── components/ui/        # shadcn
    ├── lib/supabase/, lib/auth/
    └── shared/
```

**Patrón:** Feature-first monolith (single Next app, no turborepo).

---

## 9.4 Agentes y reglas existentes

### Agentes (`agents` table + `src/features/agents/`)

| Tipo | Rol | Notas |
|------|-----|-------|
| `setter` | Calificación de leads + scoring LLM | `setter.ts`, knockout rules |
| `soporte` | Soporte general | prompt por defecto en español |
| `agendamiento` | Citas / scheduling | integra tools HighLevel |

- **Un solo agente activo por workspace** (índice único parcial DB).
- Cada agente tiene: `name`, `avatar_key`, `model` (OpenRouter), `prompt_id` → `prompts`/`prompt_versions`.
- UI: `agents-tab`, `agent-config-sheet`, `test-chat-panel`, `guided-prompt-editor`.

### Prompts

- Tabla `prompts` con scopes: `global`, `number`, `campaign`, `segment`, `mode`.
- Versionado `draft` / `published`.
- Resolver: `prompt-resolver.ts` + `prompt-builder.ts`.

### Automation rules (`automation_rules`)

Triggers: `first_message`, `inactivity_24h`, `window_closing`, `handoff_requested`, `lead_qualified`, `keyword_match`.

Actions: `send_template`, `assign_agent`, `add_tag`, `close_conversation`, `handoff_human`.

### Motor conversacional (compite con wa-agent-unilatino)

Flujo inbound:

```txt
YCloud webhook → normalizer → message_batches (buffer 30s)
  → buffer-flush (cron/pg_cron) → decision-engine
  → openrouter generateWithTools + KB search (RAG)
  → dispatch outbound YCloud
```

Archivos clave: `buffer.ts` (~800 LOC), `decision-engine.ts`, `state-machine.ts`, `openrouter.ts`.

### Qué conservar vs aislar

| Componente | Conservar como consola | Aislar / reemplazar por vertical |
|------------|------------------------|----------------------------------|
| Inbox UI + realtime | ✅ | — |
| Workspace / roles / RLS UI | ✅ | — |
| Settings / integrations UI | ✅ parcial | YCloud/GHL config puede duplicar vertical |
| Agency / super-admin | ✅ | — |
| Dashboard metrics | ✅ | extender con métricas CAG |
| Templates / 24h window | ✅ | — |
| CRM panel + HL sync | ✅ opcional | vertical ya tiene GHL dry_run |
| **buffer + openrouter LLM brain** | ⚠️ solo para workspaces sin vertical | ❌ para Eva — usar `wa-agent-unilatino` |
| **KB pgvector RAG** | ⚠️ genérico SaaS | ❌ Eva usa CAG static cache |
| Agents setter/soporte/agendamiento | ⚠️ otros clientes SaaS | ❌ no mezclar con Eva intents |

---

## 9.5 Supabase → InsForge

### Dependencia Supabase: **ALTA (core)**

| Módulo | Uso Supabase |
|--------|--------------|
| Auth | `auth.users`, SSR middleware, signup |
| Data | Todas las tablas app (20+ en foundation) |
| RLS | `auth_workspace_ids()`, `auth_has_role()` en cada tabla |
| Storage | Media WhatsApp (`media_storage` migration) |
| Realtime | hooks `use-realtime-messages`, `use-realtime-conversations` |
| Cron | pg_cron + pg_net → `/api/cron/buffer-flush` |
| Vectors | pgvector para `kb_chunks` |

**Tablas principales:** `workspaces`, `memberships`, `contacts`, `conversations`, `messages`, `message_batches`, `prompts`, `prompt_versions`, `agents`, `integrations`, `kb_documents`, `kb_chunks`, `tools`, `tool_configs`, `templates`, `automation_rules`, `setter_configs`, `events`, `business_info`, `appointments`, `schedules`.

### Mapeo conceptual a InsForge

| Supabase hoy | InsForge futuro (consola) | Dificultad |
|--------------|---------------------------|------------|
| Auth users | InsForge auth / SSO | Media-Alta |
| workspaces / memberships | tenants / members | Media |
| conversations / messages | inbox mirror o read-model | Alta (sync con vertical) |
| integrations (encrypted creds) | tenant secrets store | Media |
| events / observability | logs table o external | Media |
| kb_* pgvector | **No migrar para Eva** — vertical tiene CAG | N/A para Eva |
| pg_cron buffer | InsForge scheduled functions o external cron | Media |

### Estrategia recomendada (no implementar en CONSOLE-0)

1. **Fase 1:** Consola lee estado del vertical vía API (read-only) — sin migrar DB conversacional.
2. **Fase 2:** Metadata consola (tenants, flags, approvals) en InsForge.
3. **Fase 3:** Decidir si inbox messages viven en consola, vertical, o réplica.

**Rediseño requerido:** Cualquier path que use `SUPABASE_SERVICE_ROLE_KEY` en ~40+ archivos server-side.

---

## 9.6 Consola / inbox

| Capacidad | Existe | Calidad / notas |
|-----------|--------|-----------------|
| Inbox WhatsApp Web | ✅ | `inbox-layout`, `chat-thread`, realtime |
| Dashboard | ✅ | métricas básicas (msgs, handoffs, cost) |
| Conversaciones | ✅ | state machine: ai_active, human_active, handoff_pending, etc. |
| Handoff humano | ✅ | API `take`, `handoff`, `toggle-ai` |
| Multi-tenant workspaces | ✅ | switcher, RLS, roles admin/manager/agent/viewer |
| Config agentes | ✅ | 3 tipos, test chat |
| Knowledge base UI | ✅ | ingest + search (RAG) |
| Templates Meta 24h | ✅ | sync, submit, library |
| Integraciones | ✅ | YCloud + HL + OpenRouter per workspace |
| Tools catalog | ✅ | webhook, schedule, availability |
| Observabilidad | ✅ parcial | `observability-panel` por conversación (LLM, tools, state) |
| **CAG / vertical flags** | ❌ | no existe — construir para Eva |
| **Approval workflow knowledge** | ❌ | no existe |
| **Vertical connector registry** | ❌ | no existe |
| **Replay / test status UI** | ❌ | no existe |

**Reutilizable para algorithmus-wa-console:** ~70% de UI/operación (inbox, settings, agency, dashboard shell).

**Construir nuevo:** vertical registry, CAG status, flag control con approval, health/replay de `wa-agent-unilatino`, contrato API vertical↔consola.

---

## 9.7 Integración WhatsApp

| Aspecto | Detalle |
|---------|---------|
| **Provider** | **YCloud** (mismo que wa-agent-unilatino) |
| **Inbound** | `POST /api/webhooks/ycloud` — signature verify, media download, voice transcription |
| **Outbound** | `ycloud-client.ts` + `dispatch.ts` |
| **Buffer** | Agrupa mensajes 30s (`message_batches`), flush vía cron |
| **Message IDs** | `wamid` unique constraint |
| **Credenciales** | Por workspace, encrypted at rest (`ENCRYPTION_KEY`) — no env global |
| **Compatibilidad Eva** | **Alta** en provider; **conflicto** si ambos reciben mismo webhook sin routing |

**Convivencia propuesta:**

```txt
Opción A (recomendada inicial): webhook solo a wa-agent-unilatino;
                  consola consume eventos/estado vía API read-model.

Opción B: consola recibe webhook y delega a vertical por tenant routing.

Opción C: dual-write (no recomendado — riesgo de respuestas duplicadas).
```

---

## 9.8 Auditoría de seguridad

| Señal | Resultado |
|-------|-----------|
| Secretos hardcodeados en código | **No detectados** (grep sk-/JWT patterns) |
| Env vars sensibles | `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `ENCRYPTION_KEY`, `BUFFER_PROCESS_SECRET`, `CRON_SECRET` — correctamente server-only en `.env.local.example` |
| Credenciales tenant | Encriptadas AES-256-GCM (`src/shared/lib/crypto.ts`) |
| Webhook YCloud | Signature verification (`verifyYCloudSignature`) |
| Buffer internal | HMAC-SHA256 (`BUFFER_PROCESS_SECRET`) |
| RLS | Extensivo en migrations; hardening `search_path` en funciones |
| SSRF | `ssrf-guard.ts` en custom webhooks |
| Riesgo service_role | **Alto acoplamiento** — muchos servicios bypass RLS con service role (patrón intencional pero requiere disciplina) |

**No se copiaron valores de secrets al reporte.**

---

## 9.9 Riesgos

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Dependencia Supabase profunda | Alta | Migración a InsForge es proyecto grande |
| Cerebro LLM duplicado vs Eva | Alta | Dos motores si no se aísla vertical |
| KB RAG vs CAG Eva | Media | Confusión operativa / knowledge divergente |
| Webhook YCloud dual | Alta | Respuestas duplicadas sin routing |
| Sin tests automatizados en repo | Media | Solo script e2e, sin specs |
| Promociones / setter LLM | Media | Menos gates que Eva 8B |
| Multi-tenant RLS complexity | Media | Bien hecho pero frágil al migrar |
| Falta approval workflow | Media | Flags live sin governance |
| Observabilidad sin CAG metrics | Baja-Media | Panel existe pero no vertical-aware |
| Ownership repo (Carlos-Dominguez-faber) | Organizacional | Fork a org Algorithmus recomendado |

### Mitigaciones propuestas

- Vertical Eva = **único cerebro** de respuesta; consola = observación + control flags con approval.
- No activar LLM/RAG de consola para tenant Eva.
- Contrato API antes de compartir webhook.
- Default-off flags (patrón ya probado en 8B).

---

## 9.10 Decisión recomendada

### **Opción B — Fork y evolucionar hacia `algorithmus-wa-console`**

**Evidencia:**

1. El repo **ya es** una consola SaaS funcional (inbox, tenants, agency, settings, dashboard) — descartar (D) sería desperdiciar ~6+ meses de UI/infra.
2. Crear repo limpio desde cero (C) duplicaría inbox, auth, RLS, buffer, templates sin ventaja clara.
3. Adoptar sin fork (A) deja ownership y historial en repo ajeno; fork bajo org Algorithmus permite rename + governance.
4. El motor LLM+RAG **compite** con `wa-agent-unilatino` — no eliminar de golpe, sino **modo dual**: workspaces genéricos usan cerebro SaaS; verticales conectados (Eva) usan runtime externo.

**No recomendado ahora:** Opción D (descartar). Opción C solo si fork tiene licencia/blocker.

**Rename path:** `whatsapp-saas` → `algorithmus-wa-console` (repo + branding), manteniendo módulos útiles.

---

## 9.11 Contrato conceptual vertical ↔ console (borrador)

`algorithmus-wa-console` debería poder ver por vertical conectado:

```txt
verticalId          e.g. eva-wa-unilatino
tenantId            e.g. universidad-latino
agentStatus         mock | live_outbound | ...
runtimeMode         WA_AGENT_MODE, GHL_SYNC_MODE
knowledgeVersion    eva-unilatino-cag-v1
contentHash         cache hash
cagStatus           off | shadow | assistive_shadow | response_enabled_mock
allowedCategories   location, rvoe, ...
blockedCategories   dynamic, personalized, ...
flags               EVA_CAG_*, EVA_LLM_ENABLED, LLM_MODE
conversationLogs    read-only / redacted
leadContactState    GHL sync status (dry_run/live)
healthChecks        suite PASS/FAIL último replay
assistiveMetrics   assistiveAvailable rate, finalResponseModified=0
```

**Consola orquesta/muestra; vertical decide respuesta** (al inicio).

---

## 9.12 Estado recomendado antes de console build

```txt
✅ Línea 8B cerrada en wa-agent-unilatino
✅ CONSOLE-0 audit completado
⏳ No live CAG / no response injection
⏳ No conectar webhook dual todavía
⏳ Fork + rename bajo org Algorithmus (CONSOLE-1)
⏳ Diseñar contrato API vertical ↔ consola
⏳ Decidir: consola solo observa vs controla flags (con approval)
```

---

## 9.13 Siguiente fase recomendada

### **CONSOLE-1 — algorithmus-wa-console adoption plan**

Entregables sugeridos:

1. Decisión legal/licencia del fork.
2. Mapa módulos: keep / wrap / replace / delete.
3. Contrato API v0 vertical ↔ consola (read-only).
4. Plan migración Supabase → InsForge (fases).
5. Webhook routing strategy (Eva primero).
6. MVP consola: ver tenant Eva + CAG status + replay health sin control live.

**Alternativa si fork bloqueado:** **CONSOLE-0B — deeper audit** (licencia, despliegue prod Carlos, datos reales).

**Alternativa si fork inviable:** **CONSOLE-NEW — create clean repo** copiando solo `src/features/inbox/components`, `workspace`, `agency`, `settings` shell.

---

## Confirmaciones CONSOLE-0

| Restricción | Estado |
|-------------|--------|
| No commit en repo auditado | ✅ (working tree clean salvo este doc untracked) |
| No push | ✅ |
| No fork | ✅ |
| No modificar wa-agent-unilatino | ✅ |
| No deploy / live / producción | ✅ |
| No instalar deps / migraciones | ✅ |

---

## Referencia cruzada wa-agent-unilatino (8B cerrada)

| Eva (vertical) | whatsapp-saas (consola) |
|----------------|-------------------------|
| InsForge runtime | Supabase |
| Deterministic intents + academic engine | LLM OpenRouter + tools |
| CAG static cache (no RAG prod) | pgvector RAG KB |
| Shadow/assistive comparison | Observability LLM/tools |
| GHL dry_run qualified | GHL sync + calendar tools |
| YCloud handler mock | YCloud live inbox |
| Single tenant (Latino) | Multi-tenant workspaces |

**Complementariedad:** consola aporta **operación multi-tenant**; vertical aporta **cerebro robusto y CAG**.
