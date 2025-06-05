import { Skeleton } from "@/components/ui/skeleton";

export function KanbanSkeleton({
  columns = 4,
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
            <Skeleton className="h-5 w-3/4" />
          </div>
          {/* Card Skeletons */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="p-4 bg-card border rounded-lg shadow-sm"
              >
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
