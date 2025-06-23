"use client";
import { useState, useEffect } from "react";
import { Business } from "@/app/generated/prisma";
import { DataTable } from "@/components/lead/data-table";
import { brregColumns } from "./brreg-columns";
import { Button } from "@/components/ui/button";
import {
  importBrregData,
  getBrregBusinesses,
} from "@/app/actions/brreg/actions";
import { toast } from "sonner";
import { Upload, RefreshCw } from "lucide-react";

interface BrregClientProps {
  initial: Business[];
}

export default function BrregClient({ initial }: BrregClientProps) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importBrregData(10);
      if (result.success) {
        toast.success(result.message);
        // Refresh the data
        const newData = await getBrregBusinesses(10);
        setData(newData);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const newData = await getBrregBusinesses(10);
      setData(newData);
      toast.success("Data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={handleImport}
          disabled={importing}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {importing ? "Importing..." : "Import Sample Data"}
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <DataTable
        columns={brregColumns}
        data={data}
        searchColumn="name"
        searchPlaceholder="Søk..."
      />
    </div>
  );
}
