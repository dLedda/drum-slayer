import BeatGroup from "../../../BeatGroup";
import UINode, {UINodeOptions} from "../../UINode";
import ISubscriber from "../../../Subscriber";
import {IPublisher} from "../../../Publisher";
import {BeatGroupEvents} from "../../../BeatGroup";
import BeatLikeLoopSettingsView from "../BeatLikeLoopSettings/BeatLikeLoopSettingsView";
import "./BeatGroupSettings.css";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

export default class BeatGroupSettingsView extends UINode implements ISubscriber {
    private beatGroup: BeatGroup;
    private barCountInput!: HTMLInputElement;
    private timeSigUpInput!: HTMLInputElement;
    private loopSettingsView!: BeatLikeLoopSettingsView;

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.beatGroup.addSubscriber(this, [
            BeatGroupEvents.GlobalBarCountChanged,
            BeatGroupEvents.GlobalTimeSigUpChanged
        ]);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatGroupEvents.GlobalBarCountChanged) {
            this.barCountInput.value = this.beatGroup.getBeatByIndex(0).getBarCount().toString();
        } else if (event === BeatGroupEvents.GlobalTimeSigUpChanged) {
            this.barCountInput.value = this.beatGroup.getBeatByIndex(0).getBarCount().toString();
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
                this.beatGroup.setGlobalTimeSigUp(Number(this.timeSigUpInput.value));
            },
        });
        this.node = UINode.make("div", {
            classes: ["beat-group-settings"],
            subs: [
                UINode.make("h4", { innerText: "Settings for beat" }),
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
                    ],
                }),
            ],
        });
        return this.node;
    }
}