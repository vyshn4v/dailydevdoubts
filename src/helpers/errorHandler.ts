import { NextFunction, Request, Response } from "express";

export default async function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err)
        logger.error(`An error occurred: ${err.message}`);
    next()
};