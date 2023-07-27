"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const answerRouter = express_1.default.Router();
const Answer_1 = require("../controllers/Answer");
answerRouter.post('/', Answer_1.answerQuestion);
answerRouter.put('/vote', Answer_1.voteAnswer);
answerRouter.put('/', Answer_1.editAnswer);
answerRouter.post('/edit-request', Answer_1.editRequest);
answerRouter.put('/edit-request', Answer_1.approveEditRequest);
exports.default = answerRouter;
