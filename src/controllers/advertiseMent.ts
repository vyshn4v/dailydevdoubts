import { Response } from "express";
import { CustomRequest } from "../types/requsetObject";
import asyncHandler from 'express-async-handler'
import Advertisement from "../models/advertiseMent";

export const addAdvertiseMent = asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    const { label, expiryDate, websiteUrl } = req.body
    const path = req.file?.path
    console.log(req.body);
    console.log(req.file);
    console.log(req.files);

    if (!label || !expiryDate || !path) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }

    const advertise = new Advertisement({
        label,
        image: path,
        websiteUrl,
        expired_At: expiryDate
    })
    await advertise.save()
    res.json({ status: true, data: advertise })
})
export const getAds = asyncHandler(async (req: CustomRequest, res: Response) => {

    let currentDate = new Date()
    const advertise = await Advertisement.find({ expired_At: { $gt: currentDate } })
    res.json({ status: true, data: advertise })
})
export const deleteAdvertisement = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { ad_id } = req.query
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    if (!ad_id) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }
    await Advertisement.findByIdAndDelete(ad_id)
    res.json({ status: true, message: 'successfully deleted' })
})