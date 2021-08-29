import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

export enum BeatUnitType {
    Normal,
    GhostNote,
}


const enum BeatUnitEvents {
    Toggle,
    On,
    Off,
    TypeChange,
}


export default class BeatUnit implements IPublisher<BeatUnitEvents> {
    private publisher: Publisher<BeatUnitEvents> = new Publisher<BeatUnitEvents>();
    private on = false;
    private type: BeatUnitType = BeatUnitType.Normal;

    constructor(on = false) {
        this.on = on;
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatUnitEvents | BeatUnitEvents[]): { unbind: () => void } {
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
        this.publisher.notifySubs(BeatUnitEvents.On);
    }

    setType(type: BeatUnitType): void {
        this.type = type;
        this.publisher.notifySubs(BeatUnitEvents.Off);
    }

    getType(): BeatUnitType {
        return this.type;
    }

    isOn(): boolean {
        return this.on;
    }
}
