"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow, format, isValid } from "date-fns";
import { nb } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { updateLeadStatus } from "@/app/actions/leads/actions";
import {
  Business as PrismaBusiness,
  CustomerStage,
  Tag,
} from "@/app/generated/prisma";

import { LeadTabs } from "@/components/lead/lead-tabs";
import EditLeadSheet from "./edit-lead-sheet";

import { getStatusBadgeProps } from "@/lib/lead-status-utils";

import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconWorld,
  IconUser,
  IconMapPin,
  IconBriefcase,
  IconUsers,
  IconTarget,
  IconCurrencyDollar,
  IconPencil,
  IconTag,
  IconExternalLink,
  IconCalendarTime,
  IconSparkles,
  IconListCheck,
  IconRotateClockwise,
  IconInfoCircle,
  IconReceiptTax,
  IconCode,
  IconClock,
  IconCopy,
  IconCheck,
  IconPlus,
} from "@tabler/icons-react";

import { StageChangeDialog } from "@/components/lead/stage-change-dialog";

// Define a more complete type for the lead data used in this component
type LeadWithDetails = PrismaBusiness & {
  tags?: Tag[]; // Explicitly include optional tags relation
  // Add other relations here if they are included and used
};

// Define the type for the AI insights data structure - EXPORT
export interface LeadInsight {
  summary: string;
  recommendations: string[];
  enrichment: {
    potentialLinkedIn?: string | null; // Ensure null is allowed here too if schema allows
    potentialWebsite?: string | null;
    keyInfo?: string | null;
  };
}

interface LeadDetailClientProps {
  initialLead: LeadWithDetails | null;
  workspaceId: string;
}

// Helper component for Sidebar Info Item - EXPORT
export const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-2 text-sm">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex flex-col">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
};

// Helper component for Links - EXPORT
export const LinkItem = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  href: string | null;
}) => {
  if (!value || !href) return null;
  // Ensure href starts with http:// or https://
  const safeHref =
    href.startsWith("http://") || href.startsWith("https://")
      ? href
      : `https://${href}`;
  return (
    <div className="flex items-center space-x-2 text-sm group">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 hover:underline flex items-center"
      >
        {value}
        <IconExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  );
};

// Helper component for Copyable Value - MODIFIED
const CopyableValue = ({
  valueToCopy,
  children,
}: {
  valueToCopy: string | null | undefined;
  children: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!valueToCopy) return;
    navigator.clipboard
      .writeText(valueToCopy)
      .then(() => {
        setCopied(true);
        toast.success("Kopiert til utklippstavlen!");
        setTimeout(() => setCopied(false), 1500); // Reset icon after 1.5 seconds
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Kunne ikke kopiere.");
      });
  };

  if (!valueToCopy) {
    return <span className="text-muted-foreground">{children || "-"}</span>; // Render placeholder if no value
  }

  return (
    <div className="flex items-center justify-between space-x-1 group w-full">
      <button
        onClick={handleCopy}
        className="text-left hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded p-0.5 -m-0.5"
        aria-label={`Kopier ${valueToCopy}`}
      >
        {children}
      </button>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Kopiert" : "Kopier"}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0"
            >
              {copied ? (
                <IconCheck size={14} className="text-green-600" />
              ) : (
                <IconCopy size={14} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Kopiert!" : "Kopier"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function LeadDetailClient({
  initialLead,
  workspaceId,
}: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadWithDetails | null>(initialLead);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddActivitySheetOpen, setIsAddActivitySheetOpen] = useState(false);

  // State for AI Insights
  const [insights, setInsights] = useState<LeadInsight | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [errorInsights, setErrorInsights] = useState<string | null>(null);

  // Function to fetch AI insights - moved outside useEffect
  const handleGenerateInsights = async () => {
    if (!lead) {
      setErrorInsights("Lead data er ikke tilgjengelig.");
      return;
    }

    setIsLoadingInsights(true);
    setErrorInsights(null);
    setInsights(null); // Clear previous insights
    try {
      const response = await fetch("/api/lead-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: LeadInsight = await response.json();
      setInsights(data);
      toast.success("AI-innsikt generert!");
    } catch (error: any) {
      console.error("Error fetching AI insights:", error);
      setErrorInsights(
        error.message || "Kunne ikke hente AI-innsikt. Prøv igjen senere."
      );
      toast.error("Feil ved generering av AI-innsikt.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Offer submission logic (if used)
  const handleOfferSubmit = (offer: any) => {
    toast.success("Tilbudet ble lagret (Simulert)");
  };

  // Stage change logic remains the same
  const handleStageChange = async (newStage: CustomerStage) => {
    if (!lead) return;
    const oldStage = lead.stage;
    if (oldStage === newStage) {
      setShowStageDialog(false);
      return;
    }
    try {
      setIsChangingStage(true);
      setLead((prev) =>
        prev ? ({ ...prev, stage: newStage } as LeadWithDetails) : null
      );
      await updateLeadStatus(lead.id, newStage, workspaceId);
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">Status oppdatert</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{lead.name}</span> ble flyttet fra{" "}
            <Badge variant="outline" className="ml-1 mr-1">
              {getStatusBadgeProps(oldStage).label}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="ml-1">
              {getStatusBadgeProps(newStage).label}
            </Badge>
          </div>
        </div>
      );
      if (newStage === "customer") {
        toast.success("Lead er nå konvertert til kunde!", {
          description: "Du blir videresendt til kundeoversikten...",
          duration: 3000,
        });
        setTimeout(() => {
          router.push("/bedrifter");
        }, 2000);
      }
    } catch (error) {
      setLead((prev) =>
        prev ? ({ ...prev, stage: oldStage } as LeadWithDetails) : null
      );
      console.error("Error updating lead stage:", error);
      toast.error("Kunne ikke oppdatere statusen");
    } finally {
      setIsChangingStage(false);
      setShowStageDialog(false);
    }
  };

  if (!lead) {
    // Fallback if lead somehow becomes null client-side
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Fant ikke lead</h1>
        <p className="text-muted-foreground mb-6">
          Kunne ikke laste lead-detaljer.
        </p>
        <Button asChild>
          <a href="/leads">Tilbake til leads</a>
        </Button>
      </main>
    );
  }

  const statusProps = getStatusBadgeProps(lead.stage);

  // Calculate relative creation time
  const createdRelativeTime = formatDistanceToNow(new Date(lead.createdAt), {
    addSuffix: true,
    locale: nb,
  });

  // Format Brreg Updated time if available
  const brregCheckedTime = lead.brregUpdatedAt
    ? formatDistanceToNow(new Date(lead.brregUpdatedAt), {
        addSuffix: true,
        locale: nb,
      })
    : null;

  // Format Established Date if available and valid
  const establishedDateFormatted =
    lead.establishedDate && isValid(new Date(lead.establishedDate))
      ? format(new Date(lead.establishedDate), "PP", { locale: nb })
      : null;

  const handleLeadUpdate = (updatedLeadData: Partial<LeadWithDetails>) => {
    setLead((prev) => (prev ? { ...prev, ...updatedLeadData } : null));
    setIsEditSheetOpen(false);
    toast.success("Lead-detaljer oppdatert!");
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Sidebar (Left Column) */}
      <aside className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start space-x-4">
            {/* Left side: Title and creation time */}
            <div className="flex flex-col flex-grow">
              <CardTitle className="text-xl font-bold break-words">
                {lead.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground mt-1">
                Laget {createdRelativeTime}
              </span>
            </div>
            {/* Right side: Clickable Badge and Edit Button */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditSheetOpen(true)}
                aria-label="Rediger lead"
              >
                <IconPencil size={18} />
              </Button>
              <button
                onClick={() => !isChangingStage && setShowStageDialog(true)}
                disabled={isChangingStage}
                aria-label="Endre status"
                className={`rounded-md transition-opacity ${
                  isChangingStage
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-80"
                }`}
              >
                <Badge
                  variant={
                    statusProps.variant === "success"
                      ? "default"
                      : statusProps.variant
                  }
                  className="whitespace-nowrap cursor-pointer"
                >
                  {statusProps.label}
                </Badge>
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 pt-4">
            {/* Buttons Section */}
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={!lead.orgNumber}
                className="flex-1"
              >
                <a
                  href={
                    lead.orgNumber
                      ? `https://www.proff.no/bransjesøk?q=${lead.orgNumber}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!lead.orgNumber}
                  className={
                    !lead.orgNumber ? "pointer-events-none opacity-50" : ""
                  }
                >
                  <IconExternalLink size={16} className="mr-1.5" />
                  Proff.no
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddActivitySheetOpen(true)}
                className="flex-1"
              >
                <IconPlus size={16} className="mr-1.5" />
                Ny aktivitet
              </Button>
            </div>

            {/* Contact Info Group */}
            <div className="py-4 space-y-4">
              <InfoItem
                icon={IconUser}
                label="Kontaktperson"
                value={lead.contactPerson || "-"}
              />
              <InfoItem
                icon={IconMail}
                label="E-post"
                value={
                  <CopyableValue valueToCopy={lead.email}>
                    {lead.email || "-"}
                  </CopyableValue>
                }
              />
              <InfoItem
                icon={IconPhone}
                label="Telefon"
                value={
                  <CopyableValue valueToCopy={lead.phone}>
                    {lead.phone || "-"}
                  </CopyableValue>
                }
              />
              <InfoItem
                icon={IconTarget}
                label="Potensiell Verdi"
                value={
                  lead.potensiellVerdi?.toLocaleString("nb-NO", {
                    style: "currency",
                    currency: "NOK",
                  }) ?? "-"
                }
              />
            </div>
            <Separator />
            {/* Location Info Group */}
            <div className="py-4 space-y-4">
              <InfoItem
                icon={IconMapPin}
                label="Adresse"
                value={
                  [lead.address, lead.postalCode, lead.city, lead.country]
                    .filter(Boolean)
                    .join(", ") || "-"
                }
              />
              <LinkItem
                icon={IconWorld}
                label="Nettsted"
                value={lead.website}
                href={lead.website}
              />
            </div>
            <Separator />
            {/* Company Info Group */}
            <div className="py-4 space-y-4">
              <div className="flex items-start space-x-2 text-sm">
                <IconBuilding className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Org.nr</span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle
                            size={14}
                            className="text-muted-foreground cursor-help"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Informasjon hentet fra Brreg</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">
                    <CopyableValue valueToCopy={lead.orgNumber}>
                      {lead.orgNumber ? (
                        <a
                          href={`https://www.proff.no/bransjes%C3%B8k?q=${lead.orgNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center group"
                        >
                          {lead.orgNumber}
                          <IconExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </CopyableValue>
                  </span>
                </div>
              </div>
              <InfoItem
                icon={IconInfoCircle}
                label="Selskapsform"
                value={lead.orgForm || "-"}
              />
              <InfoItem
                icon={IconReceiptTax}
                label="MVA-registrert"
                value={
                  lead.vatRegistered === true
                    ? "Ja"
                    : lead.vatRegistered === false
                    ? "Nei"
                    : "-"
                }
              />
              <InfoItem
                icon={IconBriefcase}
                label="Bransje"
                value={lead.industry || "-"}
              />
              <InfoItem
                icon={IconUsers}
                label="Ansatte"
                value={lead.numberOfEmployees?.toLocaleString() ?? "-"}
              />
              <InfoItem
                icon={IconCalendarTime}
                label="Etablert dato"
                value={establishedDateFormatted || "-"}
              />
            </div>
            {/* <Separator /> */}
            {/* Financial Info Group */}
            <div className="py-4 space-y-4">
              {/* <InfoItem
                icon={IconCurrencyDollar}
                label="Omsetning"
                value={
                  lead.revenue?.toLocaleString("nb-NO", {
                    style: "currency",
                    currency: "NOK",
                  }) ?? "-"
                }
              /> */}
            </div>
            {/* <Separator /> */}
            {/* Tags Group */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="py-4">
                <div className="flex items-start space-x-2 text-sm">
                  <IconTag className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {lead.tags.map((tag: Tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {lead.tags && lead.tags.length > 0 && <Separator />}
          </CardContent>
        </Card>
      </aside>

      {/* Main Content (Right Column) */}
      <main className="flex-grow">
        <LeadTabs
          lead={lead}
          insights={insights}
          isLoadingInsights={isLoadingInsights}
          errorInsights={errorInsights}
          handleGenerateInsights={handleGenerateInsights}
          workspaceId={workspaceId}
          isAddActivitySheetOpen={isAddActivitySheetOpen}
          setIsAddActivitySheetOpen={setIsAddActivitySheetOpen}
        />
      </main>

      {/* Render the Stage Change Dialog */}
      <StageChangeDialog
        open={showStageDialog}
        onOpenChange={setShowStageDialog}
        currentStage={lead.stage}
        onStageSelect={handleStageChange}
        leadName={lead.name}
        isUpdating={isChangingStage}
      />

      {/* Render the Edit Sheet */}
      <EditLeadSheet
        lead={lead}
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        onLeadUpdate={handleLeadUpdate}
      />
    </div>
  );
}
