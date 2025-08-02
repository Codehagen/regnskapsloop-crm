"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateUserProfile } from "@/app/actions/admin/actions";

// Schema for form validation
const userEditFormSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  isAdmin: z.boolean(),
});

type UserEditFormValues = z.infer<typeof userEditFormSchema>;

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: Date;
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      name: user?.name || "",
      isAdmin: user?.isAdmin || false,
    },
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        isAdmin: user.isAdmin,
      });
      setError(null);
    }
  }, [user, form]);

  async function onSubmit(data: UserEditFormValues) {
    if (!user) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("name", data.name);
      formData.append("isAdmin", data.isAdmin.toString());

      try {
        const result = await updateUserProfile(formData);
        if (result.success) {
          toast.success(result.message || "Brukerprofil oppdatert!");
          onOpenChange(false);
          onUserUpdated?.();
        } else {
          setError(result.message || "En feil oppstod");
          toast.error(result.message || "Kunne ikke oppdatere brukerprofil.");
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

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rediger bruker</DialogTitle>
          <DialogDescription>
            Oppdater brukerinformasjon og tilgangsnivå.
          </DialogDescription>
        </DialogHeader>

        {/* User Info Header */}
        <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{user.name || "Ingen navn"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                ID: {user.id.slice(-8)}
              </Badge>
              <Badge variant={user.isAdmin ? "destructive" : "secondary"} className="text-xs">
                {user.isAdmin ? "Administrator" : "Bruker"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Workspaces Info */}
        {user.workspaces.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Arbeidsområder:</p>
            <div className="flex flex-wrap gap-1">
              {user.workspaces.map((workspace) => (
                <Badge key={workspace.id} variant="outline" className="text-xs">
                  {workspace.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Brukerens navn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Fullt navn som vises i systemet.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Administrator
                    </FormLabel>
                    <FormDescription>
                      Gi brukeren administratortilgang til systemet.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Read-only Info */}
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">
                Skrivebeskyttet informasjon:
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>E-post:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Opprettet:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString("nb-NO")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clerk ID:</span>
                  <span className="font-mono text-xs">{user.clerkId.slice(-8)}</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}