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
}

export const enum BeatGroupEvents {
    BeatOrderChanged,
    BeatListChanged,
    GlobalBarCountChanged,
    GlobalTimeSigUpChanged,
}

export default class BeatGroup implements IPublisher<BeatGroupEvents | BeatEvents>, BeatLike {
    private beats: Beat[] = [];
    private beatKeyMap: Record<string, number> = {};
    private publisher: Publisher<BeatGroupEvents | BeatEvents> = new Publisher<BeatGroupEvents | BeatEvents>();
    private globalBarCount: number;
    private globalTimeSigUp: number;
    private globalLoopLength: number;
    private globalIsLooping: boolean;

    constructor(options?: BeatGroupInitOptions) {
        if (options?.beats) {
            for (const beatOptions of options.beats) {
                const newBeat = new Beat(beatOptions);
                this.beats.push(newBeat);
                this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;
            }
        }
        this.globalBarCount = options?.barCount ?? 4;
        this.globalTimeSigUp = options?.timeSigUp ?? 4;
        this.globalLoopLength = options?.loopLength ?? this.globalBarCount * this.globalTimeSigUp;
        this.globalIsLooping = options?.isLooping ?? false;
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatGroupEvents | BeatEvents | (BeatGroupEvents | BeatEvents)[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    setBarCount(barCount: number): void {
        if (barCount <= 0 || (barCount | 0) !== barCount) {
            return;
        }
        this.globalBarCount = barCount;
        for (const beat of this.beats) {
            beat.setBarCount(barCount);
        }
        this.publisher.notifySubs(BeatGroupEvents.GlobalBarCountChanged);
    }

    getBarCount(): number {
        return this.globalBarCount;
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

    setGlobalTimeSigUp(timeSigUp: number): void {
        if (!Beat.isValidTimeSigRange(timeSigUp)) {
            return;
        }
        this.globalTimeSigUp = timeSigUp;
        for (const beat of this.beats) {
            beat.setTimeSignature({up: timeSigUp});
        }
        this.publisher.notifySubs(BeatGroupEvents.GlobalTimeSigUpChanged);
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
}
