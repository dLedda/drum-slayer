import Beat, {BeatEvents, BeatInitOptions} from "@/Beat";
import {IPublisher, Publisher} from "@/Publisher";
import ISubscriber from "@/Subscriber";
import BeatLike from "@/BeatLike";
import {greatestCommonDivisor, isPosInt} from "@/utils";

type BeatGroupInitOptions = {
    barCount: number;
    isLooping: boolean;
    timeSigUp: number;
    beats?: BeatInitOptions[],
    loopLength?: number,
    useAutoBeatLength?: boolean,
};

export const enum BeatGroupEvents {
    BeatOrderChanged="BGE0",
    BeatListChanged="BGE1",
    BarCountChanged="BGE2",
    TimeSigUpChanged="BGE3",
    AutoBeatSettingsChanged="BGE4",
    LockingChanged="BGE5",
}

export default class BeatGroup implements IPublisher<BeatGroupEvents | BeatEvents>, BeatLike, ISubscriber {
    private beats: Beat[] = [];
    private publisher: Publisher<BeatGroupEvents | BeatEvents, BeatGroup> = new Publisher<BeatGroupEvents | BeatEvents, BeatGroup>(this);
    private barCount: number;
    private timeSigUp: number;
    private globalLoopLength: number;
    private globalIsLooping: boolean;
    private useAutoBeatLength: boolean;
    private barSettingsLocked = false;

    constructor(options?: BeatGroupInitOptions) {
        if (options?.beats) {
            for (const beatOptions of options.beats) {
                this.addBeat(beatOptions);
            }
        }
        this.barCount = options?.barCount ?? 4;
        this.timeSigUp = options?.timeSigUp ?? 4;
        this.globalLoopLength = options?.loopLength ?? this.timeSigUp;
        this.globalIsLooping = options?.isLooping ?? false;
        this.useAutoBeatLength = options?.useAutoBeatLength ?? false;
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        switch (event) {
        case BeatEvents.LoopLengthChanged:
        case BeatEvents.DisplayTypeChanged:
            this.autoBeatLength();
            break;
        case BeatEvents.WantsRemoval:
            this.removeBeat((publisher as Beat).getKey());
            break;
        case BeatEvents.Baked:
            this.setIsUsingAutoBeatLength(false);
            break;
        }
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatGroupEvents | BeatEvents | (BeatGroupEvents | BeatEvents)[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    private setBarCountInternal(barCount: number): void {
        if (!isPosInt(barCount)) {
            barCount = this.barCount;
        }
        this.barCount = barCount;
        for (const beat of this.beats) {
            beat.setBarCount(barCount);
        }
        this.publisher.notifySubs(BeatGroupEvents.BarCountChanged);
    }

    setBarCount(barCount: number): void {
        if (!this.barSettingsLocked) {
            this.setBarCountInternal(barCount);
        } else {
            this.setBarCountInternal(this.barCount);
        }
    }

    getBarCount(): number {
        return this.barCount;
    }

    setLoopLength(loopLength: number): void {
        if (!isPosInt(loopLength)) {
            return;
        }
        this.globalLoopLength = loopLength;
        for (const beat of this.beats) {
            beat.setLoopLength(loopLength);
        }
        this.publisher.notifySubs(BeatEvents.LoopLengthChanged);
    }

    getLoopLength(): number {
        return this.globalLoopLength;
    }

    setLooping(isLooping: boolean): void {
        this.globalIsLooping = isLooping;
        for (const beat of this.beats) {
            beat.setLooping(isLooping);
        }
        this.publisher.notifySubs(BeatEvents.DisplayTypeChanged);
    }

    isLooping(): boolean {
        return this.globalIsLooping;
    }

    private findSmallestLoopLength(): number {
        const loopLengths = [this.timeSigUp];
        for (const beat of this.beats) {
            if (beat.isLooping()) {
                const loopLength = beat.getLoopLength();
                if (loopLengths.indexOf(loopLength) === -1) {
                    loopLengths.push(loopLength);
                }
            }
        }
        if (loopLengths.length === 1) {
            loopLengths.push(1);
        }
        return loopLengths.reduce((prev, curr) => (prev * curr) / greatestCommonDivisor(prev, curr));
    }

    setTimeSigUp(timeSigUp: number): void {
        if (!Beat.isValidTimeSigRange(timeSigUp)) {
            timeSigUp = this.timeSigUp;
        }
        this.timeSigUp = timeSigUp;
        for (const beat of this.beats) {
            beat.setTimeSignature({up: timeSigUp});
        }
        this.autoBeatLength();
        this.publisher.notifySubs(BeatGroupEvents.TimeSigUpChanged);
    }

    getTimeSigUp(): number {
        return this.timeSigUp;
    }

    getBeatByKey(beatKey: string): Beat {
        const foundBeat = this.beats.find(beat => beat.getKey() === beatKey);
        if (typeof foundBeat === "undefined") {
            throw new Error(`Could not find the beat with key: ${beatKey}`);
        }
        return foundBeat;
    }

    getBeatByIndex(beatIndex: number): Beat {
        if (!this.beats[beatIndex]) {
            throw new Error(`Could not find the beat with index: ${beatIndex}`);
        }
        return this.beats[beatIndex];
    }

    getBeatCount(): number {
        return this.beats.length;
    }

    getBeatKeys(): string[] {
        return this.beats.map(beat => beat.getKey());
    }

    swapBeatsByIndices(beatIndex1: number, beatIndex2: number): void {
        const beat1 = this.getBeatByIndex(beatIndex1);
        const beat2 = this.getBeatByIndex(beatIndex2);
        this.beats[beatIndex1] = beat2;
        this.beats[beatIndex2] = beat1;
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    moveBeatBack(beatKey: string): void {
        const index = this.beats.indexOf(this.getBeatByKey(beatKey));
        if (typeof index !== "undefined" && index > 0) {
            this.swapBeatsByIndices(index, index - 1);
        }
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
    }

    moveBeatForward(beatKey: string): void {
        const index = this.beats.indexOf(this.getBeatByKey(beatKey));
        if (typeof index !== "undefined" && index < this.getBeatCount()) {
            this.swapBeatsByIndices(index, index + 1);
        }
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
    }

    canMoveBeatBack(beatKey: string): boolean {
        return this.beats.indexOf(this.getBeatByKey(beatKey)) > 0;
    }

    canMoveBeatForward(beatKey: string): boolean {
        return this.beats.indexOf(this.getBeatByKey(beatKey)) < this.beats.length - 1;
    }

    addBeat(options?: BeatInitOptions): Beat {
        options = {
            timeSig: {
                up: this.timeSigUp,
                down: 4,
            },
            bars: this.barCount,
            isLooping: this.globalIsLooping,
            loopLength: this.globalLoopLength,
            ...options
        };
        const newBeat = new Beat(options);
        this.beats.push(newBeat);
        newBeat.addSubscriber(this, [
            BeatEvents.LoopLengthChanged,
            BeatEvents.WantsRemoval,
            BeatEvents.DisplayTypeChanged,
            BeatEvents.Baked,
        ]);
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
        return newBeat;
    }

    removeBeat(beatKey: string): void {
        const beat = this.getBeatByKey(beatKey);
        this.beats.splice(this.beats.indexOf(beat), 1);
        this.autoBeatLength();
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
    }

    setBeatName(beatKey: string, newName: string): void {
        this.getBeatByKey(beatKey).setName(newName);
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    autoBeatLengthOn(): boolean {
        return this.useAutoBeatLength;
    }

    private autoBeatLength(): void {
        if (this.useAutoBeatLength) {
            this.setBarCountInternal(this.findSmallestLoopLength() / this.timeSigUp);
        }
    }

    setIsUsingAutoBeatLength(isOn: boolean): void {
        this.useAutoBeatLength = isOn;
        this.autoBeatLength();
        if (isOn) {
            this.lockBars();
        } else {
            this.unlockBars();
        }
        this.publisher.notifySubs(BeatGroupEvents.AutoBeatSettingsChanged);
    }

    barsLocked(): boolean {
        return this.barSettingsLocked;
    }

    lockBars(): void {
        this.barSettingsLocked = true;
        this.publisher.notifySubs(BeatGroupEvents.LockingChanged);
    }

    unlockBars(): void {
        this.barSettingsLocked = false;
        this.publisher.notifySubs(BeatGroupEvents.LockingChanged);
    }

    bakeLoops(): void {
        this.beats.forEach(beat => beat.bakeLoops());
    }
}
