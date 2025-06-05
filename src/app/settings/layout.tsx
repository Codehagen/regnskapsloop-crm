import { AppLayout } from "@/components/app-layout";

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
