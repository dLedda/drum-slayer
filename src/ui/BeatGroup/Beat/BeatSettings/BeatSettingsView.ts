import UINode, {UINodeOptions} from "../../../UINode";
import Beat, {BeatEvents} from "../../../../Beat";
import {IPublisher} from "../../../../Publisher";
import ISubscriber from "../../../../Subscriber";
import "./BeatSettings.css";
import BeatLikeLoopSettingsView from "../../BeatLikeLoopSettings/BeatLikeLoopSettingsView";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private visible = false;
    private timeSigUp!: HTMLInputElement;
    private timeSigDown!: HTMLInputElement;
    private barCountInput!: HTMLInputElement;
    private loopSettingsView!: BeatLikeLoopSettingsView;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.NewTimeSig) {
            this.timeSigUp.value = this.beat.getTimeSigUp().toString();
            this.timeSigDown.value = this.beat.getTimeSigDown().toString();
        } else if (event === BeatEvents.NewBarCount) {
            this.barCountInput.value = this.beat.getBarCount().toString();
        }
    }

    toggleVisible(): void {
        this.visible = !this.visible;
        if (this.visible) {
            this.node?.classList.add("visible");
        } else {
            this.node?.classList.remove("visible");
        }
    }

    isOpen(): boolean {
        return this.visible;
    }

    rebuild(): HTMLElement {
        this.loopSettingsView = new BeatLikeLoopSettingsView({beatLike: this.beat});
        this.timeSigUp = UINode.make("input", {
            classes: ["time-sig-up"],
            type: "number",
            value: this.beat.getTimeSigUp().toString(),
            oninput: (event: Event) => {
                this.beat.setTimeSignature({up: Number((event.target as HTMLInputElement).value) });
            },
        });
        this.timeSigDown = UINode.make("input", {
            classes: ["beat-settings-time-sig-down"],
            type: "number",
            value: this.beat.getTimeSigDown().toString(),
            oninput: (event: Event) => {
                this.beat.setTimeSignature({down: Number((event.target as HTMLInputElement).value) });
            },
        });
        this.barCountInput = UINode.make("input", {
            classes: ["beat-settings-bars-count"],
            type: "number",
            value: this.beat.getBarCount().toString(),
            oninput: (event: Event) => {
                this.beat.setBarCount(Number((event.target as HTMLInputElement).value));
            },
        });
        this.node = UINode.make("div", {
            classes: ["beat-settings"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-settings-time-sig", "beat-settings-option-group", "beat-settings-option"],
                    subs: [
                        UINode.make("label", {innerText: "Time Signature:"}),
                        this.timeSigUp,
                        this.timeSigDown,
                    ]
                }),
                UINode.make("div", {
                    classes: ["beat-settings-bar", "beat-settings-option-group", "beat-settings-option"],
                    subs: [
                        UINode.make("label", {innerText: "Bar Count:"}),
                        this.barCountInput,
                    ],
                }),
                this.loopSettingsView.render(),
            ],
        });
        return this.node;
    }
}
