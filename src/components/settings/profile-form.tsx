"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserProfile } from "@/app/actions/settings/actions";
import { toast } from "sonner"; // Assuming you have sonner or similar for toasts
import { useState, useTransition } from "react";

// Schema matching the server action validation (only name for now)
const profileFormSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  email: z.string().email("Ugyldig e-post"), // Display only for now
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: {
    id: string; // Clerk ID
    name: string | null | undefined;
    email: string | undefined;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    setError(null); // Clear previous errors
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      // We don't send email yet as it's not handled in the action

      try {
        const result = await updateUserProfile(formData);
        if (result.success) {
          toast.success(result.message || "Profil oppdatert!");
          // Optionally reset form if needed, or rely on revalidation
          // form.reset(data); // Reset with new values if server doesn't revalidate quickly
        } else {
          setError(result.message || "En feil oppstod");
          toast.error(result.message || "Kunne ikke oppdatere profilen.");
          // TODO: Handle field-specific errors (result.errors)
        }
      } catch (e) {
        console.error(e);
        const errorMsg =
          e instanceof Error ? e.message : "En ukjent feil oppstod";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Oppdater profilinformasjonen din. .</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Ditt navn" {...field} />
                  </FormControl>
                  <FormDescription>Dette er ditt visningsnavn.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    {/* Make email read-only as it's likely managed by Clerk */}
                    <Input placeholder="din@epost.no" {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Du kan ikke endre e-postadressen din her.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? "Lagrer..." : "Oppdater profil"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
