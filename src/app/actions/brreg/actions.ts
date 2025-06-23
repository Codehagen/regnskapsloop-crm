"use server";
import { prisma } from "@/lib/db";
import { Business, BrregBusiness } from "@/app/generated/prisma";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { BusinessStatus, CustomerStage } from "@/app/generated/prisma";
import path from "path";
import { categorizeNaceCode } from "@/lib/nace-mapping";

export async function getBrregBusinesses(
  limit: number = 10
): Promise<Business[]> {
  return prisma.business.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function searchBrregRegistry({
  query,
  municipality,
  orgForm,
  industrySection,
  limit = 50,
}: {
  query?: string;
  municipality?: string;
  orgForm?: string;
  industrySection?: string;
  limit?: number;
}): Promise<BrregBusiness[]> {
  return prisma.brregBusiness.findMany({
    where: {
      ...(query && { name: { contains: query, mode: "insensitive" } }),
      ...(municipality && { businessMunicipality: municipality }),
      ...(orgForm && { orgFormCode: orgForm }),
      ...(industrySection && { industrySection }),
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function searchBrregRegistryWithPagination({
  query,
  municipality,
  orgForm,
  industrySection,
  naceCode,
  vatRegistered,
  hasEmployees,
  page = 1,
  limit = 50,
}: {
  query?: string;
  municipality?: string;
  orgForm?: string;
  industrySection?: string;
  naceCode?: string;
  vatRegistered?: boolean;
  hasEmployees?: boolean;
  page?: number;
  limit?: number;
}): Promise<{
  businesses: BrregBusiness[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  const skip = (page - 1) * limit;

  const where = {
    ...(query && { name: { contains: query, mode: "insensitive" as const } }),
    ...(municipality && { businessMunicipality: municipality }),
    ...(orgForm && { orgFormCode: orgForm }),
    ...(industrySection && { industrySection }),
    ...(naceCode && { naceCode1: { startsWith: naceCode } }),
    ...(vatRegistered !== undefined && { vatRegistered }),
    ...(hasEmployees !== undefined && { hasRegisteredEmployees: hasEmployees }),
  };

  const [businesses, total] = await Promise.all([
    prisma.brregBusiness.findMany({
      where,
      take: limit,
      skip,
      orderBy: { name: "asc" },
    }),
    prisma.brregBusiness.count({ where }),
  ]);

  return {
    businesses,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getBrregFilterOptions(): Promise<{
  municipalities: string[];
  orgForms: { code: string; description: string }[];
  industrySections: { section: string; name: string }[];
  naceCodes: { code: string; description: string }[];
}> {
  const [municipalities, orgForms, industrySections, naceCodes] =
    await Promise.all([
      // Get unique municipalities
      prisma.brregBusiness.findMany({
        select: { businessMunicipality: true },
        where: { businessMunicipality: { not: null } },
        distinct: ["businessMunicipality"],
        orderBy: { businessMunicipality: "asc" },
        take: 100, // Limit to avoid too many options
      }),

      // Get unique organization forms
      prisma.brregBusiness.findMany({
        select: { orgFormCode: true, orgFormDesc: true },
        where: {
          orgFormCode: { not: null },
          orgFormDesc: { not: null },
        },
        distinct: ["orgFormCode"],
        orderBy: { orgFormCode: "asc" },
      }),

      // Get unique industry sections
      prisma.brregBusiness.findMany({
        select: { industrySection: true, industrySectionName: true },
        where: {
          industrySection: { not: null },
          industrySectionName: { not: null },
        },
        distinct: ["industrySection"],
        orderBy: { industrySection: "asc" },
      }),

      // Get unique NACE codes (first level only)
      prisma.brregBusiness.findMany({
        select: { naceCode1: true, naceDesc1: true },
        where: {
          naceCode1: { not: null },
          naceDesc1: { not: null },
        },
        distinct: ["naceCode1"],
        orderBy: { naceCode1: "asc" },
        take: 50, // Limit to main NACE codes
      }),
    ]);

  return {
    municipalities: municipalities
      .map((m) => m.businessMunicipality)
      .filter(Boolean) as string[],
    orgForms: orgForms
      .filter((o) => o.orgFormCode && o.orgFormDesc)
      .map((o) => ({
        code: o.orgFormCode!,
        description: o.orgFormDesc!,
      })),
    industrySections: industrySections
      .filter((i) => i.industrySection && i.industrySectionName)
      .map((i) => ({
        section: i.industrySection!,
        name: i.industrySectionName!,
      })),
    naceCodes: naceCodes
      .filter((n) => n.naceCode1 && n.naceDesc1)
      .map((n) => ({
        code: n.naceCode1!,
        description: n.naceDesc1!,
      })),
  };
}

export async function getBrregRegistryCount(): Promise<number> {
  return prisma.brregBusiness.count();
}

export async function importBrregData(
  limit: number = 10
): Promise<{ success: boolean; message: string; imported: number }> {
  try {
    // Path to the CSV file
    const csvPath = path.join(
      process.cwd(),
      "enheter_2025-06-23T04-21-02.425020752.csv"
    );

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      // Fallback to sample CSV
      const samplePath = path.join(
        process.cwd(),
        "scripts",
        "enheter_sample.csv"
      );
      if (!fs.existsSync(samplePath)) {
        return {
          success: false,
          message: `CSV file not found at: ${csvPath} or ${samplePath}`,
          imported: 0,
        };
      }
      return importFromSampleCsv(limit);
    }

    // Read and parse CSV
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      quote: '"',
      escape: '"',
    });

    const recordsToImport = records.slice(0, limit);
    let imported = 0;

    for (const record of recordsToImport) {
      try {
        // Get industry categorization
        const industryCategory = categorizeNaceCode(
          record["naeringskode1.kode"]
        );

        // Map CSV fields to our BrregBusiness model
        const brregData = {
          orgNumber: record["organisasjonsnummer"] || "",
          name: record["navn"] || "",
          orgFormCode: record["organisasjonsform.kode"] || "",
          orgFormDesc: record["organisasjonsform.beskrivelse"] || "",

          naceCode1: record["naeringskode1.kode"] || "",
          naceDesc1: record["naeringskode1.beskrivelse"] || "",
          naceCode2: record["naeringskode2.kode"] || "",
          naceDesc2: record["naeringskode2.beskrivelse"] || "",
          naceCode3: record["naeringskode3.kode"] || "",
          naceDesc3: record["naeringskode3.beskrivelse"] || "",

          industrySection: industryCategory?.section || null,
          industrySectionName: industryCategory?.sectionName || null,

          email: record["epostadresse"] || null,
          phone: record["telefon"] || null,
          mobile: record["mobil"] || null,
          website: record["hjemmeside"] || null,

          businessAddress: record["forretningsadresse.adresse"] || null,
          businessCity: record["forretningsadresse.poststed"] || null,
          businessPostalCode: record["forretningsadresse.postnummer"] || null,
          businessMunicipality: record["forretningsadresse.kommune"] || null,
          businessMunicipalityCode:
            record["forretningsadresse.kommunenummer"] || null,

          postalAddress: record["postadresse.adresse"] || null,
          postalCity: record["postadresse.poststed"] || null,
          postalPostalCode: record["postadresse.postnummer"] || null,
          postalMunicipality: record["postadresse.kommune"] || null,
          postalMunicipalityCode: record["postadresse.kommunenummer"] || null,

          hasRegisteredEmployees:
            record["harRegistrertAntallAnsatte"] === "true",
          numberOfEmployees: record["antallAnsatte"]
            ? parseInt(record["antallAnsatte"])
            : null,

          establishedDate: record["stiftelsesdato"]
            ? new Date(record["stiftelsesdato"])
            : null,
          registeredDate: record["registreringsdatoenhetsregisteret"]
            ? new Date(record["registreringsdatoenhetsregisteret"])
            : null,
          vatRegistered: record["registrertIMvaRegisteret"] === "true",
          isBankrupt: record["konkurs"] === "true",
          isWindingUp: record["underAvvikling"] === "true",
        };

        // Check if business already exists
        const existing = await prisma.brregBusiness.findUnique({
          where: { orgNumber: brregData.orgNumber },
        });

        if (!existing) {
          await prisma.brregBusiness.create({
            data: brregData,
          });
          imported++;
        }
      } catch (error) {
        console.error(
          `Error importing record ${record["organisasjonsnummer"]}:`,
          error
        );
      }
    }

    return {
      success: true,
      message: `Successfully imported ${imported} out of ${recordsToImport.length} BRREG businesses`,
      imported,
    };
  } catch (error) {
    console.error("Import failed:", error);
    return {
      success: false,
      message: `Import failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      imported: 0,
    };
  }
}

async function importFromSampleCsv(
  limit: number
): Promise<{ success: boolean; message: string; imported: number }> {
  const csvPath = path.join(process.cwd(), "scripts", "enheter_sample.csv");

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    quote: '"',
    escape: '"',
  });

  const recordsToImport = records.slice(0, limit);
  let imported = 0;

  for (const record of recordsToImport) {
    try {
      const industryCategory = categorizeNaceCode(record["naeringskode"]);

      const brregData = {
        orgNumber: record["organisasjonsnummer"] || "",
        name: record["navn"] || "",
        orgFormCode: record["organisasjonsform"] || "",
        orgFormDesc: record["organisasjonsform"] || "",

        naceCode1: record["naeringskode"] || "",
        naceDesc1: record["naeringsbeskrivelse"] || "",
        naceCode2: null,
        naceDesc2: null,
        naceCode3: null,
        naceDesc3: null,

        industrySection: industryCategory?.section || null,
        industrySectionName: industryCategory?.sectionName || null,

        email: record["epostadresse"] || null,
        phone: record["telefon"] || null,
        mobile: null,
        website: null,

        businessAddress: record["forretningsadresse"] || null,
        businessCity: record["poststed"] || null,
        businessPostalCode: record["postnummer"] || null,
        businessMunicipality: null,
        businessMunicipalityCode: null,

        postalAddress: null,
        postalCity: null,
        postalPostalCode: null,
        postalMunicipality: null,
        postalMunicipalityCode: null,

        hasRegisteredEmployees: null,
        numberOfEmployees: null,

        establishedDate: null,
        registeredDate: null,
        vatRegistered: null,
        isBankrupt: null,
        isWindingUp: null,
      };

      const existing = await prisma.brregBusiness.findUnique({
        where: { orgNumber: brregData.orgNumber },
      });

      if (!existing) {
        await prisma.brregBusiness.create({
          data: brregData,
        });
        imported++;
      }
    } catch (error) {
      console.error(
        `Error importing record ${record["organisasjonsnummer"]}:`,
        error
      );
    }
  }

  return {
    success: true,
    message: `Successfully imported ${imported} out of ${recordsToImport.length} BRREG businesses from sample data`,
    imported,
  };
}

export async function convertBrregToLead(
  brregId: string,
  workspaceId: string
): Promise<{ success: boolean; message: string; businessId?: string }> {
  try {
    const brregBusiness = await prisma.brregBusiness.findUnique({
      where: { id: brregId },
    });

    if (!brregBusiness) {
      return { success: false, message: "BRREG business not found" };
    }

    // Check if already converted
    const existing = await prisma.business.findFirst({
      where: { brregOrgNumber: brregBusiness.orgNumber, workspaceId },
    });

    if (existing) {
      return {
        success: false,
        message: "This company is already in your leads/customers",
      };
    }

    // Create new Business (lead) from BRREG data
    const business = await prisma.business.create({
      data: {
        name: brregBusiness.name,
        orgNumber: brregBusiness.orgNumber,
        orgForm: brregBusiness.orgFormDesc || brregBusiness.orgFormCode || "",
        industryCode: brregBusiness.naceCode1 || "",
        industry: brregBusiness.naceDesc1 || "",
        email: brregBusiness.email || "placeholder@example.com",
        phone: brregBusiness.phone || brregBusiness.mobile || "",
        website: brregBusiness.website || "",
        address: brregBusiness.businessAddress || "",
        city: brregBusiness.businessCity || "",
        postalCode: brregBusiness.businessPostalCode || "",
        country: "Norge",
        numberOfEmployees: brregBusiness.numberOfEmployees,
        vatRegistered: brregBusiness.vatRegistered,
        establishedDate: brregBusiness.establishedDate,
        isBankrupt: brregBusiness.isBankrupt,
        isWindingUp: brregBusiness.isWindingUp,
        brregUpdatedAt: new Date(),
        brregOrgNumber: brregBusiness.orgNumber,
        status: BusinessStatus.active,
        stage: CustomerStage.lead,
        workspaceId,
      },
    });

    return {
      success: true,
      message: `Successfully added ${brregBusiness.name} as a lead`,
      businessId: business.id,
    };
  } catch (error) {
    console.error("Conversion failed:", error);
    return {
      success: false,
      message: `Conversion failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
