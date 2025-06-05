import { CustomerStage } from "@/app/generated/prisma";
import {
  Info,
  Clock,
  CheckCircle,
  ArrowUpCircle,
  AlertCircle,
} from "@/lib/tabler-icons";
import React from "react";

export function getStatusBadgeProps(stage: CustomerStage) {
  const stageMap: Record<
    CustomerStage,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive" | "success";
      icon: React.ReactNode;
      description: string;
    }
  > = {
    lead: {
      label: "Ny",
      variant: "secondary",
      icon: <Info className="h-4 w-4" />,
      description: "Ny lead som ikke er kontaktet",
    },
    prospect: {
      label: "Kontaktet",
      variant: "default",
      icon: <Clock className="h-4 w-4" />,
      description: "Lead som er i dialog",
    },
    qualified: {
      label: "Kvalifisert",
      variant: "default",
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Kvalifisert lead klar for tilbud",
    },
    customer: {
      label: "Kunde",
      variant: "success",
      icon: <ArrowUpCircle className="h-4 w-4" />,
      description: "Konvertert til aktiv kunde",
    },
    churned: {
      label: "Tapt",
      variant: "destructive",
      icon: <AlertCircle className="h-4 w-4" />,
      description: "Tapt lead",
    },
  };

  return stageMap[stage];
}
