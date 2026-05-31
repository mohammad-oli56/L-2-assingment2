import { Pool } from "pg"
import config from "../config"

const pool = new Pool({
  connectionString: config.DATABASE_URL
})

console.log("database connect successfully")

export default pool