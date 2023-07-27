"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginSchema = exports.userSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const userSignupSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email({ tlds: { allow: false } }),
    phone: joi_1.default.number().min(1000000000).max(9999999999).required(),
    password: joi_1.default.string().length(16).required(),
    confirm_password: joi_1.default.string().length(16).required()
});
exports.userSignupSchema = userSignupSchema;
const userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email({ tlds: { allow: false } }),
    password: joi_1.default.string().min(8).max(16).message("password length must be less than or equal to 16 characters long").required(),
});
exports.userLoginSchema = userLoginSchema;
