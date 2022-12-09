import fs from "fs";

export class FileLogger{
    addLog(message: String | string){
        fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => {})
    }
}