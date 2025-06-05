"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendHelpRequest } from "@/app/actions/help/actions";
import { toast } from "sonner";
import { Loader2 } from "@/lib/tabler-icons";

interface HelpDialogProps {
  trigger: React.ReactNode; // Accept the trigger element as a prop
}

export function HelpDialog({ trigger }: HelpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const result = await sendHelpRequest(message);

    if (result.success) {
      toast.success("Hjelpeforespørsel sendt! Vi kontakter deg snart.");
      setMessage("");
      setIsOpen(false);
    } else {
      toast.error("Feil ved sending", {
        description:
          result.error || "Kunne ikke sende forespørselen. Prøv igjen.",
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trenger du hjelp?</DialogTitle>
          <DialogDescription>
            Send oss en melding, så kommer vi tilbake til deg så snart som
            mulig.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="message" className="sr-only">
                Melding
              </Label>
              <Textarea
                id="message"
                placeholder="Beskriv hva du trenger hjelp med..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sender...
                </>
              ) : (
                "Send Forespørsel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
