"use client";
import { useState, useEffect } from "react";
import { Business } from "@/app/generated/prisma";
import { DataTable } from "@/components/lead/data-table";
import { brregColumns } from "./brreg-columns";

interface BrregClientProps {
  initial: Business[];
}

export default function BrregClient({ initial }: BrregClientProps) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);
  useEffect(() => { setData(initial); }, [initial]);

  if (loading) return <div>Loading...</div>;
  return (
    <DataTable columns={brregColumns} data={data} searchColumn="name" searchPlaceholder="Søk..." />
  );
}
