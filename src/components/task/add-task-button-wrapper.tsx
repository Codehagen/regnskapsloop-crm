"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskModal } from "./add-task-modal";

interface AddTaskButtonWrapperProps {
  workspaceId: string;
  businessId?: string;
}

export function AddTaskButtonWrapper({
  workspaceId,
  businessId,
}: AddTaskButtonWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="-ml-1 h-4 w-4" /> Ny oppgave
      </Button>
      <TaskModal
        isOpen={open}
        onOpenChange={setOpen}
        workspaceId={workspaceId}
        businessId={businessId}
      />
    </>
  );
}
