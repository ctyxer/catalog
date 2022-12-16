import fs from "fs";
import { stringData } from "../functions";
import { Logger } from "./logger";

export class FileLogger implements Logger{
    addLog(message: String){
        const date = new Date();
        fs.appendFile("./logs/logs.txt", 
        `${stringData(String(date.getTime()))}:${date.getMilliseconds()} ${date.getTime()}
${message}

`
        , (err) => {});
    }
}