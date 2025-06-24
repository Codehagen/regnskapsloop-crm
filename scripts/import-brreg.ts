import fs from "fs";
import { parse, Parser } from "csv-parse";
import { prisma } from "../src/lib/db";
import { categorizeNaceCode } from "../src/lib/nace-mapping";
import { Transform } from "stream";

// Configuration for bulk import
const BATCH_SIZE = 100; // Process records in batches
const PROGRESS_INTERVAL = 1000; // Show progress every N records
const MAX_RETRIES = 3; // Max retries for failed batches

interface ImportStats {
  totalRecords: number;
  processedRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errorRecords: number;
  startTime: Date;
}

async function main() {
  const filePath =
    process.argv[2] || "scripts/enheter_2025-06-23T04-21-02.425020752.csv";
  const limitArg = process.argv[3];
  const skipArg = process.argv[4];

  // Handle different argument patterns
  let limit: number | null = null;
  let skip: number = 0;

  if (limitArg && limitArg !== "all") {
    limit = Number(limitArg);
  }

  if (skipArg) {
    skip = Number(skipArg);
  }

  console.log(`🚀 Starting BRREG bulk import`);
  console.log(`📁 File: ${filePath}`);
  console.log(`📊 Limit: ${limit || "unlimited"}`);
  console.log(`⏭️  Skip: ${skip}`);
  console.log(`🔄 Batch size: ${BATCH_SIZE}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV file not found at: ${filePath}`);
    const samplePath = "scripts/enheter_sample.csv";
    if (fs.existsSync(samplePath)) {
      console.log("📝 Falling back to sample CSV");
      return importFromSampleCsv(limit || 10);
    }
    process.exit(1);
  }

  // Get file size for progress tracking
  const stats = fs.statSync(filePath);
  const fileSizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2);
  console.log(`📦 File size: ${fileSizeGB} GB`);

  try {
    await importFromLargeCsv(filePath, limit, skip);
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function importFromLargeCsv(
  filePath: string,
  limit: number | null,
  skip: number
) {
  const importStats: ImportStats = {
    totalRecords: 0,
    processedRecords: 0,
    importedRecords: 0,
    skippedRecords: 0,
    errorRecords: 0,
    startTime: new Date(),
  };

  let currentBatch: any[] = [];
  let recordsSkipped = 0;

  return new Promise<void>((resolve, reject) => {
    const parser = new Parser({
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      quote: '"',
      escape: '"',
    });

    const processBatch = async (batch: any[], isLastBatch = false) => {
      if (batch.length === 0 && !isLastBatch) return;

      const batchResults = await processBatchWithRetry(batch);

      importStats.importedRecords += batchResults.imported;
      importStats.skippedRecords += batchResults.skipped;
      importStats.errorRecords += batchResults.errors;

      // Show progress
      if (
        importStats.processedRecords % PROGRESS_INTERVAL === 0 ||
        isLastBatch
      ) {
        const elapsed = Date.now() - importStats.startTime.getTime();
        const rate = ((importStats.processedRecords / elapsed) * 1000).toFixed(
          0
        );
        const progress =
          importStats.totalRecords > 0
            ? (
                (importStats.processedRecords / importStats.totalRecords) *
                100
              ).toFixed(1)
            : "?";

        console.log(`
📈 Progress Update:
   • Processed: ${importStats.processedRecords.toLocaleString()} (${progress}%)
   • Imported: ${importStats.importedRecords.toLocaleString()}
   • Skipped: ${importStats.skippedRecords.toLocaleString()}
   • Errors: ${importStats.errorRecords.toLocaleString()}
   • Rate: ${rate} records/sec
   • Elapsed: ${(elapsed / 1000 / 60).toFixed(1)} min
        `);
      }
    };

    parser.on("readable", async function () {
      let record;
      while ((record = parser.read()) !== null) {
        importStats.totalRecords++;

        // Skip records if needed
        if (recordsSkipped < skip) {
          recordsSkipped++;
          continue;
        }

        // Check limit
        if (limit && importStats.processedRecords >= limit) {
          break;
        }

        importStats.processedRecords++;
        currentBatch.push(record);

        // Process batch when it's full
        if (currentBatch.length >= BATCH_SIZE) {
          await processBatch(currentBatch);
          currentBatch = [];
        }
      }
    });

    parser.on("error", (err) => {
      console.error("❌ CSV parsing error:", err);
      reject(err);
    });

    parser.on("end", async () => {
      // Process remaining records
      if (currentBatch.length > 0) {
        await processBatch(currentBatch, true);
      }

      const elapsed = Date.now() - importStats.startTime.getTime();
      console.log(`
🎉 Import Complete!
   • Total processed: ${importStats.processedRecords.toLocaleString()}
   • Successfully imported: ${importStats.importedRecords.toLocaleString()}
   • Skipped (duplicates): ${importStats.skippedRecords.toLocaleString()}
   • Errors: ${importStats.errorRecords.toLocaleString()}
   • Total time: ${(elapsed / 1000 / 60).toFixed(1)} minutes
   • Average rate: ${((importStats.processedRecords / elapsed) * 1000).toFixed(
     0
   )} records/sec
      `);

      resolve();
    });

    // Start streaming the file
    console.log("🔄 Starting file processing...");
    fs.createReadStream(filePath).pipe(parser);
  });
}

async function processBatchWithRetry(
  batch: any[],
  retryCount = 0
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Process each record in the batch
    for (const record of batch) {
      try {
        const result = await processRecord(record);
        if (result === "imported") imported++;
        else if (result === "skipped") skipped++;
      } catch (error) {
        console.error(
          `❌ Error processing record ${record.organisasjonsnummer}:`,
          error
        );
        errors++;
      }
    }
  } catch (batchError) {
    console.error(
      `❌ Batch processing error (attempt ${retryCount + 1}):`,
      batchError
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying batch... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      ); // Exponential backoff
      return processBatchWithRetry(batch, retryCount + 1);
    } else {
      errors = batch.length; // Mark all as errors if we can't process the batch
    }
  }

  return { imported, skipped, errors };
}

async function processRecord(record: any): Promise<"imported" | "skipped"> {
  // Get industry categorization
  const industryCategory = categorizeNaceCode(record["naeringskode1.kode"]);

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

    hasRegisteredEmployees: record["harRegistrertAntallAnsatte"] === "true",
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
    return "skipped";
  }

  await prisma.brregBusiness.create({
    data: brregData,
  });

  return "imported";
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
  console.error("💥 Script failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
