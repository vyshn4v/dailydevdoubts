"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrder = exports.orderPlans = exports.managePlansState = exports.addPlans = exports.getAllPlans = void 0;
const plans_1 = __importDefault(require("../models/plans"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const razorpay_1 = __importDefault(require("razorpay"));
const envVariables_1 = require("../config/envVariables");
const orders_1 = __importDefault(require("../models/orders"));
const user_1 = __importDefault(require("../models/user"));
exports.getAllPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const plans = yield plans_1.default.find({ isActive: true });
    res.json({ status: true, data: plans });
}));
exports.addPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    const { plan, totalQuestions, totalAnswers, price, TotalDays } = req.body;
    if (!plan || !totalQuestions || !totalAnswers || !price || !TotalDays) {
        console.log(req.body);
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    const alreadyExist = yield plans_1.default.find({ plan: plan.toUpperCase() }).count();
    if (alreadyExist) {
        console.log(alreadyExist);
        res.status(409).json({ status: false, message: "plan already exist" });
        throw new Error('plan already exist');
    }
    const plans = new plans_1.default({
        plan: plan.toUpperCase(),
        totalQuestions,
        totalAnswers,
        TotalDays,
        price
    });
    yield plans.save();
    res.json({ status: true, data: plans });
}));
exports.managePlansState = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    const { plan_id, isHide } = req.query;
    console.log(req.query);
    if (!plan_id) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    let plan = yield plans_1.default.findById(plan_id);
    if (!plan) {
        res.status(404).json({ status: false, message: "plan not found for this id" });
        throw new Error('plan not found for this id');
    }
    if (isHide && !plan.isActive) {
        plan.isActive = true;
    }
    else if (!isHide && plan.isActive) {
        plan.isActive = false;
    }
    else {
        res.status(404).json({ status: false, message: `plan is already ${isHide ? "active" : 'hide'}` });
        throw new Error("plan is already " + isHide ? "active" : 'hide');
    }
    yield plan.save();
    res.json({ status: true, data: plan });
}));
exports.orderPlans = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const { plan } = req.user;
    if (!amount && amount != 0) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    if (plan && (new Date(plan.expired_date) > new Date())) {
        res.status(403).json({ status: false, message: "already have a plan" });
        throw new Error('already have a plan');
    }
    const razorpayInstance = new razorpay_1.default({
        key_id: envVariables_1.RAZOR_PAY_KEY_ID,
        key_secret: envVariables_1.RAZOR_PAY_KEY_SECRET
    });
    razorpayInstance.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
    }, (err, order) => {
        var _a;
        console.log(err);
        console.log(order);
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, order), { amount: (_a = req.body) === null || _a === void 0 ? void 0 : _a.amount })
        });
    });
}));
exports.confirmOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, plan_id } = req.body;
    const { _id } = req.user;
    const razorpayInstance = new razorpay_1.default({
        key_id: envVariables_1.RAZOR_PAY_KEY_ID,
        key_secret: envVariables_1.RAZOR_PAY_KEY_SECRET
    });
    const plan = yield plans_1.default.findById(plan_id);
    if (!plan) {
        res.status(404).json({ status: false, message: "no plan found for this id" });
        throw new Error('plan not found for this id');
    }
    const order = yield razorpayInstance.orders.fetch(razorpay_order_id);
    if (order.status === 'paid') {
        console.log(req.body);
        const date = new Date();
        date.setDate(new Date().getDate() + plan.totalDays);
        const expiredOn = new Date(date);
        const newOrder = new orders_1.default({
            user: _id,
            plan: plan_id,
            razor_pay_order_id: order.id,
            expired_date: expiredOn
        });
        console.log(newOrder);
        yield newOrder.save();
        yield user_1.default.findByIdAndUpdate(_id, { plan: newOrder._id });
        res.json({ status: true, data: newOrder });
    }
    else {
        res.json({
            status: false, message: "order not placed"
        });
    }
}));
