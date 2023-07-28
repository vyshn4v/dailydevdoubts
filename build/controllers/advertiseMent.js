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
exports.deleteAdvertisement = exports.getAds = exports.addAdvertiseMent = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const advertiseMent_1 = __importDefault(require("../models/advertiseMent"));
exports.addAdvertiseMent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    const { label, expiryDate } = req.body;
    const path = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    console.log(req.body);
    console.log(req.file);
    console.log(req.files);
    if (!label || !expiryDate || !path) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    const advertise = new advertiseMent_1.default({
        label,
        image: path,
        expired_At: expiryDate
    });
    yield advertise.save();
    res.json({ status: true, data: advertise });
}));
exports.getAds = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let currentDate = new Date();
    const advertise = yield advertiseMent_1.default.find({ expired_At: { $gt: currentDate } });
    res.json({ status: true, data: advertise });
}));
exports.deleteAdvertisement = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ad_id } = req.query;
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    if (!ad_id) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    yield advertiseMent_1.default.findByIdAndDelete(ad_id);
    res.json({ status: true, message: 'successfully deleted' });
}));
