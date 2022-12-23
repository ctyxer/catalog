"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogToTelegram = void 0;
const TelegramBot = require("node-telegram-bot-api");
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv.config({ path: __dirname + './../.env' });
const bot = new TelegramBot(String(process.env.TELEGRAM_TOKEN), { polling: true });
let chatIDs;
if (!fs_1.default.existsSync('./logs/chat_ids.json')) {
    fs_1.default.appendFile('./logs/chat_ids.json', '[]', () => { });
}
bot.onText(/\/sendLogs/, async (msg) => {
    let data = JSON.parse(fs_1.default.readFileSync('./logs/chat_ids.json', 'utf8'));
    if (!data.includes(msg.chat.id)) {
        data.push(msg.chat.id);
        fs_1.default.writeFile('./logs/chat_ids.json', JSON.stringify(data), (err) => { });
        bot.sendMessage(msg.chat.id, `Done! Your chat id: ${msg.chat.id}`);
    }
    else {
        bot.sendMessage(msg.chat.id, "You are already receiving logs");
    }
});
class LogToTelegram {
    constructor() {
        this.message = "";
    }
    setMessage(message) {
        this.message = message;
    }
    async addLog() {
        chatIDs = JSON.parse(fs_1.default.readFileSync('./logs/chat_ids.json', 'utf8'));
        chatIDs.forEach((chatID) => {
            bot.sendMessage(chatID, String(this.message));
        });
    }
    async handle() {
        this.addLog();
    }
}
exports.LogToTelegram = LogToTelegram;
