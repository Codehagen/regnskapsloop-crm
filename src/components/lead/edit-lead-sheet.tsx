"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Business as PrismaBusiness, Tag } from "@/app/generated/prisma";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Import cn for potential class merging
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Import Form components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateLeadDetails } from "@/app/actions/leads/actions"; // Import the updated server action
import { Loader2 } from "lucide-react"; // For loading indicator

// Define a very flexible Zod schema - only require name, everything else is optional
const editLeadFormSchema = z.object({
  name: z.string().min(1, { message: "Bedriftsnavn er påkrevd." }),
  contactPerson: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  potensiellVerdi: z.string().optional().or(z.literal("")),
});

type EditLeadFormValues = z.infer<typeof editLeadFormSchema>;

interface EditLeadSheetProps {
  lead: PrismaBusiness & { tags?: Tag[] };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLeadUpdate: (updatedData: Partial<PrismaBusiness>) => void;
}

export default function EditLeadSheet({
  lead,
  isOpen,
  onOpenChange,
  onLeadUpdate,
}: EditLeadSheetProps) {
  const [isPending, startTransition] = useTransition();

  // Format potensiellVerdi for input display (e.g., handle null)
  const formatCurrencyForInput = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    // Basic formatting, could be improved (e.g., using Intl.NumberFormat)
    return String(value);
  };

  const form = useForm<EditLeadFormValues>({
    resolver: zodResolver(editLeadFormSchema),
    defaultValues: {
      name: lead.name || "",
      contactPerson: lead.contactPerson || "",
      email: lead.email || "",
      phone: lead.phone || "",
      website: lead.website || "",
      address: lead.address || "",
      postalCode: lead.postalCode || "",
      city: lead.city || "",
      country: lead.country || "",
      industry: lead.industry || "",
      notes: lead.notes || "",
      potensiellVerdi: formatCurrencyForInput(lead.potensiellVerdi),
    },
    mode: "onSubmit", // Only validate when submitting for maximum flexibility
  });

  // Reset form if the lead data changes
  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name || "",
        contactPerson: lead.contactPerson || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        address: lead.address || "",
        postalCode: lead.postalCode || "",
        city: lead.city || "",
        country: lead.country || "",
        industry: lead.industry || "",
        notes: lead.notes || "",
        potensiellVerdi: formatCurrencyForInput(lead.potensiellVerdi),
      });
    }
  }, [lead, form]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!isPending) {
          form.handleSubmit(onSubmit)();
        }
      }
      // Escape to close
      if (event.key === 'Escape' && !isPending) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, form, isPending, onOpenChange]);

  const onSubmit = (values: EditLeadFormValues) => {
    startTransition(async () => {
      // Parse potensiellVerdi before sending to server action
      const parsePotentialValue = (
        val: string | null | undefined
      ): number | null => {
        if (val === null || val === undefined || val.trim() === "") {
          return null;
        }
        // Remove spaces, replace comma with period for float parsing
        const cleanedVal = String(val).replace(/\s/g, "").replace(",", ".");
        const num = parseFloat(cleanedVal);
        return isNaN(num) ? null : num; // Return null if parsing fails
      };

      const dataToSend = {
        ...values,
        id: lead.id, // Add the lead ID
        potensiellVerdi: parsePotentialValue(values.potensiellVerdi), // Send parsed value
      };

      // Call the server action
      const result = await updateLeadDetails(dataToSend);

      if (result.success && result.data) {
        onLeadUpdate(result.data);
        toast.success(result.message || "Lead oppdatert!");
        onOpenChange(false);
      } else {
        console.error("Update failed:", result);
        toast.error(result.message || "Kunne ikke oppdatere lead.");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {/* Increased width and added overflow handling */}
      <SheetContent className="w-full sm:max-w-[480px] md:max-w-[600px] flex flex-col">
        <SheetHeader className="space-y-3 pb-6 border-b">
          <SheetTitle className="text-xl font-semibold">
            Rediger: {lead.name}
          </SheetTitle>
          <SheetDescription className="text-sm">
            Oppdater lead-informasjonen nedenfor.
          </SheetDescription>
        </SheetHeader>

        {/* Use Shadcn Form component */}
        <Form {...form}>
          {/* Added overflow-y-auto to the form's parent div */}
          <form
            id="lead-edit-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow overflow-y-auto space-y-8 px-2 py-6"
          >
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-foreground">Grunnleggende informasjon</h3>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Bedriftsnavn <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="F.eks. Eksempel AS" 
                          className="h-10"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potensiellVerdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Potensiell Verdi (NOK)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="F.eks. 50 000"
                          className="h-10"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Årlig potensiell verdi for denne leaden.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-foreground">Kontaktinformasjon</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Kontaktperson
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Navn Navnesen" 
                          className="h-10"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Telefon
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+47 123 45 678" 
                          className="h-10"
                          type="tel"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        E-post
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="epost@eksempel.no"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Nettsted
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="www.eksempel.no"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-foreground">Adresse</h3>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Gateadresse
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Eksempelveien 1" 
                          className="h-10"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className="text-sm font-medium">
                          Postnr
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0123" 
                            className="h-10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm font-medium">
                          Poststed
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Oslo" 
                            className="h-10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Land
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Norge" 
                        className="h-10"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-foreground">Tilleggsinformasjon</h3>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Bransje
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="F.eks. Programvare, Regnskap, Konsulenter" 
                          className="h-10"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Notater
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Interne notater om leaden..."
                          className="resize-none min-h-[100px]"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Kun synlig for deg og teamet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>

        {/* Sticky Footer */}
        <SheetFooter className="mt-auto pt-6 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 flex-row justify-end space-x-3">
          <SheetClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending}
              className="min-w-[100px]"
              title="Avbryt (Esc)"
            >
              Avbryt
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="lead-edit-form"
            disabled={isPending}
            className="min-w-[140px]"
            title="Lagre endringer (Ctrl+S)"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              "Lagre endringer"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

