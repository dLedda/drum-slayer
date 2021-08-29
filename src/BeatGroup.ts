import Beat, {BeatInitOptions} from "./Beat";
import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

type BeatGroupInitOptions = {
    beats: BeatInitOptions[],
}

const enum BeatGroupEvents {
    BeatOrderChanged,
    BeatListChanged,
}

export default class BeatGroup implements IPublisher<BeatGroupEvents> {
    private beats: Beat[] = [];
    private beatKeyMap: Record<string, number> = {};
    private publisher: Publisher<BeatGroupEvents> = new Publisher<BeatGroupEvents>();

    constructor(options?: BeatGroupInitOptions) {
        if (options?.beats) {
            for (const beatOptions of options.beats) {
                const newBeat = new Beat(beatOptions);
                this.beats.push(newBeat);
                this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;
            }
        }
    }

    addSubscriber(subscriber: ISubscriber, eventType: "all" | BeatGroupEvents | BeatGroupEvents[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
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
