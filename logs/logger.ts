import fs from "fs";

export function addLog(message: string): void{
    fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\nMessage:' + message, (err) => {})
    console.log('\n' + new Date() + '\n' + message)
}