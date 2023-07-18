import express from "express"
import { dashBoardData } from "../controllers/DashBoard"
const dashboardRouter = express.Router()

dashboardRouter.get('/', dashBoardData)





export default dashboardRouter