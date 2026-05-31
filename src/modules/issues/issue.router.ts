import { Router, } from "express";

import { authJWT } from "../../Middleware/auth.jwt";
import { issueController } from "./issue.controller";
import { checkRole } from "../../Middleware/role";


const router = Router()

router.post('/', authJWT, issueController.createIssue)
router.get('/', issueController.getAllIssues)
router.get("/:id", issueController.getSingleIssue)
router.patch( "/:id",authJWT,issueController.updateIssue)
router.delete("/:id",authJWT,checkRole("maintainer"),issueController.deleteIssue
)


export const issuesRoute = router