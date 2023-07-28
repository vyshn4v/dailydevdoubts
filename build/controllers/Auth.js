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
exports.refreshToken = exports.loginWithGoogle = exports.signupWithGmail = exports.ResendOtpToPhone = exports.changePassword = exports.ResendOtpUser = exports.VerifyOtpUser = exports.adminLogin = exports.userLogin = exports.userSignup = void 0;
const mongoose_1 = require("mongoose");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const sendMessageTwilio_1 = require("../helpers/sendMessageTwilio");
const envVariables_1 = require("../config/envVariables");
const jwtToken_1 = require("../helpers/jwtToken");
const passwordHashing_1 = __importDefault(require("../helpers/passwordHashing"));
const passwordValidation_1 = __importDefault(require("../helpers/passwordValidation"));
const axios_1 = __importDefault(require("axios"));
const generateUserOutputWithouPassword_1 = __importDefault(require("../helpers/generateUserOutputWithouPassword"));
const bookmarkedQuestions_1 = __importDefault(require("../models/bookmarkedQuestions"));
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
    const hashedPassword = yield (0, passwordHashing_1.default)(password);
    const User = new user_1.default({
        name: username,
        email,
        phone,
        password: hashedPassword
    });
    yield (yield (yield User.save()).populate('plan')).populate({
        path: 'plan',
        populate: {
            path: 'plan',
            model: 'plans',
        },
    });
    logger.info(`user ${User.name} success fully signed in user id : ${User._id}`);
    yield (0, sendMessageTwilio_1.sendOtpUsingTwilio)(User.phone, "SIGNUP");
    const token = yield (0, jwtToken_1.generateJwtToken)({ _id: User._id }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
    const refreshToken = yield (0, jwtToken_1.generateRefreshToken)({ user: User._id }, envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME);
    const Bookmark = yield bookmarkedQuestions_1.default.findById({ user: new mongoose_1.Types.ObjectId(User._id) }, { _id: 1, Bookmarks: 1 });
    res.json({
        status: true,
        data: (0, generateUserOutputWithouPassword_1.default)(User, token, refreshToken, Bookmark === null || Bookmark === void 0 ? void 0 : Bookmark.Bookmarks)
    });
}));
exports.userLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.query;
    const User = yield user_1.default.findOne({ email }).populate('plan').populate({
        path: 'plan',
        populate: {
            path: 'plan',
            model: 'plans',
        },
    });
    if (!User) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        });
        throw Error("invalid email id in login field :" + email);
    }
    logger.info(`user ${User.name} trying to login`);
    if (User.isSignupWithGoogle) {
        res.status(409).json({
            status: false,
            message: 'Email is registered with google try to login using google'
        });
        throw new Error('googles registered user try to login with email and password');
    }
    const passwordStatus = yield (0, passwordValidation_1.default)(String(password), User.password);
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        });
        throw Error("invalid password in login field :" + email);
    }
    if (!User.isVerified) {
        yield (0, sendMessageTwilio_1.sendOtpUsingTwilio)(User.phone, "SIGNUP");
    }
    const token = yield (0, jwtToken_1.generateJwtToken)({ _id: User._id }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
    const refreshToken = yield (0, jwtToken_1.generateRefreshToken)({ user: User._id }, envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME);
    const Bookmark = yield bookmarkedQuestions_1.default.findOne({ user: new mongoose_1.Types.ObjectId(User._id) }, { _id: 1, Bookmarks: 1 });
    res.json({
        status: true,
        data: (0, generateUserOutputWithouPassword_1.default)(User, token, refreshToken, Bookmark === null || Bookmark === void 0 ? void 0 : Bookmark.Bookmarks)
    });
}));
exports.adminLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.query;
    if (email !== envVariables_1.ADMIN_EMAIL) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        });
        throw Error("invalid email id in login field :" + email);
    }
    logger.info(`admin ${email} trying to login`);
    const passwordStatus = (password === envVariables_1.ADMIN_PASSWORD);
    // await passwordValidation(String(password), User.password)
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        });
        throw Error("invalid password in login field :" + email);
    }
    const token = yield (0, jwtToken_1.generateJwtToken)({ email }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
    const refreshToken = yield (0, jwtToken_1.generateRefreshToken)({ user: envVariables_1.ADMIN_EMAIL }, envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME);
    res.json({
        status: true,
        data: {
            "email": email,
            "token": token,
            refreshToken
        }
    });
}));
exports.VerifyOtpUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Otp } = req.body;
    const { phone, _id } = req.user;
    if (!Otp) {
        res.status(400).json({
            status: false,
            message: "Otp field is required"
        });
    }
    const OtpStatus = yield (0, sendMessageTwilio_1.verifyOtpUsingTwilio)(phone, Otp);
    if (OtpStatus && OtpStatus.status === "approved") {
        yield user_1.default.findByIdAndUpdate({ _id }, { isVerified: true });
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
exports.ResendOtpUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    let User = req.user;
    if (!_id) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        });
    }
    if (!(User === null || User === void 0 ? void 0 : User.isVerified)) {
        yield (0, sendMessageTwilio_1.sendOtpUsingTwilio)(User === null || User === void 0 ? void 0 : User.phone, "SIGNUP");
        res.json({
            status: true,
            message: "otp resend succesfully"
        });
    }
    else {
        res.status(409).json({
            status: false,
            message: "user is already verified"
        });
    }
}));
exports.changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, password, phoneNumber } = req.query;
    console.log(req.query);
    if (!otp || !password || !phoneNumber) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        });
    }
    const OtpStatus = yield (0, sendMessageTwilio_1.verifyOtpUsingTwilio)(Number(phoneNumber), String(otp));
    if (OtpStatus && OtpStatus.status === "approved") {
        const hashedPassword = yield (0, passwordHashing_1.default)(String(password));
        yield user_1.default.findOneAndUpdate({ phone: phoneNumber }, { password: hashedPassword });
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
exports.ResendOtpToPhone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.query;
    console.log(req.query);
    if (!phoneNumber) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        });
        throw new Error("Params missing");
    }
    if ((phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.length) === 10) {
        const User = yield user_1.default.findOne({ phone: phoneNumber });
        if (User) {
            yield (0, sendMessageTwilio_1.sendOtpUsingTwilio)(User === null || User === void 0 ? void 0 : User.phone, "SIGNUP");
            res.json({
                status: true,
                message: "otp resend succesfully"
            });
        }
        else {
            res.status(4094).json({
                status: false,
                message: "No user register for this number"
            });
            throw new Error("No user register for this number");
        }
    }
    else {
        res.status(400).json({
            status: false,
            message: "phone length is not match"
        });
        throw new Error("phone length is not match");
    }
}));
exports.signupWithGmail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const googleTOken = String(req.body.googleTOken);
    if (!googleTOken) {
        res.status(400).json({
            status: false,
            message: "missing google token"
        });
    }
    const payload = yield (yield axios_1.default.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleTOken}`)).data;
    if (payload) {
        const existedUser = yield user_1.default.findOne({ email: payload.email });
        if (!existedUser) {
            const hashedPassword = yield (0, passwordHashing_1.default)(payload.sub);
            const User = new user_1.default({
                name: payload.name,
                email: payload.email,
                isSignupWithGoogle: true,
                password: hashedPassword,
                isVerified: payload.email_verified
            });
            (yield (yield User.save()).populate('plan')).populate({
                path: 'plan',
                populate: {
                    path: 'plan',
                    model: 'plans',
                },
            });
            const token = yield (0, jwtToken_1.generateJwtToken)({ _id: User._id }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
            const refreshToken = yield (0, jwtToken_1.generateRefreshToken)({ user: User._id }, envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME);
            const Bookmark = yield bookmarkedQuestions_1.default.findOne({ user: new mongoose_1.Types.ObjectId(User._id) }, { _id: 1, Bookmarks: 1 });
            res.json({
                status: true,
                data: (0, generateUserOutputWithouPassword_1.default)(User, token, refreshToken, Bookmark)
            });
        }
        else {
            res.status(406).json({ status: false, message: "already signup with email please login" });
        }
    }
}));
exports.loginWithGoogle = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const googleTOken = String(req.query.googleTOken);
    if (!googleTOken) {
        res.status(400).json({
            status: false,
            message: "missing google token"
        });
    }
    const payload = yield (yield axios_1.default.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleTOken}`)).data;
    if (payload) {
        const existedUser = yield user_1.default.findOne({ email: payload.email }).populate('plan').populate({
            path: 'plan',
            populate: {
                path: 'plan',
                model: 'plans',
            },
        });
        if (existedUser) {
            const passwordStatus = yield (0, passwordValidation_1.default)(payload.sub, existedUser.password);
            if (passwordStatus) {
                const token = yield (0, jwtToken_1.generateJwtToken)({ _id: existedUser._id }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
                const refreshToken = yield (0, jwtToken_1.generateRefreshToken)({ user: existedUser._id }, envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME);
                const Bookmark = yield bookmarkedQuestions_1.default.findOne({ user: new mongoose_1.Types.ObjectId(existedUser._id) }, { _id: 1, Bookmarks: 1 });
                res.json({
                    status: true,
                    data: (0, generateUserOutputWithouPassword_1.default)(existedUser, token, refreshToken, Bookmark === null || Bookmark === void 0 ? void 0 : Bookmark.Bookmarks)
                });
            }
        }
        else {
            res.status(404).json({ status: false, message: "user not exist" });
        }
    }
}));
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = String(req.headers.authorization).split(" ")[1];
    const accessToken = String(req.body.refreshToken).split(" ")[1];
    if (!accessToken) {
        res.status(400).json({
            status: false,
            message: "missing token"
        });
    }
    console.log(accessToken);
    const decodeAccessToken = yield (0, jwtToken_1.verifyRefreshToken)(accessToken);
    console.log(decodeAccessToken);
    if (decodeAccessToken) {
        let accessToken;
        if (decodeAccessToken.user === envVariables_1.ADMIN_EMAIL) {
            accessToken = yield (0, jwtToken_1.generateJwtToken)({ email: decodeAccessToken.user }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
        }
        else {
            accessToken = yield (0, jwtToken_1.generateJwtToken)({ _id: decodeAccessToken.user }, envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME);
        }
        res.json({ status: true, data: accessToken });
    }
    else {
        res.status(498).json({ status: false, message: "Token malformed" });
        throw new Error("Token malformed");
    }
}));
