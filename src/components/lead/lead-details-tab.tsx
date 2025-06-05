"use client";

import { Business } from "@/app/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  DollarSign,
  FileText,
} from "@/lib/tabler-icons";

interface LeadDetailsTabProps {
  lead: Business;
}

export function LeadDetailsTab({ lead }: LeadDetailsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start">
              <span className="w-24 flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Navn:
              </span>
              <span>{lead.name}</span>
            </div>

            <div className="flex items-start">
              <span className="w-24 flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                E-post:
              </span>
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </div>

            <div className="flex items-start">
              <span className="w-24 flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                Telefon:
              </span>
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </div>

            {lead.orgNumber && (
              <div className="flex items-start">
                <span className="w-24 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Org.nr:
                </span>
                <a
                  href={`https://proff.no/bransjesøk?q=${lead.orgNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {lead.orgNumber}
                </a>
              </div>
            )}

            {lead.website && (
              <div className="flex items-start">
                <span className="w-24 flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Nettside:
                </span>
                <a
                  href={
                    lead.website?.startsWith("http")
                      ? lead.website
                      : `https://${lead.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {lead.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead-informasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start">
              <span className="w-36 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Registrert dato:
              </span>
              <span>
                {new Date(lead.createdAt).toLocaleDateString("no-NO")}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-36 flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Potensiell verdi:
              </span>
              <span>
                {lead.potensiellVerdi
                  ? new Intl.NumberFormat("no-NO", {
                      style: "currency",
                      currency: "NOK",
                      maximumFractionDigits: 0,
                    }).format(lead.potensiellVerdi)
                  : "Ikke angitt"}
              </span>
            </div>

            {lead.notes && (
              <div className="flex items-start">
                <span className="w-36 flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Notater:
                </span>
                <span className="whitespace-pre-wrap">{lead.notes}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {lead.address && (
        <Card>
          <CardHeader>
            <CardTitle>Adresseinformasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic">
              {lead.address}
              <br />
              {lead.postalCode} {lead.city}
              <br />
              {lead.country}
            </address>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
