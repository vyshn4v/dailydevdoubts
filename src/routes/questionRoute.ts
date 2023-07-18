import express from "express"
import { approveQuestion, bookmarkQuestion, getAllQuestion, getBookmarkedQuestions, getQuestion, getReportedQuestion, reportQuestion, voteQuestion } from "../controllers/Question";
import { AddQuestion } from "../controllers/Question";
const questionRouter = express.Router()
questionRouter.get('/' , getQuestion).put('/' , approveQuestion).post('/' , AddQuestion)
questionRouter.get('/all' , getAllQuestion)
questionRouter.get('/vote' , voteQuestion)
questionRouter.post('/report' , reportQuestion)
questionRouter.get('/reported-questions' , getReportedQuestion)
questionRouter.put('/bookmark' , bookmarkQuestion)
questionRouter.get('/bookmark' , getBookmarkedQuestions)



export default questionRouter