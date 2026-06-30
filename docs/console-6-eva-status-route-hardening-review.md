# CONSOLE-6 — Eva status route hardening review

## 3.1 Resumen

CONSOLE-6 revisa el encaje de la ruta demo `/verticals/eva/status` creada en CONSOLE-5.

Es una fase de **revisión y hardening pasivo**: documentación, avisos UI y validación — sin integración productiva ni datos reales.

## 3.2 Estado de la ruta

| Campo | Valor |
| ----- | ----- |
| Ruta | `/verticals/eva/status` |
| Archivo | `src/app/verticals/eva/status/page.tsx` |
| Tipo | demo / preview |
| Data source | `createEvaVerticalMockConnector()` |
| Modo | mock / read-only |
| Producción | **No producción** |
| API real | **No API real** |

**No navegación global** — la ruta no aparece en sidebar ni nav de `(main)`.

## 3.3 App Router review

### Route groups encontrados

| Group | Propósito |
| ----- | --------- |
| `(main)` | Inbox, dashboard, settings — layout con nav workspace |
| `(auth)` | Login, signup, password recovery |
| `(agency)` | Super-admin workspaces |

### Ubicación de la ruta Eva

```
src/app/verticals/eva/status/page.tsx
```

La ruta Eva está **fuera** de `(main)`, `(auth)` y `(agency)`.

### Motivo del aislamiento

- Evitar tocar navegación, auth layout y layout productivo de `(main)`.
- Aislar preview read-only hasta integración formal.
- Mantener el panel desacoplado del cerebro nativo (decision-engine, webhook, agents).

### Layout aplicado

- Solo `src/app/layout.tsx` (root: theme, toaster).
- **No** usa `(main)/layout.tsx` — sin sidebar, sin workspace switcher, sin nav global.

## 3.4 Auth / middleware review

### Middleware existente

Archivo: `middleware.ts` (raíz del repo).

Comportamiento relevante:

- Matcher amplio: todas las rutas excepto `_next`, `favicon`, `api/`.
- Usa Supabase SSR para refrescar sesión.
- `publicRoutes`: `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- Cualquier otra ruta sin usuario → redirect a `/login`.

### Implicación para `/verticals/eva/status`

- **No** está en `publicRoutes`.
- Usuarios **sin sesión** son redirigidos a login (middleware heredado, sin cambio en CONSOLE-6).
- Usuarios **con sesión** pueden abrir la ruta directamente por URL.
- La ruta **no** está wired a tenant/workspace ni roles — no es control plane productivo.

### Declaración CONSOLE-6

CONSOLE-6 **no modifica** `middleware.ts` ni flujos de auth.

La ruta demo **no debe considerarse control plane productivo** todavía.

### Futuro

Antes de exponerla como funcionalidad real:

- Mover bajo área **agency** o **tenant workspace**.
- Aplicar roles (admin/owner).
- Alimentar desde connector real read-only.
- Registrar en vertical registry.

## 3.5 UI safety review

El panel `EvaStatusPanel` y la página demo muestran:

- Read-only
- Mock data / Demo preview
- No live controls
- Eva first — console observes
- CAG response disabled
- LLM off
- RAG productive false

### Confirmado: no tiene

- Botones live
- Toggles editables
- Forms de escritura
- POST / PUT / DELETE
- Flag writes
- API real
- `fetch`, axios, Supabase client, `process.env` en page/panel

## 3.6 Data safety review

Confirmado en page + panel + connector mock:

- No teléfonos reales
- No secrets
- No raw WhatsApp payload
- No raw GHL payload
- No PII estudiantil
- No env vars en componentes Eva
- No `process.env` en page/panel
- No Supabase client en page/panel
- No InsForge client

## 3.7 Hardening decision

**Recomendación CONSOLE-6:** mantener la ruta demo aislada como preview temporal.

| Acción | Decisión |
| ------ | -------- |
| Agregar a nav global | **No** (todavía) |
| Mover a `(main)` o `(agency)` | **No** (esta fase) |
| Cambiar middleware | **No** (esta fase) |
| Conectar API real | **No** |

Próxima integración formal debe decidir:

- Si vive bajo agency
- Si vive bajo tenant workspace
- Si requiere role admin/owner
- Si usa connector real read-only
- Si usa vertical registry

## 3.8 Future route options

| Opción | Ruta | Uso |
| ------ | ---- | --- |
| **A** | `/verticals/eva/status` | Dev preview (actual) |
| **B** | `/agency/verticals/eva/status` | Super-admin |
| **C** | `/workspaces/[workspaceId]/verticals/eva/status` | Tenant-aware |
| **D** | Dashboard tenant integrado | Producto |

**Recomendación inicial:** para producción futura, preferir ruta **tenant-aware** o **agency-aware**, no la demo aislada actual.

## 3.9 Next phase

**CONSOLE-7 — Vertical registry mock**

Antes de integrar la ruta en navegación/producto, crear un registro mock de verticales para que Eva no sea hardcode único y la consola pueda escalar a múltiples verticales.

## Entregables CONSOLE-6

| Archivo | Rol |
| ------- | --- |
| `docs/console-6-eva-status-route-hardening-review.md` | Este documento |
| `tests/run-console6-route-hardening-validator.mjs` | Validación |
| `src/app/verticals/eva/status/page.tsx` | Avisos de seguridad (si aplica) |
