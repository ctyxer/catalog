import fs from "fs";
import { stringData } from "../functions";

export class FileLogger{
    addLog(message: String | string){
        const date = new Date();
        fs.appendFile("./logs/logs.txt", 
        `${stringData(String(date.getTime()))}:${date.getMilliseconds()} ${date.getTime()}
${message}

`
        , (err) => {});
    }
}