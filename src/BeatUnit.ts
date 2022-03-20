import {IPublisher, ISubscription, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

export enum BeatUnitType {
    Normal,
    GhostNote,
    Accent,
}


export const enum BeatUnitEvents {
    Toggle,
    On,
    Off,
    TypeChange,
}


export default class BeatUnit implements IPublisher<BeatUnitEvents> {
    private static readonly TypeRotation = [
        BeatUnitType.Normal,
        BeatUnitType.GhostNote,
        BeatUnitType.Accent,
    ] as const;
    private publisher: Publisher<BeatUnitEvents, BeatUnit> = new Publisher<BeatUnitEvents, BeatUnit>(this);
    private on = false;
    private typeIndex = 0;

    constructor(on = false, type = BeatUnitType.Normal) {
        this.on = on;
        this.setType(type);
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
        this.typeIndex = BeatUnit.TypeRotation.indexOf(type);
        this.publisher.notifySubs(BeatUnitEvents.TypeChange);
    }

    getType(): BeatUnitType {
        return BeatUnit.TypeRotation[this.typeIndex];
    }

    rotateType(): void {
        if (this.typeIndex === BeatUnit.TypeRotation.length - 1) {
            this.typeIndex = 0;
        } else {
            this.typeIndex += 1;
        }
        this.publisher.notifySubs(BeatUnitEvents.TypeChange);
    }

    isOn(): boolean {
        return this.on;
    }

    mimic(beatUnit: BeatUnit): void {
        this.setOn(beatUnit.isOn());
        this.setType(beatUnit.getType());
    }
}
