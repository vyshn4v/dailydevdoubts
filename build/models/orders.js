"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orders_schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    plan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'plans' },
    razor_pay_order_id: { type: String },
    ordered_date: { type: Date, default: new Date() },
    expired_date: { type: Date, default: new Date() }
}, { timestamps: true });
const Orders = (0, mongoose_1.model)('orders', orders_schema);
exports.default = Orders;
