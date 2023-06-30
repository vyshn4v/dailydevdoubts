import express from "express"
const answerRouter = express.Router()
import { answerQuestion } from "../controllers/Answer"

answerRouter.post('/', answerQuestion)


export default answerRouter