import type { Response } from "express"

interface TErrorResponse {
    success : boolean
    statusCode: number
    message: string
    errors?: any
}

const sendError = (
    res: Response,
    errorData: TErrorResponse
) => {

    res.status(errorData.statusCode).json({
        success: false,
        message: errorData.message,
        errors: errorData.errors
    })
}

export default sendError