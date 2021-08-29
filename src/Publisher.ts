import ISubscriber from "./Subscriber";

export class Publisher<T extends (string | number)> implements IPublisher<T> {
    private subscribers: Map<T | "all", ISubscriber[]>;

    constructor() {
        this.subscribers = new Map();
        this.subscribers.set("all", []);
    }

    addSubscriber(subscriber: ISubscriber, eventType: (T | "all") | T[]): {unbind: () => void} {
        let eventTypes: (T | "all")[] = [];
        if (!Array.isArray(eventType)) {
            eventTypes.push(eventType);
        } else {
            eventTypes = eventType as (T | "all")[];
        }
        for (const key of eventTypes) {
            this.getSubscribers(key).push(subscriber);
        }
        return {
            unbind: () => {
                for (const key of eventTypes) {
                    const subs = this.getSubscribers(key);
                    subs.splice(subs.indexOf(subscriber), 1);
                }
            }
        };
    }

    private getSubscribers(key: T | "all"): ISubscriber[] {
        const subscribersList = this.subscribers.get(key);
        if (subscribersList === undefined) {
            const newList: ISubscriber[] = [];
            this.subscribers.set(key, newList);
            return newList;
        } else {
            return subscribersList;
        }
    }

    notifySubs(eventType: T) {
        for (const sub of this.getSubscribers(eventType)) {
            sub.notify(this, eventType);
        }
        for (const sub of this.getSubscribers("all")) {
            sub.notify(this, eventType);
        }
    }
}

export interface IPublisher<T extends string | number> {
    addSubscriber(subscriber: ISubscriber, eventType: (T | "all") | T[]): {unbind: () => void};
}