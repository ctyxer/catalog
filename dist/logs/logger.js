"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.renderPathClient = exports.catcherErr = exports.addLog = void 0;
const fs_1 = __importDefault(require("fs"));
function addLog(message) {
    fs_1.default.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => { });
}
exports.addLog = addLog;
async function catcherErr(tryFunc, endFunc) {
    try {
        tryFunc();
    }
    catch (err) {
        addLog(String(err));
        if (endFunc != undefined) {
            endFunc();
        }
    }
}
exports.catcherErr = catcherErr;
function renderPathClient(req) {
    return getClient(req) + "\nrender page '" + req.url + "'";
}
exports.renderPathClient = renderPathClient;
function getClient(req) {
    return String(req.headers['user-agent']);
}
exports.getClient = getClient;
