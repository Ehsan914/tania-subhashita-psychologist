import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.adminUser.findMany();
  console.log('Admin users found:', users.length);
  for (const u of users) {
    console.log(`  - ${u.email} (name: ${u.name}, id: ${u.id})`);
  }
  if (users.length === 0) {
    console.log('No admin users found! You need to re-seed or create one.');
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
