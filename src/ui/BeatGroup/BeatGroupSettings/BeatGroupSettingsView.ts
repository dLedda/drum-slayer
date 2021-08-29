import BeatGroup from "../../../BeatGroup";
import UINode, {UINodeOptions} from "../../UINode";
import ISubscriber from "../../../Subscriber";
import {IPublisher} from "../../../Publisher";
import {BeatGroupEvents} from "../../../BeatGroup";

export type BeatGroupSettingsUINodeOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

export default class BeatGroupSettingsView extends UINode implements ISubscriber {
    private beatGroup: BeatGroup;
    private barCountInput!: HTMLInputElement;
    private timeSigUpInput!: HTMLInputElement;

    constructor(options: BeatGroupSettingsUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.beatGroup.addSubscriber(this, [
            BeatGroupEvents.GlobalBarCountChanged,
            BeatGroupEvents.GlobalTimeSigUpChanged
        ]);
        this.rebuild();
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatGroupEvents.GlobalBarCountChanged) {
            this.barCountInput.value = this.beatGroup.getBeatByIndex(0).getBarCount().toString();
        } else if (event === BeatGroupEvents.GlobalTimeSigUpChanged) {
            this.barCountInput.value = this.beatGroup.getBeatByIndex(0).getBarCount().toString();
        }
    }

    rebuild(): HTMLElement {
        this.barCountInput = UINode.make("input", {
            type: "text",
            classes: ["beat-group-settings-view-bar-count"],
            value: this.beatGroup.getBeatByIndex(0).getBarCount(),
            oninput: () => {
                this.beatGroup.setGlobalBarCount(Number(this.barCountInput.value));
            },
        });
        this.timeSigUpInput = UINode.make("input", {
            type: "text",
            value: this.beatGroup.getBeatByIndex(0).getTimeSigUp(),
            classes: ["beat-group-settings-view-time-sig-up"],
            oninput: () => {
                this.beatGroup.setGlobalTimeSigUp(Number(this.timeSigUpInput.value));
            },
        });
        this.node = UINode.make("div", {
            subs: [
                UINode.make("h4", {innerText: "Settings for beat"}),
                UINode.make("label", {
                    innerText: "Bars:",
                }),
                this.barCountInput,
                UINode.make("label", {
                    innerText: "Boxes per bar:",
                }),
                this.timeSigUpInput,
            ],
        });
        return this.node;
    }
}