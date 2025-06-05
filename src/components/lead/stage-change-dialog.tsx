"use client";

import { useState } from "react";
import { CustomerStage } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getStatusBadgeProps } from "@/lib/lead-status-utils";

// Define props for the dialog
interface StageChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: CustomerStage;
  onStageSelect: (newStage: CustomerStage) => Promise<void>; // Make it async to handle loading
  isUpdating: boolean;
  leadName: string;
}

// Use the same definitions as KanbanView
const stageColumns: {
  id: CustomerStage;
  title: string;
  description: string;
}[] = [
  { id: "lead", title: "Ny", description: "Nye leads som ikke er kontaktet" },
  { id: "prospect", title: "Kontaktet", description: "Leads som er i dialog" },
  {
    id: "qualified",
    title: "Kvalifisert",
    description: "Kvalifiserte leads klare for tilbud",
  },
  { id: "customer", title: "Kunde", description: "Konvertert til kunde" },
  { id: "churned", title: "Tapt", description: "Tapte leads" },
];

export function StageChangeDialog({
  open,
  onOpenChange,
  currentStage,
  onStageSelect,
  isUpdating,
  leadName,
}: StageChangeDialogProps) {
  const [selectedStage, setSelectedStage] =
    useState<CustomerStage>(currentStage);

  const handleSave = async () => {
    if (selectedStage !== currentStage) {
      await onStageSelect(selectedStage); // Wait for the update to finish
      // The parent component handles closing on success/error
    }
    // No need to close here, parent controls open state via onOpenChange
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Endre status for {leadName}</DialogTitle>
          <DialogDescription>
            Velg ny status for denne leaden. Endringen vil bli lagret
            umiddelbart.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedStage}
            onValueChange={(value) => setSelectedStage(value as CustomerStage)}
            className="space-y-2"
            disabled={isUpdating}
          >
            {stageColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <RadioGroupItem value={column.id} id={`stage-${column.id}`} />
                <Label htmlFor={`stage-${column.id}`}>{column.title}</Label>
                {/* Optional: Show badge preview */}
                {/* <Badge 
                    variant={getStatusBadgeProps(column.id).variant === 'success' ? 'default' : getStatusBadgeProps(column.id).variant} 
                    className="ml-auto"
                  >
                    {getStatusBadgeProps(column.id).label}
                  </Badge> */}
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isUpdating}>
              Avbryt
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUpdating || selectedStage === currentStage}
          >
            {isUpdating ? "Lagrer..." : "Lagre endring"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
