import fs from "fs";
import { Request } from 'express';

export class Logger{
    addLog(message: string | String ): void{
        fs.appendFile("./logs/logs.txt", '\n\n[' + new Date() + ']\n' + message, (err) => {})
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
    
    renderPathClient(req: Request):  String{
        return this.getClient(req) + "\nrender page '" + req.url + "'"
    }
    
    getClient(req: Request): String{
        return String(req.headers['user-agent']);
    }

}