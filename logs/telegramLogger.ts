import TelegramBot = require('node-telegram-bot-api');
import * as dotenv from "dotenv";
import fs from 'fs';
import { Logger } from './logger';

dotenv.config({ path: __dirname + './../.env' });

const bot = new TelegramBot(String(process.env.TELEGRAM_TOKEN) || "5746339461:AAE_3h1Yiv05YZ6ma9vCmPprfhQaazKWrFA", { polling: true });
let chatIDs: any[];

if(!fs.existsSync('./logs/chat_ids.json')){
    fs.appendFile('./logs/chat_ids.json', '[]', () => {});
}

bot.on('message', async (msg) => {
    console.log(msg.chat.id)
    let data = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
    data.push(msg.chat.id);
    fs.writeFile('./logs/chat_ids.json', JSON.stringify(data), (err) => { });
});
export class TelegramLogger implements Logger{
    async addLog(message: String) {
        chatIDs = JSON.parse(fs.readFileSync('./logs/chat_ids.json', 'utf8'));
        chatIDs.forEach((chatID) => {
            bot.sendMessage(chatID, String(message));
        });
    }
}
