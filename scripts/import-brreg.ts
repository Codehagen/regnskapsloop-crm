import fs from 'fs';
import readline from 'readline';
import { prisma } from '../src/lib/db';
import { BusinessStatus, CustomerStage } from '../src/app/generated/prisma';

async function main() {
  const filePath = process.argv[2];
  const limit = Number(process.argv[3] || 10);
  if (!filePath) {
    console.error('Usage: tsx scripts/import-brreg.ts <path> [limit]');
    process.exit(1);
  }

  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    throw new Error('No workspace found');
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let line = 0;
  let headers: string[] = [];

  for await (const row of rl) {
    if (line === 0) {
      headers = row.split(',');
      line++;
      continue;
    }
    if (row.trim() === '' || line > limit) break;
    const values = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
    const record = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));

    await prisma.business.create({
      data: {
        name: record['navn'],
        orgNumber: record['organisasjonsnummer'],
        orgForm: record['organisasjonsform'],
        industryCode: record['naeringskode'],
        industry: record['naeringsbeskrivelse'],
        email: record['epostadresse'] || '',
        phone: record['telefon'] || '',
        address: record['forretningsadresse'],
        city: record['poststed'],
        postalCode: record['postnummer'],
        status: BusinessStatus.active,
        stage: CustomerStage.lead,
        workspaceId: workspace.id,
      },
    });
    line++;
  }

  await prisma.$disconnect();
  console.log(`Imported ${line - 1} records`);
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
