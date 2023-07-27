import express from "express"
import { getAllPlans,addPlans, managePlansState, orderPlans, confirmOrder } from "../controllers/SubscriptionPlan"
const planRouter = express.Router()

planRouter.get('/', getAllPlans)
planRouter.post('/', addPlans)
planRouter.put('/', managePlansState)
planRouter.post('/order', orderPlans)
planRouter.post('/confirm-order', confirmOrder)

export default planRouter