import { getBrregBusinesses } from "../actions/brreg/actions";
import BrregClient from "@/components/brreg/brreg-client";
import { PageLayout } from "@/components/page-layout";

export default async function BrregPage() {
  const data = await getBrregBusinesses(10);
  return (
    <PageLayout breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Brreg", isCurrentPage: true }] }>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Brreg Data</h1>
        <BrregClient initial={data} />
      </main>
    </PageLayout>
  );
}
