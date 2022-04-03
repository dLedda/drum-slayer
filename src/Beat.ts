import Track, {TrackEvents, TrackInitOptions} from "@/Track";
import {IPublisher, Publisher} from "@/Publisher";
import ISubscriber from "@/Subscriber";
import {greatestCommonDivisor, isPosInt} from "@/utils";

type BeatGroupInitOptions = {
    barCount: number;
    isLooping: boolean;
    timeSigUp: number;
    tracks?: TrackInitOptions[],
    loopLength?: number,
    useAutoBeatLength?: boolean,
    name?: string,
};

export const enum BeatEvents {
    TrackOrderChanged="be-0",
    TrackListChanged="be-1",
    BarCountChanged="be-2",
    TimeSigUpChanged="be-3",
    AutoBeatSettingsChanged="be-4",
    LockingChanged="be-5",
    GlobalLoopLengthChanged="be-5",
    GlobalDisplayTypeChanged="be-6",
    NameChanged="be-7",
}

type EventTypeSubscriptions =
    | TrackEvents.LoopLengthChanged
    | TrackEvents.DisplayTypeChanged
    | TrackEvents.WantsRemoval
    | TrackEvents.Baked;

export default class Beat implements IPublisher<BeatEvents>, ISubscriber<EventTypeSubscriptions> {
    private static globalCounter = 0;
    private tracks: Track[] = [];
    private publisher: Publisher<BeatEvents, Beat> = new Publisher<BeatEvents, Beat>(this);
    private barCount: number;
    private timeSigUp: number;
    private globalLoopLength: number;
    private globalIsLooping: boolean;
    private useAutoBeatLength: boolean;
    private barSettingsLocked = false;
    private name: string;

    constructor(options?: BeatGroupInitOptions) {
        Beat.globalCounter++;
        if (options?.name) {
            this.name = options.name;
        } else {
            this.name = `Pattern ${Beat.globalCounter}`;
        }
        if (options?.tracks) {
            for (const trackOptions of options.tracks) {
                this.addTrack(trackOptions);
            }
        }
        this.barCount = options?.barCount ?? 4;
        this.timeSigUp = options?.timeSigUp ?? 4;
        this.globalLoopLength = options?.loopLength ?? this.timeSigUp;
        this.globalIsLooping = options?.isLooping ?? false;
        this.useAutoBeatLength = options?.useAutoBeatLength ?? false;
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch (event) {
        case TrackEvents.LoopLengthChanged:
        case TrackEvents.DisplayTypeChanged:
            this.autoBeatLength();
            break;
        case TrackEvents.WantsRemoval:
            this.removeTrack((publisher as Track).getKey());
            break;
        case TrackEvents.Baked:
            this.setIsUsingAutoBeatLength(false);
            break;
        }
    }

    addSubscriber(subscriber: ISubscriber<BeatEvents>, eventType: BeatEvents | BeatEvents[]): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    private setBarCountInternal(barCount: number): void {
        if (!isPosInt(barCount)) {
            barCount = this.barCount;
        }
        this.barCount = barCount;
        for (const track of this.tracks) {
            track.setBarCount(barCount);
        }
        this.publisher.notifySubs(BeatEvents.BarCountChanged);
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
        for (const track of this.tracks) {
            track.setLoopLength(loopLength);
        }
        this.publisher.notifySubs(BeatEvents.GlobalLoopLengthChanged);
    }

    getLoopLength(): number {
        return this.globalLoopLength;
    }

    setLooping(isLooping: boolean): void {
        this.globalIsLooping = isLooping;
        for (const track of this.tracks) {
            track.setLooping(isLooping);
        }
        this.publisher.notifySubs(BeatEvents.GlobalDisplayTypeChanged);
    }

    isLooping(): boolean {
        return this.globalIsLooping;
    }

    private findSmallestLoopLength(): number {
        const loopLengths = [this.timeSigUp];
        for (const track of this.tracks) {
            if (track.isLooping()) {
                const loopLength = track.getLoopLength();
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
        if (!Track.isValidTimeSigRange(timeSigUp)) {
            timeSigUp = this.timeSigUp;
        }
        this.timeSigUp = timeSigUp;
        for (const track of this.tracks) {
            track.setTimeSignature({up: timeSigUp});
        }
        this.autoBeatLength();
        this.publisher.notifySubs(BeatEvents.TimeSigUpChanged);
    }

    getTimeSigUp(): number {
        return this.timeSigUp;
    }

    getTrackByKey(trackKey: string): Track {
        const foundTrack = this.tracks.find(track => track.getKey() === trackKey);
        if (typeof foundTrack === "undefined") {
            throw new Error(`Could not find the track with key: ${trackKey}`);
        }
        return foundTrack;
    }

    getTrackByIndex(trackIndex: number): Track {
        if (!this.tracks[trackIndex]) {
            throw new Error(`Could not find the track with index: ${trackIndex}`);
        }
        return this.tracks[trackIndex];
    }

    getTrackCount(): number {
        return this.tracks.length;
    }

    getTrackKeys(): string[] {
        return this.tracks.map(track => track.getKey());
    }

    swapTracksByIndices(trackIndex1: number, trackIndex2: number): void {
        const track1 = this.getTrackByIndex(trackIndex1);
        const track2 = this.getTrackByIndex(trackIndex2);
        this.tracks[trackIndex1] = track2;
        this.tracks[trackIndex2] = track1;
        this.publisher.notifySubs(BeatEvents.TrackOrderChanged);
    }

    moveTrackBack(trackKey: string): void {
        const index = this.tracks.indexOf(this.getTrackByKey(trackKey));
        if (typeof index !== "undefined" && index > 0) {
            this.swapTracksByIndices(index, index - 1);
        }
        this.publisher.notifySubs(BeatEvents.TrackOrderChanged);
        this.publisher.notifySubs(BeatEvents.TrackListChanged);
    }

    moveTrackForward(trackKey: string): void {
        const index = this.tracks.indexOf(this.getTrackByKey(trackKey));
        if (typeof index !== "undefined" && index < this.getTrackCount()) {
            this.swapTracksByIndices(index, index + 1);
        }
        this.publisher.notifySubs(BeatEvents.TrackOrderChanged);
        this.publisher.notifySubs(BeatEvents.TrackListChanged);
    }

    canMoveTrackBack(trackKey: string): boolean {
        return this.tracks.indexOf(this.getTrackByKey(trackKey)) > 0;
    }

    canMoveTrackForward(trackKey: string): boolean {
        return this.tracks.indexOf(this.getTrackByKey(trackKey)) < this.tracks.length - 1;
    }

    addTrack(options?: TrackInitOptions): Track {
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
        const newTrack = new Track(options);
        this.tracks.push(newTrack);
        newTrack.addSubscriber(this, [
            TrackEvents.LoopLengthChanged,
            TrackEvents.WantsRemoval,
            TrackEvents.DisplayTypeChanged,
            TrackEvents.Baked,
        ]);
        this.publisher.notifySubs(BeatEvents.TrackListChanged);
        return newTrack;
    }

    removeTrack(trackKey: string): void {
        const track = this.getTrackByKey(trackKey);
        this.tracks.splice(this.tracks.indexOf(track), 1);
        this.autoBeatLength();
        this.publisher.notifySubs(BeatEvents.TrackListChanged);
    }

    setTrackName(trackKey: string, newName: string): void {
        this.getTrackByKey(trackKey).setName(newName);
        this.publisher.notifySubs(BeatEvents.TrackOrderChanged);
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
        this.publisher.notifySubs(BeatEvents.AutoBeatSettingsChanged);
    }

    barsLocked(): boolean {
        return this.barSettingsLocked;
    }

    lockBars(): void {
        this.barSettingsLocked = true;
        this.publisher.notifySubs(BeatEvents.LockingChanged);
    }

    unlockBars(): void {
        this.barSettingsLocked = false;
        this.publisher.notifySubs(BeatEvents.LockingChanged);
    }

    bakeLoops(): void {
        this.tracks.forEach(track => track.bakeLoops());
    }

    setName(newName: string): void {
        this.name = newName;
        this.publisher.notifySubs(BeatEvents.NameChanged);
    }

    getName(): string {
        return this.name;
    }
}
