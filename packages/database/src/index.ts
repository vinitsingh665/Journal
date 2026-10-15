import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Resilient database operation wrapper with retry.
 * Handles transient cold-start / wake-up delays on serverless databases (e.g. TiDB Cloud Serverless).
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isConnectionError =
        err?.name === "PrismaClientInitializationError" ||
        (typeof err?.message === "string" && (
          err.message.includes("Can't reach database server") ||
          err.message.includes("Connection lost") ||
          err.message.includes("ETIMEDOUT") ||
          err.message.includes("ECONNRESET")
        )) ||
        err?.code === "P1001" ||
        err?.code === "P1017";

      if (isConnectionError && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export * from "@prisma/client";
export default prisma;

