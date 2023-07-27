"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DashBoard_1 = require("../controllers/DashBoard");
const dashboardRouter = express_1.default.Router();
dashboardRouter.get('/', DashBoard_1.dashBoardData);
exports.default = dashboardRouter;
