import BeatUnit from "./BeatUnit";

type BeatInitOptions = {
    timeSig: {
        up: number,
        down: number,
    },
    bars: number,
};

export default class Beat {
    private timeSigUp: number = 4;
    private timeSigDown: number = 4;
    private units: BeatUnit[] = [];

    constructor(options?: BeatInitOptions) {
        this.setTimeSignature(options.timeSig.up, options.timeSig.down);
        this.setBars(options.bars);
    }

    setTimeSignature(up: number, down: number): void {
        if (Beat.isValidTimeSigRange(up)) {
            this.timeSigUp = up | 0;
        }
        if (Beat.isValidTimeSigRange(down)) {
            this.timeSigDown = down | 0;
        }
    }

    setBars(barCount: number): void {
        if (barCount*this.timeSigUp < this.units.length) {
            this.units.splice(barCount, this.units.length - barCount);
        } else if (barCount > this.bars) {
            for (let i = 0; i < barCount; i++) {
                this.units.push(new BeatUnit());
            }
        }

        this.bars = barCount;
    }

    stringify(): string {
        return "I am a Beat";
    }

    private static isValidTimeSigRange(sig: number): boolean {
        return sig >= 2 && sig <= 64;
    }
}