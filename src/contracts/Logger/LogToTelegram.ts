import TelegramBot = require('node-telegram-bot-api');
import * as dotenv from "dotenv";
import fs from 'fs';
import { Logger } from './Logger';
import { Observer } from '../Observer/Observer';

dotenv.config({ path: __dirname + './../.env' });

export class LogToTelegram implements Logger, Observer {
    message: string;
    chatIDs: any[];
    bot: TelegramBot;

    constructor() {
        this.message = "";
        this.chatIDs = [];
        this.bot = new TelegramBot(String(process.env.TELEGRAM_TOKEN), { polling: true });

        if (!fs.existsSync('./logs/chat_ids.json')) {
            fs.appendFile('./logs/chat_ids.json', '[]', () => { });
        }
        this.bot.onText(/\/sendLogs/, async (msg) => {
            this.bot.sendMessage(msg.chat.id, 'Wait please...')
            this.addChatID(msg.chat.id);
        });
    }

    addChatID(id: number) {
        let data = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
        if (!data.includes(id)) {
            data.push(id);
            fs.writeFile('./logs/chat_ids.json', JSON.stringify(data), (err) => { });
            this.bot.sendMessage(id, `Done! Your chat id: ${id}`);
        } else {
            this.bot.sendMessage(id, "You are already receiving logs");
        };
    }

    setMessage(message: string) {
        this.message = message;
    }

    async addLog() {
        this.chatIDs = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
        this.chatIDs.forEach((chatID) => {
            this.bot.sendMessage(chatID, this.message);
        });
    }

    async handle() {
        this.addLog();
    }
}