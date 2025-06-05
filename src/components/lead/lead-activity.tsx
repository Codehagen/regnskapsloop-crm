"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAuth } from "@clerk/nextjs";
import { Business, Activity as PrismaActivity } from "@/app/generated/prisma";

// Import Tabler icons instead of Lucide
import {
  IconPlus,
  IconPhone,
  IconMail,
  IconCalendar,
  IconFileText,
  IconClock,
  IconBuilding,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  getLeadActivities,
  addLeadActivity,
} from "@/app/actions/leads/actions";

interface LeadActivityProps {
  lead: Business;
  isAddActivityDialogOpen: boolean;
  onAddActivityDialogChange: (open: boolean) => void;
}

// Activity types from Prisma schema (excluding SMS)
type ActivityType = "call" | "email" | "meeting" | "note";

// Keep Activity interface for form state, not for fetched data
interface NewActivityState {
  type: ActivityType;
  title: string; // This will map to Prisma's description
  description: string; // This is the extra details field in the form
}

// Updated Icons map (removed sms)
const ACTIVITY_ICONS: Record<ActivityType | "lead_created", React.ReactNode> = {
  call: <IconPhone size={16} />,
  email: <IconMail size={16} />,
  meeting: <IconCalendar size={16} />,
  note: <IconFileText size={16} />,
  lead_created: <IconBuilding size={16} />,
};

// Updated Colors map (removed sms)
const ACTIVITY_COLORS: Record<ActivityType | "lead_created", string> = {
  call: "bg-blue-50 text-blue-700",
  email: "bg-purple-50 text-purple-700",
  meeting: "bg-green-50 text-green-700",
  note: "bg-gray-50 text-gray-700",
  lead_created: "bg-indigo-50 text-indigo-700",
};

export function LeadActivity({
  lead,
  isAddActivityDialogOpen,
  onAddActivityDialogChange,
}: LeadActivityProps) {
  const { userId } = useAuth(); // Get Clerk user ID

  // State for fetched activities, loading, and error
  const [activities, setActivities] = useState<PrismaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the Add Activity dialog
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newActivity, setNewActivity] = useState<NewActivityState>({
    type: "call",
    title: "", // Maps to Prisma description
    description: "", // Form field for additional details (currently not saved to a specific field)
  });

  // Function to fetch activities
  const fetchActivities = async () => {
    if (!lead || !lead.id || !lead.workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLeadActivities(lead.id, lead.workspaceId);
      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        setError(result.message || "Failed to fetch activities");
        toast.error(result.message || "Failed to fetch activities");
      }
    } catch (err) {
      console.error("Fetch activities error:", err);
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      toast.error(`Error fetching activities: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch activities on mount or when lead changes
  useEffect(() => {
    fetchActivities();
  }, [lead.id, lead.workspaceId]); // Depend on lead properties

  // Handle adding a new activity via Server Action
  const handleAddActivity = async () => {
    if (!userId) {
      toast.error("Bruker ikke autentisert."); // User not authenticated
      return;
    }
    if (!newActivity.title) {
      toast.error("Tittel må fylles ut.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("leadId", lead.id);
    formData.append("workspaceId", lead.workspaceId);
    formData.append("clerkId", userId);
    formData.append("type", newActivity.type);
    formData.append("description", newActivity.title); // Map component title to Prisma description

    try {
      const result = await addLeadActivity(formData);

      if (result.success) {
        toast.success(result.message || "Aktivitet loggført!");
        onAddActivityDialogChange(false);
        setNewActivity({
          // Reset form
          type: "call",
          title: "",
          description: "",
        });
        // Re-fetch activities to show the new one
        fetchActivities();
      } else {
        toast.error(result.message || "Klarte ikke å loggføre aktivitet.");
      }
    } catch (err) {
      console.error("Add activity error:", err);
      toast.error("En feil oppstod ved logging av aktivitet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to readable string
  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    // Handle both Date objects and string representations
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Combine lead creation and activities for rendering, sorted by date descending
  // Ensure createdAt is treated as a Date object
  const allLogEntries = [
    {
      id: "lead_created",
      type: "lead_created" as const,
      description: `Lead ${lead.name} ble lagt til i systemet.`, // Use description for consistency
      date: new Date(lead.createdAt), // Ensure it's a Date object
    },
    // Map fetched PrismaActivity to the structure needed for rendering
    ...activities.map((act) => ({ ...act, date: new Date(act.date) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Aktivitetslogg</h3>
        <Dialog
          open={isAddActivityDialogOpen}
          onOpenChange={onAddActivityDialogChange}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" disabled={isSubmitting}>
              <IconPlus size={16} /> Loggfør aktivitet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Loggfør ny aktivitet</DialogTitle>
              <DialogDescription>
                Loggfør en aktivitet knyttet til {lead.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Type aktivitet</Label>
                <Select
                  value={newActivity.type}
                  onValueChange={(value: ActivityType) =>
                    setNewActivity({ ...newActivity, type: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="activity-type">
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">
                      <div className="flex items-center gap-2">
                        <IconPhone size={16} /> Telefonsamtale
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <IconMail size={16} /> E-post
                      </div>
                    </SelectItem>
                    <SelectItem value="meeting">
                      <div className="flex items-center gap-2">
                        <IconCalendar size={16} /> Møte
                      </div>
                    </SelectItem>
                    <SelectItem value="note">
                      <div className="flex items-center gap-2">
                        <IconFileText size={16} /> Notat
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-title">Tittel</Label>
                <Input
                  id="activity-title"
                  value={newActivity.title} // This is mapped to Prisma description
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  placeholder="F.eks. Oppfølgingssamtale" // Example relates to title
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-description">
                  Detaljer (valgfritt)
                </Label>
                <Textarea
                  id="activity-description"
                  value={newActivity.description} // This is the extra detail field
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  placeholder="Legg til flere detaljer om aktiviteten (ikke lagret enda)" // Indicate not saved yet
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onAddActivityDialogChange(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button onClick={handleAddActivity} disabled={isSubmitting}>
                {isSubmitting ? "Logger..." : "Loggfør"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-6 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Laster aktiviteter...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6 border rounded-lg bg-destructive/10 text-destructive">
          <p>Kunne ikke laste aktiviteter:</p>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchActivities}
          >
            Prøv igjen
          </Button>
        </div>
      ) : allLogEntries.length > 0 ? (
        <div className="space-y-3">
          {allLogEntries.map((entry) => (
            <div
              // Use entry.id which is guaranteed unique (activity id or "lead_created")
              key={entry.id}
              className="border rounded-lg p-3 transition-all border-muted"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    ACTIVITY_COLORS[entry.type]
                  } flex-shrink-0`}
                >
                  {
                    // Use optional chaining for safety, although type should always exist here
                    ACTIVITY_ICONS[entry.type]
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div>
                    {
                      // Display Prisma's description as the main title
                      <h4 className="font-medium">{entry.description}</h4>
                    }
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <IconClock size={12} />
                    {
                      // Ensure date is formatted correctly
                      <span>{formatDate(entry.date)}</span>
                    }
                    {entry.type !== "lead_created" && (
                      <Badge variant="outline" className="font-normal ml-auto">
                        {entry.type === "call" && "Telefonsamtale"}
                        {entry.type === "email" && "E-post"}
                        {entry.type === "meeting" && "Møte"}
                        {entry.type === "note" && "Notat"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Ingen aktiviteter loggført</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1"
            onClick={() => onAddActivityDialogChange(true)}
          >
            <IconPlus size={16} /> Loggfør første aktivitet
          </Button>
        </div>
      )}
    </div>
  );
}
