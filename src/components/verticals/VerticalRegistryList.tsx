/**
 * Vertical registry list — CONSOLE-8/11/12/13 mock/read-only UI.
 * Server component: listVerticalRegistryEntries (no network).
 */

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildVerticalRoutePreview,
  listVerticalRegistryEntries,
} from "@/lib/verticals";
import { getMockWorkspaceContext } from "@/lib/workspaces";
import type { WorkspaceContext } from "@/types/workspaces/workspace-context";
import type {
  VerticalRegistryEntry,
  VerticalRouteMetadata,
} from "@/types/verticals/vertical-registry";

function FieldRow({ label, value }: { label: string; value: string | boolean }) {
  const display =
    typeof value === "boolean" ? (value ? "true" : "false") : value;
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-right">{display}</dd>
    </div>
  );
}

function PathTextRow({ label, path }: { label: string; path?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] break-all text-right font-mono text-xs">
        {path ?? "—"}
      </dd>
    </div>
  );
}

function BoolYesNoRow({ label, value }: { label: string; value: boolean }) {
  return <FieldRow label={label} value={value ? "yes" : "no"} />;
}

function WorkspaceContextPreview({
  workspaceContext,
}: {
  workspaceContext: WorkspaceContext;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm">
      <p className="font-medium text-muted-foreground">Context preview</p>
      <dl className="mt-2 space-y-1">
        <FieldRow
          label="Tenant"
          value={`${workspaceContext.tenant.tenantName} (${workspaceContext.tenant.tenantId})`}
        />
        <FieldRow
          label="Workspace"
          value={`${workspaceContext.workspace.workspaceName} (${workspaceContext.workspace.workspaceId})`}
        />
        <FieldRow label="Mode" value={workspaceContext.mode} />
        <FieldRow label="Read-only" value="yes" />
        <FieldRow label="Mock" value="yes" />
      </dl>
    </div>
  );
}

function RouteMetadataPreview({
  entry,
  workspaceContext,
}: {
  entry: VerticalRegistryEntry;
  workspaceContext: WorkspaceContext;
}) {
  const routePreview = buildVerticalRoutePreview({
    entry,
    params: workspaceContext.routeParams,
  });
  const routeMetadata: VerticalRouteMetadata = entry.routeMetadata;
  const { allowedRoles, routeSurface } = routeMetadata;

  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-sm font-medium text-muted-foreground">
        Route metadata (read-only)
      </p>
      <dl className="space-y-1">
        <FieldRow label="routeMode" value={routePreview.routeMode} />
        <FieldRow label="visibility" value={routePreview.visibility} />
        <PathTextRow
          label="preview route"
          path={routePreview.previewStatusPanelPath}
        />
        <PathTextRow
          label="workspace route (future) — template"
          path={routePreview.workspaceStatusPanelPath}
        />
        <PathTextRow
          label="workspace route preview"
          path={routePreview.resolvedWorkspaceStatusPanelPath}
        />
        <PathTextRow
          label="agency route (future) — template"
          path={routePreview.agencyStatusPanelPath}
        />
        <PathTextRow
          label="agency route preview"
          path={routePreview.resolvedAgencyStatusPanelPath}
        />
        <BoolYesNoRow label="tenant-aware" value={routePreview.tenantAware} />
        <BoolYesNoRow
          label="workspace-aware"
          value={routePreview.workspaceAware}
        />
        <BoolYesNoRow label="agency-aware" value={routePreview.agencyAware} />
        <FieldRow label="allowedRoles" value={allowedRoles.join(", ")} />
        <FieldRow label="routeSurface" value={routeSurface.join(", ")} />
        <FieldRow label="isPreviewOnly" value="true" />
      </dl>
      <p className="text-xs text-muted-foreground">
        Preview-only route resolution. Future paths are declarative only — not navigable.
      </p>
    </div>
  );
}

function VerticalCard({
  entry,
  workspaceContext,
}: {
  entry: VerticalRegistryEntry;
  workspaceContext: WorkspaceContext;
}) {
  const liveControlsBlocked = entry.capabilities.some(
    (c) => c.key === "live_controls" && !c.enabled,
  );
  const flagWritesBlocked = entry.capabilities.some(
    (c) => c.key === "flag_writes" && !c.enabled,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{entry.displayName}</CardTitle>
          <Badge variant="outline">{entry.consoleStatus}</Badge>
          <Badge variant="secondary">mock</Badge>
          <Badge variant="outline">read-only</Badge>
        </div>
        <CardDescription>{entry.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-1">
          <FieldRow label="verticalId" value={entry.verticalId} />
          <FieldRow label="tenantId" value={entry.tenantId} />
          <FieldRow label="repo" value={entry.repo} />
          <FieldRow label="owner" value={entry.owner} />
          <FieldRow label="provider" value={entry.provider} />
          <FieldRow label="crm" value={entry.crm} />
          <FieldRow label="runtimeTarget" value={entry.runtimeTarget} />
          <FieldRow label="dataMode" value={entry.dataMode} />
          <FieldRow label="connectionMode" value={entry.connectionMode} />
          <FieldRow label="tags" value={entry.tags.join(", ")} />
        </dl>

        <div className="space-y-1 text-sm">
          <p className="font-medium text-muted-foreground">Capabilities</p>
          <ul className="list-inside list-disc font-mono text-xs">
            {entry.capabilities.map((cap) => (
              <li key={cap.key}>
                {cap.key}: {cap.enabled ? "enabled" : "disabled"} ({cap.mode})
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-1">
          <FieldRow label="safety.level" value={entry.safety.level} />
          <FieldRow label="readOnly" value={entry.safety.readOnly} />
          <FieldRow label="canActivateLive" value={entry.safety.canActivateLive} />
          <FieldRow
            label="canChangeWebhook"
            value={entry.safety.canChangeWebhook}
          />
          <FieldRow
            label="canAccessSecrets"
            value={entry.safety.canAccessSecrets}
          />
          <FieldRow label="containsPii" value={entry.safety.containsPii} />
        </dl>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {liveControlsBlocked && (
            <span className="rounded border px-2 py-0.5">Live controls blocked</span>
          )}
          {flagWritesBlocked && (
            <span className="rounded border px-2 py-0.5">Flag writes blocked</span>
          )}
        </div>

        <RouteMetadataPreview
          entry={entry}
          workspaceContext={workspaceContext}
        />

        <p className="text-sm">
          <span className="text-muted-foreground">statusPanelPath: </span>
          <code className="font-mono text-xs">{entry.statusPanelPath}</code>
        </p>

        <a
          href={entry.statusPanelPath}
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open mock status panel
        </a>
      </CardContent>
    </Card>
  );
}

export function VerticalRegistryList() {
  const entries = listVerticalRegistryEntries();
  const workspaceContext = getMockWorkspaceContext();

  const mockCount = entries.filter((e) => e.dataMode === "mock").length;
  const readOnlyCount = entries.filter((e) => e.safety.readOnly).length;
  const liveBlockedCount = entries.filter(
    (e) => !e.safety.canActivateLive,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Mock read-only data</Badge>
        <Badge variant="outline">No live controls</Badge>
        <span className="text-sm text-muted-foreground">
          Console observes — Verticals decide
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        No production services are called
      </p>

      <WorkspaceContextPreview workspaceContext={workspaceContext} />

      <Card>
        <CardHeader>
          <CardTitle>Vertical Registry</CardTitle>
          <CardDescription>
            Mock read-only registry — workspace context boundary (CONSOLE-13)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Verticales</dt>
              <dd className="text-2xl font-semibold">{entries.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Mock</dt>
              <dd className="text-2xl font-semibold">{mockCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Read-only</dt>
              <dd className="text-2xl font-semibold">{readOnlyCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Live controls blocked</dt>
              <dd className="text-2xl font-semibold">{liveBlockedCount}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <VerticalCard
            key={entry.verticalId}
            entry={entry}
            workspaceContext={workspaceContext}
          />
        ))}
      </div>
    </div>
  );
}
