import TelegramBot = require('node-telegram-bot-api');
import * as dotenv from "dotenv";
import fs from 'fs';
import { Logger } from './logger';

dotenv.config({ path: __dirname + './../.env' });

const bot = new TelegramBot(String(process.env.TELEGRAM_TOKEN), { polling: true });
let chatIDs: any[];

if (!fs.existsSync('./logs/chat_ids.json')) {
    fs.appendFile('./logs/chat_ids.json', '[]', () => { });
}

bot.onText(/\/sendLogs/, async (msg) => {
    let data = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
    if (!data.includes(msg.chat.id)) {
        data.push(msg.chat.id);
        fs.writeFile('./logs/chat_ids.json', JSON.stringify(data), (err) => { });
        bot.sendMessage(msg.chat.id, `Done! Your chat id: ${msg.chat.id}`);
    } else {
        bot.sendMessage(msg.chat.id, "You are already receiving logs");
    }
});

export class TelegramLogger implements Logger {
    async addLog(message: String) {
        chatIDs = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
        chatIDs.forEach((chatID) => {
            bot.sendMessage(chatID, String(message));
        });
    }
}
