import express from "express"
const answerRouter = express.Router()
import { answerQuestion, editAnswer, editRequest, voteAnswer } from "../controllers/Answer"

answerRouter.post('/', answerQuestion)
answerRouter.put('/vote', voteAnswer)
answerRouter.put('/', editAnswer)
answerRouter.post('/edit-request', editRequest)


export default answerRouter