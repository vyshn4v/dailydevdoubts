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
const envVariables_1 = require("../config/envVariables");
exports.verifyUserToken = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.json({
            status: false,
            message: "Token not found"
        });
        throw Error("Token Not Found");
    }
    const decode = yield (0, jwtToken_1.verifyJwtToken)(token);
    const currentTime = new Date();
    if ((decode === null || decode === void 0 ? void 0 : decode.exp) && (decode === null || decode === void 0 ? void 0 : decode.exp) > (currentTime.getTime() / 1000)) {
        if ((decode === null || decode === void 0 ? void 0 : decode.email) === envVariables_1.ADMIN_EMAIL) {
            req.admin = decode === null || decode === void 0 ? void 0 : decode.email;
            return next();
        }
        const User = yield user_1.default.findById({ _id: decode === null || decode === void 0 ? void 0 : decode._id }).populate('plan').populate({
            path: 'plan',
            populate: {
                path: 'plan',
                model: 'plans',
            },
        });
        if (User) {
            if (User.isBanned) {
                res.json({
                    status: false,
                    message: "User is banned"
                });
                throw Error(`Banned user ${User.name}is try to access`);
            }
            req.user = User;
            next();
        }
        else {
            res.status(404).json({
                status: false,
                message: "User not found"
            });
            throw Error("user not found");
        }
    }
    else {
        res.status(401).json({
            status: false,
            message: "Token Expired"
        });
        throw Error("Token Expired");
    }
}));
