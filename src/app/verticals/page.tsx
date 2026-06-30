/**
 * CONSOLE-8 — Verticals mock registry list demo route.
 * Not linked in global navigation. No auth/middleware changes.
 */

import { VerticalRegistryList } from "@/components/verticals";

export const metadata = {
  title: "Verticals — Mock Registry",
  description:
    "Read-only mock vertical registry list (CONSOLE-8). No production services.",
};

export default function VerticalsMockRegistryPage() {
  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verticals — Mock Registry
        </h1>
        <p className="text-sm text-muted-foreground">
          This page uses mock read-only registry data. It does not call production services.
        </p>
      </header>
      <VerticalRegistryList />
    </main>
  );
}
