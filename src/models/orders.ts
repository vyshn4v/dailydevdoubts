import mongoose, { Schema, model } from "mongoose";


const orders_schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    plan: { type: Schema.Types.ObjectId, ref: 'plans' },
    razor_pay_order_id:{ type: String },
    ordered_date: { type: Date, default: new Date() },
    expired_date:{ type: Date, default: new Date() }
}, { timestamps: true })

const Orders = model('orders', orders_schema)
export default Orders 