"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../controllers/Auth");
const authRouter = express_1.default.Router();
const express_joi_validation_1 = require("express-joi-validation");
const validator = (0, express_joi_validation_1.createValidator)();
const validation_1 = require("../helpers/validation");
authRouter.get('/login', validator.query(validation_1.userLoginSchema), Auth_1.userLogin);
authRouter.get('/admin-login', validator.query(validation_1.userLoginSchema), Auth_1.adminLogin);
authRouter.post("/signup", validator.body(validation_1.userSignupSchema), Auth_1.userSignup);
authRouter.post("/signup-with-google", Auth_1.signupWithGmail);
authRouter.get("/login-with-google", Auth_1.loginWithGoogle);
authRouter.post("/refresh-token", Auth_1.refreshToken);
exports.default = authRouter;
