"use client";
import React from "react";
import { AppLayout } from "@/components/app-layout";
import { PageHeader, BreadcrumbItem } from "@/components/page-header";

interface PageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ breadcrumbs, children, className }: PageLayoutProps) {
  return (
    <AppLayout>
      <PageHeader items={breadcrumbs} className={className} />
      {children}
    </AppLayout>
  );
}
