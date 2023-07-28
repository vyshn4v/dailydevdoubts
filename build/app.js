"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const quick_logger_1 = __importDefault(require("./helpers/quick-logger"));
const errorHandler_1 = __importDefault(require("./helpers/errorHandler"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const userTokenverifivation_1 = require("./middleware/userTokenverifivation");
const questionRoute_1 = __importDefault(require("./routes/questionRoute"));
const answerRoute_1 = __importDefault(require("./routes/answerRoute"));
const chatRouter_1 = __importDefault(require("./routes/chatRouter"));
const dashboardRoute_1 = __importDefault(require("./routes/dashboardRoute"));
const planRouter_1 = __importDefault(require("./routes/planRouter"));
const badge_1 = __importDefault(require("./helpers/badge"));
const socket_1 = require("./helpers/socket");
const dailyActivity_1 = __importDefault(require("./routes/dailyActivity"));
const advertisMent_1 = __importDefault(require("./routes/advertisMent"));
global.logger = quick_logger_1.default;
const port = process.env.port || 3000;
(0, dbConnection_1.default)();
(0, socket_1.initializeSocket)(server);
(0, badge_1.default)();
function jsonReviver(key, value) {
    if (typeof value === 'string' && value.toLowerCase() === 'false') {
        return false;
    }
    if (typeof value === 'string' && value.toLowerCase() === 'true') {
        return true;
    }
    return value;
}
app.use(express_1.default.json({ reviver: jsonReviver }));
app.use((0, cors_1.default)({
    origin: "*"
}));
app.use("/api/auth", authRoute_1.default);
app.use("/api/user", userTokenverifivation_1.verifyUserToken, userRoute_1.default);
app.use("/api/question", userTokenverifivation_1.verifyUserToken, questionRoute_1.default);
app.use("/api/answer", userTokenverifivation_1.verifyUserToken, answerRoute_1.default);
app.use("/api/chat", userTokenverifivation_1.verifyUserToken, chatRouter_1.default);
app.use("/api/dashboard", userTokenverifivation_1.verifyUserToken, dashboardRoute_1.default);
app.use("/api/plans", userTokenverifivation_1.verifyUserToken, planRouter_1.default);
app.use("/api/daily-activity", userTokenverifivation_1.verifyUserToken, dailyActivity_1.default);
app.use("/api/advertisement", userTokenverifivation_1.verifyUserToken, advertisMent_1.default);
app.use(errorHandler_1.default);
server.listen(port, () => {
    console.log('server connected to ' + port);
});
