import { FileLogger } from "./fileLogger";
import { Repository } from "./repository";
import { TelegramLogger } from "./telegramLogger";

const fileLogger = new FileLogger();
const telegramLogger = new TelegramLogger();
const repo = new Repository();

repo.attach(fileLogger);
repo.attach(telegramLogger);

export function addLog(message: any): void {
    repo.notify(String(message));
}