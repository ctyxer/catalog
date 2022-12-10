import fs from "fs";
import { Request } from 'express';
import { FileLogger } from "./fileLogger";

export class Logger{
    fileLogger = new FileLogger();

    addLog(message: any): void{
        this.fileLogger.addLog(
            `${String(message)}`
        )
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