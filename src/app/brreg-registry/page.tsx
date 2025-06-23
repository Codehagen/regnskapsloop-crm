import {
  searchBrregRegistryWithPagination,
  getBrregFilterOptions,
  getBrregRegistryCount,
} from "../actions/brreg/actions";
import BrregRegistrySimpleClient from "@/components/brreg/brreg-registry-simple-client";
import { PageLayout } from "@/components/page-layout";
interface SearchParams {
  q?: string;
  municipality?: string;
  orgForm?: string;
  industrySection?: string;
  naceCode?: string;
  vatRegistered?: string;
  hasEmployees?: string;
  page?: string;
  pageSize?: string;
}

export default async function BrregRegistryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "25");

  const [data, filterOptions] = await Promise.all([
    searchBrregRegistryWithPagination({
      query: searchParams.q,
      municipality: searchParams.municipality,
      orgForm: searchParams.orgForm,
      industrySection: searchParams.industrySection,
      naceCode: searchParams.naceCode,
      vatRegistered:
        searchParams.vatRegistered === "true"
          ? true
          : searchParams.vatRegistered === "false"
          ? false
          : undefined,
      hasEmployees:
        searchParams.hasEmployees === "true"
          ? true
          : searchParams.hasEmployees === "false"
          ? false
          : undefined,
      page,
      limit: pageSize,
    }),
    getBrregFilterOptions(),
  ]);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "BRREG Registry", isCurrentPage: true },
      ]}
    >
      <main className="container mx-auto p-6">
        <BrregRegistrySimpleClient
          initialData={data}
          filterOptions={filterOptions}
        />
      </main>
    </PageLayout>
  );
}
