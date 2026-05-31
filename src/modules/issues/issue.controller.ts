import type { Request, Response } from "express"
import { issueService } from "./issue.service"

import sendResponse from "../../utills/reusefile/reUse"
import sendError from "../../utills/reusefile/reUseError"

// CREATE ISSUE
const createIssue = async (req: any, res: Response) => {

    try {

        const result = await issueService.createIssueInToDB({
            ...req.body,
            user: req.user
        })

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result
        })

    } catch (error: any) {

        sendError(res, {
            statusCode: 400,
            success: false,
            message: error.message,
            errors: error.message
        })

    }
}


// GET ALL ISSUES
const getAllIssues = async (
    req: Request,
    res: Response
) => {

    try {

        const result =
            await issueService.getAllIssuesFromDB(req.query)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully",
            data: result
        })

    } catch (error: any) {

        sendError(res, {
            statusCode: 400,
            success: false,
            message: error.message,
            errors: error.message
        })

    }
}


// GET SINGLE ISSUE
const getSingleIssue = async (
    req: Request,
    res: Response
) => {

    try {

        const id = req.params.id as string

        const result =
            await issueService.getSingleIssueFromDB(id)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue retrieved successfully",
            data: result
        })

    } catch (error: any) {

        sendError(res, {
            statusCode: 404,
            success: false,
            message: error.message,
            errors: error.message
        })

    }
}


// UPDATE ISSUE
const updateIssue = async (
    req: any,
    res: Response
) => {

    try {

        const id = req.params.id as string

        const result =
            await issueService.updateIssueIntoDB(
                id,
                req.body,
                req.user
            )

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: result
        })

    } catch (error: any) {

        sendError(res, {
            statusCode: 400,
            success: false,
            message: error.message,
            errors: error.message
        })

    }
}


// DELETE ISSUE
const deleteIssue = async (
    req: Request,
    res: Response
) => {

    try {

        const id = req.params.id as string

        await issueService.deleteIssueFromDB(id)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully"
        })

    } catch (error: any) {

        sendError(res, {
            statusCode: 400,
            success: false,
            message: error.message,
            errors: error.message
        })

    }
}


export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}