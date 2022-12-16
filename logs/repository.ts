import { Logger } from "./logger";

export class Repository{
    private loggers: Logger[];
    
    constructor() {
        this.loggers = [];
    }

    attach(observers: Logger){
        this.loggers.push(observers);
    };

    notify(message: String){
        this.loggers.forEach((logger) => {
            logger.addLog(message);
        })
    }
}