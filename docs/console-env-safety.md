# Console environment and secrets safety

## 5.1 Regla general

- **Do not create real `.env` files in repository.**
- **Do not commit secrets.**
- **Do not paste production keys in docs or tests.**

Use `.env.local.example` (or `.env.example` if present) only as a template. Fill real values locally outside version control.

## 5.2 Supabase vars (inherited / transitional)

Variables típicas heredadas del fork `whatsapp-saas`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Supabase** es backend heredado/transicional para auth, inbox y schema existente.

No incluir valores reales en documentación, commits o validadores. No escribir a Supabase remoto desde fases de adopción documental.

## 5.3 InsForge vars

Nuevas capacidades críticas (vertical status, CAG flags, health, replay, approvals) deben considerar **InsForge** o la **API del vertical** (`wa-agent-unilatino`).

No diseñar metadata crítica nueva acoplada solo a Supabase.

No incluir valores reales de InsForge en este repo.

## 5.4 YCloud vars

YCloud en el fork se configura por workspace (Settings → Integraciones) además de posibles vars de entorno heredadas.

**Riesgo: doble webhook.**

- Eva WA inbound webhook → **`wa-agent-unilatino` only**.
- La consola **no** debe registrar un segundo webhook YCloud para el mismo número/flujo de Eva sin fase aprobada.

**No double webhook.**

## 5.5 OpenRouter vars

Variables heredadas (p. ej. `OPENROUTER_API_KEY`) alimentan el motor LLM nativo del fork.

**OpenRouter/LLM heredado no debe usarse para Eva WA al inicio.**

No activar LLM/RAG para Eva desde la consola en fases de adopción.

## 5.6 GHL vars

HighLevel en el fork es configuración por workspace (encriptada en Supabase).

**Eva / GHL vive en `wa-agent-unilatino` inicialmente** para sync y decisiones del vertical.

La consola no debe asumir control GHL productivo de Eva sin contrato y autorización explícita.

## 5.7 `.gitignore` expectations

Deben ignorarse (y no commitearse):

```txt
.env
.env.*
!.env.example
!.env.local.example
.audit-grep.txt
*.local
```

Archivos como `node_modules/`, `.vercel/`, y SQL cron rellenado (`supabase/cron/*.filled.sql`) también deben permanecer fuera del repo según `.gitignore` existente.

## Operational guardrails

- No `npm install` en fases documentales salvo autorización.
- No ejecutar migraciones Supabase.
- No deploy ni live.
- No llamar APIs externas desde validadores documentales.
