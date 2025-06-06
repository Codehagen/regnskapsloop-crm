"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddLeadModal } from "./add-lead-modal";

interface AddLeadButtonWrapperProps {
  workspaceId: string;
}

export function AddLeadButtonWrapper({
  workspaceId,
}: AddLeadButtonWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="-ml-1 h-4 w-4" aria-hidden="true" />
        Nytt lead
      </Button>

      {/* Render the modal */}
      <AddLeadModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        workspaceId={workspaceId}
      />
    </>
  );
}
