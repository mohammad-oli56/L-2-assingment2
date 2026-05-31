import pool from "../../DB/db"
import bcrypt from "bcryptjs"

const setUserIntoDB = async (payload: any) => {
    const { name, email, password, role } = payload

    // check existing user
    const checkUser = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    )

    if (checkUser.rows.length > 0) {
        throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at, updated_at`,
        [name, email, hashedPassword, role || "contributor"]
    )

    return result.rows[0]
}


// LOGIN
const getUserLoginFromDB = async (payload: any) => {
    const { email, password } = payload

    const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    )

    if (userResult.rows.length === 0) {
        throw new Error("Invalid email or password")
    }

    const user = userResult.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Invalid email or password")
    }

    delete user.password

    return user
}

export const authService = {
    setUserIntoDB,
    getUserLoginFromDB
}