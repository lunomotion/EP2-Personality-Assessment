import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return { client: new PrismaClient({ adapter }), pool }
}

if (!globalForPrisma.prisma) {
  const { client, pool } = createPrismaClient()
  globalForPrisma.prisma = client
  globalForPrisma.pool = pool
}

export const prisma = globalForPrisma.prisma

export default prisma
