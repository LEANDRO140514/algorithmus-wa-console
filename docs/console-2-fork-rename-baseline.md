# CONSOLE-2 — Fork + Rename Baseline

**Estado:** Baseline documental completado (sin cambios funcionales)  
**Fecha:** 2026-06-24  
**Repo:** https://github.com/LEANDRO140514/algorithmus-wa-console  
**HEAD baseline:** `f910676` (heredado de fork upstream)

---

## 4.1 Resumen

**Fork creado:**

```txt
https://github.com/LEANDRO140514/algorithmus-wa-console
```

**Fork origen:**

```txt
https://github.com/Carlos-Dominguez-faber/whatsapp-saas
```

**Objetivo:**

Convertir este repo en **Algorithmus WA Console** — consola SaaS, control plane, inbox, tenants y supervisión de verticales WhatsApp.

**Vertical conectado (primer vertical):**

```txt
https://github.com/LEANDRO140514/wa-agent-unilatino
```

**No usar `curdeeclau-monorepo` en esta línea.**

---

## 4.2 Decisión

```txt
Este repo será la consola SaaS / control plane / inbox / tenants / supervisión.
No será el cerebro principal de Eva WA.
wa-agent-unilatino será el primer vertical conectado.
```

**Principio:**

```txt
La consola observa, opera y supervisa.
El vertical decide, responde y sincroniza.
```

**Eva WA (wa-agent-unilatino):**

- Línea 8B CAG cerrada @ `c8a29c1`
- CAG response injection: **NO activo**
- RAG productivo: **NO activo**
- LLM: **apagado**

**Restricciones heredadas de CONSOLE-1 (aún no implementadas en código):**

- No activar decision-engine para Eva.
- No conectar webhook Eva a la consola.
- No usar agentes nativos (setter/soporte/agendamiento) para Eva todavía.

---

## 4.3 Supabase / InsForge

```txt
Supabase se conserva temporalmente como backend heredado/transicional.
InsForge es el destino estratégico para nuevas capacidades críticas.
No migrar todo de golpe.
No ampliar dependencia Supabase para metadata crítica nueva.
```

Nueva metadata de verticales (CAG status, health, flags, knowledgeVersion) debe diseñarse hacia **InsForge o API del vertical**, no nuevas tablas críticas en Supabase.

---

## 4.4 Webhook routing (principio)

```txt
Eva primero.
Webhook YCloud productivo de Eva sigue en wa-agent-unilatino.
algorithmus-wa-console observa vía API/read-only.
No doble webhook.
```

---

## 4.5 Estado inicial CONSOLE-2

```txt
No se modificó funcionalidad.
No se instalaron dependencias.
No se ejecutaron migraciones.
No se tocó producción.
No se tocó wa-agent-unilatino.
No se tocó Supabase remoto.
No se tocó InsForge.
```

**Entregables CONSOLE-2 (solo documentación):**

| Archivo | Origen |
|---------|--------|
| `docs/console-0-whatsapp-saas-audit.md` | Copiado desde clone auditado |
| `docs/console-1-algorithmus-wa-console-adoption-plan.md` | Copiado desde clone auditado |
| `docs/console-2-fork-rename-baseline.md` | Este documento |
| `tests/run-console1-adoption-plan-validator.mjs` | Copiado |
| `tests/run-console2-fork-baseline-validator.mjs` | Nuevo |

**Remotes configurados:**

```txt
origin   → LEANDRO140514/algorithmus-wa-console
upstream → Carlos-Dominguez-faber/whatsapp-saas (referencia, sin pull/merge en CONSOLE-2)
```

---

## 4.6 Próxima fase

**CONSOLE-3 — repository baseline hardening**

(o **CONSOLE-3 — identity rename and safety hardening**)

Incluirá: README rename, branding Algorithmus, branch protection, e2e scaffold, sin desactivar cerebro nativo hasta CONSOLE-4.

---

## Referencias

- CONSOLE-0: auditoría `whatsapp-saas`
- CONSOLE-1: plan de adopción B — fork y evolucionar
- Eva 8B.8: `wa-agent-unilatino` handoff consola
