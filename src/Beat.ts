import BeatUnit, {BeatUnitType} from "./BeatUnit";
import {IPublisher, Publisher} from "./Publisher";
import ISubscriber from "./Subscriber";

export type BeatInitOptions = {
    timeSig?: {
        up: number,
        down: number,
    },
    name?: string,
    bars?: number,
};

export enum BeatEvents {
    NewTimeSig,
    NewBarCount,
    NewName,
    UnitChanged,
}

export default class Beat implements IPublisher<BeatEvents>{
    private static count = 0;
    private readonly key: string;
    private name: string;
    private timeSigUp = 4;
    private timeSigDown = 4;
    private readonly unitRecord: BeatUnit[] = [];
    private barCount = 1;
    private publisher = new Publisher<BeatEvents>();

    constructor(options?: BeatInitOptions) {
        this.key = `Beat-${Beat.count}`;
        this.name = options?.name ?? this.key;
        this.setTimeSignature(options?.timeSig?.up ?? 4, options?.timeSig?.down ?? 4);
        this.setBars(options?.bars ?? 48);
        Beat.count++;
    }

    addSubscriber(subscriber: ISubscriber, eventType: BeatEvents | "all"): { unbind: () => void } {
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

    setBars(barCount: number): void {
        const isPosInt = (barCount > 0 && (barCount | 0) === barCount);
        if (!isPosInt || barCount == this.barCount) {
            return;
        }
        this.barCount = barCount;
        this.updateBeatUnitLength();
        this.publisher.notifySubs(BeatEvents.NewBarCount);
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
        if (Math.abs(index | 0) !== index) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.setOn(true);
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }

    turnUnitOff(index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.setOn(false);
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }


    toggleUnit(index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.toggle();
            this.publisher.notifySubs(BeatEvents.UnitChanged);
        }
    }

    setUnitType(index: number, type: BeatUnitType): void {
        if (Math.abs(index | 0) !== index) {
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

    private static isValidTimeSigRange(sig: number): boolean {
        return sig >= 2 && sig <= 64;
    }

    setName(newName: string): void {
        this.name = newName;
        this.publisher.notifySubs(BeatEvents.NewName);
    }

    getName(): string {
        return this.name;
    }
}