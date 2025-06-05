"use client";

import { Business, CustomerStage } from "@/app/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, DollarSign, Calendar, Info } from "@/lib/tabler-icons";

interface LeadInfoCardsProps {
  lead: Business;
  statusProps: {
    label: string;
    variant: "default" | "outline" | "secondary" | "destructive" | "success";
    icon: React.ReactNode;
    description: string;
  };
  onStatusDialogOpen: () => void;
}

export function LeadInfoCards({
  lead,
  statusProps,
  onStatusDialogOpen,
}: LeadInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card className="bg-blue-50/50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Kontaktinfo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <a
              href={`mailto:${lead.email}`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              {lead.email}
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="text-sm hover:underline flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              {lead.phone}
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50/50 border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Potensiell verdi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">
            {lead.potensiellVerdi
              ? new Intl.NumberFormat("no-NO", {
                  style: "currency",
                  currency: "NOK",
                  maximumFractionDigits: 0,
                }).format(lead.potensiellVerdi)
              : "Ikke angitt"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-50/50 border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Registrert dato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">
            {new Date(lead.createdAt).toLocaleDateString("no-NO")}
          </p>
          <p className="text-xs text-muted-foreground">
            {`${Math.floor(
              (Date.now() - new Date(lead.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )} dager siden`}
          </p>
        </CardContent>
      </Card>

      <Card
        className={`${
          statusProps.variant === "success"
            ? "bg-green-50/50 border-green-100"
            : statusProps.variant === "destructive"
            ? "bg-red-50/50 border-red-100"
            : "bg-blue-50/50 border-blue-100"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                statusProps.variant as
                  | "default"
                  | "destructive"
                  | "outline"
                  | "secondary"
                  | null
              }
              className="flex items-center gap-1"
            >
              {statusProps.icon}
              {statusProps.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onStatusDialogOpen}
            >
              Endre
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {statusProps.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
