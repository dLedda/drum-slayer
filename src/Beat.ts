import BeatUnit, {BeatUnitType} from "./BeatUnit";

export type BeatInitOptions = {
    timeSig: {
        up: number,
        down: number,
    },
    bars: number,
    drumSchema: string[],
};

export default class Beat {
    private timeSigUp: number = 4;
    private timeSigDown: number = 4;
    private readonly unitRecords: Record<string, BeatUnit[]>;
    private readonly drumSchema: string[];
    private notify: () => void = () => {};
    private barCount: number = 1;

    constructor(options?: BeatInitOptions) {
        this.unitRecords = {};
        if (options) {
            this.drumSchema = [...options.drumSchema];
            this.initUnitRecords();
            this.setTimeSignature(options.timeSig.up, options.timeSig.down);
            this.setBars(options.bars);
        } else {
            this.drumSchema = ['LF', 'LH', 'RH', 'RF'];
            this.initUnitRecords();
            this.setTimeSignature(4, 4);
            this.setBars(48);
        }
    }

    private initUnitRecords(): void {
        for (const drumSchemaTag of this.drumSchema) {
            this.unitRecords[drumSchemaTag] = [];
        }
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
        for (const drumSchemaTag of this.drumSchema) {
            const unitRecord = this.unitRecords[drumSchemaTag];
            if (newBarCount < unitRecord.length) {
                unitRecord.splice(this.barCount, unitRecord.length - newBarCount);
            } else if (newBarCount > unitRecord.length) {
                const barsToAdd = newBarCount - unitRecord.length;
                for (let i = 0; i < barsToAdd; i++) {
                    unitRecord.push(new BeatUnit());
                }
            }
        }
    }

    getTimeSigUp(): number {
        return this.timeSigUp;
    }

    getTimeSigDown(): number {
        return this.timeSigDown;
    }

    stringify(): string {
        let stringified = this.drumSchema.join(" ");
        stringified += "\n";
        for (let i = 0; i < this.unitRecords[this.drumSchema[0]].length; i++) {
            for (const drumSchemaTag of this.drumSchema) {
                stringified += this.unitRecords[drumSchemaTag][i].stringify() + " ";
            }
            if (i % this.timeSigUp === 2) {
                stringified += "\n";
            }
            stringified += "\n";
        }
        return stringified;
    }

    swapSchemaOrder(index1: number, index2: number): void {
        if (this.drumSchema[index1] && this.drumSchema[index2]) {
            const temp = this.drumSchema[index1];
            this.drumSchema[index1] = this.drumSchema[index2];
            this.drumSchema[index2] = temp;
        }
        this.notify();
    }

    turnUnitOn(schemaKey: string, index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
            this.unitRecords[schemaKey][index].setOn(true);
        }
    }

    turnUnitOff(schemaKey: string, index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
            this.unitRecords[schemaKey][index].setOn(false);
        }
    }


    toggleUnit(schemaKey: string, index: number): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
            this.unitRecords[schemaKey][index].toggle();
        }
    }

    setUnitType(schemaKey: string, index: number, type: BeatUnitType): void {
        if (Math.abs(index | 0) !== index) {
            return;
        }
        this.unitRecords[schemaKey]?.[index]?.setType(type);
    }

    onUpdate(updateCallback: () => void) {
        this.notify = updateCallback;
    }

    getUnit(schemaKey: string, index: number): BeatUnit | null {
        return this.unitRecords[schemaKey]?.[index] ?? null;
    }

    getDrumSchema(): string[] {
        return this.drumSchema.slice();
    }

    getBarCount(): number {
        return this.barCount;
    }

    private static isValidTimeSigRange(sig: number): boolean {
        return sig >= 2 && sig <= 64;
    }
}