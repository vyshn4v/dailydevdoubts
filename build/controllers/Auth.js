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
exports.VerifyOtpUser = exports.userLogin = exports.userSignup = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendMessageTwilio_1 = require("../helpers/sendMessageTwilio");
const envVariables_1 = require("../config/envVariables");
const jwtToken_1 = require("../helpers/jwtToken");
exports.userSignup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, phone, password, confirm_password } = req.body;
    if (!username || !email || !phone || !password || !confirm_password) {
        res.status(440).json({
            status: false,
            message: "parameter is missing user signup failed"
        });
        throw new Error("parameter is missing user signup failed");
    }
    logger.info(`user ${username} trying to signup`);
    if (password !== confirm_password) {
        res.status(401).json({
            status: false,
            message: "passwords are not matched"
        });
        throw new Error("passwords are not matched");
    }
    const PhoneOrEmailAlreadyTaken = yield user_1.default.find({ $or: [{ phone }, { email }] }).count();
    if (PhoneOrEmailAlreadyTaken) {
        res.status(440).json({
            status: false,
            message: "Phone or Email is already Taken"
        });
        throw new Error("Phone or Email is already Taken");
    }
    const generatedSalt = yield bcrypt_1.default.genSalt(envVariables_1.BCRYPT_SALT_ROUND);
    const hashedPassword = yield bcrypt_1.default.hash(password, generatedSalt);
    const User = new user_1.default({
        name: username,
        email,
        phone,
        password: hashedPassword
    });
    User.save();
    yield (0, sendMessageTwilio_1.sendOtpUsingTwilio)(User.phone, "SIGNUP");
    logger.info(`user ${User.name} success fully signed in user id : ${User._id}`);
    res.json({
        status: true,
        data: {
            "name": User.name,
            "email": User.email,
            "phone": User.phone,
            "isBanned": User.isBanned,
            "isVerified": User.isVerified,
            "following_user": User.following_user,
            "isSignupWithGoogle": User.isSignupWithGoogle,
            "_id": User._id,
            "createdAt": User.createdAt,
            "updatedAt": User.updatedAt,
        }
    });
}));
exports.userLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const User = yield user_1.default.findOne({ email });
    if (!User) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        });
        throw Error("invalid email id in login field :" + email);
    }
    logger.info(`user ${User.name} trying to signup`);
    const passwordStatus = yield bcrypt_1.default.compare(password, User.password);
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        });
        throw Error("invalid password in login field :" + email);
    }
    const token = yield (0, jwtToken_1.generateJwtToken)({ _id: User._id, isOtpVerified: false });
    res.json({
        status: true,
        data: {
            token
        }
    });
}));
exports.VerifyOtpUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Otp } = req.body;
    const { phone } = req.user;
    if (!Otp) {
        res.status(400).json({
            status: false,
            message: "Otp field is required"
        });
    }
    const OtpStatus = yield (0, sendMessageTwilio_1.verifyOtpUsingTwilio)(phone, Otp);
    if (OtpStatus && OtpStatus.status === "approved") {
        res.json({
            status: true,
            data: OtpStatus.status
        });
    }
    else {
        res.json({
            status: false,
            message: "otp is not verifed"
        });
    }
}));
