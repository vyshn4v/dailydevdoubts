"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatRouter = express_1.default.Router();
const express_joi_validation_1 = require("express-joi-validation");
const validator = (0, express_joi_validation_1.createValidator)();
const Chat_1 = require("../controllers/Chat");
const cloudinary_1 = __importDefault(require("../middleware/cloudinary"));
chatRouter.post('/', cloudinary_1.default.single('image'), Chat_1.createChat);
chatRouter.get('/', Chat_1.getAllChats);
chatRouter.post('/message/:chat_id', Chat_1.sendMessage);
chatRouter.delete('/:chat_id', Chat_1.deleteGroup);
exports.default = chatRouter;
