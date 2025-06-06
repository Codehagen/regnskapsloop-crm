import { Button } from "@/components/ui/button";
import { IconPlus, IconChecklist } from "@tabler/icons-react";

interface TaskEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TaskEmptyState({
  title = "Ingen oppgaver funnet",
  description = "Prøv å justere søket eller filtrene dine, eller opprett en ny oppgave.",
  actionLabel = "Opprett oppgave",
  onAction,
}: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center h-[400px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <IconChecklist size={40} className="text-primary" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction}>
          <IconPlus size={16} className="-ml-1 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
