import "./TrackSettings.css";
import Track, { TrackEvents } from "@/Track";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";
import EditableTextFieldView from "@/ui/Widgets/EditableTextFIeld/EditableTextFieldView";
import { h, ISubscriber, ISubscription, Rung, RungOptions } from "@djledda/ladder";

export type BeatSettingsViewUINodeOptions = RungOptions & {
    track: Track,
};

const EventTypeSubscriptions = [
    TrackEvents.NewName,
    TrackEvents.LoopLengthChanged,
    TrackEvents.DisplayTypeChanged,
];
type EventTypeSubscriptions = typeof EventTypeSubscriptions[number];

export default class TrackSettingsView extends Rung implements ISubscriber<EventTypeSubscriptions> {
    private track: Track;
    private loopLengthInput!: NumberInputView;
    private bakeButton!: ActionButtonView;
    private loopCheckbox!: BoolBoxView;
    private loopLengthSection!: HTMLDivElement;
    private sub!: ISubscription;
    private title!: EditableTextFieldView;
    private editingTitle: boolean;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.editingTitle = false;
        this.track = options.track;
        this.setupBindings();
    }

    private setupBindings() {
        this.sub = this.track.addSubscriber(this, EventTypeSubscriptions);
    }

    setBeat(track: Track): void {
        this.sub.unbind();
        this.track = track;
        this.setupBindings();
        EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch(event) {
        case TrackEvents.NewName:
            this.title.setText(this.track.getName());
            break;
        case TrackEvents.LoopLengthChanged:
            this.loopLengthInput.setValue(this.track.getLoopLength());
            break;
        case TrackEvents.DisplayTypeChanged:
            this.loopCheckbox.setValue(this.track.isLooping());
            this.bakeButton.setDisabled(!this.track.isLooping());
            if (this.track.isLooping()) {
                this.loopLengthSection.classList.remove("hide");
            } else {
                this.loopLengthSection.classList.add("hide");
            }
            break;
        }
    }

    build(): Node {
        this.title = new EditableTextFieldView({
            initialText: this.track.getName(),
            setter: (newText: string) => this.track.setName(newText),
        });
        this.bakeButton = new ActionButtonView({
            icon: "snowflake",
            type: "secondary",
            alt: "Bake Loops",
            disabled: !this.track.isLooping(),
            onClick: () => this.track.bakeLoops(),
        });
        this.loopLengthInput = new NumberInputView({
            initialValue: this.track.getLoopLength(),
            onDecrement: () => this.track.setLoopLength(this.track.getLoopLength() - 1),
            onIncrement: () => this.track.setLoopLength(this.track.getLoopLength() + 1),
            onNewInput: (input: number) => this.track.setLoopLength(input),
        });
        this.loopCheckbox = new BoolBoxView({
            label: "Loop:",
            value: this.track.isLooping(),
            onInput: (isChecked: boolean) => this.track.setLooping(isChecked),
        });
        this.loopLengthSection = <div className={"loop-settings-option"}>{this.loopLengthInput}</div> as HTMLDivElement;
        if (this.track.isLooping()) {
            this.loopLengthSection.classList.remove("hide");
        } else {
            this.loopLengthSection.classList.add("hide");
        }
        return <div className={"track-settings"}>
            <div className={"track-settings-title-container"}>
                {this.title}
            </div>
            <div className={"track-settings-lower"}>
                {this.bakeButton}
                {new ActionButtonView({
                    icon: "trash",
                    type: "secondary",
                    alt: "Delete Track",
                    onClick: () => this.track.delete(),
                })}
                <div className={"loop-settings"}>
                    {this.loopCheckbox}
                </div>
                {this.loopLengthSection}
            </div>
        </div>;
    }
}
