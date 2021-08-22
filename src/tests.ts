import {BeatUnitType} from "./BeatUnit";
import Beat from "./Beat";

const beat = new Beat({
    drumSchema: ["LH", "RH", "LF", "LR"],
    timeSig: {
        up: 3,
        down: 4,
    },
    bars: 10,
});

console.log(beat.stringify());