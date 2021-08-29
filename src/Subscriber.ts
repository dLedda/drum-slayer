import {IPublisher} from "./Publisher";

export default interface ISubscriber {
    notify<T extends string | number>(publisher: IPublisher<T>, event: T | "all" | T[]): void;
}