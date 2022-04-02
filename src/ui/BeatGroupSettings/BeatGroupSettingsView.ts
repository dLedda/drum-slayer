import "./BeatGroupSettings.css";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import ISubscriber from "@/Subscriber";
import BeatGroup, {BeatGroupEvents} from "@/BeatGroup";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import BeatSettingsView from "@/ui/BeatSettings/BeatSettingsView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

const EventTypeSubscriptions = [
    BeatGroupEvents.BarCountChanged,
    BeatGroupEvents.TimeSigUpChanged,
    BeatGroupEvents.GlobalDisplayTypeChanged,
    BeatGroupEvents.BeatListChanged,
    BeatGroupEvents.LockingChanged,
    BeatGroupEvents.AutoBeatSettingsChanged,
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatGroupSettingsView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private beatGroup: BeatGroup;
    private barCountInput!: NumberInputView;
    private timeSigUpInput!: NumberInputView;
    private autoBeatLengthCheckbox!: BoolBoxView;
    private beatSettingsViews: BeatSettingsView[] = [];
    private beatSettingsContainer!: HTMLDivElement;

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.setupBindings();
    }

    setBeatGroup(newBeatGroup: BeatGroup): void {
        this.beatGroup = newBeatGroup;
        this.setupBindings();
        EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    setupBindings(): void {
        this.beatGroup.addSubscriber(this, EventTypeSubscriptions);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch(event) {
        case BeatGroupEvents.BarCountChanged:
            this.barCountInput.setValue(this.beatGroup.getBarCount());
            break;
        case BeatGroupEvents.TimeSigUpChanged:
            this.timeSigUpInput.setValue(this.beatGroup.getTimeSigUp());
            break;
        case BeatGroupEvents.BeatListChanged:
            this.remakeBeatSettingsViews();
            break;
        case BeatGroupEvents.LockingChanged:
            if (this.beatGroup.barsLocked()) {
                this.barCountInput.disable();
            } else {
                this.barCountInput.enable();
            }
            break;
        case BeatGroupEvents.AutoBeatSettingsChanged:
            this.autoBeatLengthCheckbox.setValue(this.beatGroup.autoBeatLengthOn());
            break;
        case BeatGroupEvents.GlobalDisplayTypeChanged:
            break;
        }
    }

    private remakeBeatSettingsViews() {
        const beatCount = this.beatGroup.getBeatCount();
        this.beatSettingsViews.splice(beatCount, this.beatSettingsViews.length - beatCount);
        for (let i = 0; i < beatCount; i++) {
            if (this.beatSettingsViews[i]) {
                this.beatSettingsViews[i].setBeat(this.beatGroup.getBeatByIndex(i));
            } else {
                this.beatSettingsViews.push(new BeatSettingsView({ beat: this.beatGroup.getBeatByIndex(i) }));
            }
        }
        if (!this.beatSettingsContainer) {
            this.beatSettingsContainer = h("div", {}, this.beatSettingsViews);
        } else {
            this.beatSettingsContainer.replaceChildren(...this.beatSettingsViews.reverse().map(view => view.render()));
        }
    }

    build(): HTMLElement {
        this.barCountInput = new NumberInputView({
            label: "Bars:",
            initialValue: this.beatGroup.getBarCount(),
            setter: (input: number) => this.beatGroup.setBarCount(input),
            getter: () => this.beatGroup.getBarCount(),
        });
        this.timeSigUpInput = new NumberInputView({
            label: "Boxes per bar:",
            initialValue: this.beatGroup.getTimeSigUp(),
            setter: (input: number) => this.beatGroup.setTimeSigUp(input),
            getter: () => this.beatGroup.getTimeSigUp(),
        });
        this.autoBeatLengthCheckbox = new BoolBoxView({
            label: "Auto beat length:",
            value: this.beatGroup.autoBeatLengthOn(),
            onInput: (isChecked: boolean) => this.beatGroup.setIsUsingAutoBeatLength(isChecked),
        });
        this.remakeBeatSettingsViews();
        return h("div", {
            classes: ["beat-group-settings"],
        }, [
            h("div", {
                classes: ["beat-group-settings-options"],
            }, [
                h("div", {
                    classes: ["beat-group-settings-boxes", "beat-group-settings-option"],
                }, [
                    this.timeSigUpInput,
                ]),
                h("div", {
                    classes: ["beat-group-settings-bar-count", "beat-group-settings-option"]
                    ,
                }, [
                    this.barCountInput,
                ]),
                h("div", {
                    classes: ["beat-group-settings-bar-count", "beat-group-settings-option"],
                }, [
                    this.autoBeatLengthCheckbox,
                ]),
                new ActionButtonView({
                    label: "New Track",
                    onClick: () => this.beatGroup.addBeat(),
                }),
                this.beatSettingsContainer,
            ]),
        ]);
    }
}