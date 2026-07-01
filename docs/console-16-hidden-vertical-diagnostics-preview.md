# CONSOLE-16 — Hidden vertical diagnostics preview

## Objetivo

Extender la UI del Vertical Registry para mostrar **diagnósticos mock/read-only** también para verticales **ocultos** por el workspace context mock, explicando por qué el filtro CONSOLE-14 los excluyó.

CONSOLE-16 muestra diagnostics mock/read-only de verticales ocultos.
CONSOLE-16 reutiliza el filtro de CONSOLE-14.
CONSOLE-16 reutiliza diagnostics de CONSOLE-15.
CONSOLE-16 no activa workspace real.
CONSOLE-16 no crea permisos reales.
CONSOLE-16 no lee sesión real.
CONSOLE-16 no usa Supabase.
CONSOLE-16 no crea rutas tenant-aware reales.
CONSOLE-16 no crea navegación productiva.
CONSOLE-16 no muestra links para hidden entries.
CONSOLE-16 no mueve /verticals ni /verticals/eva/status.
CONSOLE-16 no toca middleware, auth, layout ni nav global.
CONSOLE-16 no toca wa-agent-unilatino, InsForge, YCloud, GHL ni Supabase.

## Contexto

- **CONSOLE-14** filtra el registry en `visibleEntries` / `hiddenEntries`.
- **CONSOLE-15** muestra Access diagnostics para verticales visibles.
- **CONSOLE-16** aplica el mismo `diagnoseVerticalAccess` a `hiddenEntries` en una sección separada.

Principio rector:

> La consola observa, opera y supervisa.  
> El vertical decide, responde y sincroniza.

## Archivos modificados / creados

| Archivo | Acción |
| ------- | ------ |
| `src/components/verticals/VerticalRegistryList.tsx` | Sección Hidden vertical diagnostics preview |
| `scripts/validate-hidden-vertical-diagnostics-preview.mjs` | Validator CONSOLE-16 |
| `docs/console-16-hidden-vertical-diagnostics-preview.md` | Este documento |

**Sin cambios:** filter mock, access diagnostics helper, workspace context, vertical registry mock, rutas `app/`, middleware, auth, nav, `package.json`, lockfiles.

## Por qué se añade hidden diagnostics

CONSOLE-15 explica verticales visibles. Operadores necesitan ver también qué fue filtrado y la razón (`hidden_no_access`, `hidden_not_visible`, `hidden_roles_incompatible`) sin activar RBAC real.

## Cómo se reutiliza filteredRegistry.hiddenEntries

```ts
const filteredRegistry = filterVerticalRegistryForWorkspace({ entries, workspaceContext });
const hiddenEntries = filteredRegistry.hiddenEntries;
```

No se crea filtro nuevo ni se alteran reglas de visibilidad.

## Cómo se reutiliza diagnoseVerticalAccess

```ts
hiddenEntries.map((entry) =>
  diagnoseVerticalAccess({ entry, workspaceContext })
);
```

Cada hidden entry recibe el mismo contrato `VerticalAccessDiagnostic` de CONSOLE-15.

## Estados hidden soportados

| Status | Significado |
| ------ | ----------- |
| `hidden_no_access` | Sin entrada en `verticalAccess` |
| `hidden_not_visible` | Access existe pero `visible === false` |
| `hidden_roles_incompatible` | Access visible pero sin roles compatibles |

Un hidden entry con `status: visible` sería inconsistencia con el filtro.

## Por qué no se muestra navegación para hidden entries

Los verticales ocultos no deben ser operables ni navegables desde la consola mock. No hay `Open mock status panel` ni `href` en la sección hidden. El único link navegable sigue siendo `entry.statusPanelPath` en verticales **visibles**.

## Cómo se muestra en UI

Sección **Hidden vertical diagnostics preview** (después de la lista visible):

- Resumen: Hidden verticals count, Mode, Mock, Read-only
- Si `hiddenEntries.length === 0`: mensaje seguro *No hidden verticals for the current mock workspace context.*
- Por cada hidden entry: Vertical, Status, Match, Access found/visible, Roles compatible, Matched/Missing roles, Mock, Read-only

Con el mock actual (solo Eva, acceso compatible), el conteo es 0 y se muestra el estado vacío.

## Qué sigue siendo read-only

- Sin APIs, Supabase, auth, cookies, sesión.
- Sin botones, dropdowns, accordions con estado.
- Rutas workspace/agency siguen siendo texto en visible entries.

## Por qué no auth / Supabase / permisos reales

La fase documenta el comportamiento del filtro mock; no implementa RBAC ni lee tenant real.

## Por qué no rutas productivas

No se crean `/workspaces` ni `/agency/verticals` navegables.

## Validaciones ejecutadas

```bash
node scripts/validate-vertical-registry-routes.mjs
node scripts/validate-vertical-registry-route-consumption.mjs
node scripts/validate-vertical-route-preview-contract.mjs
node scripts/validate-workspace-context-mock-boundary.mjs
node scripts/validate-workspace-filtered-vertical-registry.mjs
node scripts/validate-vertical-registry-access-diagnostics.mjs
node scripts/validate-hidden-vertical-diagnostics-preview.mjs
node tests/run-console7-vertical-registry-validator.mjs
node tests/run-console8-vertical-registry-list-ui-validator.mjs
```

## Restricciones respetadas

- No wa-agent-unilatino, InsForge, YCloud, GHL, Supabase remoto.
- No middleware, auth, layout global, nav global.
- No `package.json` ni lockfiles.
- No rutas productivas nuevas.
- No commit automático — revisión humana primero.

## Riesgos abiertos

- Mock registry con un solo vertical: hidden diagnostics muestra estado vacío hasta añadir más entries mock.
- Sin resumen agregado por razón/match type (CONSOLE-17 futuro).

## Siguiente fase recomendada

**CONSOLE-17 — Registry diagnostics summary mock**

Resumen agregado read-only: visibles, ocultos, por razón, por match type y por roles — sin auth real, permisos reales, Supabase ni rutas productivas.
