/**
 * Eva WA status panel — CONSOLE-5 mock/read-only UI.
 * Server component: loads snapshot from createEvaVerticalMockConnector (no network).
 */

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createEvaVerticalMockConnector } from "@/lib/vertical-connectors/eva";

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

function CategoryBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium text-muted-foreground">
        {title} ({items.length})
      </p>
      <p className="font-mono text-xs">{items.join(", ") || "—"}</p>
    </div>
  );
}

export async function EvaStatusPanel() {
  const connector = createEvaVerticalMockConnector();
  const snapshot = await connector.getStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Read-only</Badge>
        <Badge variant="outline">Mock data</Badge>
        <Badge variant="outline">No live controls</Badge>
        <span className="text-sm text-muted-foreground">
          Eva first — console observes
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{snapshot.displayName}</CardTitle>
          <CardDescription>
            Identity · Connection · Eva WA Universidad Latino
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <FieldRow label="verticalId" value={snapshot.verticalId} />
          <FieldRow label="tenantId" value={snapshot.tenantId} />
          <FieldRow label="connectionState" value={snapshot.connectionState} />
          <FieldRow label="provider" value={snapshot.provider} />
          <FieldRow label="crm" value={snapshot.crm} />
          <FieldRow label="updatedAt" value={snapshot.updatedAt} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow label="status" value={snapshot.health.status} />
            <FieldRow label="message" value={snapshot.health.message} />
            <FieldRow label="checkedAt" value={snapshot.health.checkedAt} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
            <CardDescription>WA_AGENT_MODE · academic engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow
              label="WA_AGENT_MODE"
              value={snapshot.flags.WA_AGENT_MODE}
            />
            <FieldRow
              label="waAgentMode"
              value={snapshot.runtime.waAgentMode}
            />
            <FieldRow
              label="academicEngineEnabled"
              value={snapshot.runtime.academicEngineEnabled}
            />
            <FieldRow label="outboundReal" value={snapshot.runtime.outboundReal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GHL</CardTitle>
            <CardDescription>GHL_SYNC_MODE</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow
              label="GHL_SYNC_MODE"
              value={snapshot.flags.GHL_SYNC_MODE}
            />
            <FieldRow label="syncMode" value={snapshot.ghl.syncMode} />
            <FieldRow
              label="customFieldsEnabled"
              value={snapshot.ghl.customFieldsEnabled}
            />
            <FieldRow label="live" value={snapshot.ghl.live} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LLM</CardTitle>
            <CardDescription>LLM off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow label="enabled" value={snapshot.llm.enabled} />
            <FieldRow label="mode" value={snapshot.llm.mode} />
            <FieldRow label="EVA_LLM_ENABLED" value={snapshot.flags.EVA_LLM_ENABLED} />
            <FieldRow label="LLM_MODE" value={snapshot.flags.LLM_MODE} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>CAG</CardTitle>
            <CardDescription>CAG response disabled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-1">
              <FieldRow label="mode" value={snapshot.cag.mode} />
              <FieldRow
                label="shadowLoggingEnabled"
                value={snapshot.cag.shadowLoggingEnabled}
              />
              <FieldRow
                label="assistiveShadowEnabled"
                value={snapshot.cag.assistiveShadowEnabled}
              />
              <FieldRow
                label="responseEnabled"
                value={snapshot.cag.responseEnabled}
              />
              <FieldRow
                label="finalResponseModified"
                value={snapshot.cag.finalResponseModified}
              />
              <FieldRow
                label="EVA_CAG_RESPONSE_ENABLED"
                value={snapshot.flags.EVA_CAG_RESPONSE_ENABLED}
              />
              <FieldRow
                label="EVA_CAG_SHADOW_LOGGING"
                value={snapshot.flags.EVA_CAG_SHADOW_LOGGING}
              />
              <FieldRow
                label="EVA_CAG_ASSISTIVE_SHADOW"
                value={snapshot.flags.EVA_CAG_ASSISTIVE_SHADOW}
              />
            </dl>
            <CategoryBlock
              title="allowedCategories"
              items={snapshot.cag.allowedCategories}
            />
            <CategoryBlock
              title="blockedCategories"
              items={snapshot.cag.blockedCategories}
            />
            <CategoryBlock
              title="partialCategories"
              items={snapshot.cag.partialCategories}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge</CardTitle>
            <CardDescription>RAG productive false</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow label="source" value={snapshot.knowledge.source} />
            <FieldRow label="strategy" value={snapshot.knowledge.strategy} />
            <FieldRow
              label="ragProductive"
              value={snapshot.knowledge.ragProductive}
            />
            <FieldRow label="version" value={snapshot.knowledge.version} />
            <FieldRow label="contentHash" value={snapshot.knowledge.contentHash} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Replay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow label="status" value={snapshot.replay.status} />
            <FieldRow label="lastRunLabel" value={snapshot.replay.lastRunLabel} />
            <FieldRow label="passed" value={snapshot.replay.passed} />
            <FieldRow label="failed" value={snapshot.replay.failed} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Flags</CardTitle>
            <CardDescription>Read-only key/value — no flag writes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(snapshot.flags).map(([key, value]) => (
              <FieldRow key={key} label={key} value={value} />
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <FieldRow label="level" value={snapshot.safety.level} />
            <FieldRow label="readOnly" value={snapshot.safety.readOnly} />
            <FieldRow
              label="canWriteRuntime"
              value={snapshot.safety.canWriteRuntime}
            />
            <FieldRow
              label="canActivateLive"
              value={snapshot.safety.canActivateLive}
            />
            <FieldRow
              label="canChangeWebhook"
              value={snapshot.safety.canChangeWebhook}
            />
            <FieldRow label="piiRedacted" value={snapshot.safety.piiRedacted} />
            <FieldRow
              label="secretsIncluded"
              value={snapshot.safety.secretsIncluded}
            />
            <FieldRow
              label="warnings"
              value={
                snapshot.safety.warnings.length > 0
                  ? snapshot.safety.warnings.join("; ")
                  : "none"
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
