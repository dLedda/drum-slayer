import "./BeatLikeLoopSettings.css";
import BeatLike from "@/BeatLike";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import ISubscriber from "@/Subscriber";
import UINode, {UINodeOptions} from "@/ui/UINode";
import {BeatEvents} from "@/Beat";
import {IPublisher} from "@/Publisher";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";

export type BeatLikeLoopSettingsViewUINodeOptions = UINodeOptions & {
    beatLike: BeatLike,
    title?: string,
};

export default class BeatLikeLoopSettingsView extends UINode implements ISubscriber {
    private beatLike: BeatLike;
    private loopLengthInput!: NumberInputView;
    private loopCheckbox!: BoolBoxView;
    private loopLengthSection!: HTMLDivElement;
    private title: string;

    constructor(options: BeatLikeLoopSettingsViewUINodeOptions) {
        super(options);
        this.beatLike = options.beatLike;
        this.title = options.title ?? "Looping settings:";
        this.setupBindings();
    }

    private setupBindings() {
        this.beatLike.addSubscriber(this, [
            BeatEvents.LoopLengthChanged,
            BeatEvents.DisplayTypeChanged
        ]);
    }

    notify<T extends string | number>(publisher: IPublisher<T> | null, event: "all" | T[] | T): void {
        if (event === BeatEvents.LoopLengthChanged) {
            this.loopLengthInput.setValue(this.beatLike.getLoopLength());
        } else if (event === BeatEvents.DisplayTypeChanged) {
            this.loopCheckbox.setValue(this.beatLike.isLooping());
            if (this.beatLike.isLooping()) {
                this.loopLengthSection.classList.remove("hide");
            } else {
                this.loopLengthSection.classList.add("hide");
            }
        }
    }

    setBeatLike(beatLike: BeatLike): void {
        this.beatLike = beatLike;
        this.notify(null, BeatEvents.LoopLengthChanged);
        this.notify(null, BeatEvents.DisplayTypeChanged);
    }

    build(): HTMLElement {
        this.loopLengthInput = new NumberInputView({
            initialValue: this.beatLike.getLoopLength(),
            label: "Length:",
            onDecrement: () => this.beatLike.setLoopLength(this.beatLike.getLoopLength() - 1),
            onIncrement: () => this.beatLike.setLoopLength(this.beatLike.getLoopLength() + 1),
            onNewInput: (input: number) => this.beatLike.setLoopLength(input),
        });
        this.loopCheckbox = new BoolBoxView({
            label: "On:",
            value: this.beatLike.isLooping(),
            onInput: (isChecked: boolean) => this.beatLike.setLooping(isChecked),
        });
        this.loopLengthSection = UINode.make("div", {
            classes: ["loop-settings-option"],
            subs: [
                this.loopLengthInput.render(),
            ],
        });
        if (this.beatLike.isLooping()) {
            this.loopLengthSection.classList.remove("hide");
        } else {
            this.loopLengthSection.classList.add("hide");
        }
        return UINode.make("div", {
            classes: ["loop-settings"],
            subs: [
                UINode.make("p", {innerText: this.title}),
                UINode.make("div", {
                    classes: ["loop-settings-option-group"],
                    subs: [
                        UINode.make("div", {
                            classes: ["loop-settings-option"],
                            subs: [
                                this.loopCheckbox.render(),
                            ],
                        }),
                        this.loopLengthSection,
                    ],
                }),
            ]
        });
    }
}
