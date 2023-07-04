import express from "express"
import { approveQuestion, getAllQuestion, getQuestion, voteQuestion } from "../controllers/Question";
import { AddQuestion } from "../controllers/Question";
const questionRouter = express.Router()
questionRouter.get('/' , getQuestion)
questionRouter.put('/' , approveQuestion)
questionRouter.post('/' , AddQuestion)
questionRouter.get('/all' , getAllQuestion)
questionRouter.get('/vote' , voteQuestion)



export default questionRouter