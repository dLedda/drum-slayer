import "./BeatGroupSettings.css";
import UINode, {UINodeOptions} from "@/ui/UINode";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import ISubscriber from "@/Subscriber";
import BeatGroup, {BeatGroupEvents} from "@/BeatGroup";
import {IPublisher} from "@/Publisher";
import {BeatEvents} from "@/Beat";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import BeatSettingsView from "@/ui/BeatSettings/BeatSettingsView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

export default class BeatGroupSettingsView extends UINode implements ISubscriber {
    private beatGroup: BeatGroup;
    private barCountInput!: NumberInputView;
    private timeSigUpInput!: NumberInputView;
    private autoBeatLengthCheckbox!: BoolBoxView;
    private beatSettingsViews: BeatSettingsView[] = [];
    private beatSettingsContainer!: HTMLDivElement;
    private static readonly EventTypeSubscriptions = [
        BeatGroupEvents.BarCountChanged,
        BeatGroupEvents.TimeSigUpChanged,
        BeatEvents.DisplayTypeChanged,
        BeatGroupEvents.BeatListChanged,
        BeatGroupEvents.LockingChanged,
        BeatGroupEvents.AutoBeatSettingsChanged,
    ];

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.setupBindings();
    }

    setBeatGroup(newBeatGroup: BeatGroup): void {
        this.beatGroup = newBeatGroup;
        this.setupBindings();
        BeatGroupSettingsView.EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    setupBindings(): void {
        this.beatGroup.addSubscriber(this, BeatGroupSettingsView.EventTypeSubscriptions);
    }

    notify<T extends string | number>(publisher: IPublisher<T> | null, event: "all" | T[] | T): void {
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
            this.beatSettingsContainer = UINode.make("div", {
                subs: this.beatSettingsViews.map(view => view.render())
            });
        } else {
            this.beatSettingsContainer.replaceChildren(...this.beatSettingsViews.map(view => view.render()));
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
        return UINode.make("div", {
            classes: ["beat-group-settings"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-group-settings-options"],
                    subs: [
                        UINode.make("div", {
                            classes: ["beat-group-settings-boxes", "beat-group-settings-option"],
                            subs: [
                                this.timeSigUpInput.render(),
                            ],
                        }),
                        UINode.make("div", {
                            classes: ["beat-group-settings-bar-count", "beat-group-settings-option"],
                            subs: [
                                this.barCountInput.render(),
                            ],
                        }),
                        UINode.make("div", {
                            classes: ["beat-group-settings-bar-count", "beat-group-settings-option"],
                            subs: [
                                this.autoBeatLengthCheckbox.render(),
                            ],
                        }),
                        new ActionButtonView({
                            label: "New Track",
                            onClick: () => this.beatGroup.addBeat(),
                        }).render(),
                        this.beatSettingsContainer,
                    ],
                }),
            ],
        });
    }
}