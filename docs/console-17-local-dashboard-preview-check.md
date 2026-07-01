# CONSOLE-17 — Local dashboard preview check

## Objetivo

Verificar localmente que el dashboard/preview UI de la consola (CONSOLE-7 → CONSOLE-16) se renderiza correctamente en rutas mock/read-only, sin activar producción ni runtime vivo.

CONSOLE-17 solo valida preview local.
CONSOLE-17 no activa producción.
CONSOLE-17 no toca wa-agent-unilatino.
CONSOLE-17 no toca InsForge, YCloud, GHL ni Supabase remoto.
CONSOLE-17 no crea rutas productivas.
CONSOLE-17 no crea navegación live.
CONSOLE-17 no hace deploy.

## Contexto

- **Commit base:** `9e519bb` — feat: add hidden vertical diagnostics preview
- **Branch:** `main` (sincronizado con `origin/main` al inicio)
- **Rutas revisadas:** `/verticals`, `/verticals/eva/status`
- Principio rector: la consola observa; el vertical decide.

## Package manager y dependencias

| Item | Valor |
| ---- | ----- |
| Package manager detectado | **npm** (por `package-lock.json`) |
| Lockfile | `package-lock.json` (único lockfile presente) |
| `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb` | No presentes |
| `node_modules` inicial | Ausente |
| Instalación | `npm ci` ejecutado |
| `package.json` modificado | No |
| `package-lock.json` modificado | No |
| `git status` post-install | Limpio (solo `node_modules` gitignored) |

### Scripts disponibles (`package.json`)

| Script | Comando |
| ------ | ------- |
| `dev` | `next dev --turbopack` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint src/ middleware.ts` |
| `typecheck` | `tsc --noEmit` |
| `test:e2e` | `playwright test` |

## Validators pre-preview

Todos **PASS** antes de levantar el dev server:

| Validator | Resultado |
| --------- | --------- |
| CONSOLE-10 | PASS |
| CONSOLE-11 | PASS |
| CONSOLE-12 | PASS |
| CONSOLE-13 | PASS |
| CONSOLE-14 | PASS |
| CONSOLE-15 | PASS |
| CONSOLE-16 | PASS |
| CONSOLE-7 | 82/82 |
| CONSOLE-8 | 83/83 |

## Dev server local

| Item | Valor |
| ---- | ----- |
| Comando | `npm run dev` |
| Framework | Next.js 16.2.7 (Turbopack) |
| Puerto solicitado | 3000 (ocupado por otro proceso) |
| **URL local usada** | **http://localhost:3001** |
| Estado | Ready (~1.7s) |
| `.env.local` | **Ausente** (no se crearon secrets) |

### Notas de entorno

- Rutas mock `/verticals` y `/verticals/eva/status` cargaron con **HTTP 200** sin `.env.local`.
- Rutas productivas bajo `(main)` (p. ej. `/` → `/inbox`) fallan con error Supabase esperado:
  - `Your project's URL and Key are required to create a Supabase client!`
  - Variables faltantes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No se configuraron secrets reales ni se modificó middleware/auth.

## Ruta `/verticals`

**URL:** http://localhost:3001/verticals  
**Estado:** Carga correctamente (HTTP 200)

### Checklist visual (contenido HTML verificado)

| Check | Resultado |
| ----- | --------- |
| Eva WA Universidad Latino (card) | PASS |
| Context preview | PASS |
| Workspace filter preview | PASS |
| Route metadata (read-only) | PASS |
| routeMode / visibility | PASS |
| Preview route | PASS |
| Workspace route (future) template | PASS |
| Workspace route preview resuelto | PASS |
| Agency route (future) template | PASS |
| Agency route preview resuelto | PASS |
| Tenant-aware / Workspace-aware / Agency-aware | PASS |
| Allowed roles | PASS |
| Route surfaces | PASS |
| Access diagnostics | PASS |
| Hidden vertical diagnostics preview | PASS |
| Mensaje vacío hidden: No hidden verticals for the current mock workspace context. | PASS |
| Open mock status panel | PASS |
| Live controls blocked / Flag writes blocked | PASS |
| `href` a `/workspaces/` | 0 (texto only) |
| `href` a `/agency` | 0 (texto only) |
| Único link navegable a status | `href="/verticals/eva/status"` (×1) |
| Botones live / deploy / sync | No detectados |

## Ruta `/verticals/eva/status`

**URL:** http://localhost:3001/verticals/eva/status  
**Estado:** Carga correctamente (HTTP 200)

### Checklist visual

| Check | Resultado |
| ----- | --------- |
| Título Eva WA Status — Mock | PASS |
| Demo preview (safety notice) | PASS |
| Mock read-only data | PASS |
| No production services are called | PASS |
| No live controls are available | PASS |
| Badges read-only / mock | PASS |
| Referencias ycloud / ghl en panel | PASS |
| Botones live / APIs reales | No detectados |
| Errores visuales graves | No observados |

## Enlaces revisados

- Desde `/verticals`, el único link navegable permitido apunta a `/verticals/eva/status`.
- Rutas workspace/agency futuras se muestran como texto (`PathTextRow`), no como links.
- Hidden entries no incluyen links ni “Open mock status panel”.

## Errores encontrados

1. **Puerto 3000 ocupado** — dev server usó 3001 automáticamente (no bloqueante).
2. **Tailwind warning** — clase `duration-[350ms]` ambigua (warning de build, no bloquea preview).
3. **Rutas `(main)` sin env** — `/inbox` y layout principal requieren Supabase env; fuera del scope de rutas mock CONSOLE-7–16.
4. **Sin `.env.local`** — preview mock funciona; app productiva local queda blocked hasta CONSOLE-18A si se desea.
5. **React 19 / next-themes script warning** — ver sección *Hallazgo corregido* (CONSOLE-17A).

## Hallazgo corregido (CONSOLE-17A)

### Error detectado

Console error en dev:

```
Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client.
```

Ubicación: `src/components/theme-provider.tsx` → `next-themes` `ThemeProvider` (inline `<script>` para anti-FOUC).

### Causa

`next-themes@0.4.6` renderiza un `<script dangerouslySetInnerHTML>` dentro del árbol React del client component. React 19 / Next.js 16 advierte porque los scripts en componentes cliente no deben ejecutarse durante el render del cliente.

### Fix aplicado

**Opción A** — reemplazar el wrapper de `next-themes` por un `ThemeProvider` local que:

- aplica tema con `useLayoutEffect` / `useEffect` en `document.documentElement`;
- persiste en `localStorage` (`theme`);
- soporta `attribute="class"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`;
- exporta `useTheme` desde el mismo módulo;
- **no renderiza `<script>` en JSX**.

Archivos tocados:

| Archivo | Cambio |
| ------- | ------ |
| `src/components/theme-provider.tsx` | Provider local sin script inline |
| `src/components/theme-toggle.tsx` | `useTheme` desde `@/components/theme-provider` |
| `src/components/ui/sonner.tsx` | idem |
| `src/features/ui-kit/components/component-showcase.tsx` | idem |

`package.json` y lockfiles **sin cambios**. Dependencia `next-themes` permanece en el proyecto pero ya no se importa en runtime de la app.

### Rutas revalidadas

| Ruta | HTTP | Script-tag error |
| ---- | ---- | ---------------- |
| http://localhost:3001/verticals | 200 | No reproducido post-fix |
| http://localhost:3001/verticals/eva/status | 200 | No reproducido post-fix |

Tema dark por defecto sigue aplicándose vía clase en `documentElement`.

### Resultado

Preview local mock carga sin el error de `<script>` en React component.

## Hallazgo corregido (CONSOLE-17B)

### Error detectado

Runtime error en dev:

```
Your project's URL and Key are required to create a Supabase client!
```

Ubicación: `src/lib/supabase/server.ts` → `createServerClient()`  
Caller: `src/app/(main)/layout.tsx` → `MainLayout` (y también `inbox/page.tsx`).

### Causa

El layout `(main)` y la página inbox llaman `createClient()` al renderizar, pero en local no existe `.env.local` con:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`@supabase/ssr` lanza error al instanciar el cliente sin URL/key.

### Fix aplicado

1. **`hasSupabaseServerEnv()`** exportado desde `src/lib/supabase/server.ts`.
2. **Guard en `MainLayout`** antes de `createClient()` — banner read-only + `{children}`.
3. **Guard en `inbox/page.tsx`** — la página también llamaba `createClient()` directamente; fallback local sin Supabase.

`createClient()` **no se invoca** cuando faltan env vars en esos paths.

### Comportamiento

| Condición | Comportamiento |
| --------- | -------------- |
| Env vars **faltan** | Banner `Local preview: Supabase env not configured...`; inbox muestra mensaje read-only; sin crash |
| Env vars **presentes** | Flujo auth/Supabase actual sin cambios |

### Confirmaciones

- No se creó `.env.local` (no .env.local)
- No se usaron valores dummy ni secrets reales (no secrets reales)
- No se conectó Supabase remoto (no Supabase remoto)
- No se modificó middleware ni auth productiva

### Rutas revalidadas (post-17B)

| Ruta | HTTP | Supabase error |
| ---- | ---- | -------------- |
| `/verticals` | 200 | No |
| `/verticals/eva/status` | 200 | No |
| `/inbox` | 200 | No (fallback preview) |
| `/` | 307 → `/inbox` | No |

## Correcciones hechas

- **CONSOLE-17A:** ThemeProvider sin `<script>` inline (ver *Hallazgo corregido CONSOLE-17A*).
- **CONSOLE-17B:** Guard Supabase env missing en MainLayout + inbox page.

## Restricciones respetadas

- No wa-agent-unilatino, InsForge remoto, YCloud, GHL, Supabase remoto intencional.
- No middleware, auth, layout global, nav global modificados.
- No `package.json` ni lockfiles modificados.
- No rutas productivas nuevas bajo `/workspaces` o `/agency`.
- No deploy.
- No commit en esta fase.

## Resultado final

**PASS** — preview local estabilizado.

Ambos issues de CONSOLE-17 resueltos:

1. **ThemeProvider script tag** (CONSOLE-17A)
2. **Supabase URL/Key required** (CONSOLE-17B)

Las rutas mock (`/verticals`, `/verticals/eva/status`) y rutas `(main)` sin env (`/inbox`) cargan sin crash en preview local read-only.

## Siguiente fase recomendada

**Si preview mock es suficiente:**

**CONSOLE-18 — Registry diagnostics summary mock**  
Resumen agregado read-only: visibles, ocultos, por razón, match type y roles.

**Si se necesita preview de rutas `(main)` sin Supabase real:**

**CONSOLE-18A — Local environment stabilization for console preview**  
Mínimo necesario para dev local sin tocar producción ni secrets reales (p. ej. placeholders seguros o bypass documentado solo para mock routes).
