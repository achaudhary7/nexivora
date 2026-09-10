import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * **Prisma 7 moved the datasource URL out of `schema.prisma`** (ADR-002 predicted
 * exactly this). The connection string now lives in two places for two different
 * consumers, and conflating them is the mistake to avoid:
 *
 *   - **Here**, for the CLI — `prisma migrate`, `prisma studio`, `prisma db push`.
 *   - **In a driver adapter** passed to `new PrismaClient({ adapter })` at
 *     runtime — see `src/lib/db/client.ts`.
 *
 * `schema.prisma` now declares only the provider.
 *
 * Migrations deliberately run as a different, more privileged database user than
 * the application (docs/SECURITY.md §9), which is another reason these two URLs
 * are separate rather than shared.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --experimental-strip-types prisma/seed/index.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
