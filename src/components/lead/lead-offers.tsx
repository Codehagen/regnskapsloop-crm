"use client";

import { useState } from "react";
import { Business } from "@/app/generated/prisma";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Check,
  X,
  Clock,
  DollarSign,
  UserCheck,
  Send,
  Eye,
  CalendarRange,
  ChevronDown,
  Pencil,
  Trash,
} from "@/lib/tabler-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadOffersProps {
  lead: Business;
  onCreateOffer: () => void;
  showCreateOffer: boolean;
}

interface Offer {
  id: string;
  title: string;
  totalAmount: number;
  createdAt: Date;
  validUntil: Date;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  items: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
}

export function LeadOffers({
  lead,
  onCreateOffer,
  showCreateOffer,
}: LeadOffersProps) {
  // Example offers - in a real app, these would come from a database
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "1",
      title: "Månedlig CRM-løsning",
      totalAmount: 2990,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      validUntil: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), // 27 days from now
      status: "sent",
      items: [
        {
          id: "item-1",
          description: "CRM Standard Plan",
          quantity: 1,
          price: 1990,
        },
        {
          id: "item-2",
          description: "Oppsett og konfigurasjon",
          quantity: 1,
          price: 1000,
        },
      ],
    },
  ]);

  // Format number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge props
  const getStatusBadge = (status: Offer["status"]) => {
    const statusMap: Record<
      Offer["status"],
      {
        label: string;
        variant:
          | "default"
          | "outline"
          | "secondary"
          | "destructive"
          | "success";
        icon: React.ReactNode;
      }
    > = {
      draft: {
        label: "Utkast",
        variant: "secondary",
        icon: <FileText className="h-4 w-4" />,
      },
      sent: {
        label: "Sendt",
        variant: "default",
        icon: <Send className="h-4 w-4" />,
      },
      accepted: {
        label: "Akseptert",
        variant: "success",
        icon: <Check className="h-4 w-4" />,
      },
      rejected: {
        label: "Avslått",
        variant: "destructive",
        icon: <X className="h-4 w-4" />,
      },
      expired: {
        label: "Utløpt",
        variant: "outline",
        icon: <Clock className="h-4 w-4" />,
      },
    };

    return statusMap[status];
  };

  return (
    <div className="space-y-4">
      {offers.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tilbud</h3>
            {!showCreateOffer && (
              <Button onClick={onCreateOffer} className="gap-2">
                <Plus className="h-4 w-4" /> Opprett tilbud
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {offers.map((offer) => {
              const statusBadge = getStatusBadge(offer.status);
              return (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle>{offer.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {formatCurrency(offer.totalAmount)} • Opprettet{" "}
                          {formatDate(offer.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            statusBadge.variant as
                              | "default"
                              | "destructive"
                              | "outline"
                              | "secondary"
                              | "success"
                              | null
                          }
                          className="flex items-center gap-1"
                        >
                          {statusBadge.icon}
                          {statusBadge.label}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <span className="sr-only">Åpne meny</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" /> Vis tilbud
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Send className="h-4 w-4" /> Send på e-post
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Pencil className="h-4 w-4" /> Rediger
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash className="h-4 w-4" /> Slett
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarRange className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Gyldig til:{" "}
                            <strong>{formatDate(offer.validUntil)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Totalbeløp:{" "}
                            <strong>{formatCurrency(offer.totalAmount)}</strong>
                          </span>
                        </div>
                      </div>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="items">
                          <AccordionTrigger>
                            <span className="text-sm font-medium">
                              Produkter og tjenester ({offer.items.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {offer.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between py-2 border-b border-muted last:border-0"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {item.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.quantity} x{" "}
                                      {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t bg-muted/20 gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" /> Forhåndsvis
                    </Button>

                    {offer.status === "sent" && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="success"
                                size="sm"
                                className="gap-2"
                              >
                                <UserCheck className="h-4 w-4" /> Merk som
                                akseptert
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Merk tilbudet som akseptert av kunden</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                              >
                                <X className="h-4 w-4" /> Merk som avslått
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Merk tilbudet som avslått av kunden</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <FileText className="h-10 w-10 mb-3 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">Ingen tilbud ennå</h3>
          <p className="text-muted-foreground mb-4">
            Du har ikke opprettet noen tilbud til {lead.name} ennå
          </p>
          <Button onClick={onCreateOffer} className="gap-2">
            <Plus className="h-4 w-4" /> Opprett første tilbud
          </Button>
        </div>
      )}
    </div>
  );
}
