import express from "express"
import { approveQuestion, getAllQuestion, getQuestion, voteQuestion } from "../controllers/Question";
import { AddQuestion } from "../controllers/Question";
const questionRouter = express.Router()
questionRouter.post('/' , AddQuestion)
questionRouter.get('/all' , getAllQuestion)
questionRouter.put('/' , approveQuestion)
questionRouter.get('/' , getQuestion)
questionRouter.get('/vote' , voteQuestion)



export default questionRouter