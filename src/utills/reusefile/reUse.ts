import type { Response } from "express";

export interface TResponse<T> {
    success: boolean
    message: string
    data?: T
    statusCode: number
}

const SendResponse = <T>( res: Response, data: TResponse<T>) => {

    return res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data
    })

}

export default SendResponse