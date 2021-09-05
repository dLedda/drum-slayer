import "./BeatLikeLoopSettings.css";
import BeatLike from "../../BeatLike";
import NumberInputView from "../Widgets/NumberInput/NumberInputView";
import ISubscriber from "../../Subscriber";
import UINode, {UINodeOptions} from "../UINode";
import {BeatEvents} from "../../Beat";
import {IPublisher} from "../../Publisher";

export type BeatLikeLoopSettingsViewUINodeOptions = UINodeOptions & {
    beatLike: BeatLike,
};

export default class BeatLikeLoopSettingsView extends UINode implements ISubscriber {
    private beatLike: BeatLike;
    private loopLengthInput!: NumberInputView;
    private loopCheckbox!: HTMLInputElement;

    constructor(options: BeatLikeLoopSettingsViewUINodeOptions) {
        super(options);
        this.beatLike = options.beatLike;
        this.setupBindings();
    }

    private setupBindings() {
        this.beatLike.addSubscriber(this, [
            BeatEvents.LoopLengthChanged,
            BeatEvents.DisplayTypeChanged
        ]);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.LoopLengthChanged) {
            this.loopLengthInput.setValue(this.beatLike.getLoopLength());
        } else if (event === BeatEvents.DisplayTypeChanged) {
            this.loopCheckbox.checked = this.beatLike.isLooping();
        }
    }

    rebuild(): HTMLElement {
        this.loopLengthInput = new NumberInputView({
            initialValue: this.beatLike.getLoopLength(),
            label: "Length:",
            onDecrement: () => this.beatLike.setLoopLength(this.beatLike.getLoopLength() - 1),
            onIncrement: () => this.beatLike.setLoopLength(this.beatLike.getLoopLength() + 1),
            onNewInput: (input: number) => this.beatLike.setLoopLength(input),
        });
        this.loopCheckbox = UINode.make("input", {
            classes: ["loop-settings-loop-toggle"],
            type: "checkbox",
            checked: this.beatLike.isLooping(),
            oninput: (event: Event) => {
                this.beatLike.setLooping((event.target as HTMLInputElement).checked);
            },
        });
        this.node = UINode.make("div", {
            classes: ["loop-settings"],
            subs: [
                UINode.make("p", {innerText: "Looping:"}),
                UINode.make("div", {
                    classes: ["loop-settings-option-group"],
                    subs: [
                        UINode.make("div", {
                            classes: ["loop-settings-option"],
                            subs: [
                                this.loopLengthInput.render(),
                            ],
                        }),
                        UINode.make("div", {
                            classes: ["loop-settings-option"],
                            subs: [
                                UINode.make("label", {innerText: "On:"}),
                                this.loopCheckbox,
                            ],
                        }),
                    ],
                }),
            ]
        });
        return this.node;
    }
}
