# Algorithmus WA Console

SaaS control plane for WhatsApp vertical agents.

**Forked from** [Carlos-Dominguez-faber/whatsapp-saas](https://github.com/Carlos-Dominguez-faber/whatsapp-saas).

## Purpose

This repository is the **Algorithmus WA Console**: inbox, tenants/workspaces, agency/super-admin, dashboard, and supervision layer for WhatsApp vertical agents.

It is **not** the primary brain for outbound decisions, CAG response injection, or GHL sync for Eva WA.

## First vertical

**[wa-agent-unilatino](https://github.com/LEANDRO140514/wa-agent-unilatino)** — Eva WA / Universidad Latino.

The vertical decides, responds, and synchronizes. The console observes, operates, and supervises.

## Guiding principle

> The console observes, operates, and supervises.  
> The vertical decides, responds, and synchronizes.

## Status

This repository is in **adoption/hardening phase**.

**Do not use as production brain for Eva WA.**

Inherited runtime (decision-engine, native agents, OpenRouter/RAG) remains in the codebase from the fork but must not drive Eva WA in the first integration.

## Supabase / InsForge

- **Supabase** is inherited/transitional (auth, inbox, legacy schema).
- **InsForge** is the strategic destination for new critical capabilities (vertical status, CAG flags, health, replay, approvals).

Do not expand Supabase dependency for new critical metadata. Design new capabilities InsForge-first or via the vertical API contract.

## Safety rules

- **No double webhook** — Eva WA YCloud webhook stays in `wa-agent-unilatino`.
- **No live control** without explicit authorization.
- **No native decision-engine for Eva WA.**
- **No CAG response activation from console yet.**
- **No RAG/LLM activation for Eva WA from console.**

See also [docs/console-env-safety.md](docs/console-env-safety.md).

## Console adoption docs

| Phase | Document |
| ----- | -------- |
| CONSOLE-0 | [docs/console-0-whatsapp-saas-audit.md](docs/console-0-whatsapp-saas-audit.md) |
| CONSOLE-1 | [docs/console-1-algorithmus-wa-console-adoption-plan.md](docs/console-1-algorithmus-wa-console-adoption-plan.md) |
| CONSOLE-2 | [docs/console-2-fork-rename-baseline.md](docs/console-2-fork-rename-baseline.md) |
| CONSOLE-3 | [docs/console-3-repository-baseline-hardening.md](docs/console-3-repository-baseline-hardening.md) |

## Inherited stack (from fork)

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 + React 19 + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend (legacy) | Supabase (Auth + PostgreSQL + RLS + Storage) |
| IA (legacy) | OpenRouter |
| WhatsApp | YCloud |
| Hosting | Vercel |

Local development instructions remain in the forked codebase; do not run installs, migrations, or production deploys as part of the adoption phases unless explicitly authorized.

## Environment template

See [`.env.local.example`](.env.local.example). Do not commit real `.env` files or production secrets — [docs/console-env-safety.md](docs/console-env-safety.md).
