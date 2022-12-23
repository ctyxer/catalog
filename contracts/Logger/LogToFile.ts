import { stringData } from "../../functions";
import { Observer } from "../Observer/Observer";
import { Logger } from "./Logger";
import fs from 'fs';

export class LogToFile implements Logger, Observer {
    message: string;

    constructor() {
        this.message = "";
    }

    setMessage(message: string) {
        this.message = message;
    }

    addLog(): void {
        const date = new Date();
        fs.appendFile("./logs/logs.txt",
            `${stringData(String(date.getTime()))}:${date.getMilliseconds()} ${date.getTime()}
${this.message}

`
            , (err) => { });
    }

    handle(): void {
        this.addLog();
    }
}