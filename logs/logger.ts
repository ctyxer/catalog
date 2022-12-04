import fs from "fs";

export function addLog(message: string): void{
    fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => {})
    console.log('\n' + new Date() + '\n' + message)
}

export async function catcherErr(tryFunc: Function, endFunc?: Function){
    try{
        tryFunc()
    }
    catch(err){
        addLog(String(err));
        if(endFunc != undefined){
            endFunc();
        }
    }
}