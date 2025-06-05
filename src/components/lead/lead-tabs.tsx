"use client";

import { Business } from "@/app/generated/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LeadActivity } from "./lead-activity";
import { LeadProffInfo } from "./lead-proff-info";
import { LeadNotes } from "./lead-notes";
import { LeadOffers } from "./lead-offers";
import { LeadEmails } from "./lead-emails";
import { CreateOffer } from "./create-offer";
import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  IconSparkles,
  IconListCheck,
  IconRotateClockwise,
  IconWorld,
  IconExternalLink,
  IconBriefcase,
} from "@tabler/icons-react";

import type { LeadInsight } from "./lead-detail-client";
import { InfoItem, LinkItem } from "./lead-detail-client";

interface LeadTabsProps {
  lead: Business;
  insights: LeadInsight | null;
  isLoadingInsights: boolean;
  errorInsights: string | null;
  handleGenerateInsights: () => Promise<void>;
  workspaceId: string;
  isAddActivitySheetOpen: boolean;
  setIsAddActivitySheetOpen: Dispatch<SetStateAction<boolean>>;
}

export function LeadTabs({
  lead,
  insights,
  isLoadingInsights,
  errorInsights,
  handleGenerateInsights,
  workspaceId,
  isAddActivitySheetOpen,
  setIsAddActivitySheetOpen,
}: LeadTabsProps) {
  const [showCreateOffer, setShowCreateOffer] = useState(false);

  const handleOfferSubmit = (offer: any) => {
    toast.success("Tilbudet ble lagret (Simulert)");
    setShowCreateOffer(false);
  };

  return (
    <Tabs defaultValue="activities" className="space-y-4">
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
        <TabsTrigger value="emails">E-post</TabsTrigger>
        {/* <TabsTrigger value="offers">Tilbud</TabsTrigger> */}
        <TabsTrigger value="notes">Notater</TabsTrigger>
        {/* {lead.orgNumber && <TabsTrigger value="proff">Proff Info</TabsTrigger>} */}
      </TabsList>

      {/* <TabsContent value="ai-innsikt">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconSparkles size={20} className="text-primary" />
              AI-Innsikt for {lead.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isLoadingInsights || !lead}
              aria-label="Generer AI-innsikt"
            >
              {isLoadingInsights ? (
                <>
                  <IconRotateClockwise
                    size={16}
                    className="mr-2 animate-spin"
                  />
                  Genererer...
                </>
              ) : (
                <>
                  <IconSparkles size={16} className="mr-2" />
                  Generer Innsikt
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!insights && !isLoadingInsights && !errorInsights && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Klikk på knappen for å generere AI-innsikt for dette leadet.
              </p>
            )}
            {isLoadingInsights && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4 mt-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            )}
            {errorInsights && !isLoadingInsights && (
              <p className="text-sm text-destructive">Feil: {errorInsights}</p>
            )}
            {insights && !isLoadingInsights && !errorInsights && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Oppsummering</h4>
                  <p className="text-muted-foreground">{insights.summary}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1.5">
                    <IconListCheck size={16} /> Anbefalte neste steg
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {insights.recommendations.map(
                      (rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      )
                    )}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-1">Anriket Data</h4>
                  <div className="space-y-1 text-muted-foreground">
                    {insights.enrichment.potentialWebsite && (
                      <LinkItem
                        icon={IconWorld}
                        label="Potensielt Nettsted"
                        value={insights.enrichment.potentialWebsite}
                        href={insights.enrichment.potentialWebsite}
                      />
                    )}
                    {insights.enrichment.potentialLinkedIn && (
                      <LinkItem
                        icon={IconExternalLink}
                        label="Potensiell LinkedIn"
                        value={insights.enrichment.potentialLinkedIn}
                        href={insights.enrichment.potentialLinkedIn}
                      />
                    )}
                    {insights.enrichment.keyInfo && (
                      <InfoItem
                        icon={IconBriefcase}
                        label="Nøkkelinfo"
                        value={insights.enrichment.keyInfo}
                      />
                    )}
                    {!insights.enrichment.potentialWebsite &&
                      !insights.enrichment.potentialLinkedIn &&
                      !insights.enrichment.keyInfo && (
                        <p className="text-xs italic">
                          Ingen ytterligere data funnet.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent> */}

      <TabsContent value="activities">
        <Card>
          <CardContent className="pt-6">
            <LeadActivity
              lead={lead}
              isAddActivityDialogOpen={isAddActivitySheetOpen}
              onAddActivityDialogChange={setIsAddActivitySheetOpen}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="emails">
        <LeadEmails lead={lead} workspaceId={workspaceId} />
      </TabsContent>

      {/* <TabsContent value="offers">
        <div className="space-y-4">
          {showCreateOffer ? (
            <Card>
              <CardHeader>
                <CardTitle>Opprett nytt tilbud</CardTitle>
                <CardDescription>
                  Fyll ut informasjonen for å opprette et nytt tilbud til{" "}
                  {lead.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateOffer
                  business={lead}
                  onSubmit={handleOfferSubmit}
                  onCancel={() => setShowCreateOffer(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <LeadOffers
                  lead={lead}
                  onCreateOffer={() => setShowCreateOffer(true)}
                  showCreateOffer={showCreateOffer}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent> */}

      <TabsContent value="notes">
        <Card>
          <CardContent className="pt-6">
            <LeadNotes lead={lead} workspaceId={workspaceId} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* {lead.orgNumber && (
        <TabsContent value="proff">
          <Card>
            <CardContent className="pt-6">
              <LeadProffInfo lead={lead} />
            </CardContent>
          </Card>
        </TabsContent>
      )} */}
    </Tabs>
  );
}
