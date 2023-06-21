"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const { createLogger, format, transports } = winston_1.default;
const logger = createLogger({
    level: "info",
    format: format.combine(format.colorize(), format.timestamp({
        format: 'DD-MM-YYYY HH:mm:ss'
    }), format.errors({ stack: true }), format.splat(), format.json()),
    transports: [
        new transports.File({ filename: './logfile/errorlogfile.log', level: 'error' }),
        new transports.File({ filename: './logfile/succeslogfile.log', level: 'info' }),
        new transports.File({ filename: './logfile/logfile.log' }),
        new transports.DailyRotateFile({ filename: `./logfile/dailylogfile/logfile.log`, datePattern: "YYYY-MM-DD-HH" })
    ]
});
if (process.env.NODE_ENV !== "PRODUCTION") {
    logger.add(new transports.Console({
        format: format.combine(format.colorize(), format.simple())
    }));
}
exports.default = logger;
