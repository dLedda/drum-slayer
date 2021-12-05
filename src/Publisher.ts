import ISubscriber from "./Subscriber";

class Subscription<T extends (string | number), P> implements ISubscription {
    private subscriber: ISubscriber;
    private readonly eventTypes: T[];
    private publisher: Publisher<T, P>;
    constructor(publisher: Publisher<T, P>, subscriber: ISubscriber, eventTypes: T[]) {
        this.subscriber = subscriber;
        this.publisher = publisher;
        this.eventTypes = eventTypes;
    }

    unbind(): void {
        this.publisher.unbind(this);
    }

    getEventTypes(): T[] {
        return this.eventTypes;
    }

    getSubscriber(): ISubscriber {
        return this.subscriber;
    }
}


export class Publisher<T extends (string | number), P> implements IPublisher<T> {
    private subscribers: Map<T | "all", ISubscriber[]>;
    private parent: P;

    constructor(parent: P) {
        this.parent = parent;
        this.subscribers = new Map();
        this.subscribers.set("all", []);
    }

    addSubscriber(subscriber: ISubscriber, eventType: (T | "all") | T[]): ISubscription {
        let eventTypes: (T | "all")[] = [];
        if (!Array.isArray(eventType)) {
            eventTypes.push(eventType);
        } else {
            eventTypes = eventType as (T | "all")[];
        }
        for (const key of eventTypes) {
            this.getSubscribers(key).push(subscriber);
        }
        return new Subscription(this, subscriber, eventTypes);
    }

    unbind(subscription: Subscription<T, P>): void {
        for (const key of subscription.getEventTypes()) {
            const subs = this.getSubscribers(key);
            subs.splice(subs.indexOf(subscription.getSubscriber()), 1);
        }
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

    notifySubs(eventType: T): void {
        for (const sub of this.getSubscribers(eventType)) {
            sub.notify(this.parent, eventType);
        }
        for (const sub of this.getSubscribers("all")) {
            sub.notify(this.parent, eventType);
        }
    }
}

export interface IPublisher<T extends string | number> {
    addSubscriber(subscriber: ISubscriber, eventType: (T | "all") | T[]): {unbind: () => void};
}

export interface ISubscription {
    unbind(): void;
}