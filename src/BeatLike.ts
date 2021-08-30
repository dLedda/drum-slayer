import {IPublisher} from "./Publisher";
import {BeatEvents} from "./Beat";

export default interface BeatLike extends IPublisher<BeatEvents>{
    setBarCount(barCount: number): void;
    getBarCount(): void;
    setLooping(isLooping: boolean): void;
    isLooping(): boolean;
    setLoopLength(loopLength: number): void;
    getLoopLength(): number;
}
