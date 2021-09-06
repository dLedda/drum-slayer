export default interface ISubscriber {
    notify<T extends string | number>(publisher: unknown, event: T | "all" | T[]): void;
}