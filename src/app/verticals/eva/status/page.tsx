/**
 * CONSOLE-5 / CONSOLE-6 — Eva WA status demo route (mock read-only).
 * Not linked in global navigation. No auth/middleware changes in CONSOLE-6.
 */

import { EvaStatusPanel } from "@/components/verticals/eva";

export const metadata = {
  title: "Eva WA Status — Mock",
  description:
    "Read-only mock status panel for Eva WA vertical (CONSOLE-5). No production services.",
};

export default function EvaStatusMockPage() {
  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Eva WA Status — Mock
        </h1>
        <p className="text-sm text-muted-foreground">
          This panel uses mock read-only data from CONSOLE-4. It does not call
          production services.
        </p>
      </header>

      <aside
        className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground"
        aria-label="Demo preview safety notice"
      >
        <p className="font-medium text-foreground">Demo preview</p>
        <p>Mock read-only data</p>
        <p>No production services are called</p>
        <p>No live controls are available</p>
        <p>This route is not wired to tenant/auth yet</p>
      </aside>

      <EvaStatusPanel />
    </main>
  );
}
