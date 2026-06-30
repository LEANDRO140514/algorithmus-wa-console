# CONSOLE-3 — Repository baseline hardening

## 4.1 Resumen

CONSOLE-3 establece bardas documentales y de seguridad antes de modificar funcionalidad en `algorithmus-wa-console`.

Esta fase endurece identidad, reglas de arquitectura, límites Supabase/InsForge, tratamiento del cerebro nativo heredado, y principios de webhook — sin cambiar runtime.

## 4.2 No functional change

Esta fase declara explícitamente:

- **No decision-engine changes.**
- **No webhook changes.**
- **No native agent changes.**
- **No Supabase schema changes.**
- **No env/secrets changes.**
- **No deploy.**
- **No production.**

No se instalaron dependencias. No se ejecutaron migraciones. No se tocó `wa-agent-unilatino`. No se tocó Supabase ni InsForge remoto.

## 4.3 Repo identity

| Campo | Valor |
| ----- | ----- |
| Repo | `algorithmus-wa-console` |
| GitHub | https://github.com/LEANDRO140514/algorithmus-wa-console |
| Origen | Fork de `whatsapp-saas` (Carlos-Dominguez-faber) |
| Rol | Control plane / consola SaaS / inbox / tenants / supervisión |
| Primer vertical | `wa-agent-unilatino` — Eva WA Universidad Latino |

No usar `curdeeclau-monorepo` en esta línea.

## 4.4 Architecture principles

- **Console observes, operates, and supervises.**
- **Vertical decides, responds, and synchronizes.**
- **Eva first** — el primer vertical conectado es Eva WA vía `wa-agent-unilatino`.
- **No double webhook** — un solo receptor inbound para Eva.
- **Read-only vertical connector first** — la consola lee estado vía API/contrato antes de cualquier control.
- **Default-off for risky controls** — flags de CAG, LLM, RAG, live routing apagados por defecto.
- **Approval before live controls** — ningún control productivo sin autorización explícita.

## 4.5 Supabase / InsForge boundary

**Supabase remains inherited/transitional.**

El fork hereda auth, inbox, workspaces, RLS, pgvector KB, y configuración YCloud/GHL por tenant en Supabase. Eso se conserva temporalmente para no romper UI/dashboard existente.

**InsForge-first** para metadata crítica nueva:

- vertical status
- CAG status
- health
- flags
- replay results
- approval workflow

No ampliar dependencia Supabase para metadata crítica nueva. Nuevas capacidades críticas deben diseñarse InsForge-first o vía contrato/API del vertical.

## 4.6 Native brain treatment

Existing decision-engine, native agents (setter/soporte/agendamiento), OpenRouter/RAG are **legacy/native capabilities** inherited from `whatsapp-saas`.

They **must not respond for Eva WA** in the first integration.

They may be kept for future tenants or isolated experiments, but Eva WA routing must not depend on them until an explicit, approved migration phase.

No activar decision-engine nativo para Eva. No activar LLM/RAG heredado para Eva desde la consola.

## 4.7 Webhook principle

- Eva WA YCloud webhook **remains in `wa-agent-unilatino`**.
- Console **does not receive Eva webhook** initially.
- Console **reads via API / read-only connector**.
- **No duplicate inbound processing.**

## 4.8 Safety checklist

Antes de cualquier fase que toque runtime, verificar:

- [ ] No production secrets in repo or docs
- [ ] No live controls enabled
- [ ] No migration execution in adoption phases
- [ ] No remote Supabase writes from adoption work
- [ ] No InsForge writes from adoption work
- [ ] No webhook changes
- [ ] No native brain for Eva
- [ ] No LLM/RAG activation for Eva

## 4.9 Next phase

**CONSOLE-4 — Eva vertical connector contract stub**

Definir contrato read-only v0 entre consola y vertical (estado, health, flags, shadow/replay metadata) antes de desactivar rutas nativas en el path de Eva.

Alternativa documentada (no preferida en esta fase):

- CONSOLE-4 — disable native brain for Eva path (design only)

## Entregables CONSOLE-3

| Archivo | Propósito |
| ------- | --------- |
| `README.md` | Identidad pública del repo |
| `docs/console-env-safety.md` | Reglas de variables y secretos |
| `tests/run-console3-baseline-hardening-validator.mjs` | Validación documental |
