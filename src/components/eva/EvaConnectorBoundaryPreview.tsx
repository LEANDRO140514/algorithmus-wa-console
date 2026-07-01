/**
 * Eva connector boundary preview — CONSOLE-20 mock/read-only UI.
 * Server component: getEvaConnectorBoundaryStatus (no network).
 */

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEvaConnectorBoundaryStatus } from "@/lib/eva";

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

function ScopeBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium text-muted-foreground">
        {title} ({items.length})
      </p>
      <p className="font-mono text-xs">{items.join(", ") || "—"}</p>
    </div>
  );
}

export function EvaConnectorBoundaryPreview() {
  const boundary = getEvaConnectorBoundaryStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eva connector boundary</CardTitle>
        <CardDescription>
          CONSOLE-19 contract preview — console role observe_supervise;
          vertical role decide_respond_sync; boundary mode read_only_contract.
          wa-agent-unilatino decides, responds and syncs. The console is not
          Eva&apos;s brain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Mock</Badge>
          <Badge variant="outline">Read-only</Badge>
          <Badge variant="outline">No live calls</Badge>
          <span className="text-sm text-muted-foreground">
            Runtime owner: {boundary.runtimeOwner}
          </span>
        </div>

        <dl className="space-y-1">
          <FieldRow label="Runtime owner" value={boundary.runtimeOwner} />
          <FieldRow label="Console role" value={boundary.consoleRole} />
          <FieldRow label="Vertical role" value={boundary.verticalRole} />
          <FieldRow label="Boundary mode" value={boundary.boundaryMode} />
          <FieldRow label="Connector mode" value={boundary.connectorMode} />
          <FieldRow
            label="Live calls enabled"
            value={boundary.liveCallsEnabled}
          />
          <FieldRow
            label="Runtime connected"
            value={boundary.health.liveRuntimeConnected}
          />
          <FieldRow
            label="Ready for future integration"
            value={boundary.health.readyForFutureIntegration}
          />
        </dl>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Flags</p>
          <dl className="space-y-1">
            <FieldRow
              label="WA_AGENT_MODE"
              value={boundary.activeFlags.WA_AGENT_MODE}
            />
            <FieldRow
              label="GHL_SYNC_MODE"
              value={boundary.activeFlags.GHL_SYNC_MODE}
            />
            <FieldRow
              label="GHL_WRITE_CUSTOM_FIELDS"
              value={boundary.activeFlags.GHL_WRITE_CUSTOM_FIELDS}
            />
            <FieldRow
              label="ACADEMIC_ENGINE_ENABLED"
              value={boundary.activeFlags.ACADEMIC_ENGINE_ENABLED}
            />
            <FieldRow
              label="EVA_LLM_ENABLED"
              value={boundary.activeFlags.EVA_LLM_ENABLED}
            />
          </dl>
        </div>

        <ScopeBlock title="Can read" items={boundary.canRead} />
        <ScopeBlock title="Cannot write" items={boundary.cannotWrite} />

        <dl className="space-y-1">
          <FieldRow label="Mode" value={boundary.reason} />
          <FieldRow label="Mock" value="yes" />
          <FieldRow label="Read-only" value="yes" />
        </dl>

        <p className="text-xs text-muted-foreground">{boundary.lastKnownRuntime.note}</p>
      </CardContent>
    </Card>
  );
}
