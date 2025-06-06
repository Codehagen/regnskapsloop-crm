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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask, getWorkspaceUsers } from "@/app/actions/tasks/actions";

interface AddTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  businessId?: string;
}

export function AddTaskModal({ isOpen, onOpenChange, workspaceId, businessId }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getWorkspaceUsers(workspaceId).then(setUsers).catch(() => {});
  }, [workspaceId]);

  const toggleAssignee = (id: string) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await createTask({
      title,
      description,
      priority: priority as any,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      workspaceId,
      businessId,
      assigneeIds: assignees,
    });
    setIsSubmitting(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignees([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ny oppgave</DialogTitle>
          <DialogDescription>
            Opprett en oppgave knyttet til arbeidsområdet ditt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Tittel</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Beskrivelse</Label>
            <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due">Frist</Label>
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
            <Label>Tilordne til</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={assignees.includes(u.id)}
                    onCheckedChange={() => toggleAssignee(u.id)}
                  />
                  <span>{u.name || u.email}</span>
                </label>
              ))}
              {users.length === 0 && <p className="text-sm text-muted-foreground">Ingen brukere</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            Lagre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
