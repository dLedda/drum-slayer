import "./BeatSettings.css";
import Beat, {BeatEvents} from "../../Beat";
import UINode, {UINodeOptions} from "../UINode";
import ISubscriber from "../../Subscriber";
import NumberInputView from "../Widgets/NumberInput/NumberInputView";
import BeatLikeLoopSettingsView from "../BeatLikeLoopSettings/BeatLikeLoopSettingsView";
import {IPublisher} from "../../Publisher";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private visible = false;
    private timeSigUp!: NumberInputView;
    private timeSigDown!: NumberInputView;
    private barCountInput!: NumberInputView;
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
            this.timeSigUp.setValue(this.beat.getTimeSigUp());
            this.timeSigDown.setValue(this.beat.getTimeSigDown());
        } else if (event === BeatEvents.NewBarCount) {
            this.barCountInput.setValue(this.beat.getBarCount());
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
        this.timeSigUp = new NumberInputView({
            initialValue: this.beat.getTimeSigUp(),
            setter: (value: number) => this.beat.setBarCount(value),
            getter: () => this.beat.getBarCount(),
        });
        this.timeSigDown = new NumberInputView({
            initialValue: this.beat.getTimeSigDown(),
            setter: (value: number) => this.beat.setBarCount(value),
            getter: () => this.beat.getBarCount(),
        });
        this.barCountInput = new NumberInputView({
            label: "Bar Count:",
            initialValue: this.beat.getBarCount(),
            setter: (value: number) => this.beat.setBarCount(value),
            getter: () => this.beat.getBarCount(),
        });
        this.node = UINode.make("div", {
            classes: ["beat-settings"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-settings-time-sig", "beat-settings-option-group", "beat-settings-option"],
                    subs: [
                        UINode.make("label", {innerText: "Time Signature:"}),
                        this.timeSigUp.render(),
                        this.timeSigDown.render(),
                    ]
                }),
                UINode.make("div", {
                    classes: ["beat-settings-bar", "beat-settings-option-group", "beat-settings-option"],
                    subs: [this.barCountInput.render()],
                }),
                this.loopSettingsView.render(),
            ],
        });
        return this.node;
    }
}
