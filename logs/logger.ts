import fs from "fs";

export function addLog(message: string): void{
    fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => {})
    console.log('\n' + new Date() + '\n' + message)
}