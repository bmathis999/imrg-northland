import { Suspense } from "react";
import DataBoundary from "./DataBoundary";

/**
 * Wrap any section that reads from the database.
 * - Suspense lets the rest of the page render even if this part fails on the server.
 * - DataBoundary then shows a friendly "couldn't load" message with a retry button.
 * Data functions throw on failure (rather than returning an error), so a previously
 * cached good copy is kept and served instead of being replaced by the failure.
 */
export function SafeSection({
  what,
  children,
  fallback,
  quiet,
}: {
  what: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  quiet?: boolean;
}) {
  return (
    <DataBoundary what={what} quiet={quiet}>
      <Suspense fallback={fallback ?? <div className="h-40 animate-pulse bg-panel" aria-label={`Loading ${what}`} />}>
        {children}
      </Suspense>
    </DataBoundary>
  );
}
