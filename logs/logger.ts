import fs from "fs";
import { Request } from 'express';

export function addLog(message: string | String ): void{
    fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => {})
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

export function renderPathClient(req: Request):  String{
    return getClient(req) + "\nrender page '" + req.url + "'"
}

export function getClient(req: Request): String{
    return String(req.headers['user-agent']);
}