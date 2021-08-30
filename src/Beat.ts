import BeatUnit, {BeatUnitType} from "./BeatUnit";
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

export enum BeatEvents {
    NewTimeSig,
    NewBarCount,
    NewName,
    UnitChanged,
    DisplayTypeChanged,
    LoopLengthChanged,
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
        this.key = `Beat-${Beat.count}`;
        this.name = options?.name ?? this.key;
        this.setTimeSignature({up: options?.timeSig?.up ?? 4, down: options?.timeSig?.down ?? 4});
        this.setBarCount(options?.bars ?? 4);
        Beat.count++;
        this.loopLength = options?.loopLength ?? this.timeSigUp * this.barCount;
        this.looping = options?.isLooping ?? false;
    }

    setLoopLength(loopLength: number): void {
        if (!isPosInt(loopLength) || loopLength < 2) {
            return;
        }
        this.loopLength = loopLength | 0;
        this.publisher.notifySubs(BeatEvents.LoopLengthChanged);
    }

    setLooping(isLooping: boolean): void {
        this.looping = isLooping;
        this.publisher.notifySubs(BeatEvents.DisplayTypeChanged);
    }

    addSubscriber(subscriber: ISubscriber, eventType: BeatEvents | "all"): { unbind: () => void } {
        return this.publisher.addSubscriber(subscriber, eventType);
    }

    setTimeSignature(timeSig: {up?: number, down?: number}): void {
        if (timeSig.up && Beat.isValidTimeSigRange(timeSig.up)) {
            this.timeSigUp = timeSig.up | 0;
            this.loopLength = this.timeSigUp * this.barCount;
        }
        if (timeSig.down && Beat.isValidTimeSigRange(timeSig.down)) {
            this.timeSigDown = timeSig.down | 0;
        }
        this.updateBeatUnitLength();
        this.publisher.notifySubs(BeatEvents.NewTimeSig);
    }

    setBarCount(barCount: number): void {
        if (!isPosInt(barCount) || barCount == this.barCount) {
            return;
        }
        this.barCount = barCount;
        this.loopLength = this.timeSigUp * this.barCount;
        this.updateBeatUnitLength();
        this.publisher.notifySubs(BeatEvents.NewBarCount);
    }

    getUnitByIndex(index: number): BeatUnit | null {
        if (this.looping) {
            return this.unitRecord[index % this.loopLength];
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

    turnUnitOn(index: number): void {
        if (!isPosInt(index)) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.setOn(true);
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }

    turnUnitOff(index: number): void {
        if (!isPosInt(index)) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.setOn(false);
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }


    toggleUnit(index: number): void {
        if (!isPosInt(index)) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.toggle();
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }

    setUnitType(index: number, type: BeatUnitType): void {
        if (!isPosInt(index)) {
            return;
        }
        this.getUnit(index).setType(type);
        this.publisher.notifySubs(BeatEvents.UnitChanged);
    }

    unitIsOn(index: number): boolean {
        return this.getUnit(index)?.isOn();
    }

    unitType(index: number): BeatUnitType {
        return this.getUnit(index)?.getType();
    }

    private getUnit(index: number): BeatUnit {
        if (!this.unitRecord[index]) {
            throw new Error(`Invalid beat unit index! - ${index}`);
        }
        return this.unitRecord[index];
    }

    getBarCount(): number {
        return this.barCount;
    }

    getKey(): string {
        return this.key;
    }

    static isValidTimeSigRange(sig: number): boolean {
        return sig >= 2 && sig <= 64;
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