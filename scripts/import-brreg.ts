import fs from "fs";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/db";
import { categorizeNaceCode } from "../src/lib/nace-mapping";

async function main() {
  const filePath =
    process.argv[2] || "enheter_2025-06-23T04-21-02.425020752.csv";
  const limit = Number(process.argv[3] || 10);

  console.log(`Importing from: ${filePath}, limit: ${limit}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Fallback to sample CSV
    const samplePath = "scripts/enheter_sample.csv";
    if (!fs.existsSync(samplePath)) {
      console.error(`CSV file not found at: ${filePath} or ${samplePath}`);
      process.exit(1);
    }
    return importFromSampleCsv(limit);
  }

  try {
    // Read and parse CSV
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      quote: '"',
      escape: '"',
    });

    console.log(`Found ${records.length} records in CSV`);

    let imported = 0;
    const recordsToImport = records.slice(0, limit);

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

        if (existing) {
          console.log(
            `Business ${brregData.name} (${brregData.orgNumber}) already exists, skipping`
          );
          continue;
        }

        await prisma.brregBusiness.create({
          data: brregData,
        });

        imported++;
        console.log(
          `Imported: ${brregData.name} (${brregData.orgNumber}) - Industry: ${
            industryCategory?.section || "Unknown"
          }`
        );
      } catch (error) {
        console.error(
          `Error importing record ${record["organisasjonsnummer"]}:`,
          error
        );
      }
    }

    console.log(
      `Successfully imported ${imported} out of ${recordsToImport.length} BRREG businesses`
    );
  } catch (error) {
    console.error("Error reading or parsing CSV:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function importFromSampleCsv(limit: number) {
  const filePath = "scripts/enheter_sample.csv";

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    quote: '"',
    escape: '"',
  });

  let imported = 0;
  const recordsToImport = records.slice(0, limit);

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

      if (existing) {
        console.log(
          `Business ${brregData.name} (${brregData.orgNumber}) already exists, skipping`
        );
        continue;
      }

      await prisma.brregBusiness.create({
        data: brregData,
      });

      imported++;
      console.log(
        `Imported: ${brregData.name} (${brregData.orgNumber}) - Industry: ${
          industryCategory?.section || "Unknown"
        }`
      );
    } catch (error) {
      console.error(
        `Error importing record ${record["organisasjonsnummer"]}:`,
        error
      );
    }
  }

  console.log(
    `Successfully imported ${imported} out of ${recordsToImport.length} BRREG businesses from sample data`
  );
}

main().catch((err) => {
  console.error("Script failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
