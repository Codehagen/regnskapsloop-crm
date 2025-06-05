import { LeadsTableSkeleton } from "@/components/lead/leads-skeleton";

export function CustomersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return <LeadsTableSkeleton rows={rows} />;
}
