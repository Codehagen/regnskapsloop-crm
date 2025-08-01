"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { TaskModal } from "./add-task-modal";

interface AddTaskButtonWrapperProps {
  workspaceId: string;
  businessId?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  iconType?: "lucide" | "tabler";
}

export function AddTaskButtonWrapper({
  workspaceId,
  businessId,
  variant = "default",
  size = "default",
  className = "",
  iconType = "lucide",
}: AddTaskButtonWrapperProps) {
  const [open, setOpen] = useState(false);

  const IconComponent = iconType === "tabler" ? IconPlus : Plus;
  const iconProps = iconType === "tabler" 
    ? { size: 16, className: "mr-1.5" }
    : { className: "-ml-1 h-4 w-4" };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <IconComponent {...iconProps} />
        Ny oppgave
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
