import fs from "fs";
import { Request } from 'express';
import { FileLogger } from "./fileLogger";
import { TelegramLogger } from "./telegramLogger";

export class Logger{
    fileLogger = new FileLogger();
    telegramLogger = new TelegramLogger();

    addLog(message: any): void{
        this.fileLogger.addLog(
            `${String(message)}`
        );
        this.telegramLogger.addLog(
            `${String(message)}`
        );
    }
    
    catcherErr(tryFunc: Function, endFunc?: Function){
        try{
            tryFunc()
        }
        catch(err){
            this.addLog(String(err));
            if(endFunc != undefined){
                endFunc();
            }
        }
    }
}