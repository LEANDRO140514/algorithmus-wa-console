# CONSOLE-1 — algorithmus-wa-console Adoption Plan

**Estado:** Planificación documental (sin cambios funcionales)  
**Fecha:** 2026-06-24  
**Base audit:** `docs/console-0-whatsapp-saas-audit.md`  
**Repo fuente:** https://github.com/Carlos-Dominguez-faber/whatsapp-saas  
**Clone local:** `C:/Users/vonde/Proyectos/algorithmus-wa-console-audit` @ `f910676`  
**Vertical de referencia:** https://github.com/LEANDRO140514/wa-agent-unilatino @ `c8a29c1`

---

## 2.1 Resumen ejecutivo

- **whatsapp-saas sí sirve como base madura** para **algorithmus-wa-console** (inbox, multi-tenant, agency, dashboard, settings).
- La ruta recomendada es **fork + rename** bajo org Algorithmus (`algorithmus-wa-console`), no rewrite desde cero.
- **No se adopta** el cerebro conversacional heredado (buffer → decision-engine → OpenRouter + KB RAG) como cerebro de **Eva WA**.
- Se **conservan** consola, inbox UI, tenants/workspaces, agency, dashboard y capa operativa.
- **wa-agent-unilatino** será el **primer vertical conectado** — recibe webhook, decide, responde, sincroniza GHL, CAG en InsForge.
- **Supabase** queda como **backend heredado/transicional** en la consola; no se amplía acoplamiento crítico nuevo.
- **InsForge** es el **destino estratégico** para metadata de verticales, health, flags visibles y contrato API.
- **No usar curdeeclau-monorepo** para esta línea.

**Principio:** La consola observa, opera y supervisa. El vertical decide, responde y sincroniza.

---

## 2.2 Decisión recomendada

| Opción | Veredicto | Razón |
|--------|-----------|-------|
| **A. Adoptar repo directo** | No recomendado | Ownership en cuenta ajena; sin control de fork/rename/governance |
| **B. Fork y evolucionar** | **Recomendado** | Conserva ~70% UI/infra; permite rename, aislar cerebro Eva, roadmap InsForge-first |
| **C. Repo nuevo copiando piezas** | Solo si B bloqueada | Duplica inbox/auth/RLS sin ventaja clara vs fork |
| **D. Descartar** | No | Desperdicia consola multi-tenant ya construida |

### Condiciones para ejecutar B (post-CONSOLE-1)

1. Revisar **licencia y ownership** del repo upstream antes del fork.
2. Fork bajo **cuenta/org Algorithmus** (p. ej. `LEANDRO140514/algorithmus-wa-console`).
3. **Renombrar** repo, README y branding tras CONSOLE-2.
4. **Congelar upstream** si no habrá contribución bidireccional.
5. Conservar **auditoría CONSOLE-0/1** en `docs/`.
6. **No modificar funcionalidad** hasta aprobación explícita de CONSOLE-1 y inicio de CONSOLE-2.

---

## 2.3 Principio consola vs cerebro

### algorithmus-wa-console (observa / opera / supervisa)

- Muestra inbox y conversaciones (read-only o link inicial).
- Gestiona tenants/workspaces y agency.
- Muestra dashboard, métricas y health del vertical.
- Muestra **CAG status**, `knowledgeVersion`, flags visibles (read-only en MVP).
- Permite handoff humano en UI cuando el modelo de datos lo soporte (fase posterior).
- **No decide** respuesta automática de Eva al inicio.
- **No activa live** sin workflow de approval.

### wa-agent-unilatino (decide / responde / sincroniza)

- Recibe webhook YCloud productivo de Eva (inicial).
- Ejecuta intents determinísticos + academic engine.
- CAG shadow / assistive comparison (8B cerrada).
- Sincroniza GHL (dry_run controlado).
- Runtime **InsForge**; knowledge pack versionado.

### Prohibido al inicio

| Prohibición | Motivo |
|-------------|--------|
| decision-engine de whatsapp-saas responde por Eva | Doble cerebro |
| RAG/LLM heredado compite con CAG Eva | Divergencia knowledge |
| Mismo webhook sin routing a ambos repos | Doble respuesta |
| Consola activa live / LLM / CAG injection sin approval | Riesgo operativo |
| Acceso directo de consola a tablas InsForge del vertical | Acoplamiento frágil |

---

## 2.4 Keep / Wrap / Replace / Defer / Disable map

| Área | Estado actual | Acción | Motivo | Fase |
|------|---------------|--------|--------|------|
| Next.js app shell | Next 16 App Router | **KEEP** | Base sólida consola | CONSOLE-2+ |
| shadcn UI | Radix + Tailwind | **KEEP** | Design system listo | CONSOLE-2+ |
| Login / auth UI | Supabase Auth pages | **KEEP** | Funcional | CONSOLE-2+ |
| Agency / super-admin | `(agency)/workspaces` | **KEEP** | Multi-cliente | CONSOLE-2+ |
| Workspaces / memberships | Supabase + RLS | **KEEP** | Multi-tenant core | CONSOLE-2+ |
| Inbox UI | `features/inbox/components` | **KEEP** | Valor principal consola | CONSOLE-2+ |
| Conversations UI | chat-thread, realtime hooks | **KEEP** (read-only Eva path) | Supervisión | CONSOLE-6+ |
| Contacts | `contacts` table + CRM panel | **WRAP** | Puede mirror vertical después | CONSOLE-8+ |
| Dashboard metrics | `dashboard/services/metrics` | **KEEP** + extend | Base KPIs | CONSOLE-6+ |
| Templates Meta 24h | templates API + UI | **KEEP** | Útil operación | DEFER Eva |
| CRM panel / HL | `crm-panel`, highlevel-client | **WRAP** | Eva ya tiene GHL propio | CONSOLE-8+ |
| YCloud provider | webhook + client | **WRAP** | Mismo provider; routing Eva-first | CONSOLE-4+ |
| HighLevel integration | per-workspace encrypted | **WRAP** | No duplicar sync Eva | CONSOLE-8+ |
| Supabase Auth | SSR middleware | **KEEP** temporal | No migrar auth aún | S0–S3 |
| Supabase DB / RLS | 20+ tablas | **KEEP** temporal | Legacy containment | S0–S3 |
| Realtime | Supabase channels | **KEEP** temporal | Inbox live updates | S0–S3 |
| Storage (media) | Supabase storage | **KEEP** temporal | Media inbox | S4 |
| pgvector KB / RAG | `kb-service.ts` | **DISABLE** Eva path | CAG es fuente Eva | CONSOLE-4+ |
| OpenRouter / AI SDK | `openrouter.ts`, buffer | **DISABLE** Eva path | LLM off en Eva | CONSOLE-4+ |
| decision-engine | `decision-engine.ts` | **REPLACE** (Eva) | Vertical decide | CONSOLE-4+ |
| Agents setter/soporte/agendamiento | `agents` table + UI | **DISABLE** Eva | Legacy native agents | CONSOLE-4+ |
| automation_rules | triggers/actions | **DEFER** Eva | Evaluar post-MVP | CONSOLE-8+ |
| Webhook `/api/webhooks/ycloud` | inbound processor | **DISABLE** Eva tenant | Eva recibe webhook | CONSOLE-4+ |
| Buffer 30s | `message_batches` | **DISABLE** Eva path | No autoresponder nativo | CONSOLE-4+ |
| Tools catalog | schedule, webhook, etc. | **DEFER** Eva | Vertical tools propios | CONSOLE-8+ |
| cron / pg_net | buffer-flush | **KEEP** non-Eva | Otros tenants futuros | S0 |
| Tests / Playwright config | script only | **DEFER** | Añadir specs post-fork | CONSOLE-3 |
| **Vertical connector** | No existe | **REPLACE** (nuevo) | InsForge/API read-only | CONSOLE-5–6 |
| **Eva status panel** | No existe | **REPLACE** (nuevo) | MVP consola | CONSOLE-6 |
| **CAG metrics UI** | No existe | **REPLACE** (nuevo) | Handoff 8B.8 | CONSOLE-6 |

### Resumen acciones

```txt
KEEP:    UI shell, inbox, agency, dashboard, workspaces, auth UI (transicional)
WRAP:    Supabase access, YCloud, HL, contacts (adapters)
REPLACE: decision-engine Eva, vertical connector, status panels
DEFER:   auth→InsForge, full inbox migration, automation para Eva, e2e specs
DISABLE: native brain path para tenant Eva (webhook, buffer, LLM, RAG)
```

---

## 2.5 Supabase → InsForge migration plan

### Principio

**InsForge-first** para capacidades nuevas. **Supabase legacy containment** para lo existente. Sin rewrite total inmediato.

### Fase S0 — Legacy containment (CONSOLE-2 → CONSOLE-4)

- Mantener Supabase para auth, workspaces, inbox heredado.
- **No** nuevas tablas críticas acopladas a Supabase para Eva.
- Inventariar módulos con `SUPABASE_SERVICE_ROLE_KEY` (~40 archivos).
- Introducir **adapters conceptuales** (`VerticalStatusPort`, `TenantMetadataPort`).
- Documentar boundary: consola Supabase ≠ vertical InsForge.

### Fase S1 — Vertical metadata in InsForge / API (CONSOLE-5 → CONSOLE-7)

Nueva metadata (InsForge o API expuesta por vertical):

- `verticalId`, `tenantId`
- `knowledgeVersion`, `contentHash`
- `cagStatus`, allowed/blocked categories
- health / replay status
- flags visibles (read-only)
- `lastSafeCommit`, deploy metadata

**No** duplicar conversaciones aún.

### Fase S2 — Console reads vertical state (CONSOLE-6 → CONSOLE-8)

- Panel Eva consume **Vertical Connector Contract v0** (read-only).
- Sin escritura de flags desde consola.
- Sin control runtime.

### Fase S3 — Controlled operations (futuro)

- Consola **propone** cambios (flags, knowledge approval).
- Workflow approval + audit log.
- Rollback por flag.
- **No live** sin autorización documentada.

### Fase S4 — Optional deeper migration (futuro, evaluar)

| Dominio | Complejidad | Notas |
|---------|-------------|-------|
| Conversaciones / messages | Alta | ¿Mirror vs source of truth? |
| Contacts | Media-Alta | GHL ya en vertical |
| Auth | Alta | SSO org-wide |
| RAG/KB heredado | Media | Solo non-Eva tenants |
| Analytics | Media | Agregar CAG metrics |

**Reglas:** No migrar todo de golpe. No romper inbox auth. No duplicar sin estrategia de sync.

---

## 2.6 Vertical connector contract v0 (read-only)

**No implementar en CONSOLE-1.** Contrato conceptual para `wa-agent-unilatino` ↔ `algorithmus-wa-console`.

### Endpoints propuestos (vertical expone, consola consume)

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/health` | Liveness del vertical |
| GET | `/vertical/status` | Resumen runtime |
| GET | `/vertical/cag/status` | CAG flags + categorías |
| GET | `/vertical/knowledge` | `knowledgeVersion`, `contentHash` |
| GET | `/vertical/replay/latest` | Último replay PASS/FAIL |
| GET | `/vertical/runtime` | `WA_AGENT_MODE`, `GHL_SYNC_MODE`, etc. |
| GET | `/vertical/flags` | Flags visibles redactados |

### Payload conceptual (ejemplo)

```json
{
  "verticalId": "eva-wa-unilatino",
  "tenantId": "universidad-latino",
  "runtimeMode": "mock",
  "ghlSyncMode": "dry_run",
  "llmEnabled": false,
  "llmMode": "off",
  "knowledgeVersion": "eva-unilatino-cag-v1",
  "contentHash": "bd550d5f…",
  "cagStatus": "assistive_shadow",
  "allowedCategories": ["location", "rvoe", "…"],
  "blockedCategories": ["dynamic", "personalized", "…"],
  "finalResponseModifiedCount": 0,
  "latestReplayStatus": "PASS",
  "lastDeployAt": null,
  "lastSafeCommit": "c8a29c1",
  "liveAllowedPhonesRedacted": ["+52999***5583"]
}
```

### Reglas v0

- **Read-only** — consola no activa flags ni runtime.
- Sin secrets, tokens, API keys.
- Sin teléfonos completos ni PII.
- Sin context CAG bruto ni payloads YCloud/GHL completos.
- Autenticación: service token per-tenant (diseño CONSOLE-5).

---

## 2.7 Webhook routing principle

### Estado inicial recomendado

```txt
Eva primero.
Consola observa.
```

| Componente | Routing inicial |
|------------|-----------------|
| Webhook YCloud productivo Eva | → `wa-agent-unilatino` (InsForge) |
| algorithmus-wa-console | **NO** recibe webhook Eva |
| Consola | Consume estado vía API read-only / mirror futuro |
| Inbox UI Eva | Read-only link o réplica controlada (fase posterior) |

### Riesgo crítico

Si **whatsapp-saas** y **wa-agent-unilatino** procesan el mismo inbound → **doble respuesta**, estados inconsistentes, costos LLM duplicados.

### Regla

Routing avanzado (consola como proxy, fan-out, tenant routing table) queda para **CONSOLE-9+** tras contrato v0 estable.

---

## 2.8 Treatment of existing agents

| Agent | Estado | Usar para Eva | Acción |
|-------|--------|---------------|--------|
| `setter` | Activo en SaaS nativo | **NO** | **DISABLE** path Eva; legacy reference |
| `soporte` | Activo en SaaS nativo | **NO** | **DISABLE** path Eva |
| `agendamiento` | Activo en SaaS nativo | **NO** | **DISABLE** path Eva |

- **No borrar** código ni tablas en fork inicial.
- Marcar workspace Eva como `vertical_mode: external` (concepto CONSOLE-4).
- Agentes nativos pueden servir **otros tenants** no-Eva en el futuro.

---

## 2.9 RAG/KB heredado

| Aspecto | Decisión |
|---------|----------|
| pgvector KB en whatsapp-saas | **Legacy capability** de consola |
| Eva CAG (`eva-cache-v1.json`) | **Fuente de verdad** para Universidad Latino |
| Conectar KB heredado a Eva | **NO** |
| UI KB tab | **DEFER** — evaluar como knowledge management UI genérica |
| RAG productivo Eva desde consola | **NO** — RAG productivo NO activar desde consola |
| Embeddings desde consola para Eva | **NO** |

---

## 2.10 MVP algorithmus-wa-console para Eva

Mínimo viable **sin botón live**:

| # | Función | Detalle |
|---|---------|---------|
| 1 | Tenant visible | Universidad Latino / workspace mapping |
| 2 | Vertical visible | `eva-wa-unilatino` |
| 3 | Runtime status | mock, GHL dry_run/live (read-only) |
| 4 | LLM status | off/on visible, alert si on |
| 5 | CAG status | off / shadow / assistive_shadow / response_enabled_mock |
| 6 | Knowledge | `knowledgeVersion`, `contentHash` |
| 7 | Replay | último 8B suite PASS/FAIL |
| 8 | Health | `/health` vertical |
| 9 | Alerts | live, LLM on, GHL live, CAG response enabled |
| 10 | Inbox | read-only o deep-link (si datos disponibles) |

**Explícitamente fuera de MVP:** activar live, toggle flags, response injection, deploy trigger.

---

## 2.11 Adoption roadmap

| Fase | Nombre | Entregable |
|------|--------|------------|
| **CONSOLE-1** | Adoption plan | Este documento + validator |
| **CONSOLE-2** | Fork + rename setup | Repo `algorithmus-wa-console`, README, branding |
| **CONSOLE-3** | Repository baseline hardening | Branch protection, docs, e2e scaffold |
| **CONSOLE-4** | Disable native brain for Eva path | Feature flag `vertical_mode=external`, skip buffer/webhook |
| **CONSOLE-5** | Vertical connector contract stub | OpenAPI/spec v0, mock server |
| **CONSOLE-6** | Eva vertical status panel (mock) | UI read-only contra stub/mock API |
| **CONSOLE-7** | InsForge metadata adapter plan | Dónde vive metadata; no migrar auth aún |
| **CONSOLE-8** | Read-only integration wa-agent-unilatino | Conectar panel a API real (mock env) |

Fases futuras (no detalladas aquí): approval workflow, inbox mirror, controlled flag proposals, multi-vertical registry.

---

## 2.12 Risks

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Alta dependencia Supabase | Alta | S0 containment; InsForge-first nuevas features |
| service_role en ~40 módulos | Alta | Adapters; audit; least privilege gradual |
| Doble cerebro | Crítica | DISABLE native path Eva; webhook Eva-first |
| Doble webhook | Crítica | Consola no recibe webhook Eva inicial |
| RAG/LLM vs CAG | Alta | KB heredado DISABLE Eva; CAG en vertical |
| Ownership / licencia fork | Media | Checklist §2.13 antes CONSOLE-2 |
| Multi-tenant + vertical externo | Media | `vertical_mode` per workspace |
| Flags desde consola sin approval | Alta | Read-only v0; approval S3 |
| Secretos en logs | Media | Redaction tests (patrón 8B) |
| Migración InsForge agresiva | Alta | Fases S0–S4; no big bang |
| Romper inbox existente | Alta | No rewrite; DISABLE scoped |

---

## 2.13 Decision checklist before fork

- [ ] Confirmar owner/org destino (Algorithmus / LEANDRO140514)
- [ ] Confirmar nombre repo: `algorithmus-wa-console`
- [ ] Confirmar si mantener upstream remote (probablemente no)
- [ ] Confirmar licencia upstream (README / LICENSE file)
- [ ] Confirmar conservar historial git en fork
- [ ] Confirmar **no copiar** `.env` ni secrets al fork
- [ ] Confirmar branch protection deseada
- [ ] Confirmar README rename y arquitectura dos-repos
- [ ] Confirmar issue tracker / project board
- [ ] Confirmar estrategia Supabase legacy (S0)
- [ ] Confirmar estrategia InsForge-first (S1+)
- [ ] Confirmar Vertical Connector Contract v0 aprobado
- [ ] Confirmar wa-agent-unilatino como primer vertical
- [ ] Confirmar **no curdeeclau-monorepo**
- [ ] Aprobar CONSOLE-1 antes de iniciar CONSOLE-2

---

## 2.14 Recommendation final

**Recomendación: Fork y evolucionar** (`whatsapp-saas` → `algorithmus-wa-console`).

**Condiciones:**

1. Ejecutar fork **solo después** de aprobar este plan (CONSOLE-1).
2. **No modificar funcionalidad** hasta CONSOLE-2.
3. **Mantener Supabase** como backend transicional de consola.
4. **Diseñar capacidades nuevas hacia InsForge** y API del vertical.
5. **wa-agent-unilatino** es primer vertical conectado y **único cerebro de Eva**.
6. **No usar curdeeclau-monorepo**.

**Siguiente paso:** **CONSOLE-2 — fork + rename setup** (tras checklist §2.13).

---

## Referencias

- CONSOLE-0: `docs/console-0-whatsapp-saas-audit.md`
- Eva 8B.8 handoff: `wa-agent-unilatino` → `docs/phase-8b8-cag-assistive-acceptance-console-handoff.md`
- Arquitectura: `Algorithmus WA Console = consola + wa-agent-unilatino vertical`
