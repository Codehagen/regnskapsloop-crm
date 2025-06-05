"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/app/actions/applications/actions";
import {
  JobApplication,
  JobApplicationStatus,
  Activity,
} from "@/app/generated/prisma";
import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  FileText,
  Clock,
  Building,
  DollarSign,
  Calendar as CalendarIcon,
  Star,
  CheckCircle,
  XCircle,
  Send,
  ArrowRightCircle,
  ExternalLink,
  Download,
  Tag,
  Clock as ClockIcon,
  MessageCircle,
} from "@/lib/tabler-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobApplicationWithActivities extends JobApplication {
  activities: Activity[];
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] =
    useState<JobApplicationWithActivities | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("overview");

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const data = await getApplicationById(id);
        setApplication(data as JobApplicationWithActivities);
      } catch (error) {
        console.error(`Error fetching application details: ${error}`);
        toast.error("Kunne ikke laste inn søknadsdetaljer");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Function to update application status
  const handleStatusChange = async (newStatus: JobApplicationStatus) => {
    if (!application) return;

    // Store the original application in case we need to revert
    const originalApplication = { ...application };

    try {
      // Optimistically update UI
      setApplication({ ...application, status: newStatus });

      // Make API call
      await updateApplicationStatus(id, newStatus);

      toast.success(`Søknadsstatus oppdatert til ${getStatusLabel(newStatus)}`);
    } catch (error) {
      // Revert to original state on error
      setApplication(originalApplication);
      console.error(`Error updating application status: ${error}`);
      toast.error("Kunne ikke oppdatere søknadsstatus");
    }
  };

  // Helper function to get readable status labels
  const getStatusLabel = (status: JobApplicationStatus): string => {
    const statusLabels: Record<JobApplicationStatus, string> = {
      new: "Ny",
      reviewing: "Under vurdering",
      interviewed: "Intervjuet",
      offer_extended: "Tilbud sendt",
      hired: "Ansatt",
      rejected: "Avslått",
    };
    return statusLabels[status];
  };

  // Helper function to get status badge variant
  const getStatusVariant = (status: JobApplicationStatus) => {
    switch (status) {
      case "new":
        return "secondary";
      case "reviewing":
        return "default";
      case "interviewed":
        return "outline";
      case "offer_extended":
        return "success";
      case "hired":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helper function to render the progress indicator based on application status
  const getApplicationProgress = (status: JobApplicationStatus): number => {
    const statusValues: Record<JobApplicationStatus, number> = {
      new: 20,
      reviewing: 40,
      interviewed: 60,
      offer_extended: 80,
      hired: 100,
      rejected: 0,
    };
    return statusValues[status];
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Jobbsøknader", href: "/applications" },
        {
          label: application
            ? `${application.firstName} ${application.lastName}`
            : "Laster...",
          isCurrentPage: true,
        },
      ]}
    >
      <main className="p-6">
        {loading ? (
          // Loading state
          <ApplicationDetailSkeleton />
        ) : !application ? (
          // Error state - application not found
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <h1 className="text-2xl font-bold mb-2">Søknad ikke funnet</h1>
            <p className="text-muted-foreground mb-6">
              Kunne ikke finne søknaden du leter etter.
            </p>
            <Button onClick={() => router.push("/applications")}>
              Tilbake til søknader
            </Button>
          </div>
        ) : (
          // Application detail content
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - fixed info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Candidate card */}
              <Card>
                <CardHeader className="relative pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold">
                        {application.firstName} {application.lastName}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {application.desiredPosition ||
                          "Stilling ikke spesifisert"}
                      </CardDescription>
                    </div>
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={getStatusVariant(application.status)}
                        className="px-3 py-1 text-sm"
                      >
                        {getStatusLabel(application.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Søkte{" "}
                        {formatDistanceToNow(
                          new Date(application.applicationDate),
                          { addSuffix: true, locale: nb }
                        )}
                      </span>
                    </div>

                    <Progress
                      value={getApplicationProgress(application.status)}
                      className="h-2 mt-2"
                    />

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${application.email}`}
                          className="text-sm hover:underline"
                        >
                          {application.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${application.phone}`}
                          className="text-sm hover:underline"
                        >
                          {application.phone}
                        </a>
                      </div>
                      {application.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {application.address},{application.postalCode}{" "}
                            {application.city},{application.country}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {application.currentEmployer && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Nåværende arbeidsgiver:
                            </span>{" "}
                            {application.currentEmployer}
                          </span>
                        </div>
                      )}
                      {application.expectedSalary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Forventet lønn:
                            </span>{" "}
                            {application.expectedSalary.toLocaleString("nb-NO")}{" "}
                            kr
                          </span>
                        </div>
                      )}
                      {application.experience !== null &&
                        application.experience !== undefined && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              <span className="text-muted-foreground">
                                Erfaring:
                              </span>{" "}
                              {application.experience} år
                            </span>
                          </div>
                        )}
                      {application.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Kan starte:
                            </span>{" "}
                            {format(
                              new Date(application.startDate),
                              "dd.MM.yyyy",
                              { locale: nb }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full">Oppdater status</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Endre status til</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries({
                        new: { label: "Ny", icon: CheckCircle },
                        reviewing: {
                          label: "Under vurdering",
                          icon: ClockIcon,
                        },
                        interviewed: {
                          label: "Intervjuet",
                          icon: MessageCircle,
                        },
                        offer_extended: { label: "Tilbud sendt", icon: Send },
                        hired: { label: "Ansatt", icon: CheckCircle },
                        rejected: { label: "Avslått", icon: XCircle },
                      }).map(
                        ([key, { label, icon: Icon }]) =>
                          application.status !==
                            (key as JobApplicationStatus) && (
                            <DropdownMenuItem
                              key={key}
                              onClick={() =>
                                handleStatusChange(key as JobApplicationStatus)
                              }
                              className="cursor-pointer"
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              <span>{label}</span>
                            </DropdownMenuItem>
                          )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1">
                      <Mail className="mr-2 h-4 w-4" />
                      Send e-post
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Planlegg
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Skills card */}
              {application.skills && application.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ferdigheter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-muted/50"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education card */}
              {application.education && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Utdanning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <span>{application.education}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs
                defaultValue="overview"
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Oversikt</TabsTrigger>
                  <TabsTrigger value="documents">Dokumenter</TabsTrigger>
                  <TabsTrigger value="activity">Aktiviteter</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Assessment Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vurdering</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground mb-1">
                            Faglig egnethet
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= 4
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted stroke-[1.5px]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground mb-1">
                            Kommunikasjon
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= 3
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted stroke-[1.5px]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground mb-1">
                            Erfaring
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= 5
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted stroke-[1.5px]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Team notes section */}
                      <div>
                        <h3 className="font-medium mb-2">Team notater</h3>
                        <p className="text-sm text-muted-foreground italic">
                          {application.notes || "Ingen notater lagt til ennå."}
                        </p>
                      </div>

                      {/* Add comments field */}
                      <div>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Legg til kommentar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Source and additional info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Tilleggsinformasjon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {application.source && (
                          <div>
                            <span className="text-sm text-muted-foreground block">
                              Kilde
                            </span>
                            <span>{application.source}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            Søknadsdato
                          </span>
                          <span>
                            {format(
                              new Date(application.applicationDate),
                              "dd.MM.yyyy",
                              { locale: nb }
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                  {/* Resume section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">CV</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {application.resume ? (
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                              <span>
                                CV - {application.firstName}_
                                {application.lastName}.pdf
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Last ned
                              </Button>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Åpne
                              </Button>
                            </div>
                          </div>
                          <div className="aspect-3/4 bg-muted rounded-md flex items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 border rounded-md border-dashed">
                          <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Ingen CV er lastet opp
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cover letter section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Søknadsbrev</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {application.coverLetter ? (
                        <ScrollArea className="max-h-[300px] rounded-md border p-4">
                          <div className="prose prose-sm max-w-none">
                            <p>{application.coverLetter}</p>
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center p-6 border rounded-md border-dashed">
                          <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Ingen søknadsbrev er lastet opp
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Aktivitetslogg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {application.activities &&
                      application.activities.length > 0 ? (
                        <div className="space-y-4">
                          {application.activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center z-10 relative">
                                  {activity.type === "note" && (
                                    <MessageCircle className="h-4 w-4" />
                                  )}
                                  {activity.type === "email" && (
                                    <Mail className="h-4 w-4" />
                                  )}
                                  {activity.type === "call" && (
                                    <Phone className="h-4 w-4" />
                                  )}
                                  {activity.type === "meeting" && (
                                    <Users className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="absolute h-full w-0.5 bg-muted top-8 left-1/2 transform -translate-x-1/2 z-0"></div>
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">
                                      {activity.type === "note" && "Notat"}
                                      {activity.type === "email" && "E-post"}
                                      {activity.type === "call" &&
                                        "Telefonsamtale"}
                                      {activity.type === "meeting" && "Møte"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(
                                        new Date(activity.date),
                                        "dd.MM.yyyy HH:mm",
                                        { locale: nb }
                                      )}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      activity.completed ? "success" : "outline"
                                    }
                                  >
                                    {activity.completed
                                      ? "Fullført"
                                      : "Planlagt"}
                                  </Badge>
                                </div>
                                <p className="mt-2">{activity.description}</p>
                                {activity.outcome && (
                                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                                    <span className="font-medium">
                                      Resultat:{" "}
                                    </span>
                                    {activity.outcome}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <Clock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Ingen aktiviteter er registrert
                          </p>
                          <Button variant="outline" className="mt-4">
                            Legg til aktivitet
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

// Loading skeleton component
function ApplicationDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Separator />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Separator />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2 w-full">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-full mb-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
