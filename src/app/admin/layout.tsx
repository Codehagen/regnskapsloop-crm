import { AppLayout } from "@/components/app-layout";
import { isSuperAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <AppLayout>{children}</AppLayout>;
}