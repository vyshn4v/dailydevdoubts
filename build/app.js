"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const cors_1 = __importDefault(require("cors"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const quick_logger_1 = __importDefault(require("./helpers/quick-logger"));
const errorHandler_1 = __importDefault(require("./helpers/errorHandler"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const userTokenverifivation_1 = require("./middleware/userTokenverifivation");
global.logger = quick_logger_1.default;
const port = process.env.port || 3000;
(0, dbConnection_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/auth", authRoute_1.default);
app.use("/api/user", userTokenverifivation_1.verifyUserToken, userRoute_1.default);
app.use(errorHandler_1.default);
app.listen(port, () => {
    console.log('server connected to ' + port);
});
