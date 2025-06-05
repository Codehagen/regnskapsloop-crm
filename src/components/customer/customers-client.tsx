"use client";

import { useState, useEffect } from "react";
import { Business } from "@/app/generated/prisma";
import { DataTable } from "@/components/lead/data-table";
import { customerColumns } from "./customer-columns";
import { CustomersTableSkeleton } from "./customers-skeleton";

interface CustomersClientProps {
  initialCustomers: Business[];
}

export default function CustomersClient({
  initialCustomers,
}: CustomersClientProps) {
  const [customers, setCustomers] = useState<Business[]>(initialCustomers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  const renderContent = () => {
    if (loading) {
      return <CustomersTableSkeleton />;
    }

    if (customers.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          Ingen kunder funnet.
        </div>
      );
    }

    return (
      <DataTable
        columns={customerColumns}
        data={customers}
        searchColumn="name"
        searchPlaceholder="Søk etter kunder..."
      />
    );
  };

  return <main>{renderContent()}</main>;
}
