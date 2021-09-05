import BeatUnit from "./BeatUnit";
import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";
import BeatLike from "./BeatLike";
import {isPosInt} from "./utils";

export type BeatInitOptions = {
    timeSig?: {
        up: number,
        down: number,
    },
    name?: string,
    bars?: number,
    isLooping?: boolean,
    loopLength?: number,
};

export const enum BeatEvents {
    NewTimeSig="BE0",
    NewBarCount="BE1",
    NewName="BE2",
    DisplayTypeChanged="BE3",
    LoopLengthChanged="BE4",
}

export default class Beat implements IPublisher<BeatEvents>, BeatLike {
    private static count = 0;
    private readonly key: string;
    private name: string;
    private timeSigUp = 4;
    private timeSigDown = 4;
    private readonly unitRecord: BeatUnit[] = [];
    private barCount = 1;
    private publisher = new Publisher<BeatEvents>();
    private loopLength: number;
    private looping: boolean;

    constructor(options?: BeatInitOptions) {
        this.key = `B-${Beat.count}`;
        this.name = options?.name ?? this.key;
        this.setTimeSignature({up: options?.timeSig?.up ?? 4, down: options?.timeSig?.down ?? 4});
        this.setBarCount(options?.bars ?? 4);
        Beat.count++;
        this.loopLength = options?.loopLength ?? this.timeSigUp * this.barCount;
        this.looping = options?.isLooping ?? false;
    }

    setLoopLength(loopLength: number): void {
        if (!isPosInt(loopLength) || loopLength < 2) {
            loopLength = this.loopLength;
        }
        this.loopLength = loopLength;
        this.publisher.notifySubs(BeatEvents.LoopLengthChanged);
    }

    setLooping(isLooping: boolean): void {
        this.looping = isLooping;
        this.publisher.notifySubs(BeatEvents.DisplayTypeChanged);
    }

    addSubscriber(subscriber: ISubscriber, eventType: BeatEvents | BeatEvents[] | "all"): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    setTimeSignature(timeSig: {up?: number, down?: number}): void {
        if (timeSig.up && Beat.isValidTimeSigRange(timeSig.up)) {
            this.timeSigUp = timeSig.up | 0;
        }
        if (timeSig.down && Beat.isValidTimeSigRange(timeSig.down)) {
            this.timeSigDown = timeSig.down | 0;
        }
        this.updateBeatUnitLength();
        this.publisher.notifySubs(BeatEvents.NewTimeSig);
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
        this.updateBeatUnitLength();
        this.publisher.notifySubs(BeatEvents.NewBarCount);
    }

    getUnitByIndex(index: number): BeatUnit | null {
        if (this.looping) {
            index %= this.loopLength;
        }
        return this.unitRecord[index] ?? null;
    }

    private updateBeatUnitLength() {
        const newBarCount = this.barCount * this.timeSigUp;
        if (newBarCount < this.unitRecord.length) {
            this.unitRecord.splice(this.barCount * this.timeSigUp, this.unitRecord.length - newBarCount);
        } else if (newBarCount > this.unitRecord.length) {
            const barsToAdd = newBarCount - this.unitRecord.length;
            for (let i = 0; i < barsToAdd; i++) {
                this.unitRecord.push(new BeatUnit());
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
        this.publisher.notifySubs(BeatEvents.NewName);
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
}