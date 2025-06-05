"use client";

import { Business, CustomerStage } from "@/app/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SendSmsDialog } from "@/components/lead/send-sms-dialog";
import {
  User,
  MessageSquare,
  PencilLine,
  MoveUp,
  CheckCircle,
} from "@/lib/tabler-icons";
import { useState } from "react";
import { toast } from "sonner";

interface LeadHeaderProps {
  lead: Business;
  getStatusBadgeProps: (stage: CustomerStage) => {
    label: string;
    variant: "default" | "outline" | "secondary" | "destructive" | "success";
    icon: React.ReactNode;
    description: string;
  };
  onStatusChange: (newStage: CustomerStage) => Promise<void>;
}

export function LeadHeader({
  lead,
  getStatusBadgeProps,
  onStatusChange,
}: LeadHeaderProps) {
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);

  const statusProps = getStatusBadgeProps(lead.stage);

  const handleStageChange = async (newStage: CustomerStage) => {
    if (lead.stage === newStage) {
      setShowStageDialog(false);
      return;
    }

    try {
      setIsChangingStage(true);
      await onStatusChange(newStage);
    } catch (error) {
      console.error("Error updating lead stage:", error);
    } finally {
      setIsChangingStage(false);
      setShowStageDialog(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
              <span>{lead.contactPerson || lead.name}</span>
              <span>•</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={
                        statusProps.variant as
                          | "default"
                          | "destructive"
                          | "outline"
                          | "secondary"
                          | null
                      }
                      className="flex items-center gap-1 cursor-help"
                    >
                      {statusProps.icon}
                      {statusProps.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{statusProps.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {lead.orgNumber && (
                <>
                  <span>•</span>
                  <span>
                    Org.nr:
                    <a
                      href={`https://proff.no/bransjesøk?q=${lead.orgNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      {lead.orgNumber}
                    </a>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SendSmsDialog
            lead={lead}
            trigger={
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Send SMS
              </Button>
            }
          />

          <Button variant="outline" disabled className="gap-2">
            <PencilLine className="h-4 w-4" /> Rediger
          </Button>

          <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <MoveUp className="h-4 w-4" /> Endre status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Endre status for {lead.name}</DialogTitle>
                <DialogDescription>
                  Velg ny status for denne leaden. Dette vil oppdatere
                  oppfølgningsstatus.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {Object.entries(CustomerStage).map(([key, stage]) => (
                  <Button
                    key={key}
                    variant={stage === lead.stage ? "secondary" : "outline"}
                    className="justify-start gap-2 h-auto py-3"
                    disabled={isChangingStage}
                    onClick={() => handleStageChange(stage)}
                  >
                    {getStatusBadgeProps(stage).icon}
                    <div className="flex flex-col items-start">
                      <span>{getStatusBadgeProps(stage).label}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {getStatusBadgeProps(stage).description}
                      </span>
                    </div>
                    {stage === lead.stage && (
                      <CheckCircle className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setShowStageDialog(false)}
                  disabled={isChangingStage}
                >
                  Avbryt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
