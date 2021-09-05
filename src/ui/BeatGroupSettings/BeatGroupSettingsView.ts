import BeatLikeLoopSettingsView from "../BeatLikeLoopSettings/BeatLikeLoopSettingsView";
import "./BeatGroupSettings.css";
import UINode, {UINodeOptions} from "../UINode";
import NumberInputView from "../Widgets/NumberInput/NumberInputView";
import ISubscriber from "../../Subscriber";
import BeatGroup, {BeatGroupEvents} from "../../BeatGroup";
import {IPublisher} from "../../Publisher";
import {BeatEvents} from "../../Beat";
import BoolBoxView from "../Widgets/BoolBox/BoolBoxView";
import BeatSettingsView from "../BeatSettings/BeatSettingsView";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

export default class BeatGroupSettingsView extends UINode implements ISubscriber {
    private beatGroup: BeatGroup;
    private barCountInput!: NumberInputView;
    private timeSigUpInput!: NumberInputView;
    private loopSettingsView!: BeatLikeLoopSettingsView;
    private autoBeatLengthCheckbox!: BoolBoxView;
    private forceFullBarsCheckbox!: BoolBoxView;
    private autoBeatOptions!: HTMLElement;

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.beatGroup.addSubscriber(this, [
            BeatGroupEvents.BarCountChanged,
            BeatGroupEvents.TimeSigUpChanged,
            BeatEvents.DisplayTypeChanged,
        ]);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatGroupEvents.BarCountChanged) {
            this.barCountInput.setValue(this.beatGroup.getBarCount());
        } else if (event === BeatGroupEvents.TimeSigUpChanged) {
            this.timeSigUpInput.setValue(this.beatGroup.getTimeSigUp());
        } else if (event === BeatEvents.DisplayTypeChanged) {
            if (this.beatGroup.isLooping()) {
                this.autoBeatOptions.classList.add("visible");
            } else {
                this.autoBeatOptions.classList.remove("visible");
            }
        }
    }

    rebuild(): HTMLElement {
        this.loopSettingsView = new BeatLikeLoopSettingsView({beatLike: this.beatGroup});
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
        this.autoBeatOptions = UINode.make("div", {
            classes: ["beat-group-settings-option-group"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-group-settings-autobeat-option", "beat-group-settings-option"],
                    subs: [
                        this.autoBeatLengthCheckbox.render(),
                    ],
                }),
            ]
        });
        const beatSettingsViews = [];
        for (let i = 0; i < this.beatGroup.getBeatCount(); i++) {
            beatSettingsViews.push(new BeatSettingsView({ beat: this.beatGroup.getBeatByIndex(i) }));
        }
        this.node = UINode.make("div", {
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
                        this.loopSettingsView.render(),
                        this.autoBeatOptions,
                        UINode.make("button", {
                            innerText: "New Track",
                            onclick: () => this.beatGroup.addBeat(),
                        }),
                        ...beatSettingsViews.map(view => view.render()),
                    ],
                }),
            ],
        });
        return this.node;
    }
}