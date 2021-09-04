import BeatGroup from "../../../BeatGroup";
import UINode, {UINodeOptions} from "../../UINode";
import ISubscriber from "../../../Subscriber";
import {IPublisher} from "../../../Publisher";
import {BeatGroupEvents} from "../../../BeatGroup";
import BeatLikeLoopSettingsView from "../BeatLikeLoopSettings/BeatLikeLoopSettingsView";
import "./BeatGroupSettings.css";
import {BeatEvents} from "../../../Beat";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

export default class BeatGroupSettingsView extends UINode implements ISubscriber {
    private beatGroup: BeatGroup;
    private barCountInput!: HTMLInputElement;
    private timeSigUpInput!: HTMLInputElement;
    private loopSettingsView!: BeatLikeLoopSettingsView;
    private autoBeatLengthCheckbox!: HTMLInputElement;
    private forceFullBarsCheckbox!: HTMLInputElement;
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
            this.barCountInput.valueAsNumber = this.beatGroup.getBeatByIndex(0).getBarCount();
        } else if (event === BeatGroupEvents.TimeSigUpChanged) {
            this.timeSigUpInput.valueAsNumber = this.beatGroup.getBeatByIndex(0).getTimeSigUp();
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
        this.barCountInput = UINode.make("input", {
            type: "number",
            value: this.beatGroup.getBeatByIndex(0).getBarCount().toString(),
            oninput: () => {
                this.beatGroup.setBarCount(Number(this.barCountInput.value));
            },
        });
        this.timeSigUpInput = UINode.make("input", {
            type: "number",
            value: this.beatGroup.getBeatByIndex(0).getTimeSigUp().toString(),
            oninput: () => {
                this.beatGroup.setTimeSigUp(Number(this.timeSigUpInput.value));
            },
        });
        this.autoBeatLengthCheckbox = UINode.make("input", {
            type: "checkbox",
            checked: this.beatGroup.autoBeatLengthOn(),
            oninput: () => {
                this.beatGroup.setIsUsingAutoBeatLength(this.autoBeatLengthCheckbox.checked);
            },
        });
        this.forceFullBarsCheckbox = UINode.make("input", {
            type: "checkbox",
            checked: this.beatGroup.forcesFullBars(),
            oninput: () => {
                this.beatGroup.setForcesFullBars(this.forceFullBarsCheckbox.checked);
            },
        });
        this.autoBeatOptions = UINode.make("div", {
            classes: ["beat-group-settings-option-group"],
            subs: [
                UINode.make("div", {
                    subs: [
                        UINode.make("label", { innerText: "Auto beat length:"}),
                        this.autoBeatLengthCheckbox,
                    ],
                }),
                UINode.make("div", {
                    subs: [
                        UINode.make("label", { innerText: "Force full bars:"}),
                        this.forceFullBarsCheckbox,
                    ],
                }),
            ]
        });
        this.node = UINode.make("div", {
            classes: ["beat-group-settings"],
            subs: [
                UINode.make("div", { innerText: "Settings for beat" }),
                UINode.make("div", {
                    classes: ["beat-group-settings-options"],
                    subs: [
                        UINode.make("div", {
                            classes: ["beat-group-settings-bar-count", "beat-group-settings-option"],
                            subs: [
                                UINode.make("label", { innerText: "Bars:" }),
                                this.barCountInput,
                            ],
                        }),
                        UINode.make("div", {
                            classes: ["beat-group-settings-boxes", "beat-group-settings-option"],
                            subs: [
                                UINode.make("label", { innerText: "Boxes per bar:" }),
                                this.timeSigUpInput,
                            ],
                        }),
                        this.loopSettingsView.render(),
                        this.autoBeatOptions,
                    ],
                }),
            ],
        });
        return this.node;
    }
}