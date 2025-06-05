import { AppLayout } from "@/components/app-layout";

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
