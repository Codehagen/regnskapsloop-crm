"use client";

import { useState } from "react";
import { Business } from "@/app/generated/prisma";
import {
  Building2,
  ExternalLink,
  FileText,
  Globe,
  BarChart4,
  Search,
  Info,
  Users,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Briefcase,
  BarChart2,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface LeadProffInfoProps {
  lead: Business;
}

// Sample data types - in a real implementation, these would match the actual API response
interface ProffData {
  orgNumber: string;
  companyName: string;
  industry: string;
  foundedYear: number;
  address: string;
  postalCode: string;
  city: string;
  website: string;
  employeeCount: number;
  lastYearRevenue: number;
  lastYearProfit: number;
  creditScore: {
    score: number;
    description: string;
    rating: "A" | "B" | "C" | "D" | "E";
  };
  roles: {
    name: string;
    title: string;
  }[];
  financials: {
    year: number;
    revenue: number;
    profit: number;
    equityRatio: number;
  }[];
}

export function LeadProffInfo({ lead }: LeadProffInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prodsData, setProffData] = useState<ProffData | null>(null);

  // Function to fetch Proff data
  const fetchProffData = async () => {
    if (!lead.orgNumber) return;

    setIsLoading(true);
    toast.info("Henter data fra Proff.no...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would be an API call to fetch Proff data
      // Example data for demonstration
      const mockData: ProffData = {
        orgNumber: lead.orgNumber,
        companyName: lead.name,
        industry: "IT og Teknologitjenester",
        foundedYear: 2015,
        address: lead.address || "Storgata 10",
        postalCode: lead.postalCode || "0182",
        city: lead.city || "Oslo",
        website: lead.website || "www.example.com",
        employeeCount: 24,
        lastYearRevenue: 12500000,
        lastYearProfit: 2750000,
        creditScore: {
          score: 85,
          description: "God kredittverdighet",
          rating: "B",
        },
        roles: [
          { name: "Pål Hansen", title: "Daglig leder" },
          { name: "Line Andersen", title: "Styreleder" },
          { name: "Morten Olsen", title: "CFO" },
        ],
        financials: [
          { year: 2022, revenue: 12500000, profit: 2750000, equityRatio: 42 },
          { year: 2021, revenue: 10200000, profit: 1850000, equityRatio: 38 },
          { year: 2020, revenue: 8500000, profit: 950000, equityRatio: 35 },
        ],
      };

      setProffData(mockData);
      toast.success("Data fra Proff.no ble hentet");
    } catch (error) {
      console.error("Error fetching Proff data:", error);
      toast.error("Kunne ikke hente data fra Proff.no");
    } finally {
      setIsLoading(false);
    }
  };

  // Format number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            Proff.no Informasjon
            <Badge variant="outline" className="ml-1">
              Ekstern
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Hent oppdatert selskapsdata og økonomisk informasjon fra Proff.no
          </p>
        </div>

        <Button
          variant="default"
          onClick={fetchProffData}
          disabled={isLoading || !lead.orgNumber}
          className="gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isLoading ? "Henter data..." : "Hent oppdatert info"}
        </Button>
      </div>

      {!prodsData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Selskapsdata for {lead.name}
            </CardTitle>
            <CardDescription>
              Hent oppdatert informasjon om selskapet fra Proff.no
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex flex-col items-center">
                  <BuildingIcon size={48} />
                  <h3 className="text-lg font-medium mt-4">
                    {lead.orgNumber
                      ? "Ingen data hentet ennå"
                      : "Mangler organisasjonsnummer"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    {lead.orgNumber
                      ? 'Klikk på "Hent oppdatert info" for å se selskapsdata fra Proff.no'
                      : "Legg til organisasjonsnummer for å hente data fra Proff.no"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2"
                    disabled={!lead.orgNumber}
                  >
                    <a
                      href={`https://proff.no/bransjesøk?q=${
                        lead.orgNumber || ""
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Search className="h-4 w-4" /> Søk med org.nummer
                    </a>
                  </Button>

                  <Button variant="outline" asChild className="gap-2">
                    <a
                      href={`https://proff.no/bransjesøk?q=${encodeURIComponent(
                        lead.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Search className="h-4 w-4" /> Søk med navn
                    </a>
                  </Button>
                </div>

                <Button variant="default" asChild className="mt-8 gap-2">
                  <a
                    href="https://proff.no"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" /> Åpne Proff.no
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Display Proff data when available
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Oversikt</TabsTrigger>
            <TabsTrigger value="financials">Økonomi</TabsTrigger>
            <TabsTrigger value="roles">Roller</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    {prodsData.companyName}
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://proff.no/bransjesøk?q=${prodsData.orgNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Proff.no
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Info className="h-4 w-4" /> Grunnleggende informasjon
                      </h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between border-b pb-1 border-dashed">
                          <dt className="text-sm">Org.nummer:</dt>
                          <dd className="text-sm font-medium">
                            {prodsData.orgNumber}
                          </dd>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-dashed">
                          <dt className="text-sm">Bransje:</dt>
                          <dd className="text-sm font-medium">
                            {prodsData.industry}
                          </dd>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-dashed">
                          <dt className="text-sm">Etablert:</dt>
                          <dd className="text-sm font-medium">
                            {prodsData.foundedYear}
                          </dd>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-dashed">
                          <dt className="text-sm">Antall ansatte:</dt>
                          <dd className="text-sm font-medium">
                            {prodsData.employeeCount}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Adresse
                      </h4>
                      <address className="not-italic text-sm">
                        {prodsData.address}
                        <br />
                        {prodsData.postalCode} {prodsData.city}
                      </address>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Globe className="h-4 w-4" /> Nettside
                      </h4>
                      <a
                        href={
                          prodsData.website.startsWith("http")
                            ? prodsData.website
                            : `https://${prodsData.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {prodsData.website}
                      </a>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <CircleDollarSign className="h-4 w-4" /> Siste
                        regnskapsår
                      </h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm">Omsetning (2022):</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(prodsData.lastYearRevenue)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm">Resultat (2022):</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(prodsData.lastYearProfit)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-muted-foreground" />
                  Kredittverdighet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                      flex items-center justify-center rounded-full h-24 w-24 text-2xl font-bold
                      ${getCreditScoreColor(prodsData.creditScore.rating)}
                    `}
                    >
                      {prodsData.creditScore.rating}
                    </div>
                    <p className="text-sm font-medium mt-2">
                      {prodsData.creditScore.description}
                    </p>
                  </div>

                  <div className="flex-1 max-w-sm">
                    <p className="text-sm text-muted-foreground mb-2">
                      Kredittverdigheten er en indikasjon på selskapets
                      betalingsevne og økonomiske stabilitet.
                    </p>
                    <div className="w-full bg-muted rounded-full h-4 mt-2">
                      <div
                        className={`h-4 rounded-full ${getCreditScoreProgressColor(
                          prodsData.creditScore.rating
                        )}`}
                        style={{ width: `${prodsData.creditScore.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Lav</span>
                      <span className="text-xs text-muted-foreground">Høy</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-muted-foreground" />
                  Økonomiske nøkkeltall
                </CardTitle>
                <CardDescription>
                  Historiske regnskapstall for {prodsData.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium text-sm py-2">
                          År
                        </th>
                        <th className="text-right font-medium text-sm py-2">
                          Omsetning
                        </th>
                        <th className="text-right font-medium text-sm py-2">
                          Resultat
                        </th>
                        <th className="text-right font-medium text-sm py-2">
                          Egenkapitalandel
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prodsData.financials.map((year) => (
                        <tr key={year.year} className="border-b border-dashed">
                          <td className="py-3 text-sm">{year.year}</td>
                          <td className="py-3 text-sm text-right">
                            {formatCurrency(year.revenue)}
                          </td>
                          <td className="py-3 text-sm text-right">
                            {formatCurrency(year.profit)}
                          </td>
                          <td className="py-3 text-sm text-right">
                            {year.equityRatio}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Utvikling i omsetning og resultat
                  </h4>
                  <div className="h-48 w-full flex items-end gap-2">
                    {prodsData.financials
                      .slice()
                      .reverse()
                      .map((year) => (
                        <div
                          key={year.year}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div className="w-full flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-blue-100 rounded-t"
                              style={{
                                height: `${(year.revenue / 15000000) * 100}%`,
                              }}
                            ></div>
                            <div
                              className={`w-full ${
                                year.profit > 0 ? "bg-green-100" : "bg-red-100"
                              } rounded-t`}
                              style={{
                                height: `${
                                  (Math.abs(year.profit) / 3000000) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium mt-1">
                            {year.year}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-center mt-2 gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span className="text-xs">Omsetning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <span className="text-xs">Resultat</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Roller og personer
                </CardTitle>
                <CardDescription>
                  Nøkkelpersoner i {prodsData.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {prodsData.roles.map((role, index) => (
                    <Card
                      key={index}
                      className="border bg-card overflow-hidden"
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        <CardDescription>{role.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                          >
                            <Search className="h-3.5 w-3.5" /> Se i proff.no
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Helper function to render a custom building icon
function BuildingIcon({ size = 24 }) {
  return (
    <div className="relative flex items-center justify-center h-20 w-20 rounded-xl bg-muted/50">
      <Building2 className="h-10 w-10 text-muted-foreground" />
    </div>
  );
}

// Helper function to get color based on credit rating
function getCreditScoreColor(rating: "A" | "B" | "C" | "D" | "E") {
  switch (rating) {
    case "A":
      return "bg-green-50 text-green-700 border border-green-200";
    case "B":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "C":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "D":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "E":
      return "bg-red-50 text-red-700 border border-red-200";
  }
}

// Helper function to get progress bar color based on credit rating
function getCreditScoreProgressColor(rating: "A" | "B" | "C" | "D" | "E") {
  switch (rating) {
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-blue-500";
    case "C":
      return "bg-yellow-500";
    case "D":
      return "bg-orange-500";
    case "E":
      return "bg-red-500";
  }
}
