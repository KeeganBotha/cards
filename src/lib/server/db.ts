import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { config } from "./config";

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
  });

// Reuse one client across dev hot reloads to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (config.NODE_ENV !== "production") globalForPrisma.prisma = db;
