import {IPublisher, ISubscription, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

export enum BeatUnitType {
    Normal,
    GhostNote,
}


export const enum BeatUnitEvents {
    Toggle,
    On,
    Off,
    TypeChange,
}


export default class BeatUnit implements IPublisher<BeatUnitEvents> {
    private publisher: Publisher<BeatUnitEvents, BeatUnit> = new Publisher<BeatUnitEvents, BeatUnit>(this);
    private on = false;
    private type: BeatUnitType = BeatUnitType.Normal;

    constructor(on = false) {
        this.on = on;
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatUnitEvents | BeatUnitEvents[]): ISubscription {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    toggle(): void {
        this.on = !this.on;
        this.publisher.notifySubs(BeatUnitEvents.Toggle);
        if (this.on) {
            this.publisher.notifySubs(BeatUnitEvents.On);
        } else {
            this.publisher.notifySubs(BeatUnitEvents.Off);
        }
    }

    setOn(on: boolean): void {
        this.on = on;
        this.publisher.notifySubs(this.on ? BeatUnitEvents.On : BeatUnitEvents.Off);
    }

    setType(type: BeatUnitType): void {
        this.type = type;
        this.publisher.notifySubs(BeatUnitEvents.TypeChange);
    }

    getType(): BeatUnitType {
        return this.type;
    }

    isOn(): boolean {
        return this.on;
    }
}
