import TrackUnit, {TrackUnitType} from "@/TrackUnit";
import {IPublisher, Publisher} from "@/Publisher";
import ISubscriber from "@/Subscriber";
import {isPosInt} from "@/utils";

export type TrackInitOptions = {
    timeSig?: {
        up: number,
        down: number,
    },
    name?: string,
    bars?: number,
    isLooping?: boolean,
    loopLength?: number,
};

export const enum TrackEvents {
    NewTimeSig="be-0",
    NewBarCount="be-1",
    NewName="be-2",
    DisplayTypeChanged="be-3",
    LoopLengthChanged="be-4",
    WantsRemoval="be-5",
    Baked="be-6",
    DeepChange="be-7",
}

export type TrackSerial = {
    name: string,
    timeSigUp: number,
    timeSigDown: number,
    units: {
        isOn: boolean[],
        type: TrackUnitType[],
    },
    barCount: number,
    loopLength: number,
    looping: boolean,
}

export default class Track implements IPublisher<TrackEvents> {
    private static count = 0;
    private readonly key: string;
    private name: string;
    private timeSigUp = 4;
    private timeSigDown = 4;
    private readonly unitRecord: TrackUnit[] = [];
    private barCount = 1;
    private publisher = new Publisher<TrackEvents, Track>(this);
    private loopLength: number;
    private looping: boolean;

    constructor(options?: TrackInitOptions) {
        this.key = `B-${Track.count}`;
        this.name = options?.name ?? this.key;
        this.setTimeSignature({up: options?.timeSig?.up ?? 4, down: options?.timeSig?.down ?? 4});
        this.setBarCount(options?.bars ?? 4);
        Track.count++;
        this.loopLength = options?.loopLength ?? this.timeSigUp * this.barCount;
        this.looping = options?.isLooping ?? false;
    }

    static deserialise(serial: any): Track {
        if (!Track.isTrackSerial(serial)) {
            throw new Error("Invalid track serial.");
        }
        const track = new Track({
            bars: serial.barCount,
            isLooping: serial.looping,
            loopLength: serial.loopLength,
            name: serial.name,
            timeSig: {
                up: serial.timeSigUp,
                down: serial.timeSigDown,
            },
        });
        const units = serial.units.isOn.map((isOn, i) => new TrackUnit({
            on: isOn,
            type: serial.units.type[i],
            parent: track,
        }));
        track.unitRecord.length = 0;
        track.unitRecord.push(...units);
        return track;
    }

    setLoopLength(loopLength: number): void {
        if (!isPosInt(loopLength) || loopLength < 2) {
            loopLength = this.loopLength;
        }
        this.loopLength = loopLength;
        this.publisher.notifySubs(TrackEvents.LoopLengthChanged);
    }

    setLooping(isLooping: boolean): void {
        this.looping = isLooping;
        this.publisher.notifySubs(TrackEvents.DisplayTypeChanged);
    }

    addSubscriber(subscriber: ISubscriber<TrackEvents>, eventType: TrackEvents | TrackEvents[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    setTimeSignature(timeSig: {up?: number, down?: number}): void {
        if (timeSig.up && Track.isValidTimeSigRange(timeSig.up)) {
            this.timeSigUp = timeSig.up | 0;
        }
        if (timeSig.down && Track.isValidTimeSigRange(timeSig.down)) {
            this.timeSigDown = timeSig.down | 0;
        }
        this.updateTrackUnitLength();
        this.publisher.notifySubs(TrackEvents.NewTimeSig);
    }

    setTimeSigUp(timeSigUp: number): void {
        this.setTimeSignature({up: timeSigUp});
    }

    setTimeSigDown(timeSigUp: number): void {
        this.setTimeSignature({down: timeSigUp});
    }

    setBarCount(barCount: number): void {
        if (!isPosInt(barCount) || barCount == this.barCount) {
            barCount = this.barCount;
        }
        this.barCount = barCount;
        this.updateTrackUnitLength();
        this.publisher.notifySubs(TrackEvents.NewBarCount);
    }

    getUnitByIndex(index: number): TrackUnit | null {
        if (this.looping) {
            index %= this.loopLength;
        }
        return this.unitRecord[index] ?? null;
    }

    private updateTrackUnitLength() {
        const newBarCount = this.barCount * this.timeSigUp;
        if (newBarCount < this.unitRecord.length) {
            this.unitRecord.splice(this.barCount * this.timeSigUp, this.unitRecord.length - newBarCount);
        } else if (newBarCount > this.unitRecord.length) {
            const barsToAdd = newBarCount - this.unitRecord.length;
            for (let i = 0; i < barsToAdd; i++) {
                this.unitRecord.push(new TrackUnit({
                    parent: this,
                }));
            }
        }
    }

    getTimeSigUp(): number {
        return this.timeSigUp;
    }

    getTimeSigDown(): number {
        return this.timeSigDown;
    }

    getBarCount(): number {
        return this.barCount;
    }

    getKey(): string {
        return this.key;
    }

    static isValidTimeSigRange(sig: number): boolean {
        return sig >= 2 && sig <= 32;
    }

    setName(newName: string): void {
        this.name = newName;
        this.publisher.notifySubs(TrackEvents.NewName);
    }

    getName(): string {
        return this.name;
    }

    isLooping(): boolean {
        return this.looping;
    }

    getLoopLength(): number {
        return this.loopLength;
    }

    delete(): void {
        this.publisher.notifySubs(TrackEvents.WantsRemoval);
    }

    bakeLoops(): void {
        if (this.isLooping()) {
            this.unitRecord.forEach((unit, i) => {
                const reprUnitAtPos = this.getUnitByIndex(i);
                if (reprUnitAtPos) {
                    unit.mimic(reprUnitAtPos);
                }
            });
            this.publisher.notifySubs(TrackEvents.Baked);
            this.setLooping(false);
        } else {
            this.publisher.notifySubs(TrackEvents.Baked);
        }
    }

    serialise(): Readonly<TrackSerial> {
        return {
            name: this.name,
            timeSigUp: this.timeSigUp,
            timeSigDown: this.timeSigDown,
            units: {
                isOn: this.unitRecord.map(unit => unit.isOn()),
                type: this.unitRecord.map(unit => unit.getType()),
            },
            barCount: this.barCount,
            loopLength: this.loopLength,
            looping: this.looping,
        } as const;
    }

    static isTrackSerial(serial: any): serial is TrackSerial {
        const correctTypes =  typeof serial.name === "string" &&
            typeof serial.timeSigUp === "number" &&
            typeof serial.timeSigDown === "number" &&
            typeof serial.units === "object" &&
            Array.isArray(serial.units.isOn) &&
            Array.isArray(serial.units.type) &&
            typeof serial.barCount === "number" &&
            typeof serial.loopLength === "number" &&
            typeof serial.looping === "boolean";
        return correctTypes && serial.units.isOn.length === serial.units.type.length;
    }

    alertDeepChange(): void {
        this.publisher.notifySubs(TrackEvents.DeepChange);
    }
}