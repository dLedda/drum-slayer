import UINode, {UINodeOptions} from "../../../UINode";
import Beat, {BeatEvents} from "../../../../Beat";
import {IPublisher} from "../../../../Publisher";
import "./BeatSettingsView.css";
import ISubscriber from "../../../../Subscriber";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private visible = false;
    private timeSigUp: HTMLInputElement;
    private timeSigDown: HTMLInputElement;
    private barCountInput: HTMLInputElement;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, BeatEvents.NewName);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T) {
        if (event === BeatEvents.NewTimeSig) {
            this.timeSigUp.value = this.beat.getTimeSigUp().toString();
            this.timeSigDown.value = this.beat.getTimeSigDown().toString();
        } else if (event === BeatEvents.NewBarCount) {
            this.barCountInput.value = this.beat.getBarCount();
        }
    }

    toggleVisible() {
        this.visible = !this.visible;
        if (this.visible) {
            this.node?.classList.add("visible");
        } else {
            this.node?.classList.remove("visible");
        }
    }

    isOpen() {
        return this.visible;
    }

    rebuild(): HTMLElement {
        this.timeSigUp = UINode.make("input", {});
        this.timeSigUp.addEventListener("input",
            (event) => this.beat.setTimeSignature({
                up: Number((event.target as HTMLInputElement).value) }));
        this.timeSigDown = UINode.make("input", {});
        this.timeSigDown.addEventListener("input",
            (event) => this.beat.setTimeSignature({
                down: Number((event.target as HTMLInputElement).value) }));
        this.node = UINode.make("div", {
            subs: [
                UINode.make("p", {innerText: `Settings for ${this.beat.getName()}`}),
                this.timeSigUp,
                this.timeSigDown,
            ],
            classes: ["beatSettingsView"]
        });
        return this.node;
    }
}
