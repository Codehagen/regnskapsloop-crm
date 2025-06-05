"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Business } from "@/app/generated/prisma";
import { Send, XIcon } from "@/lib/tabler-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SendSmsDialogProps {
  lead: Business;
  trigger?: React.ReactNode;
}

export function SendSmsDialog({ lead, trigger }: SendSmsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    `Hei ${
      lead.contactPerson || lead.name
    }! Vi i [Firma] vil gjerne følge opp vår tidligere samtale. Er det noe spesielt du ønsker mer informasjon om? Vennlig hilsen [Ditt navn]`
  );

  // Function to handle sending the SMS
  const handleSendSms = async () => {
    if (!message.trim()) {
      toast.error("Meldingen kan ikke være tom");
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would call an API to send the SMS
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("SMS sendt til " + (lead.contactPerson || lead.name), {
        description: "Meldingen ble sendt til " + lead.phone,
      });

      setOpen(false);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Kunne ikke sende SMS");
    } finally {
      setLoading(false);
    }
  };

  // Generate a personalized template based on lead stage
  const generateTemplate = () => {
    switch (lead.stage) {
      case "lead":
        return `Hei ${
          lead.contactPerson || lead.name
        }! Vi i [Firma] har sett at dere kan være interessert i våre tjenester. Er det greit at vi tar en prat om hvordan vi kan hjelpe dere? Vennlig hilsen [Ditt navn]`;
      case "prospect":
        return `Hei ${
          lead.contactPerson || lead.name
        }! Takk for hyggelig samtale. Som avtalt sender jeg litt mer informasjon om våre tjenester. Er det noe spesielt du ønsker mer informasjon om? Vennlig hilsen [Ditt navn]`;
      case "qualified":
        return `Hei ${
          lead.contactPerson || lead.name
        }! Vi i [Firma] setter pris på dialogen vår. Jeg jobber med tilbudet til dere og lurer på om det er noe spesifikt dere ønsker at vi skal fokusere på? Vennlig hilsen [Ditt navn]`;
      default:
        return `Hei ${
          lead.contactPerson || lead.name
        }! Vi i [Firma] vil gjerne følge opp vår tidligere samtale. Er det noe spesielt du ønsker mer informasjon om? Vennlig hilsen [Ditt navn]`;
    }
  };

  // Reset and generate a new template
  const handleResetTemplate = () => {
    setMessage(generateTemplate());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Send SMS</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send SMS til {lead.name}</DialogTitle>
          <DialogDescription>
            Skriv en melding som skal sendes som SMS til{" "}
            {lead.contactPerson || lead.name} ({lead.phone})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(lead.contactPerson || lead.name)
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {lead.contactPerson || lead.name}
                </p>
                <p className="text-xs text-muted-foreground">{lead.phone}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="message">Melding</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv meldingen din her..."
              className="min-h-[120px]"
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length} tegn{" "}
                {message.length > 160
                  ? `(${Math.ceil(message.length / 160)} SMS)`
                  : "(1 SMS)"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTemplate}
                className="h-auto py-1 px-2 text-xs"
              >
                Tilbakestill mal
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => setOpen(false)}
          >
            <XIcon className="h-4 w-4" /> Avbryt
          </Button>
          <Button
            onClick={handleSendSms}
            disabled={loading || !message.trim()}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            {loading ? "Sender..." : "Send SMS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
