/**
 * CONSOLE-5 — Eva WA status demo route (mock read-only).
 * Not linked in global navigation. No auth/middleware changes.
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
      <EvaStatusPanel />
    </main>
  );
}
