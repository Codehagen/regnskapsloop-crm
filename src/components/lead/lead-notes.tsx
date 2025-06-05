"use client";

import { useState, useEffect, useTransition } from "react";
import { Business, Activity, User as PrismaUser } from "@/app/generated/prisma";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Save,
  X,
  Trash2,
  CalendarDays,
  Loader2,
  Pencil,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getLeadNotes,
  addLeadNote,
  deleteLeadNote,
  updateLeadNote,
} from "@/app/actions/leads/actions";
import { Skeleton } from "@/components/ui/skeleton";

// Define the type for a note (Activity with optional user)
type NoteActivity = Activity & {
  user?: Pick<PrismaUser, "id" | "name" | "email"> | null;
};

interface LeadNotesProps {
  lead: Business;
  workspaceId: string;
}

export function LeadNotes({ lead, workspaceId }: LeadNotesProps) {
  const { user } = useUser();
  const [notes, setNotes] = useState<NoteActivity[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();

  // State for editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState("");

  // State for text expansion
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const MAX_PREVIEW_LENGTH = 200; // Max chars before truncating

  // Fetch notes when component mounts or lead/workspace changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!lead.id || !workspaceId) return;
      setIsLoadingNotes(true);
      try {
        const result = await getLeadNotes(lead.id, workspaceId);
        if (result.success && result.data) {
          setNotes(result.data as NoteActivity[]);
        } else {
          toast.error(result.message || "Kunne ikke hente notater");
          setNotes([]);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error("En feil oppstod under henting av notater");
        setNotes([]);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [lead.id, workspaceId]);

  // Add a new note
  const handleAddNote = () => {
    if (!newNote.trim() || !user) {
      toast.error("Notatet kan ikke være tomt, og du må være logget inn.");
      return;
    }

    startSubmitTransition(async () => {
      const formData = new FormData();
      formData.append("leadId", lead.id);
      formData.append("workspaceId", workspaceId);
      formData.append("content", newNote);
      formData.append("clerkId", user.id);

      try {
        const result = await addLeadNote(formData);
        if (result.success && result.data) {
          setNotes([result.data as NoteActivity, ...notes]);
          setNewNote("");
          setShowAddNote(false);
          toast.success("Notat lagt til");
        } else {
          toast.error(result.message || "Kunne ikke legge til notat");
        }
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error("En feil oppstod under lagring av notat");
      }
    });
  };

  // Start editing a note
  const handleStartEdit = (note: NoteActivity) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.description || ""); // Pre-fill with existing content
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteContent("");
  };

  // Update a note
  const handleUpdateNote = () => {
    if (!editingNoteId || !editedNoteContent.trim() || !user) {
      toast.error(
        "Notat-ID mangler, innhold kan ikke være tomt, og du må være logget inn."
      );
      return;
    }

    startUpdateTransition(async () => {
      const formData = new FormData();
      formData.append("noteId", editingNoteId);
      formData.append("workspaceId", workspaceId);
      formData.append("content", editedNoteContent);
      formData.append("clerkId", user.id); // Include for permission checks

      try {
        // Assume updateLeadNote exists and handles the update
        const result = await updateLeadNote(formData);
        if (result.success && result.data) {
          // Update the note in the local state
          setNotes(
            notes.map((n) =>
              n.id === editingNoteId
                ? { ...n, description: editedNoteContent }
                : n
            )
          );
          handleCancelEdit(); // Close the dialog and reset state
          toast.success("Notat oppdatert");
        } else {
          toast.error(result.message || "Kunne ikke oppdatere notat");
        }
      } catch (error) {
        console.error("Error updating note:", error);
        toast.error("En feil oppstod under oppdatering av notat");
      }
    });
  };

  // Delete a note
  const handleDeleteNote = (noteId: string) => {
    if (!noteId) return;

    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.append("noteId", noteId);
      formData.append("workspaceId", workspaceId);
      formData.append("leadId", lead.id);

      try {
        const result = await deleteLeadNote(formData);
        if (result.success) {
          setNotes(notes.filter((note) => note.id !== noteId));
          toast.success("Notat slettet");
        } else {
          toast.error(result.message || "Kunne ikke slette notat");
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        toast.error("En feil oppstod under sletting av notat");
      }
    });
  };

  // Format date nicely
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (isNaN(days)) return "Ugyldig dato";

    if (days === 0) {
      return (
        "I dag " +
        new Date(date).toLocaleTimeString("no-NO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (days === 1) {
      return (
        "I går " +
        new Date(date).toLocaleTimeString("no-NO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (days < 7) {
      return days + " dager siden";
    } else {
      return new Date(date).toLocaleDateString("no-NO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Helper to get user initials
  const getInitials = (name?: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Toggle note expansion
  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notater</h3>
        <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" disabled={!user}>
              <Plus className="h-4 w-4" /> Legg til notat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til nytt notat</DialogTitle>
              <DialogDescription>
                Legg til et notat om {lead.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Skriv notatet ditt her..."
                className="min-h-[150px]"
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddNote(false)}
                disabled={isSubmitting}
                className="gap-1"
              >
                <X className="h-4 w-4" /> Avbryt
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={isSubmitting || !newNote.trim()}
                className="gap-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? "Lagrer..." : "Lagre notat"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingNotes ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="bg-white border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(note.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {note.user?.name || note.user?.email || "Ukjent Bruker"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(note.date)}
                      </p>
                    </div>
                  </div>
                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      {/* Edit Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleStartEdit(note)}
                            disabled={isUpdating || isDeleting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rediger notat</p>
                        </TooltipContent>
                      </Tooltip>
                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={isDeleting || isUpdating}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Slett notat</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm relative">
                  {note.description &&
                  note.description.length > MAX_PREVIEW_LENGTH &&
                  !expandedNotes.has(note.id) ? (
                    <>
                      {note.description.substring(0, MAX_PREVIEW_LENGTH)}...
                      <Button
                        variant="link"
                        className="h-auto p-0 ml-1 text-xs text-primary absolute bottom-0 right-0 bg-white/80 backdrop-blur-sm"
                        onClick={() => toggleNoteExpansion(note.id)}
                      >
                        Les mer
                      </Button>
                    </>
                  ) : (
                    <>
                      {note.description}
                      {note.description &&
                        note.description.length > MAX_PREVIEW_LENGTH &&
                        expandedNotes.has(note.id) && (
                          <Button
                            variant="link"
                            className="h-auto p-0 ml-1 text-xs text-primary block text-right w-full"
                            onClick={() => toggleNoteExpansion(note.id)}
                          >
                            Vis mindre
                          </Button>
                        )}
                    </>
                  )}
                  {!note.description && (
                    <p className="text-muted-foreground italic text-xs">
                      Tomt notat.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Ingen notater registrert</p>
          <Button
            variant="link"
            size="sm"
            className="mt-2 gap-1"
            onClick={() => setShowAddNote(true)}
            disabled={!user}
          >
            <Plus className="h-4 w-4" /> Legg til første notat
          </Button>
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNoteId} onOpenChange={handleCancelEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger notat</DialogTitle>
            <DialogDescription>
              Rediger notatet for {lead.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedNoteContent}
              onChange={(e) => setEditedNoteContent(e.target.value)}
              placeholder="Rediger notatet ditt her..."
              className="min-h-[150px]"
              disabled={isUpdating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="gap-1"
            >
              <X className="h-4 w-4" /> Avbryt
            </Button>
            <Button
              onClick={handleUpdateNote}
              disabled={isUpdating || !editedNoteContent.trim()}
              className="gap-1"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isUpdating ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
