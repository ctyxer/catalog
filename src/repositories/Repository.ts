// import { Logger } from "../contracts/Logger/Logger";
// import { Observer } from "../contracts/Observer/Observer";

export class Repository {
    protected observers: any[];
    
    constructor() {
        this.observers = [];
    }

    attach(observer: any){
        this.observers.push(observer);
    }

    notify(){
        this.observers.forEach(observer => {
            observer.handle();
        });
    }
}