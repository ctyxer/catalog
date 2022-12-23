"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogToFile = void 0;
const functions_1 = require("../../functions");
const fs_1 = __importDefault(require("fs"));
class LogToFile {
    constructor() {
        this.message = "";
    }
    setMessage(message) {
        this.message = message;
    }
    addLog() {
        const date = new Date();
        fs_1.default.appendFile("./logs/logs.txt", `${(0, functions_1.stringData)(String(date.getTime()))}:${date.getMilliseconds()} ${date.getTime()}
${this.message}

`, (err) => { });
    }
    handle() {
        this.addLog();
    }
}
exports.LogToFile = LogToFile;
