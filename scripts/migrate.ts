import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sql })

await migrate(db, { migrationsFolder: "./drizzle" })
console.log("✓ Migrations applied")
process.exit(0)
