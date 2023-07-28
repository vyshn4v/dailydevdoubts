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
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const user_1 = __importDefault(require("../models/user"));
const question_1 = __importDefault(require("../models/question"));
const leadBoard_1 = __importDefault(require("../models/leadBoard"));
const badges = [
    { badge: "Bronze", count: 0 },
    { badge: "Silver", count: 0 },
    { badge: "Gold", count: 0 }
];
function verifyBadge() {
    node_cron_1.default.schedule('0 0 * * *', () => {
        badge();
    });
}
exports.default = verifyBadge;
function badge() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield user_1.default.find({});
            users === null || users === void 0 ? void 0 : users.map((user) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                if (((_a = user === null || user === void 0 ? void 0 : user.badges) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                    user.badges = badges;
                    yield user.save();
                }
                const totalQuestion = yield question_1.default.find({ user: new mongoose_1.default.Types.ObjectId(String(user._id)), isApprove: true }).count();
                if (user === null || user === void 0 ? void 0 : user.badges) {
                    if (totalQuestion >= ((((_b = user === null || user === void 0 ? void 0 : user.badges[0]) === null || _b === void 0 ? void 0 : _b.count) + 1) * 10) && totalQuestion >= 10) {
                        user.badges[0].count = getFirstDigits(totalQuestion);
                        yield user.save();
                    }
                    if (((_c = user === null || user === void 0 ? void 0 : user.badges[0]) === null || _c === void 0 ? void 0 : _c.count) >= ((((_d = user === null || user === void 0 ? void 0 : user.badges[1]) === null || _d === void 0 ? void 0 : _d.count) + 1) * 10) && ((_e = user === null || user === void 0 ? void 0 : user.badges[0]) === null || _e === void 0 ? void 0 : _e.count) >= 10) {
                        user.badges[1].count = (_f = user === null || user === void 0 ? void 0 : user.badges[0]) === null || _f === void 0 ? void 0 : _f.count;
                        yield user.save();
                    }
                    if (user.reputation >= ((((_g = user === null || user === void 0 ? void 0 : user.badges[2]) === null || _g === void 0 ? void 0 : _g.count) + 1) * 10)) {
                        user.badges[2].count = getFirstDigits(user.reputation);
                        yield user.save();
                    }
                }
            }));
            const topTenUsers = users.sort((a, b) => b.reputation - a.reputation).slice(0, 10).map((user) => user._id);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const leadbordExist = yield leadBoard_1.default.exists({
                createdAt: { $gte: currentDate, $lt: nextDay },
            });
            if (!leadbordExist) {
                const leadBoard = new leadBoard_1.default({
                    users: topTenUsers
                });
                yield leadBoard.save();
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getFirstDigits(number) {
    const numberString = number.toString();
    return parseInt(numberString.substr(0, numberString.length - 1));
}
