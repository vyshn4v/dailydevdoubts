import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const answerQuestion = asyncHandler(async (req: Request, res: Response) => {
    res.json('hello')
})