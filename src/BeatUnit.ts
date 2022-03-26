import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

export const enum BeatUnitType {
    Normal="but-0",
    GhostNote="but-1",
    Accent="but-2",
}

export const enum BeatUnitEvent {
    Toggle="bue-0",
    On="bue-1",
    Off="bue-2",
    TypeChange="bue-3",
}


export default class BeatUnit implements IPublisher<BeatUnitEvent> {
    private static readonly TypeRotation = [
        BeatUnitType.Normal,
        BeatUnitType.GhostNote,
        BeatUnitType.Accent,
    ] as const;
    private publisher: Publisher<BeatUnitEvent, BeatUnit> = new Publisher<BeatUnitEvent, BeatUnit>(this);
    private on = false;
    private typeIndex = 0;

    constructor(on = false, type = BeatUnitType.Normal) {
        this.on = on;
        this.setType(type);
    }

    addSubscriber(subscriber: ISubscriber<BeatUnitEvent>, eventType: BeatUnitEvent[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    toggle(): void {
        this.on = !this.on;
        this.publisher.notifySubs(BeatUnitEvent.Toggle);
        if (this.on) {
            this.publisher.notifySubs(BeatUnitEvent.On);
        } else {
            this.publisher.notifySubs(BeatUnitEvent.Off);
        }
    }

    setOn(on: boolean): void {
        this.on = on;
        this.publisher.notifySubs(this.on ? BeatUnitEvent.On : BeatUnitEvent.Off);
    }

    setType(type: BeatUnitType): void {
        this.typeIndex = BeatUnit.TypeRotation.indexOf(type);
        this.publisher.notifySubs(BeatUnitEvent.TypeChange);
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
        this.publisher.notifySubs(BeatUnitEvent.TypeChange);
    }

    isOn(): boolean {
        return this.on;
    }

    mimic(beatUnit: BeatUnit): void {
        this.setOn(beatUnit.isOn());
        this.setType(beatUnit.getType());
    }
}
