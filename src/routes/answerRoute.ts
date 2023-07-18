import express from "express"
const answerRouter = express.Router()
import { answerQuestion, approveEditRequest, editAnswer, editRequest, voteAnswer } from "../controllers/Answer"

answerRouter.post('/', answerQuestion)
answerRouter.put('/vote', voteAnswer)
answerRouter.put('/', editAnswer)
answerRouter.post('/edit-request', editRequest)
answerRouter.put('/edit-request', approveEditRequest)


export default answerRouter