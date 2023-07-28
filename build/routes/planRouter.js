"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SubscriptionPlan_1 = require("../controllers/SubscriptionPlan");
const planRouter = express_1.default.Router();
planRouter.get('/', SubscriptionPlan_1.getAllPlans);
planRouter.post('/', SubscriptionPlan_1.addPlans);
planRouter.put('/', SubscriptionPlan_1.managePlansState);
planRouter.post('/order', SubscriptionPlan_1.orderPlans);
planRouter.post('/confirm-order', SubscriptionPlan_1.confirmOrder);
exports.default = planRouter;
