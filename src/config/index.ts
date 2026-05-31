import dotenv from "dotenv"
// .env shate connect kore
dotenv.config()

const config ={
    PORT : process.env.PORT,
    DATABASE_URL : process.env.DATABASE_URL,
    JWT_SECRET : process.env.JWT_SECRET as string
}

export default config