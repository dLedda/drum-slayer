import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";
import Track from "@/Track";

export const enum TrackUnitType {
    Normal="tut-0",
    GhostNote="tut-1",
    Accent="tut-2",
    GhostNoteAccent="tut-3",
}

export const enum TrackUnitEvent {
    Toggle="tue-0",
    On="tue-1",
    Off="tue-2",
    TypeChange="tue-3",
}


export default class TrackUnit implements IPublisher<TrackUnitEvent> {
    private static readonly TypeRotation = [
        TrackUnitType.Normal,
        TrackUnitType.GhostNote,
        TrackUnitType.Accent,
        TrackUnitType.GhostNoteAccent,
    ] as const;
    private publisher: Publisher<TrackUnitEvent, TrackUnit> = new Publisher<TrackUnitEvent, TrackUnit>(this);
    private on = false;
    private typeIndex = 0;
    private parent: Track;

    constructor(options: {
        on?: boolean,
        type?: TrackUnitType,
        parent: Track,
    }) {
        this.parent = options.parent;
        this.on = options.on ?? false;
        this.setType(options.type ?? TrackUnitType.Normal);
    }

    addSubscriber(subscriber: ISubscriber<TrackUnitEvent>, eventType: TrackUnitEvent[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    toggle(): void {
        this.on = !this.on;
        this.publisher.notifySubs(TrackUnitEvent.Toggle);
        if (this.on) {
            this.publisher.notifySubs(TrackUnitEvent.On);
        } else {
            this.publisher.notifySubs(TrackUnitEvent.Off);
        }
        this.parent.alertDeepChange();
    }

    setOn(on: boolean): void {
        this.on = on;
        this.publisher.notifySubs(this.on ? TrackUnitEvent.On : TrackUnitEvent.Off);
        this.parent.alertDeepChange();
    }

    setType(type: TrackUnitType): void {
        this.typeIndex = TrackUnit.TypeRotation.indexOf(type);
        this.publisher.notifySubs(TrackUnitEvent.TypeChange);
        this.parent.alertDeepChange();
    }

    getType(): TrackUnitType {
        return TrackUnit.TypeRotation[this.typeIndex];
    }

    rotateType(): void {
        if (this.typeIndex === TrackUnit.TypeRotation.length - 1) {
            this.typeIndex = 0;
        } else {
            this.typeIndex += 1;
        }
        this.publisher.notifySubs(TrackUnitEvent.TypeChange);
        this.parent.alertDeepChange();
    }

    isOn(): boolean {
        return this.on;
    }

    mimic(trackUnit: TrackUnit): void {
        this.setOn(trackUnit.isOn());
        this.setType(trackUnit.getType());
    }
}
