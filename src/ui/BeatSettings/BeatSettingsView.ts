import "./BeatSettings.css";
import Beat, {BeatEvents} from "@/Beat";
import UINode, {UINodeOptions} from "@/ui/UINode";
import ISubscriber, {SubscriptionEvent} from "@/Subscriber";
import {ISubscription} from "@/Publisher";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

const EventTypeSubscriptions = [
    BeatEvents.NewName,
    BeatEvents.LoopLengthChanged,
    BeatEvents.DisplayTypeChanged,
];

export default class BeatSettingsView extends UINode implements ISubscriber<typeof EventTypeSubscriptions> {
    private beat: Beat;
    private loopLengthInput!: NumberInputView;
    private bakeButton!: ActionButtonView;
    private loopCheckbox!: BoolBoxView;
    private loopLengthSection!: HTMLDivElement;
    private sub!: ISubscription;
    private titleInput!: HTMLInputElement;
    private titleDisplay!: HTMLSpanElement;
    private editingTitle: boolean;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.editingTitle = false;
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
        EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    notify(publisher: unknown, event: SubscriptionEvent<typeof EventTypeSubscriptions>): void {
        switch(event) {
        case BeatEvents.NewName:
            this.titleInput.value = this.beat.getName();
            this.titleDisplay.innerText = this.beat.getName();
            break;
        case BeatEvents.LoopLengthChanged:
            this.loopLengthInput.setValue(this.beat.getLoopLength());
            break;
        case BeatEvents.DisplayTypeChanged:
            this.loopCheckbox.setValue(this.beat.isLooping());
            this.bakeButton.setDisabled(!this.beat.isLooping());
            if (this.beat.isLooping()) {
                this.loopLengthSection.classList.remove("hide");
            } else {
                this.loopLengthSection.classList.add("hide");
            }
            break;
        }
    }

    build(): HTMLElement {
        this.titleInput = UINode.make("input", {
            value: this.beat.getName(),
            classes: ["beat-settings-title-input"],
            type: "text",
            oninput: (event: Event) => {
                this.beat.setName((event.target as HTMLInputElement).value);
            },
            onblur: () => this.titleInput.replaceWith(this.titleDisplay),
            onkeyup: (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    (event.target as HTMLInputElement).blur();
                }
            }
        });
        this.titleDisplay = UINode.make("div", {
            innerText: this.beat.getName(),
            classes: ["beat-settings-title"],
            onclick: () => {
                this.titleDisplay.replaceWith(this.titleInput);
                this.titleInput.focus();
            }
        });
        this.bakeButton = new ActionButtonView({
            icon: "snowflake",
            type: "secondary",
            alt: "Bake Loops",
            disabled: !this.beat.isLooping(),
            onClick: () => this.beat.bakeLoops(),
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
        }, [
            this.loopLengthInput.render(),
        ]);
        if (this.beat.isLooping()) {
            this.loopLengthSection.classList.remove("hide");
        } else {
            this.loopLengthSection.classList.add("hide");
        }
        return UINode.make("div", {
            classes: ["beat-settings"],
        }, [
            this.titleDisplay,
            UINode.make("div", {
                classes: ["beat-settings-lower"],
            }, [
                this.bakeButton.render(),
                new ActionButtonView({
                    icon: "trash",
                    type: "secondary",
                    alt: "Delete Track",
                    onClick: () => this.beat.delete(),
                }).render(),
                UINode.make("div", {
                    classes: ["loop-settings"],
                }, [
                    this.loopCheckbox.render(),
                ]),
                this.loopLengthSection,
            ]),
        ]);
    }
}
