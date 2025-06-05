import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-1/2" /> {/* Skeleton for PageHeader */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" /> {/* Skeleton for a title */}
        <Skeleton className="h-4 w-3/4" /> {/* Skeleton for some text */}
        <Skeleton className="h-4 w-1/2" /> {/* Skeleton for more text */}
        <Skeleton className="h-10 w-full" />{" "}
        {/* Skeleton for a larger block/form */}
      </div>
    </div>
  );
}
