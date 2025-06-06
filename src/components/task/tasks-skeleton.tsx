import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton({
  columns = 3,
  cardsPerColumn = 3,
}: {
  columns?: number;
  cardsPerColumn?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col h-full">
          {/* Column Header Skeleton - matches actual kanban header */}
          <div className="mb-2 px-1">
            <div className="flex items-center gap-1 mb-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>

          {/* Droppable Area Skeleton - matches actual kanban droppable */}
          <div className="flex-1 min-h-[300px] rounded-lg border border-dashed p-2 bg-muted/40">
            <div className="flex flex-col gap-2">
              {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="bg-card border rounded-lg shadow-sm"
                >
                  {/* Card Header - matches enhanced task card header */}
                  <div className="p-2 pb-0">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Card Content - matches enhanced task card content */}
                  <div className="p-2 pt-1">
                    {/* Description skeleton */}
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-2" />

                    {/* Information rows skeleton */}
                    <div className="space-y-1">
                      {/* Business row */}
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-20" />
                      </div>

                      {/* Assignee row */}
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3 w-3" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>

                      {/* Due date row */}
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-24" />
                      </div>

                      {/* Created date row */}
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
