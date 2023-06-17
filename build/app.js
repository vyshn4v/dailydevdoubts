"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const port = process.env.port || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/auth", (req, res) => {
    res.json("hello");
});
app.listen(port, () => {
    console.log('server connected to ' + port);
});
