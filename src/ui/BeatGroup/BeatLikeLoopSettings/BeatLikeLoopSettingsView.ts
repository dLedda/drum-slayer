import BeatLike from "../../../BeatLike";
import UINode, {UINodeOptions} from "../../UINode";
import ISubscriber from "../../../Subscriber";
import {IPublisher} from "../../../Publisher";
import {BeatEvents} from "../../../Beat";
import "./BeatLikeLoopSettings.css";

export type BeatLikeLoopSettingsViewUINodeOptions = UINodeOptions & {
    beatLike: BeatLike,
};

export default class BeatLikeLoopSettingsView extends UINode implements ISubscriber {
    private beatLike: BeatLike;
    private loopLengthInput!: HTMLInputElement;
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
            this.loopLengthInput.value = this.beatLike.getLoopLength().toString();
        } else if (event === BeatEvents.DisplayTypeChanged) {
            this.loopCheckbox.checked = this.beatLike.isLooping();
        }
    }

    rebuild(): HTMLElement {
        this.loopLengthInput = UINode.make("input", {
            classes: ["loop-settings-loop-length"],
            type: "number",
            value: this.beatLike.getLoopLength().toString(),
            oninput: (event: Event) => {
                this.beatLike.setLoopLength(Number((event.target as HTMLInputElement).value));
            },
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
                                UINode.make("label", {innerText: "Length:"}),
                                this.loopLengthInput,
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
