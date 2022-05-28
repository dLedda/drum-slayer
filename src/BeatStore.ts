import Beat, { BeatEvents } from "@/Beat";
import { Capsule, ICapsule, ISubscriber } from "@djledda/ladder";

const EventTypeSubscriptions = [
    BeatEvents.TimeSigUpChanged,
    BeatEvents.BarCountChanged,
    BeatEvents.GlobalDisplayTypeChanged,
    BeatEvents.TrackListChanged,
    BeatEvents.LockingChanged,
    BeatEvents.AutoBeatSettingsChanged,
    BeatEvents.DeepChange,
] as const;
type EventTypeSubscriptions = typeof EventTypeSubscriptions[number];

export default class BeatStore implements ISubscriber<EventTypeSubscriptions> {
    private readonly beats: Beat[];
    private activeBeat: ICapsule<Beat>;
    private onBeatChangeCbs: (() => void)[] = [];
    private autoSave: boolean;
    private orientation: "horizontal" | "vertical" | null = null;

    constructor(options: { loadFromLocalStorage: boolean, autoSave: boolean }) {
        this.autoSave = options.autoSave;
        if (options.loadFromLocalStorage) {
            const save = localStorage.getItem("drum-slayer-save");
            if (save) {
                const serial = JSON.parse(save);
                this.beats = [BeatStore.defaultMainBeatGroup()];
                this.activeBeat = Capsule.new(this.beats[0]);
                this.loadFromSave(serial);
                if (this.autoSave) {
                    this.activeBeat.watch(() => this.save("localStorage"), true);
                    this.beats.forEach(beat => beat.addSubscriber(this, EventTypeSubscriptions));
                }
                return;
            }
        }
        this.beats = [
            BeatStore.defaultMainBeatGroup(),
        ];
        this.activeBeat = Capsule.new(this.beats[0]);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        this.save("localStorage");
    }

    static defaultMainBeatGroup(): Beat {
        const defaultSettings = {
            barCount: 2,
            isLooping: false,
            timeSigUp: 8,
        };
        const mainBeatGroup = new Beat(defaultSettings);
        mainBeatGroup.addTrack({ name: "LF" });
        mainBeatGroup.addTrack({ name: "LH" });
        mainBeatGroup.addTrack({ name: "RH" });
        mainBeatGroup.addTrack({ name: "RF" });
        return mainBeatGroup;
    }

    getActiveBeat(): ICapsule<Beat> {
        return this.activeBeat;
    }

    resetActiveBeat(): void {
        const index = this.beats.indexOf(this.activeBeat.val);
        const reset = BeatStore.defaultMainBeatGroup();
        this.beats[index] = reset;
        this.activeBeat.val = reset;
    }

    getBeats(): Beat[] {
        return this.beats.slice();
    }

    setActiveBeat(beat: Beat): void {
        const index = this.beats.indexOf(beat);
        if (index !== -1) {
            this.activeBeat.val = this.beats[index];
        }
    }

    addNewBeat(): void {
        const newBeat = BeatStore.defaultMainBeatGroup();
        this.beats.push(newBeat);
        if (this.autoSave) {
            newBeat.addSubscriber(this, EventTypeSubscriptions);
        }
        this.onBeatChangeCbs.forEach(cb => cb());
        if (this.autoSave) {
            this.save("localStorage");
        }
    }

    onBeatChanges(callback: () => void) {
        this.onBeatChangeCbs.push(callback);
    }

    save(destination: "localStorage"): void {
        if (destination === "localStorage") {
            const serials = this.beats.map(beat => beat.serialise());
            localStorage.setItem("drum-slayer-save", JSON.stringify({
                beats: serials,
                activeBeatIndex: this.beats.indexOf(this.activeBeat.val),
                orientation: this.orientation,
            }));
        }
    }

    loadFromSave(source: any): void {
        this.beats.length = 0;
        if (Array.isArray(source.beats)
            && (typeof source.activeBeatIndex === "number" || typeof source.activeBeatIndex === "undefined")
            && typeof source.orientation === "string") {
            try {
                source.beats.forEach((beat: any) => this.beats.push(Beat.deserialise(beat)));
                if (typeof source.activeBeatIndex === "number") {
                    this.activeBeat.val = this.beats[source.activeBeatIndex];
                }
                this.orientation = source.orientation;
            } catch (err) {
                console.error(err);
            }
        }
    }

    setOrientation(orientation: "horizontal" | "vertical"): void {
        this.orientation = orientation;
        this.save("localStorage");
    }

    getSavedOrientation(): "horizontal" | "vertical" | null {
        return this.orientation;
    }
}