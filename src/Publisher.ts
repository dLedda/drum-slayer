import ISubscriber, {LEvent} from "./Subscriber";

class Subscription<EventType extends LEvent, PublisherType> implements ISubscription {
    private subscriber: ISubscriber<EventType>;
    private readonly eventTypes: EventType[];
    private publisher: Publisher<EventType, PublisherType>;
    constructor(publisher: Publisher<EventType, PublisherType>, subscriber: ISubscriber<EventType>, eventTypes: EventType[]) {
        this.subscriber = subscriber;
        this.publisher = publisher;
        this.eventTypes = eventTypes;
    }

    unbind(): void {
        this.publisher.unbind(this);
    }

    getEventTypes(): EventType[] {
        return this.eventTypes;
    }

    getSubscriber(): ISubscriber<EventType> {
        return this.subscriber;
    }
}

interface EventSubscriberRecord<T extends LEvent> {
    get<K extends T>(key: K): ISubscriber<K>[];
    set<K extends T>(key: K, subscribers: ISubscriber<K>[]): EventSubscriberRecord<T>;
}


export class Publisher<EventType extends LEvent, PublisherType> implements IPublisher<EventType> {
    private subscribers: EventSubscriberRecord<EventType>;
    private parent: PublisherType;

    constructor(parent: PublisherType) {
        this.parent = parent;
        this.subscribers = new Map();
    }

    addSubscriber(subscriber: ISubscriber<EventType>, subscribeTo: EventType | EventType[]): ISubscription {
        let eventTypes: EventType[] = [];
        if (!Array.isArray(subscribeTo)) {
            eventTypes.push(subscribeTo);
        } else {
            eventTypes = subscribeTo;
        }
        for (const key of eventTypes) {
            this.getSubscribers(key).push(subscriber);
        }
        return new Subscription(this, subscriber, eventTypes);
    }

    unbind(subscription: Subscription<EventType, PublisherType>): void {
        for (const key of subscription.getEventTypes()) {
            const subs = this.getSubscribers(key);
            subs.splice(subs.indexOf(subscription.getSubscriber()), 1);
        }
    }

    private getSubscribers<K extends EventType>(key: K): ISubscriber<K>[] {
        const subscribersList = this.subscribers.get(key);
        if (subscribersList === undefined) {
            const newList: ISubscriber<K>[] = [];
            this.subscribers.set(key, newList);
            return newList;
        } else {
            return subscribersList;
        }
    }

    notifySubs<K extends EventType>(eventType: K): void {
        for (const sub of this.getSubscribers(eventType)) {
            sub.notify(this.parent, eventType);
        }
    }
}

export interface IPublisher<T extends LEvent> {
    addSubscriber(subscriber: ISubscriber<T>, subscribeTo: T | T[]): {unbind: () => void};
}

export interface ISubscription {
    unbind(): void;
}