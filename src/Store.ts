import type BeatUnit from "./BeatUnit";
import Beat, {BeatInitOptions} from "./Beat";

export default class Store {
    private beat: Beat;
    constructor(options: BeatInitOptions) {
        this.beat = new Beat(options);
    }

    getBeat() {
        return this.beat;
    }

    subscribeBeatUnit(schemaKey: string, index: number, callback: (unit: BeatUnit) => void): BeatUnit {
        this.beat.onUnitUpdate(() => {
            callback(this.beat.getUnit(schemaKey, index));
        });
        return this.beat.getUnit(schemaKey, index);
    }
}
