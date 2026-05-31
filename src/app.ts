import express, { type Application, type Request, type Response } from "express"
import { issuesRoute } from "./modules/issues/issue.router"
import { authRouter } from "./modules/auth/auth.router"
const app :Application = express()

app.use(express.json())

app.use('/api/issues',issuesRoute)

app.use('/api/auth',authRouter)

app.get('/',async(req:Request,res:Response)=>{
    res.send("connect")
})


export default app