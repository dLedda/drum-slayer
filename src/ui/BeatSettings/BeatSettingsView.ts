import "./BeatSettings.css";
import Beat, {BeatEvents} from "@/Beat";
import UINode, {UINodeOptions} from "@/ui/UINode";
import ISubscriber from "@/Subscriber";
import {IPublisher, ISubscription} from "@/Publisher";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private nameInput!: HTMLInputElement;
    private deleteButton!: ActionButtonView;
    private loopLengthInput!: NumberInputView;
    private loopCheckbox!: BoolBoxView;
    private loopLengthSection!: HTMLDivElement;
    private sub!: ISubscription;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.sub = this.beat.addSubscriber(this, "all");
    }

    setBeat(beat: Beat): void {
        this.sub.unbind();
        this.beat = beat;
        this.setupBindings();
        this.notify(null, BeatEvents.NewName);
        this.notify(null, BeatEvents.LoopLengthChanged);
        this.notify(null, BeatEvents.DisplayTypeChanged);
    }

    notify<T extends string | number>(publisher: IPublisher<T> | null, event: "all" | T[] | T): void {
        if (event === BeatEvents.NewName) {
            this.nameInput.value = this.beat.getName();
        } else if (event === BeatEvents.LoopLengthChanged) {
            this.loopLengthInput.setValue(this.beat.getLoopLength());
        } else if (event === BeatEvents.DisplayTypeChanged) {
            this.loopCheckbox.setValue(this.beat.isLooping());
            if (this.beat.isLooping()) {
                this.loopLengthSection.classList.remove("hide");
            } else {
                this.loopLengthSection.classList.add("hide");
            }
        }
    }

    build(): HTMLElement {
        this.nameInput = UINode.make("input", {
            value: this.beat.getName(),
            classes: ["beat-settings-name-field"],
            type: "text",
            oninput: (event: Event) => this.beat.setName((event.target as HTMLInputElement).value),
        });
        this.deleteButton = new ActionButtonView({
            icon: "trash",
            type: "secondary",
            onClick: () => this.beat.delete(),
        });
        this.loopLengthInput = new NumberInputView({
            initialValue: this.beat.getLoopLength(),
            onDecrement: () => this.beat.setLoopLength(this.beat.getLoopLength() - 1),
            onIncrement: () => this.beat.setLoopLength(this.beat.getLoopLength() + 1),
            onNewInput: (input: number) => this.beat.setLoopLength(input),
        });
        this.loopCheckbox = new BoolBoxView({
            label: "Loop:",
            value: this.beat.isLooping(),
            onInput: (isChecked: boolean) => this.beat.setLooping(isChecked),
        });
        this.loopLengthSection = UINode.make("div", {
            classes: ["loop-settings-option"],
            subs: [
                this.loopLengthInput.render(),
            ],
        });
        if (this.beat.isLooping()) {
            this.loopLengthSection.classList.remove("hide");
        } else {
            this.loopLengthSection.classList.add("hide");
        }
        return UINode.make("div", {
            classes: ["beat-settings"],
            subs: [
                this.nameInput,
                UINode.make("div", {
                    classes: ["loop-settings"],
                    subs: [
                        this.loopCheckbox.render(),
                    ]
                }),
                this.loopLengthSection,
                this.deleteButton.render(),
            ],
        });
    }
}
