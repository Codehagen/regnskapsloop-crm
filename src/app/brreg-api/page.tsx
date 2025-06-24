import {
  searchBrregApiWithPagination,
  getBrregApiFilterOptions,
  getBrregApiCount,
} from "../actions/brreg/api-actions";
import BrregApiClient from "@/components/brreg/brreg-api-client";
import { PageLayout } from "@/components/page-layout";
import { getUserWorkspaceData } from "@/lib/auth/workspace";

interface SearchParams {
  q?: string;
  municipality?: string;
  city?: string;
  orgForm?: string;
  industrySection?: string;
  naceCode?: string;
  vatRegistered?: string;
  hasEmployees?: string;
  page?: string;
  pageSize?: string;
}

export default async function BrregApiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = parseInt(resolvedSearchParams.pageSize || "25");

  const [data, filterOptions, { workspaceId }] = await Promise.all([
    searchBrregApiWithPagination({
      query: resolvedSearchParams.q,
      municipality: resolvedSearchParams.municipality,
      city: resolvedSearchParams.city,
      orgForm: resolvedSearchParams.orgForm,
      industrySection: resolvedSearchParams.industrySection,
      naceCode: resolvedSearchParams.naceCode,
      vatRegistered:
        resolvedSearchParams.vatRegistered === "true"
          ? true
          : resolvedSearchParams.vatRegistered === "false"
          ? false
          : undefined,
      hasEmployees:
        resolvedSearchParams.hasEmployees === "true"
          ? true
          : resolvedSearchParams.hasEmployees === "false"
          ? false
          : undefined,
      page,
      limit: pageSize,
    }),
    getBrregApiFilterOptions(),
    getUserWorkspaceData(),
  ]);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Dashbord", href: "/" },
        { label: "BRREG API Live", isCurrentPage: true },
      ]}
    >
      <main className="container mx-auto p-6">
        {/* <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">BRREG API Live Data</h1>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live API
            </div>
          </div>
          <p className="text-muted-foreground">
            Search Norwegian companies directly from Brønnøysundregistrene's
            live API. Data is fetched in real-time from the official registry.
          </p>
        </div> */}

        <BrregApiClient
          initialData={data}
          filterOptions={filterOptions}
          workspaceId={workspaceId}
        />
      </main>
    </PageLayout>
  );
}
