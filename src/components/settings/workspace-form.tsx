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
import { updateWorkspaceName } from "@/app/actions/settings/actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";

// Schema matching the server action validation
const workspaceFormSchema = z.object({
  name: z.string().min(1, "Navn på arbeidsområde er påkrevd"),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

interface WorkspaceFormProps {
  workspace: {
    id: string;
    name: string;
  };
}

export function WorkspaceForm({ workspace }: WorkspaceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace.name || "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: WorkspaceFormValues) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceId", workspace.id);
      formData.append("name", data.name);

      try {
        const result = await updateWorkspaceName(formData);
        if (result.success) {
          toast.success(result.message || "Navn på arbeidsområde oppdatert!");
          // Reset form with the new name after successful update
          form.reset({ name: data.name });
        } else {
          setError(result.message || "En feil oppstod");
          toast.error(result.message || "Kunne ikke oppdatere navnet.");
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
        <CardTitle>Arbeidsområde</CardTitle>
        <CardDescription>
          Oppdater navnet på arbeidsområdet ditt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn på arbeidsområde</FormLabel>
                  <FormControl>
                    <Input placeholder="Arbeidsområdets navn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Dette vises i sidepanelet og andre steder.
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
              {isPending ? "Lagrer..." : "Oppdater navn"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
