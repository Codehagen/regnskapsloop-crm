import { PageLayout } from "@/components/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardData } from "../actions/dashboard/actions";
import {
  Building2,
  Users,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Activity as ActivityIcon,
  Flame,
  CalendarDays,
  History,
  Mail,
  FileText,
} from "@/lib/tabler-icons";
import { getUserWorkspaceData } from "@/lib/auth/workspace";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

// Make the homepage a server component to fetch data
export default async function Homepage() {
  // --- Get User and Workspace Data (handles auth, db sync, redirects) --- //
  const { userId, workspaceId } = await getUserWorkspaceData();

  // --- Fetch data for the specific workspace --- //
  const {
    leadsCount,
    prospectsCount,
    qualifiedCount,
    customersCount,
    recentLeads,
    totalPotentialValue,
    topLeads,
    upcomingActivities,
    recentActivities,
  } = await getDashboardData(workspaceId);

  // --- Render the page with workspace-specific data --- //
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Regnskapsloop", href: "/dashboard" },
        { label: "Dashboard", isCurrentPage: true },
      ]}
    >
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Oversikt over din pipeline og aktiviteter
          </p>
        </div>

        {/* Main metric cards - Data now reflects the current workspace */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link href="/leads">
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Nye Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leadsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leads som ennå ikke er kontaktet
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leads">
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">I Dialog</CardTitle>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prospectsCount + qualifiedCount}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {prospectsCount} Kontaktet
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {qualifiedCount} Kvalifisert
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leads">
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Kunder</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customersCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aktive kunder
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leads">
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Potensiell Verdi
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("no-NO", {
                    style: "currency",
                    currency: "NOK",
                    maximumFractionDigits: 0,
                  }).format(totalPotentialValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total potensiell verdi i pipeline
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* NEW SECTIONS GRID */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
          {/* Top Leads Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Høyest Potensiell Verdi
              </CardTitle>
              <CardDescription>
                Leads med høyest potensiell verdi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topLeads.length > 0 ? (
                <ul className="space-y-3">
                  {topLeads.map((lead) => (
                    <li key={lead.id} className="border-b pb-2 last:border-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="flex justify-between items-center text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                      >
                        <span className="font-medium hover:underline truncate pr-2">
                          {lead.name}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {new Intl.NumberFormat("no-NO", {
                            style: "currency",
                            currency: "NOK",
                            maximumFractionDigits: 0,
                          }).format(lead.potensiellVerdi ?? 0)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingen leads med potensiell verdi funnet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Feed Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-500" />
                Nylig Aktivitet
              </CardTitle>
              <CardDescription>Siste hendelser i systemet</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-start space-x-3 text-sm border-b pb-3 last:border-0"
                    >
                      {/* Simple icon based on type - could be enhanced */}
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === "call" && (
                          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {activity.type === "meeting" && (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                        {activity.type === "email" && (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        )}
                        {activity.type === "note" && (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="truncate">
                          <span className="font-medium capitalize">
                            {/* Translate activity types */}
                            {activity.type === "meeting"
                              ? "Møte"
                              : activity.type === "call"
                              ? "Telefon"
                              : activity.type === "email"
                              ? "E-post"
                              : activity.type === "note"
                              ? "Notat"
                              : activity.type}{" "}
                          </span>
                          {activity.business ? (
                            <>
                              {" "}
                              med{" "}
                              <Link
                                href={`/leads/${activity.business.id}`}
                                className="hover:underline"
                              >
                                {activity.business.name}
                              </Link>
                            </>
                          ) : activity.contact ? (
                            <>
                              {" "}
                              med{" "}
                              <Link
                                href={`/contacts/${activity.contact.id}`}
                                className="hover:underline"
                              >
                                {activity.contact.name}
                              </Link>
                            </>
                          ) : (
                            "" /* No specific relation */
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.createdAt, {
                            addSuffix: true,
                            locale: nb,
                          })}
                          {activity.user?.name && ` av ${activity.user.name}`}
                        </p>
                        {/* Optional: Show description snippet? */}
                        {/* <p className="text-xs text-muted-foreground truncate">{activity.description}</p> */}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingen nylig aktivitet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline and Recent Leads - Data now reflects the current workspace */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pipeline Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pipeline Status
              </CardTitle>
              <CardDescription>
                Oversikt over leads i ulike stadier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pipeline calculations using workspace-filtered counts */}
                <div className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium">Nye leads</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-300 h-full"
                      style={{
                        width: `${
                          (leadsCount /
                            Math.max(
                              1,
                              leadsCount +
                                prospectsCount +
                                qualifiedCount +
                                customersCount // Use workspace counts
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm">{leadsCount}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium">Kontaktet</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-300 h-full"
                      style={{
                        width: `${
                          (prospectsCount /
                            Math.max(
                              1,
                              leadsCount +
                                prospectsCount +
                                qualifiedCount +
                                customersCount // Use workspace counts
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm">{prospectsCount}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium">Kvalifisert</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-300 h-full"
                      style={{
                        width: `${
                          (qualifiedCount /
                            Math.max(
                              1,
                              leadsCount +
                                prospectsCount +
                                qualifiedCount +
                                customersCount // Use workspace counts
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm">{qualifiedCount}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 text-sm font-medium">Kunder</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-green-300 h-full"
                      style={{
                        width: `${
                          (customersCount /
                            Math.max(
                              1,
                              leadsCount +
                                prospectsCount +
                                qualifiedCount +
                                customersCount // Use workspace counts
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm">{customersCount}</div>
                </div>
              </div>

              <div className="mt-6">
                {/* Link should perhaps go to a workspace-specific leads page later */}
                <Link href="/leads">
                  <Button variant="outline" className="w-full">
                    <span>Se alle leads</span>
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads - Data now reflects the current workspace */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Siste Leads</CardTitle>
              <CardDescription>
                Nylig registrerte leads i systemet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block border-b pb-3 last:border-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{lead.name}</p>
                            <Badge
                              variant={
                                lead.stage === "lead"
                                  ? "secondary"
                                  : lead.stage === "prospect"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {lead.stage === "lead"
                                ? "Ny"
                                : lead.stage === "prospect"
                                ? "Kontaktet"
                                : "Kvalifisert"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lead.contactPerson || lead.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registrert:{" "}
                            {new Date(lead.createdAt).toLocaleDateString(
                              "no-NO"
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Ingen nye leads funnet
                  </p>
                )}
              </div>

              <div className="mt-4">
                {/* Link should perhaps go to a workspace-specific new lead page later */}
                <Link href="/leads">
                  <Button disabled className="w-full">
                    <span>Opprett nytt lead</span>
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </PageLayout>
  );
}
