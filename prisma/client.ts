// src/lib/prisma.ts or src/utils/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prevent multiple instances in development (e.g., due to hot reload in dev tools like Nodemon)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Optional: enable logging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
