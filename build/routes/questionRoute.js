"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Question_1 = require("../controllers/Question");
const Question_2 = require("../controllers/Question");
const questionRouter = express_1.default.Router();
questionRouter.get('/', Question_1.getQuestion);
questionRouter.put('/', Question_1.approveQuestion);
questionRouter.post('/', Question_2.AddQuestion);
questionRouter.get('/all', Question_1.getAllQuestion);
questionRouter.get('/vote', Question_1.voteQuestion);
questionRouter.post('/report', Question_1.reportQuestion);
questionRouter.get('/reported-questions', Question_1.getReportedQuestion);
questionRouter.put('/bookmark', Question_1.bookmarkQuestion);
questionRouter.get('/bookmark', Question_1.getBookmarkedQuestions);
exports.default = questionRouter;
