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
exports.verifyUserToken = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jwtToken_1 = require("../helpers/jwtToken");
const user_1 = __importDefault(require("../models/user"));
exports.verifyUserToken = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token) {
        res.json({
            status: false,
            message: "Token not found"
        });
        throw Error("Token Not Found");
    }
    const decode = yield (0, jwtToken_1.verifyJwtToken)(token);
    const currentTime = new Date();
    if (decode.exp && decode.exp > (currentTime.getTime() / 1000)) {
        const User = yield user_1.default.findById({ _id: decode._id });
        if (User) {
            req.user = User;
            next();
        }
        else {
            res.json({
                status: false,
                message: "User not found"
            });
            throw Error("user not found");
        }
    }
    else {
        res.json({
            status: false,
            message: "Token Expired"
        });
        throw Error("Token Expired");
    }
}));
