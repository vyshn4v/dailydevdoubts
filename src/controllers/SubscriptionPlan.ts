import { Response } from "express";
import Plans from "../models/plans";
import { CustomRequest } from "../types/requsetObject";
import asyncHandler from 'express-async-handler';
import Razorpay from "razorpay";
import { RAZOR_PAY_KEY_ID, RAZOR_PAY_KEY_SECRET } from "../config/envVariables";
import Orders from "../models/orders";
import user from "../models/user";
export const getAllPlans = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const plans = await Plans.find({ isActive: true })
    res.json({ status: true, data: plans })
})
export const addPlans = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    const { plan, totalQuestions, totalAnswers, price, TotalDays } = req.body
    if (!plan || !totalQuestions || !totalAnswers || !price || !TotalDays) {
        console.log(req.body);
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }
    const alreadyExist = await Plans.find({ plan: plan.toUpperCase() }).count()
    if (alreadyExist) {
        console.log(alreadyExist);

        res.status(409).json({ status: false, message: "plan already exist" })
        throw new Error('plan already exist')
    }
    const plans = new Plans({
        plan: plan.toUpperCase(),
        totalQuestions,
        totalAnswers,
        TotalDays,
        price
    })
    await plans.save()
    res.json({ status: true, data: plans })
})
export const managePlansState = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    const { plan_id, isHide } = req.query
    console.log(req.query);
    if (!plan_id) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }
    let plan = await Plans.findById(plan_id)
    if (!plan) {
        res.status(404).json({ status: false, message: "plan not found for this id" })
        throw new Error('plan not found for this id')
    }
    if (isHide && !plan.isActive) {
        plan.isActive = true
    } else if (!isHide && plan.isActive) {
        plan.isActive = false
    } else {
        res.status(404).json({ status: false, message: `plan is already ${isHide ? "active" : 'hide'}` })
        throw new Error("plan is already " + isHide ? "active" : 'hide')
    }

    await plan.save()
    res.json({ status: true, data: plan })
})

export const orderPlans = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { amount } = req.body
    const { plan } = req.user
    if (!amount&&amount!=0) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }
    if (plan && (new Date(plan.expired_date) > new Date())) {
        res.status(403).json({ status: false, message: "already have a plan" })
        throw new Error('already have a plan')
    }
    const razorpayInstance = new Razorpay({
        key_id: RAZOR_PAY_KEY_ID,
        key_secret: RAZOR_PAY_KEY_SECRET
    })
    razorpayInstance.orders.create({
        amount: req.body.amount*100,
        currency: "INR",
    }, (err, order) => {
        console.log(err);
        console.log(order);
        res.json({
            success: true,
            data: {
                ...order,
                amount: req.body?.amount
            }
        })
    })

})

export const confirmOrder = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { razorpay_order_id, plan_id } = req.body
    const { _id } = req.user
    const razorpayInstance = new Razorpay({
        key_id: RAZOR_PAY_KEY_ID,
        key_secret: RAZOR_PAY_KEY_SECRET
    });
    const plan = await Plans.findById(plan_id)
    if (!plan) {
        res.status(404).json({ status: false, message: "no plan found for this id" })
        throw new Error('plan not found for this id')
    }
    const order = await razorpayInstance.orders.fetch(razorpay_order_id)
    if (order.status === 'paid') {
        console.log(req.body);
        const date = new Date()
        date.setDate(new Date().getDate() + plan.totalDays)
        const expiredOn = new Date(date)
        const newOrder = new Orders({
            user: _id,
            plan: plan_id,
            razor_pay_order_id: order.id,
            expired_date: expiredOn
        })
        console.log(newOrder);
        
        await newOrder.save()
        await user.findByIdAndUpdate(_id, { plan: newOrder._id })
        res.json({ status: true, data: newOrder })

    } else {
        res.json({
            status: false, message: "order not placed"
        })
    }
})
