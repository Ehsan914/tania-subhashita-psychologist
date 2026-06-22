import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function check() {
  const hero = await prisma.heroSection.findFirst();
  console.log('portraitImageUrl:', JSON.stringify(hero?.portraitImageUrl));
  await (prisma as any)['$disconnect']();
}
check();
