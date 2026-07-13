import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

declare global {
  var prismaClient: PrismaClient | undefined;
}

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

export const prisma =
  globalThis.prismaClient ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}
