"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { IconTrash, IconChevronDown, IconX } from "@tabler/icons-react";
import {
  createTask,
  updateTask,
  deleteTask,
  getWorkspaceUsers,
  getWorkspaceBusinesses,
} from "@/app/actions/tasks/actions";
import { Task } from "@/app/generated/prisma";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  businessId?: string;
  task?: Task & {
    assignees: { id: string; name: string | null; email: string }[];
  }; // For edit mode
  onTaskUpdated?: () => void; // Callback to refresh tasks list
}

export function TaskModal({
  isOpen,
  onOpenChange,
  workspaceId,
  businessId,
  task,
  onTaskUpdated,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [users, setUsers] = useState<
    { id: string; name: string | null; email: string }[]
  >([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<
    {
      id: string;
      name: string;
      stage: string;
      email: string;
      contactPerson: string | null;
    }[]
  >([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  const isEditMode = !!task;

  useEffect(() => {
    getWorkspaceUsers(workspaceId)
      .then(setUsers)
      .catch(() => {});
    getWorkspaceBusinesses(workspaceId)
      .then(setBusinesses)
      .catch(() => {});
  }, [workspaceId]);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
      setAssignees(task.assignees.map((a) => a.id));
      setSelectedBusinessId((task as any).businessId || "none");
    } else {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignees([]);
      setSelectedBusinessId(businessId || "none");
    }
  }, [task, isOpen, businessId]);

  const toggleAssignee = (id: string) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const removeAssignee = (id: string) => {
    setAssignees((prev) => prev.filter((a) => a !== id));
  };

  const getSelectedUsers = () => {
    return users.filter((user) => assignees.includes(user.id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && task) {
        const result = await updateTask({
          id: task.id,
          title,
          description,
          priority: priority as any,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          workspaceId,
          businessId:
            selectedBusinessId === "none"
              ? undefined
              : selectedBusinessId || undefined,
          assigneeIds: assignees,
        });

        if (result.success) {
          toast.success("Oppgave oppdatert");
          onTaskUpdated?.();
          onOpenChange(false);
        } else {
          toast.error("Kunne ikke oppdatere oppgave");
        }
      } else {
        const result = await createTask({
          title,
          description,
          priority: priority as any,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          workspaceId,
          businessId:
            selectedBusinessId === "none"
              ? businessId || undefined
              : selectedBusinessId || businessId,
          assigneeIds: assignees,
        });

        if (result.success) {
          toast.success("Oppgave opprettet");
          onTaskUpdated?.();
          onOpenChange(false);
        } else {
          toast.error("Kunne ikke opprette oppgave");
        }
      }
    } catch (error) {
      toast.error(
        isEditMode
          ? "Kunne ikke oppdatere oppgave"
          : "Kunne ikke opprette oppgave"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);

    try {
      const result = await deleteTask(task.id, workspaceId);
      if (result.success) {
        toast.success("Oppgave slettet");
        onTaskUpdated?.();
        onOpenChange(false);
        setShowDeleteConfirm(false);
      } else {
        toast.error("Kunne ikke slette oppgave");
      }
    } catch (error) {
      toast.error("Kunne ikke slette oppgave");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Rediger oppgave" : "Ny oppgave"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Gjør endringer i oppgaven din."
                : "Opprett en oppgave knyttet til arbeidsområdet ditt."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Tittel</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Beskrivelse</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Frist</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Prioritet</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Lav</SelectItem>
                  <SelectItem value="medium">Middels</SelectItem>
                  <SelectItem value="high">Høy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Knyttet til</Label>
              <Select
                value={selectedBusinessId}
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg bedrift/kunde (valgfritt)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen bedrift valgt</SelectItem>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{business.name}</span>
                        {business.contactPerson && (
                          <span className="text-xs text-muted-foreground">
                            {business.contactPerson}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tilordne til</Label>
              <div className="space-y-2">
                {/* Selected Users Display */}
                {getSelectedUsers().length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getSelectedUsers().map((user) => (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        <span className="text-xs">
                          {user.name || user.email}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeAssignee(user.id)}
                        >
                          <IconX className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* User Selection Dropdown */}
                <Popover
                  open={assigneePopoverOpen}
                  onOpenChange={setAssigneePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={assigneePopoverOpen}
                      className="w-full justify-between"
                    >
                      <span className="text-muted-foreground">
                        {assignees.length === 0
                          ? "Velg brukere..."
                          : `${assignees.length} bruker${
                              assignees.length > 1 ? "e" : ""
                            } valgt`}
                      </span>
                      <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {users.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Ingen brukere funnet
                        </div>
                      ) : (
                        <div className="p-1">
                          {users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent cursor-pointer"
                              onClick={() => toggleAssignee(user.id)}
                            >
                              <Checkbox
                                checked={assignees.includes(user.id)}
                                onChange={() => {}} // Controlled by parent onClick
                              />
                              <span className="text-sm">
                                {user.name || user.email}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {isEditMode && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  <IconTrash className="h-4 w-4 mr-1" />
                  Slett
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
              >
                {isEditMode ? "Oppdater" : "Lagre"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen kan ikke angres. Dette vil permanent slette
              oppgaven
              <strong className="block mt-1">"{task?.title}"</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Sletter..." : "Slett oppgave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
