"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../controllers/Auth");
const User_1 = require("../controllers/User");
const cloudinary_1 = __importDefault(require("../middleware/cloudinary"));
const userRouter = express_1.default.Router();
userRouter.post('/otp', Auth_1.VerifyOtpUser);
userRouter.get('/otp', Auth_1.ResendOtpUser);
userRouter.put('/change-password', Auth_1.ResendOtpUser);
userRouter.get('/all-users', User_1.getAllUsers);
userRouter.get('/followers', User_1.getFollowedUsers);
userRouter.put('/manage', User_1.manageUser);
userRouter.get('/profile', User_1.getProfile);
userRouter.put('/follow-unfollow', User_1.followUnfollowUser);
userRouter.put('/profile', cloudinary_1.default.single('image'), User_1.uploadImage);
exports.default = userRouter;
