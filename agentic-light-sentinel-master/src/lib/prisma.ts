import { PrismaClient } from "@prisma/client";

// Force TypeScript to use the full type
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
