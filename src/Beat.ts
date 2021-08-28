import BeatUnit, {BeatUnitType} from "./BeatUnit";

export type BeatInitOptions = {
    timeSig: {
        up: number,
        down: number,
    },
    name: string,
    bars: number,
};

export default class Beat {
    private static count = 0;
    private readonly key: string;
    private name: string;
    private timeSigUp = 4;
    private timeSigDown = 4;
    private readonly unitRecord: BeatUnit[] = [];
    private observers: (() => void)[] = [];
    private barCount = 1;

    constructor(options: BeatInitOptions) {
        this.key = `Beat-${Beat.count}`;
        if (options.timeSig) {
            this.name = options.name;
            this.setTimeSignature(options.timeSig.up, options.timeSig.down);
            this.setBars(options.bars);
        } else {
            this.name = this.key;
            this.setTimeSignature(4, 4);
            this.setBars(48);
        }
        Beat.count++;
    }

    setTimeSignature(up: number, down: number): void {
        if (Beat.isValidTimeSigRange(up)) {
            if (Beat.isValidTimeSigRange(down)) {
                this.timeSigUp = up | 0;
                this.timeSigDown = down | 0;
                this.updateBeatUnitLength();
                this.notify();
            }
        }
    }

    setBars(barCount: number): void {
        const isPosInt = (barCount > 0 && (barCount | 0) === barCount);
        if (!isPosInt || barCount == this.barCount) {
            return;
        }
        this.barCount = barCount;
        this.updateBeatUnitLength();
        this.notify();
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
            this.notify();
        }
    }

    turnUnitOff(index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.setOn(false);
            this.notify();
        }
    }


    toggleUnit(index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        const unit = this.getUnit(index);
        if (unit) {
            unit.toggle();
            this.notify();
        }
    }

    setUnitType(index: number, type: BeatUnitType): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        this.getUnit(index).setType(type);
        this.notify();
    }

    unitIsOn(index: number): boolean {
        return this.getUnit(index)?.isOn();
    }

    unitType(index: number): BeatUnitType {
        return this.getUnit(index)?.getType();
    }

    onUpdate(updateCallback: () => void): void {
        this.observers.push(updateCallback);
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

    private notify(): void {
        this.observers.forEach(observer => observer());
    }

    setName(newName: string): void {
        this.name = newName;
        this.notify();
    }

    getName(): string {
        return this.name;
    }
}