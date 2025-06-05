"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { Business, Offer, OfferItem } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CheckIcon,
  Package,
  PlusCircle,
  SaveIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface CreateOfferProps {
  business: Business;
  onCancel: () => void;
  onSubmit: (offer: Omit<Offer, "id">) => void;
}

export function CreateOffer({
  business,
  onCancel,
  onSubmit,
}: CreateOfferProps) {
  const [title, setTitle] = useState(`Tilbud til ${business.name}`);
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState<Omit<OfferItem, "id">[]>([
    {
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = "NOK";

  // Replace the templates with accounting-focused services
  const offerTemplates = [
    {
      name: "Løpende regnskapsføring",
      items: [
        {
          description: "Månedlig regnskapsføring",
          quantity: 12,
          unitPrice: 4500,
          discount: 0,
          total: 54000,
        },
        {
          description: "Årsoppgjør",
          quantity: 1,
          unitPrice: 15000,
          discount: 0,
          total: 15000,
        },
        {
          description: "MVA-oppgaver",
          quantity: 6,
          unitPrice: 1200,
          discount: 0,
          total: 7200,
        },
      ],
    },
    {
      name: "Årsoppgjørspakke",
      items: [
        {
          description: "Årsoppgjør",
          quantity: 1,
          unitPrice: 15000,
          discount: 0,
          total: 15000,
        },
        {
          description: "Årsregnskap",
          quantity: 1,
          unitPrice: 8000,
          discount: 0,
          total: 8000,
        },
        {
          description: "Selvangivelse næring",
          quantity: 1,
          unitPrice: 5000,
          discount: 0,
          total: 5000,
        },
      ],
    },
    {
      name: "Etablererpakke",
      items: [
        {
          description: "Bistand ved selskapsetablering",
          quantity: 1,
          unitPrice: 7500,
          discount: 0,
          total: 7500,
        },
        {
          description: "Oppsett av regnskap",
          quantity: 1,
          unitPrice: 5000,
          discount: 0,
          total: 5000,
        },
        {
          description: "Registrering i Brønnøysund",
          quantity: 1,
          unitPrice: 3500,
          discount: 0,
          total: 3500,
        },
      ],
    },
    {
      name: "Rådgivningspakke",
      items: [
        {
          description: "Økonomisk rådgivning",
          quantity: 5,
          unitPrice: 1800,
          discount: 0,
          total: 9000,
        },
        {
          description: "Skatteplanlegging",
          quantity: 1,
          unitPrice: 8500,
          discount: 0,
          total: 8500,
        },
      ],
    },
  ];

  // Update common items to be accounting-focused
  const commonItems = [
    { description: "Månedlig regnskapsføring", unitPrice: 4500 },
    { description: "Kvartalsvis regnskapsføring", unitPrice: 9000 },
    { description: "Årsoppgjør", unitPrice: 15000 },
    { description: "MVA-oppgave", unitPrice: 1200 },
    { description: "Lønnskjøring (per ansatt)", unitPrice: 500 },
    { description: "Årsregnskap", unitPrice: 8000 },
    { description: "Selvangivelse næring", unitPrice: 5000 },
    { description: "Selvangivelse person", unitPrice: 3000 },
    { description: "Økonomisk rådgivning (per time)", unitPrice: 1800 },
    { description: "Skatteplanlegging", unitPrice: 8500 },
    { description: "Bistand kontroll/bokettersyn", unitPrice: 12000 },
    { description: "Fakturering (per mnd)", unitPrice: 2500 },
    { description: "Oppsett av regnskap", unitPrice: 5000 },
  ];

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Function to apply a template
  const applyTemplate = (templateName: string) => {
    const template = offerTemplates.find((t) => t.name === templateName);
    if (template) {
      // Update title if it's empty
      if (!title) {
        setTitle(template.name);
      }

      // Replace items with template items (with new calculated totals)
      const newItems = template.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: calculateItemTotal(
          item.quantity,
          item.unitPrice,
          item.discount || 0
        ),
      }));

      setItems(newItems);

      toast.success(`Mal "${templateName}" ble lagt til`);
    }
  };

  // Function to add a common item
  const addCommonItem = (item: { description: string; unitPrice: number }) => {
    const newItem = {
      description: item.description,
      quantity: 1,
      unitPrice: item.unitPrice,
      total: item.unitPrice,
    };

    setItems([...items, newItem]);
    toast.success(`"${item.description}" ble lagt til`);
  };

  // Helper function to calculate item total
  const calculateItemTotal = (
    quantity: number,
    unitPrice: number,
    discount: number = 0
  ) => {
    return quantity * unitPrice * (1 - discount / 100);
  };

  // Modify handleItemChange to use the helper function
  const handleItemChange = (
    index: number,
    field: keyof OfferItem,
    value: any
  ) => {
    const newItems = [...items];

    // Parse numeric values
    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      value = parseFloat(value) || 0;
    }

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate total for this item
    const item = newItems[index];
    newItems[index].total = calculateItemTotal(
      item.quantity,
      item.unitPrice,
      item.discount || 0
    );

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!title) {
      toast.error("Fyll inn tittel på tilbudet");
      return;
    }

    if (
      items.length === 0 ||
      items.some((item) => !item.description || item.unitPrice <= 0)
    ) {
      toast.error("Fyll inn alle felter for produkter/tjenester");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the offer object
      const offer: Omit<Offer, "id"> = {
        title,
        description,
        businessId: business.id,
        contactId: business.contacts?.[0]?.id, // Default to first contact
        createdAt: new Date(),
        expiresAt: new Date(expiresAt),
        status: isDraft ? "draft" : "sent",
        totalAmount: calculateTotal(),
        currency,
        items: items.map((item, index) => ({
          ...item,
          id: `new-item-${index}`, // Temporary ID, would be replaced by backend
        })),
        notes,
      };

      // Submit to parent
      onSubmit(offer);

      toast.success(
        isDraft
          ? "Tilbudet ble lagret som utkast"
          : "Tilbudet ble sendt til kunden"
      );
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Det oppstod en feil. Prøv igjen senere.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = () => {
    // Make sure we have all required data
    if (!title) {
      toast.error("Fyll inn tittel på tilbudet");
      return;
    }

    if (
      items.length === 0 ||
      items.some((item) => !item.description || item.unitPrice <= 0)
    ) {
      toast.error("Fyll inn alle felter for produkter/tjenester");
      return;
    }

    // Recipient email from the business contact
    const recipientEmail = business.email;

    // Format the email subject
    const emailSubject = `Tilbud: ${title} - ${business.name}`;

    // Format current date
    const currentDate = new Date().toLocaleDateString("no-NO");

    // Generate intro text
    const introText = `Hei ${business.contactPerson},

Vi takker for din interesse og har gleden av å sende deg vårt tilbud.

TILBUD: ${title.toUpperCase()}
Dato: ${currentDate}
Referanse: ${business.name}
Gyldig til: ${new Date(expiresAt).toLocaleDateString("no-NO")}

TJENESTER/PRODUKTER:
`;

    // Format items as structured list with proper spacing
    const itemsList = items
      .map((item, index) => {
        const formattedPrice = new Intl.NumberFormat("no-NO", {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(item.unitPrice);

        const formattedTotal = new Intl.NumberFormat("no-NO", {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(item.total);

        // Use proper indentation and formatting
        let itemText = `${index + 1}. ${item.description}\n`;
        itemText += `   Antall: ${item.quantity}\n`;
        itemText += `   Pris: ${formattedPrice}`;

        if (item.discount) {
          itemText += `   (${item.discount}% rabatt)`;
        }

        itemText += `\n   Sum: ${formattedTotal}\n`;

        return itemText;
      })
      .join("\n");

    // Format the total amount
    const totalAmount = new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(calculateTotal());

    // Add divider lines
    const divider = "----------------------------------------";

    // Construct the email body with improved formatting
    const emailBody = `${introText}
${itemsList}
${divider}
TOTALT: ${totalAmount}
${divider}

${notes ? `MERKNADER:\n${notes}\n\n` : ""}VILKÅR OG BETINGELSER:
- Tilbudet er gyldig til ${new Date(expiresAt).toLocaleDateString("no-NO")}
- Alle priser er oppgitt i ${currency} og er eks. mva.
- Betalingsbetingelser: 14 dager netto
- Leveringstid: Etter avtale

${divider}

Ta gjerne kontakt dersom du har spørsmål eller ønsker å diskutere tilbudet videre.

Med vennlig hilsen,
[Ditt navn]
[Din stilling]
[Din bedrift]
[Kontaktinformasjon]
`;

    // Create a mailto URL with the formatted content
    const mailtoUrl = `mailto:${encodeURIComponent(
      recipientEmail
    )}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
      emailBody
    )}`;

    // Open the mailto link
    window.open(mailtoUrl, "_blank");

    // Show success message
    toast.success("E-postprogram åpnet med tilbudsdetaljer");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nytt tilbud</CardTitle>
        <CardDescription>
          Opprett et nytt tilbud til {business.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Templates Selection */}
        <div className="bg-muted/30 rounded-lg p-4 border">
          <h3 className="font-medium mb-3 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Hurtigmaler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-select">Velg mal</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg en mal for rask utfylling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tilgjengelige maler</SelectLabel>
                    {offerTemplates.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quick-add">Legg til enkeltprodukt</Label>
              <Select
                onValueChange={(value) => {
                  const item = commonItems.find((i) => i.description === value);
                  if (item) addCommonItem(item);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Legg til produkt/tjeneste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Vanlige produkter/tjenester</SelectLabel>
                    {commonItems.map((item) => (
                      <SelectItem
                        key={item.description}
                        value={item.description}
                      >
                        {item.description} -{" "}
                        {new Intl.NumberFormat("no-NO", {
                          style: "currency",
                          currency: currency,
                        }).format(item.unitPrice)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Basic Information - improved layout */}
        <div className="space-y-4">
          <h3 className="font-medium">Generell informasjon</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Tittel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. 'Konsulenttjenester Q1 2023'"
              />
            </div>

            <div>
              <Label htmlFor="expiresAt">Gyldig til</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? (
                      format(new Date(expiresAt), "PPP", { locale: nb })
                    ) : (
                      <span>Velg dato</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiresAt ? new Date(expiresAt) : undefined}
                    onSelect={(date) =>
                      date && setExpiresAt(date.toISOString().split("T")[0])
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Skriv en kort beskrivelse av tilbudet..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Items Table - Keep the existing table, but with better styling */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="font-medium">Produkter/tjenester</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Legg til rad
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/2"
                  >
                    Beskrivelse
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Antall
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Pris ({currency})
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Rabatt %
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Sum ({currency})
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-10"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Beskriv produkt eller tjeneste"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount || ""}
                        onChange={(e) =>
                          handleItemChange(index, "discount", e.target.value)
                        }
                        className="text-right"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      {new Intl.NumberFormat("no-NO", {
                        style: "currency",
                        currency: currency,
                        maximumFractionDigits: 0,
                      }).format(item.total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-muted/50 font-bold">
                  <td
                    colSpan={4}
                    className="px-4 py-3 whitespace-nowrap text-sm text-right"
                  >
                    Totalt ({currency})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-right">
                    {new Intl.NumberFormat("no-NO", {
                      style: "currency",
                      currency: currency,
                      maximumFractionDigits: 0,
                    }).format(calculateTotal())}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notater</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Legg til eventuelle notater eller betingelser..."
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Avbryt
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Lagre som utkast
          </Button>
          <Button
            variant="outline"
            onClick={handleSendEmail}
            disabled={isSubmitting}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send på e-post
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Send tilbud
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
