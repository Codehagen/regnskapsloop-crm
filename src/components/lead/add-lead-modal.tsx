"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createLeadFromOrgNumber } from "@/app/actions/leads/actions";

interface AddLeadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
}

export function AddLeadModal({
  isOpen,
  onOpenChange,
  workspaceId,
}: AddLeadModalProps) {
  const [orgNumber, setOrgNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Initialize router

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orgNumber.trim()) return;

    setIsLoading(true);
    toast.loading("Søker etter og oppretter lead...");

    try {
      const result = await createLeadFromOrgNumber(
        orgNumber.trim(),
        workspaceId
      );
      toast.dismiss(); // Dismiss loading toast

      if (result.success && result.data) {
        toast.success(result.message);
        setOrgNumber(""); // Clear input
        onOpenChange(false); // Close modal
        // Navigate to the NEWLY created lead's page
        router.push(`/leads/${result.data.id}`);
      } else if (!result.success && result.data) {
        // Handle case where lead already exists (success=false, but data is present)
        toast.info(`${result.message} Videresender til eksisterende lead...`);
        setOrgNumber(""); // Clear input
        onOpenChange(false); // Close modal
        // Navigate to the EXISTING lead's page
        router.push(`/leads/${result.data.id}`);
      } else {
        // Handle other errors (e.g., Brreg fetch failed, DB error)
        toast.error(result.message || "En ukjent feil oppstod.");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Failed to create lead:", error);
      toast.error("En uventet feil oppstod under oppretting.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Legg til nytt Lead via Org.nr.</DialogTitle>
          <DialogDescription>
            Skriv inn organisasjonsnummeret for å hente bedriftsdata automatisk
            fra Brønnøysundregistrene.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orgNumber" className="text-right">
                Org.nr.
              </Label>
              <Input
                id="orgNumber"
                value={orgNumber}
                onChange={(e) => setOrgNumber(e.target.value)}
                className="col-span-3"
                placeholder="987654321"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading || !orgNumber.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Søker..." : "Opprett Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
