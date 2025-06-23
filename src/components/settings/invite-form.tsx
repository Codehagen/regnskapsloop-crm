"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { inviteToWorkspace } from "@/app/actions/workspace/actions";
import { toast } from "sonner";
import { useTransition, useState } from "react";

const inviteFormSchema = z.object({
  email: z.string().email("Ugyldig e-post"),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteFormProps {
  workspaceId: string;
}

export function InviteForm({ workspaceId }: InviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  async function onSubmit(data: InviteFormValues) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("email", data.email);
      try {
        const result = await inviteToWorkspace(formData);
        if (result.success) {
          toast.success("Invitasjon sendt!");
          form.reset();
        } else {
          setError(result.message || "Kunne ikke sende invitasjon");
          toast.error(result.message || "Kunne ikke sende invitasjon");
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "En ukjent feil oppstod";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter bruker</CardTitle>
        <CardDescription>Send en e-postinvitasjon til arbeidsområdet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input placeholder="bruker@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? "Sender..." : "Send invitasjon"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
