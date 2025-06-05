import { Button } from "@/components/ui/button";
import { Plus } from "@/lib/tabler-icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "Ingen elementer funnet",
  description = "Prøv å justere søket eller filtrene dine, eller opprett et nytt element.",
  actionLabel = "Opprett nytt",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center h-[400px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        {/* Optional: Add an icon here, e.g., <Inbox className="h-10 w-10 text-primary" /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction}>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
