"use strict";
// import { Logger } from "../contracts/Logger/Logger";
// import { Observer } from "../contracts/Observer/Observer";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
class Repository {
    constructor() {
        this.observers = [];
    }
    attach(observer) {
        this.observers.push(observer);
    }
    notify() {
        this.observers.forEach(observer => {
            observer.handle();
        });
    }
}
exports.Repository = Repository;
