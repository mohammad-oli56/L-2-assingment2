import type { Request, Response } from "express"
import { authService } from "./auth.service"
import jwt from "jsonwebtoken"
import config from "../../config"

// SIGNUP
const signupUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.setUserIntoDB(req.body)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        })

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.message
        })
    }
}


// LOGIN
const loginUser = async (req: Request, res: Response) => {
    try {
        const user = await authService.getUserLoginFromDB(req.body)

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role
            },
            config.JWT_SECRET as string,
            {
                expiresIn: "7d"
            }
        )

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user
            }
        })

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: error.message
        })
    }
}

export const authController = {
    signupUser,
    loginUser
}