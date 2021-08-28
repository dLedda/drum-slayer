import Beat, {BeatInitOptions} from "./Beat";

type BeatGroupInitOptions = {
    beats: BeatInitOptions[],
}

export default class BeatGroup {
    private beats: Beat[] = [];
    private beatKeyMap: Record<string, number> = {};
    private subscribers: (() => void)[] = [];

    constructor(options: BeatGroupInitOptions) {
        for (const beatOptions of options.beats) {
            const newBeat = new Beat(beatOptions);
            this.beats.push(newBeat);
            this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;
        }
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
        this.notify();
    }

    swapBeatsByKeys(beatKey1: string, beatKey2: string): void {
        const index1 = this.beatKeyMap[this.getBeatByKey(beatKey1).getKey()];
        const index2 = this.beatKeyMap[this.getBeatByKey(beatKey2).getKey()];
        this.swapBeatsByIndices(index1, index2);
    }

    private notify(): void {
        this.subscribers.forEach(subscriber => subscriber());
    }

    onBeatChangeByKey(beatKey: string, subscriber: (beatKey: string) => void): void {
        this.getBeatByKey(beatKey).onUpdate(() => subscriber(beatKey));
    }

    onBeatChangeByIndex(beatIndex: number, subscriber: (beatIndex: number) => void): void {
        this.getBeatByIndex(beatIndex).onUpdate(() => subscriber(beatIndex));
    }

    onBeatsChange(subscriber: () => void): void {
        this.subscribers.push(subscriber);
    }

    moveBeatBack(beatKey: string): void {
        const index = this.beatKeyMap[beatKey];
        if (typeof index !== "undefined" && index > 0) {
            this.swapBeatsByIndices(index, index - 1);
        }
        this.notify();
    }

    moveBeatForward(beatKey: string): void {
        const index = this.beatKeyMap[beatKey];
        if (typeof index !== "undefined" && index < this.getBeatCount()) {
            this.swapBeatsByIndices(index, index + 1);
        }
        this.notify();
    }

    canMoveBeatBack(beatKey: string): boolean {
        return this.beatKeyMap[beatKey] > 0;
    }

    canMoveBeatForward(beatKey: string): boolean {
        return this.beatKeyMap[beatKey] < this.beats.length - 1;
    }

    setBeatName(beatKey: string, newName: string): void {
        this.getBeatByKey(beatKey).setName(newName);
        this.notify();
    }
}
