// import { Logger } from "../contracts/Logger/Logger";
// import { Observer } from "../contracts/Observer/Observer";

export class Repository {
    protected observers: any[];
    
    constructor() {
        this.observers = [];
    }
}