import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton({
  columns = 3,
  cardsPerColumn = 3,
}: {
  columns?: number;
  cardsPerColumn?: number;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col w-72 flex-shrink-0">
          {/* Column Header Skeleton */}
          <div className="p-3 bg-muted rounded-t-lg mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          {/* Card Skeletons */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="p-4 bg-card border rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
