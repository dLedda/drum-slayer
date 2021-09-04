import Beat, {BeatEvents, BeatInitOptions} from "./Beat";
import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";
import BeatLike from "./BeatLike";
import {isPosInt} from "./utils";

type BeatGroupInitOptions = {
    barCount: number;
    isLooping: boolean;
    timeSigUp: number;
    beats: BeatInitOptions[],
    loopLength?: number,
    forceFullBars?: boolean,
    useAutoBeatLength?: boolean,
}

export const enum BeatGroupEvents {
    BeatOrderChanged="BGE0",
    BeatListChanged="BGE1",
    BarCountChanged="BGE2",
    TimeSigUpChanged="BGE3",
    AutoBeatSettingsChanged="BGE4",
}

export default class BeatGroup implements IPublisher<BeatGroupEvents | BeatEvents>, BeatLike, ISubscriber {
    private beats: Beat[] = [];
    private beatKeyMap: Record<string, number> = {};
    private publisher: Publisher<BeatGroupEvents | BeatEvents> = new Publisher<BeatGroupEvents | BeatEvents>();
    private barCount: number;
    private timeSigUp: number;
    private globalLoopLength: number;
    private globalIsLooping: boolean;
    private forceFullBars: boolean;
    private useAutoBeatLength: boolean;

    constructor(options?: BeatGroupInitOptions) {
        if (options?.beats) {
            for (const beatOptions of options.beats) {
                const newBeat = new Beat(beatOptions);
                this.beats.push(newBeat);
                this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;
            }
        }
        this.barCount = options?.barCount ?? 4;
        this.timeSigUp = options?.timeSigUp ?? 4;
        this.globalLoopLength = options?.loopLength ?? this.barCount * this.timeSigUp;
        this.globalIsLooping = options?.isLooping ?? false;
        this.useAutoBeatLength = options?.useAutoBeatLength ?? false;
        this.forceFullBars = options?.forceFullBars ?? true;
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.LoopLengthChanged) {
            this.autoBeatLength();
        }
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatGroupEvents | BeatEvents | (BeatGroupEvents | BeatEvents)[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    setBarCount(barCount: number): void {
        if (!isPosInt(barCount)) {
            barCount = this.barCount;
        }
        this.barCount = barCount;
        for (const beat of this.beats) {
            beat.setBarCount(barCount);
        }
        this.publisher.notifySubs(BeatGroupEvents.BarCountChanged);
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
        if (isLooping) {
            this.autoBeatLength();
        }
        this.publisher.notifySubs(BeatEvents.DisplayTypeChanged);
    }

    isLooping(): boolean {
        return this.globalIsLooping;
    }

    private findSmallestLoopLength(): number {
        const loopLengths = [];
        const denominators = [];
        for (const beat of this.beats) {
            loopLengths.push(beat.getLoopLength());
        }
        if (this.forceFullBars) {
            loopLengths.push(this.timeSigUp);
        }
        for (let i = 0; i < loopLengths.length; i++) {
            let isFactor = false;
            for (let j = 0; j < loopLengths.length; j++) {
                if (j !== i && loopLengths[j] % loopLengths[i] === 0 && loopLengths[j] !== loopLengths[i]) {
                    isFactor = true;
                    break;
                }
            }
            if (!isFactor && denominators.indexOf(loopLengths[i]) === -1) {
                denominators.push(loopLengths[i]);
            }
        }
        return denominators.reduce((prev, curr) => prev * curr, 1);
    }

    setTimeSigUp(timeSigUp: number): void {
        if (!Beat.isValidTimeSigRange(timeSigUp)) {
            timeSigUp = this.timeSigUp;
        }
        this.timeSigUp = timeSigUp;
        for (const beat of this.beats) {
            beat.setTimeSignature({up: timeSigUp});
        }
        this.publisher.notifySubs(BeatGroupEvents.TimeSigUpChanged);
    }

    getBeatByKey(beatKey: string): Beat {
        if (typeof this.beatKeyMap[beatKey] === "undefined") {
            throw new Error(`Could not find the beat with key: ${beatKey}`);
        }
        return this.getBeatByIndex(this.beatKeyMap[beatKey]);
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
        this.beatKeyMap[beat1.getKey()] = beatIndex2;
        this.beatKeyMap[beat2.getKey()] = beatIndex1;
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    swapBeatsByKeys(beatKey1: string, beatKey2: string): void {
        const index1 = this.beatKeyMap[this.getBeatByKey(beatKey1).getKey()];
        const index2 = this.beatKeyMap[this.getBeatByKey(beatKey2).getKey()];
        this.swapBeatsByIndices(index1, index2);
    }

    moveBeatBack(beatKey: string): void {
        const index = this.beatKeyMap[beatKey];
        if (typeof index !== "undefined" && index > 0) {
            this.swapBeatsByIndices(index, index - 1);
        }
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    moveBeatForward(beatKey: string): void {
        const index = this.beatKeyMap[beatKey];
        if (typeof index !== "undefined" && index < this.getBeatCount()) {
            this.swapBeatsByIndices(index, index + 1);
        }
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    canMoveBeatBack(beatKey: string): boolean {
        return this.beatKeyMap[beatKey] > 0;
    }

    canMoveBeatForward(beatKey: string): boolean {
        return this.beatKeyMap[beatKey] < this.beats.length - 1;
    }

    addBeat(options?: BeatInitOptions): Beat {
        const newBeat = new Beat(options);
        this.beats.push(newBeat);
        this.beatKeyMap[newBeat.getKey()] = this.beats.length;
        newBeat.addSubscriber(this, [BeatEvents.LoopLengthChanged]);
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
        return newBeat;
    }

    removeBeat(beatKey: string): void {
        const beat = this.getBeatByKey(beatKey);
        this.publisher.notifySubs(BeatGroupEvents.BeatListChanged);
        this.beats.splice(this.beats.indexOf(beat), 1);
    }

    setBeatName(beatKey: string, newName: string): void {
        this.getBeatByKey(beatKey).setName(newName);
        this.publisher.notifySubs(BeatGroupEvents.BeatOrderChanged);
    }

    autoBeatLengthOn(): boolean {
        return this.useAutoBeatLength;
    }

    forcesFullBars(): boolean {
        return this.forceFullBars;
    }

    private autoBeatLength(): void {
        if (this.useAutoBeatLength && this.globalIsLooping) {
            this.setBarCount(this.findSmallestLoopLength() / this.timeSigUp);
        }
    }

    setIsUsingAutoBeatLength(isOn: boolean): void {
        this.useAutoBeatLength = isOn;
        this.autoBeatLength();
        this.publisher.notifySubs(BeatGroupEvents.AutoBeatSettingsChanged);
    }

    setForcesFullBars(force: boolean): void {
        this.forceFullBars = force;
        this.autoBeatLength();
        this.publisher.notifySubs(BeatGroupEvents.AutoBeatSettingsChanged);
    }
}
