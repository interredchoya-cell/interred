import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null
  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient()
    }
    return globalForPrisma.prisma
  } catch (e) {
    return null
  }
}

export const prisma = globalForPrisma.prisma ?? (process.env.DATABASE_URL ? getPrisma() : null)
