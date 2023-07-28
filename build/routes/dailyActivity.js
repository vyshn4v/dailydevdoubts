"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dailyActivityRouter = express_1.default.Router();
const express_joi_validation_1 = require("express-joi-validation");
const validator = (0, express_joi_validation_1.createValidator)();
const DailyActivities_1 = require("../controllers/DailyActivities");
dailyActivityRouter.get('/', DailyActivities_1.getDailyActivity);
exports.default = dailyActivityRouter;
