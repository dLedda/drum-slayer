import UINode, {UINodeOptions} from "../../../UINode";
import Beat, {BeatEvents} from "../../../../Beat";
import {IPublisher} from "../../../../Publisher";
import ISubscriber from "../../../../Subscriber";
import "./BeatSettings.css";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private visible = false;
    private timeSigUp!: HTMLInputElement;
    private timeSigDown!: HTMLInputElement;
    private barCountInput!: HTMLInputElement;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T) {
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
        this.timeSigUp = UINode.make("input", {
            value: this.beat.getTimeSigUp().toString(),
            oninput: (event) => {
                this.beat.setTimeSignature({up: Number((event.target as HTMLInputElement).value) });
            },
        });
        this.timeSigDown = UINode.make("input", {
            value: this.beat.getTimeSigDown().toString(),
            oninput: (event) => {
                this.beat.setTimeSignature({down: Number((event.target as HTMLInputElement).value) });
            },
        });
        this.barCountInput = UINode.make("input", {
            value: this.beat.getBarCount().toString(),
            oninput: (event) => {
                this.beat.setBars(Number((event.target as HTMLInputElement).value));
            },
        });
        this.node = UINode.make("div", {
            subs: [
                UINode.make("div", {
                    classes: ["beat-settings-time-sig"],
                    subs: [
                        UINode.make("label", {innerText: "Time Signature:"}),
                        this.timeSigUp,
                        this.timeSigDown,
                    ]
                }),
                UINode.make("label", {innerText: "Bars:"}),
                this.barCountInput,
            ],
            classes: ["beat-settings"]
        });
        return this.node;
    }
}
