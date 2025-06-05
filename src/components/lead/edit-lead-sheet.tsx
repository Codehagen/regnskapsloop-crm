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

// Define the Zod schema for the form, mirroring the server action's schema
const editLeadFormSchema = z.object({
  name: z.string().min(1, { message: "Bedriftsnavn er påkrevd." }),
  contactPerson: z.string().optional(),
  email: z
    .string()
    .email({ message: "Ugyldig e-postadresse." })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  website: z
    .string()
    .url({ message: "Ugyldig nettstedsadresse (URL)." })
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  potensiellVerdi: z.preprocess(
    // Allow empty string, treat as null for validation
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z
      .string()
      .optional()
      .refine(
        (val) =>
          val === null || val === undefined || /^[\d\s,.]*$/.test(String(val)),
        {
          message:
            "Ugyldig tallformat. Bruk kun tall, komma, punktum eller mellomrom.",
        }
      )
  ),
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
    mode: "onChange", // Validate on change for better UX
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

      // Type assertion using the corrected temporary helper schema
      const result = await updateLeadDetails(
        dataToSend as z.infer<typeof updateLeadServerActionSchema>
      );

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
        <SheetHeader>
          <SheetTitle>Rediger: {lead.name}</SheetTitle>
          <SheetDescription>
            Oppdater detaljene og klikk lagre.
          </SheetDescription>
        </SheetHeader>

        {/* Use Shadcn Form component */}
        <Form {...form}>
          {/* Added overflow-y-auto to the form's parent div */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow overflow-y-auto space-y-6 px-1 py-4" // Added padding/spacing
          >
            {/* Grouping fields logically */}
            <div className="space-y-4 p-1">
              <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Generelt
              </h4>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedriftsnavn *</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Eksempel AS" {...field} />
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
                    <FormLabel>Potensiell Verdi (NOK)</FormLabel>
                    <FormControl>
                      <Input
                        type="text" // Use text to allow formatting chars
                        placeholder="F.eks. 50000"
                        {...field}
                        value={field.value ?? ""} // Handle null/undefined for input value
                        onChange={(e) => {
                          // Allow only numbers, comma, period, space
                          const value = e.target.value;
                          if (/^[\d\s,.]*$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Årlig potensiell verdi for denne leaden.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-1">
              <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Kontaktinformasjon
              </h4>
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontaktperson</FormLabel>
                    <FormControl>
                      <Input placeholder="Navn Navnesen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="epost@eksempel.no"
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
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="123 45 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nettsted</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.eksempel.no"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-1">
              <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Adresse
              </h4>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gateadresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Eksempelveien 1" {...field} />
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
                      <FormLabel>Postnr</FormLabel>
                      <FormControl>
                        <Input placeholder="0123" {...field} />
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
                      <FormLabel>Poststed</FormLabel>
                      <FormControl>
                        <Input placeholder="Oslo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land</FormLabel>
                    <FormControl>
                      <Input placeholder="Norge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-1">
              <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Annen Info
              </h4>
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bransje</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Programvare" {...field} />
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
                    <FormLabel>Notater</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Interne notater om leaden..."
                        className="resize-none"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {/* Sticky Footer */}
        <SheetFooter className="mt-auto pt-4 border-t bg-background sticky bottom-0">
          <SheetClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Avbryt
            </Button>
          </SheetClose>
          <Button
            type="submit" // Changed to submit
            form="lead-edit-form" // Link to form by ID if needed, but usually handled by <Form>
            disabled={
              isPending || !form.formState.isValid || !form.formState.isDirty
            }
            onClick={form.handleSubmit(onSubmit)} // Trigger form submission
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

// Corrected temporary helper schema for type assertion
// Optional strings should be string | undefined, matching server action
const updateLeadServerActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  potensiellVerdi: z.number().optional().nullable(),
});
