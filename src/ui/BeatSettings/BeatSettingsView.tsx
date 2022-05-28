import "./BeatSettings.css";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import Beat, { BeatEvents } from "@/Beat";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import TrackSettingsView from "@/ui/TrackSettings/TrackSettingsView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";
import { h, ISubscriber, Rung, RungOptions } from "@djledda/ladder";

export type BeatSettingsUINodeOptions = RungOptions & {
    beat: Beat,
};

const EventTypeSubscriptions = [
    BeatEvents.TimeSigUpChanged,
    BeatEvents.BarCountChanged,
    BeatEvents.GlobalDisplayTypeChanged,
    BeatEvents.TrackListChanged,
    BeatEvents.LockingChanged,
    BeatEvents.AutoBeatSettingsChanged,
];
type EventTypeSubscriptions = typeof EventTypeSubscriptions[number];

export default class BeatSettingsView extends Rung implements ISubscriber<EventTypeSubscriptions> {
    private beat: Beat;
    private barCountInput!: NumberInputView;
    private timeSigUpInput!: NumberInputView;
    private autoBeatLengthCheckbox!: BoolBoxView;
    private trackSettingsViews: TrackSettingsView[] = [];
    private trackSettingsContainer!: HTMLDivElement;

    constructor(options: BeatSettingsUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    setBeat(newBeat: Beat): void {
        this.beat = newBeat;
        this.setupBindings();
        EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    setupBindings(): void {
        this.beat.addSubscriber(this, EventTypeSubscriptions);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch(event) {
        case BeatEvents.BarCountChanged:
            this.barCountInput.setValue(this.beat.getBarCount());
            break;
        case BeatEvents.TimeSigUpChanged:
            this.timeSigUpInput.setValue(this.beat.getTimeSigUp());
            break;
        case BeatEvents.TrackListChanged:
            this.remakeBeatSettingsViews();
            break;
        case BeatEvents.LockingChanged:
            if (this.beat.barsLocked()) {
                this.barCountInput.disable();
            } else {
                this.barCountInput.enable();
            }
            break;
        case BeatEvents.AutoBeatSettingsChanged:
            this.autoBeatLengthCheckbox.setValue(this.beat.autoBeatLengthOn());
            break;
        case BeatEvents.GlobalDisplayTypeChanged:
            break;
        }
    }

    private remakeBeatSettingsViews() {
        const trackCount = this.beat.getTrackCount();
        this.trackSettingsViews.splice(trackCount, this.trackSettingsViews.length - trackCount);
        for (let i = 0; i < trackCount; i++) {
            if (this.trackSettingsViews[i]) {
                this.trackSettingsViews[i].setBeat(this.beat.getTrackByIndex(i));
            } else {
                this.trackSettingsViews.unshift(new TrackSettingsView({ track: this.beat.getTrackByIndex(i) }));
            }
        }
        if (!this.trackSettingsContainer) {
            this.trackSettingsContainer = <div>{...this.trackSettingsViews}</div> as HTMLDivElement;
        } else {
            this.trackSettingsContainer.replaceChildren(...this.trackSettingsViews.reverse().map(view => view.render()));
        }
    }

    build(): Node {
        this.barCountInput = new NumberInputView({
            label: "Bars:",
            initialValue: this.beat.getBarCount(),
            setter: (input: number) => this.beat.setBarCount(input),
            getter: () => this.beat.getBarCount(),
        });
        this.timeSigUpInput = new NumberInputView({
            label: "Boxes per bar:",
            initialValue: this.beat.getTimeSigUp(),
            setter: (input: number) => this.beat.setTimeSigUp(input),
            getter: () => this.beat.getTimeSigUp(),
        });
        this.autoBeatLengthCheckbox = new BoolBoxView({
            label: "Auto beat length:",
            value: this.beat.autoBeatLengthOn(),
            onInput: (isChecked: boolean) => this.beat.setIsUsingAutoBeatLength(isChecked),
        });
        this.remakeBeatSettingsViews();
        return <div className={"beat-settings"}>
            <div className={"beat-settings-options"}>
                <div classes={["beat-settings-boxes", "beat-settings-option"]}>
                    {this.timeSigUpInput}
                </div>
                <div classes={["beat-settings-bar-count", "beat-settings-option"]}>
                    {this.barCountInput}
                </div>
                <div classes={["beat-settings-bar-count", "beat-settings-option"]}>
                    {this.autoBeatLengthCheckbox}
                </div>
                {new ActionButtonView({
                    label: "New Track",
                    onClick: () => this.beat.addTrack(),
                })}
                {this.trackSettingsContainer}
            </div>
        </div>;
    }
}