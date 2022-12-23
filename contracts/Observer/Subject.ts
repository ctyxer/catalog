import { Observer } from "./Observer";

export interface Subject {
    attach(observable: Observer): void;
    // attachMany(observable: Observer[]): void;
    // detach(index: number): void;
    notify(): void;
}