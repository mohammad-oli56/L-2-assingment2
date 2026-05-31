import jwt from "jsonwebtoken";
import config from "../config";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "../utills/Interface/Interface";

export interface AuthRequest extends Request{
    user ? : JwtPayload
} 


export const authJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;

    //   console.log("authHeader",authHeader)

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

      

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        const decoded = jwt.verify(
            token,
            config.JWT_SECRET as string
        ) as JwtPayload;

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};