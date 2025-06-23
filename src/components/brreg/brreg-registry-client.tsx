"use client";

import { useState, useEffect } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  searchBrregRegistryWithPagination,
  getBrregFilterOptions,
  importBrregData,
} from "@/app/actions/brreg/actions";
import { brregRegistryColumns } from "./brreg-registry-columns";
import { Search, Filter, Download, Building2 } from "lucide-react";
import { toast } from "sonner";

interface FilterOptions {
  municipalities: string[];
  orgForms: { code: string; description: string }[];
  industrySections: { section: string; name: string }[];
  naceCodes: { code: string; description: string }[];
}

interface BrregRegistryClientProps {
  initialData: {
    businesses: BrregBusiness[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  filterOptions: FilterOptions;
}

export default function BrregRegistryClient({
  initialData,
  filterOptions,
}: BrregRegistryClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // URL state management with nuqs
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [municipality, setMunicipality] = useQueryState(
    "municipality",
    parseAsString.withDefault("")
  );
  const [orgForm, setOrgForm] = useQueryState(
    "orgForm",
    parseAsString.withDefault("")
  );
  const [industrySection, setIndustrySection] = useQueryState(
    "industrySection",
    parseAsString.withDefault("")
  );
  const [naceCode, setNaceCode] = useQueryState(
    "naceCode",
    parseAsString.withDefault("")
  );
  const [vatRegistered, setVatRegistered] = useQueryState(
    "vatRegistered",
    parseAsBoolean
  );
  const [hasEmployees, setHasEmployees] = useQueryState(
    "hasEmployees",
    parseAsBoolean
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(25)
  );

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Fetch data when filters change
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await searchBrregRegistryWithPagination({
        query: query || undefined,
        municipality: municipality || undefined,
        orgForm: orgForm || undefined,
        industrySection: industrySection || undefined,
        naceCode: naceCode || undefined,
        vatRegistered: vatRegistered === null ? undefined : vatRegistered,
        hasEmployees: hasEmployees === null ? undefined : hasEmployees,
        page,
        limit: pageSize,
      });
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchData();
      } else {
        setPage(1); // Reset to page 1 when filters change
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    query,
    municipality,
    orgForm,
    industrySection,
    naceCode,
    vatRegistered,
    hasEmployees,
    pageSize,
  ]);

  // Fetch data when page changes
  useEffect(() => {
    fetchData();
  }, [page]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importBrregData(1000); // Import 1000 records
      if (result.success) {
        toast.success(result.message);
        fetchData(); // Refresh data after import
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to import data");
    } finally {
      setImporting(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setMunicipality("");
    setOrgForm("");
    setIndustrySection("");
    setNaceCode("");
    setVatRegistered(null);
    setHasEmployees(null);
    setPage(1);
  };

  const table = useReactTable({
    data: data.businesses,
    columns: brregRegistryColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true, // We handle pagination server-side
    manualFiltering: true, // We handle filtering server-side
    pageCount: data.totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({
          pageIndex: page - 1,
          pageSize: pageSize,
        });
        setPage(newPagination.pageIndex + 1);
        setPageSize(newPagination.pageSize);
      }
    },
  });

  const activeFiltersCount = [
    query,
    municipality,
    orgForm,
    industrySection,
    naceCode,
    vatRegistered,
    hasEmployees,
  ].filter((f) => f !== "" && f !== undefined).length;

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
            {data.total.toLocaleString()} companies
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Municipality */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Municipality</label>
              <Select value={municipality} onValueChange={setMunicipality}>
                <SelectTrigger>
                  <SelectValue placeholder="All municipalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All municipalities</SelectItem>
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
              <Select value={orgForm} onValueChange={setOrgForm}>
                <SelectTrigger>
                  <SelectValue placeholder="All forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All forms</SelectItem>
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
                value={industrySection}
                onValueChange={setIndustrySection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All industries</SelectItem>
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
              <Select value={naceCode} onValueChange={setNaceCode}>
                <SelectTrigger>
                  <SelectValue placeholder="All NACE codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All NACE codes</SelectItem>
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
                value={vatRegistered === null ? "" : vatRegistered.toString()}
                onValueChange={(value) =>
                  setVatRegistered(value === "" ? null : value === "true")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Has Employees</label>
              <Select
                value={
                  hasEmployees === undefined ? "" : hasEmployees.toString()
                }
                onValueChange={(value) =>
                  setHasEmployees(value === "" ? undefined : value === "true")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {data.businesses.length} of {data.total.toLocaleString()}{" "}
            results
          </span>
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {brregRegistryColumns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={brregRegistryColumns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
