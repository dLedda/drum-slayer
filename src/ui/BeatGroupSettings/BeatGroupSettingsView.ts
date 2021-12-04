import "./BeatGroupSettings.css";
import UINode, {UINodeOptions} from "../UINode";
import NumberInputView from "../Widgets/NumberInput/NumberInputView";
import ISubscriber from "../../Subscriber";
import BeatGroup, {BeatGroupEvents} from "../../BeatGroup";
import {IPublisher} from "../../Publisher";
import {BeatEvents} from "../../Beat";
import BoolBoxView from "../Widgets/BoolBox/BoolBoxView";
import BeatSettingsView from "../BeatSettings/BeatSettingsView";
import ActionButtonView from "../Widgets/ActionButton/ActionButtonView";

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

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.beatGroup.addSubscriber(this, [
            BeatGroupEvents.BarCountChanged,
            BeatGroupEvents.TimeSigUpChanged,
            BeatEvents.DisplayTypeChanged,
            BeatGroupEvents.BeatListChanged,
            BeatGroupEvents.LockingChanged,
            BeatGroupEvents.AutoBeatSettingsChanged,
        ]);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatGroupEvents.BarCountChanged) {
            this.barCountInput.setValue(this.beatGroup.getBarCount());
        } else if (event === BeatGroupEvents.TimeSigUpChanged) {
            this.timeSigUpInput.setValue(this.beatGroup.getTimeSigUp());
        } else if (event === BeatGroupEvents.BeatListChanged) {
            this.remakeBeatSettingsViews();
        } else if (event === BeatGroupEvents.LockingChanged) {
            if (this.beatGroup.barsLocked()) {
                this.barCountInput.disable();
            } else {
                this.barCountInput.enable();
            }
        } else if (event === BeatGroupEvents.AutoBeatSettingsChanged) {
            this.autoBeatLengthCheckbox.setValue(this.beatGroup.autoBeatLengthOn());
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

    rebuild(): HTMLElement {
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
                        this.beatSettingsContainer,
                        new ActionButtonView({
                            label: "New Track",
                            onClick: () => this.beatGroup.addBeat(),
                        }).render(),
                    ],
                }),
            ],
        });
    }
}