"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrregRegistryDataTable } from "./brreg-registry-data-table";
import {
  Search,
  Filter,
  Building2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Globe,
} from "lucide-react";

interface FilterOptions {
  municipalities: string[];
  cities: string[];
  orgForms: { code: string; description: string }[];
  industrySections: { section: string; name: string }[];
  naceCodes: { code: string; description: string }[];
}

interface BrregApiClientProps {
  initialData: {
    businesses: any[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  filterOptions: FilterOptions;
  workspaceId: string;
}

export default function BrregApiClient({
  initialData,
  filterOptions,
  workspaceId,
}: BrregApiClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filters change
    router.push(`?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/brreg-api");
  };

  const currentQuery = searchParams.get("q") || "";
  const currentMunicipality = searchParams.get("municipality") || "all";
  const currentCity = searchParams.get("city") || "all";
  const currentOrgForm = searchParams.get("orgForm") || "all";
  const currentIndustrySection = searchParams.get("industrySection") || "all";
  const currentNaceCode = searchParams.get("naceCode") || "all";
  const currentVatRegistered = searchParams.get("vatRegistered") || "all";
  const currentHasEmployees = searchParams.get("hasEmployees") || "all";

  const activeFiltersCount = [
    currentQuery,
    currentMunicipality !== "all" ? currentMunicipality : "",
    currentCity !== "all" ? currentCity : "",
    currentOrgForm !== "all" ? currentOrgForm : "",
    currentIndustrySection !== "all" ? currentIndustrySection : "",
    currentNaceCode !== "all" ? currentNaceCode : "",
    currentVatRegistered !== "all" ? currentVatRegistered : "",
    currentHasEmployees !== "all" ? currentHasEmployees : "",
  ].filter((f) => f !== "").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              BRREG Live API
            </h2>
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
            >
              <Wifi className="h-3 w-3" />
              Live Data
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Søk norske bedrifter direkte fra Brønnøysundregistrenes offisielle
            API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {initialData.total.toLocaleString()} bedrifter funnet
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://data.brreg.no/enhetsregisteret/api/dokumentasjon/no/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              API Docs
            </a>
          </Button>
        </div>
      </div>

      {/* API Status */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Tilkoblet BRREG API
                </span>
              </div>
              <div className="text-xs text-green-600">
                data.brreg.no/enhetsregisteret/api
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-green-700">
              <div>
                <span className="font-medium">Sidestørrelse:</span>{" "}
                {initialData.businesses.length}
              </div>
              <div>
                <span className="font-medium">Gjeldende side:</span>{" "}
                {initialData.currentPage}
              </div>
              <div>
                <span className="font-medium">Totalt antall sider:</span>{" "}
                {initialData.totalPages}
              </div>
              <div>
                <span className="font-medium">Totale resultater:</span>{" "}
                {initialData.total.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Søk og filtre</CardTitle>
              <CardDescription>
                Filtrer bedrifter fra det live BRREG registeret
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} aktive filter
                  {activeFiltersCount !== 1 ? "e" : ""}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Fjern alle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk bedriftsnavn..."
              value={currentQuery}
              onChange={(e) => updateSearchParams("q", e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Municipality */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kommune</label>
              <Select
                value={currentMunicipality}
                onValueChange={(value) =>
                  updateSearchParams("municipality", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle kommuner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kommuner</SelectItem>
                  {filterOptions.municipalities.map((muni) => (
                    <SelectItem key={muni} value={muni}>
                      {muni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm font-medium">By</label>
              <Select
                value={currentCity}
                onValueChange={(value) => updateSearchParams("city", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle byer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle byer</SelectItem>
                  {filterOptions.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Organization Form */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organisasjonsform</label>
              <Select
                value={currentOrgForm}
                onValueChange={(value) => updateSearchParams("orgForm", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle former" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle former</SelectItem>
                  {filterOptions.orgForms.map((form) => (
                    <SelectItem key={form.code} value={form.code}>
                      {form.code} - {form.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bransje</label>
              <Select
                value={currentIndustrySection}
                onValueChange={(value) =>
                  updateSearchParams("industrySection", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle bransjer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle bransjer</SelectItem>
                  {filterOptions.industrySections.map((section) => (
                    <SelectItem key={section.section} value={section.section}>
                      {section.section} - {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NACE Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">NACE-kode</label>
              <Select
                value={currentNaceCode}
                onValueChange={(value) => updateSearchParams("naceCode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle koder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle koder</SelectItem>
                  {filterOptions.naceCodes.map((nace) => (
                    <SelectItem key={nace.code} value={nace.code}>
                      {nace.code} - {nace.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VAT Registered */}
            <div className="space-y-2">
              <label className="text-sm font-medium">MVA-status</label>
              <Select
                value={currentVatRegistered}
                onValueChange={(value) =>
                  updateSearchParams("vatRegistered", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="true">MVA-registrert</SelectItem>
                  <SelectItem value="false">Ikke MVA-registrert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Employees */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ansatte</label>
              <Select
                value={currentHasEmployees}
                onValueChange={(value) =>
                  updateSearchParams("hasEmployees", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="true">Har ansatte</SelectItem>
                  <SelectItem value="false">Ingen ansatte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                Søkeresultater
                <Badge variant="outline" className="text-xs">
                  Side {initialData.currentPage} av {initialData.totalPages}
                </Badge>
              </CardTitle>
              <CardDescription>
                {initialData.total > 0 ? (
                  <>
                    Viser {initialData.businesses.length} bedrifter (Side{" "}
                    {initialData.currentPage} av {initialData.totalPages}) -{" "}
                    {initialData.total.toLocaleString()} totalt funnet
                  </>
                ) : (
                  "Ingen bedrifter funnet med gjeldende filtre"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BrregRegistryDataTable
            businesses={initialData.businesses}
            workspaceId={workspaceId}
          />

          {/* Pagination Controls */}
          {initialData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Side {initialData.currentPage} av {initialData.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={initialData.currentPage <= 1}
                >
                  Første
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(initialData.currentPage - 1)}
                  disabled={initialData.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Forrige
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, initialData.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(
                            initialData.totalPages - 4,
                            initialData.currentPage - 2
                          )
                        ) + i;

                      if (pageNum > initialData.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === initialData.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(initialData.currentPage + 1)}
                  disabled={initialData.currentPage >= initialData.totalPages}
                >
                  Neste
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(initialData.totalPages)}
                  disabled={initialData.currentPage >= initialData.totalPages}
                >
                  Siste
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
