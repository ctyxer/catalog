"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
class Logger {
    addLog(message) {
        fs_1.default.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => { });
    }
    catcherErr(tryFunc, endFunc) {
        try {
            tryFunc();
        }
        catch (err) {
            this.addLog(String(err));
            if (endFunc != undefined) {
                endFunc();
            }
        }
    }
    renderPathClient(req) {
        return this.getClient(req) + "\nrender page '" + req.url + "'";
    }
    getClient(req) {
        return String(req.headers['user-agent']);
    }
}
exports.Logger = Logger;
