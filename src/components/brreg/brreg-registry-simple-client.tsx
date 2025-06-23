"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrregBusiness } from "@/app/generated/prisma";
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
import { importBrregData } from "@/app/actions/brreg/actions";
import { BrregRegistryDataTable } from "./brreg-registry-data-table";
import {
  Search,
  Filter,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface FilterOptions {
  municipalities: string[];
  orgForms: { code: string; description: string }[];
  industrySections: { section: string; name: string }[];
  naceCodes: { code: string; description: string }[];
}

interface BrregRegistrySimpleClientProps {
  initialData: {
    businesses: BrregBusiness[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  filterOptions: FilterOptions;
}

export default function BrregRegistrySimpleClient({
  initialData,
  filterOptions,
}: BrregRegistrySimpleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importBrregData(1000);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to import data");
    } finally {
      setImporting(false);
    }
  };

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
    router.push("/brreg-registry");
  };

  const currentQuery = searchParams.get("q") || "";
  const currentMunicipality = searchParams.get("municipality") || "all";
  const currentOrgForm = searchParams.get("orgForm") || "all";
  const currentIndustrySection = searchParams.get("industrySection") || "all";
  const currentNaceCode = searchParams.get("naceCode") || "all";
  const currentVatRegistered = searchParams.get("vatRegistered") || "all";
  const currentHasEmployees = searchParams.get("hasEmployees") || "all";

  const activeFiltersCount = [
    currentQuery,
    currentMunicipality !== "all" ? currentMunicipality : "",
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
          <h2 className="text-2xl font-semibold tracking-tight">
            Norwegian Business Registry
          </h2>
          <p className="text-sm text-muted-foreground">
            Search and explore companies from the Norwegian BRREG database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {initialData.total.toLocaleString()} companies
          </Badge>
          <Button onClick={handleImport} disabled={importing} size="sm">
            <Download className="mr-2 h-4 w-4" />
            {importing ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>
                Filter companies by various criteria
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} active filter
                  {activeFiltersCount !== 1 ? "s" : ""}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company names..."
              value={currentQuery}
              onChange={(e) => updateSearchParams("q", e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Municipality */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Municipality</label>
              <Select
                value={currentMunicipality}
                onValueChange={(value) =>
                  updateSearchParams("municipality", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All municipalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All municipalities</SelectItem>
                  {filterOptions.municipalities.map((muni) => (
                    <SelectItem key={muni} value={muni}>
                      {muni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Organization Form */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Form</label>
              <Select
                value={currentOrgForm}
                onValueChange={(value) => updateSearchParams("orgForm", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All forms</SelectItem>
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
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={currentIndustrySection}
                onValueChange={(value) =>
                  updateSearchParams("industrySection", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {filterOptions.industrySections.map((industry) => (
                    <SelectItem key={industry.section} value={industry.section}>
                      {industry.section}: {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NACE Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">NACE Code</label>
              <Select
                value={currentNaceCode}
                onValueChange={(value) => updateSearchParams("naceCode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All NACE codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All NACE codes</SelectItem>
                  {filterOptions.naceCodes.map((nace) => (
                    <SelectItem key={nace.code} value={nace.code}>
                      {nace.code} - {nace.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">VAT Registered</label>
              <Select
                value={currentVatRegistered}
                onValueChange={(value) =>
                  updateSearchParams("vatRegistered", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Has Employees</label>
              <Select
                value={currentHasEmployees}
                onValueChange={(value) =>
                  updateSearchParams("hasEmployees", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {initialData.businesses.length} of{" "}
            {initialData.total.toLocaleString()} results
          </span>
        </div>

        {/* Pagination */}
        {initialData.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(initialData.currentPage - 1)}
              disabled={initialData.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {initialData.currentPage} of {initialData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(initialData.currentPage + 1)}
              disabled={initialData.currentPage >= initialData.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <BrregRegistryDataTable businesses={initialData.businesses} />

      {/* Bottom Pagination */}
      {initialData.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={initialData.currentPage <= 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(initialData.currentPage - 1)}
              disabled={initialData.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {initialData.currentPage} of {initialData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(initialData.currentPage + 1)}
              disabled={initialData.currentPage >= initialData.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(initialData.totalPages)}
              disabled={initialData.currentPage >= initialData.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
