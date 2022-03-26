import "./BeatSettings.css";
import Beat, {BeatEvents} from "@/Beat";
import UINode, {UINodeOptions} from "@/ui/UINode";
import ISubscriber from "@/Subscriber";
import {ISubscription} from "@/Publisher";
import NumberInputView from "@/ui/Widgets/NumberInput/NumberInputView";
import BoolBoxView from "@/ui/Widgets/BoolBox/BoolBoxView";
import ActionButtonView from "@/ui/Widgets/ActionButton/ActionButtonView";
import EditableTextFieldView from "@/ui/Widgets/EditableTextFIeld/EditableTextFieldView";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

const EventTypeSubscriptions = [
    BeatEvents.NewName,
    BeatEvents.LoopLengthChanged,
    BeatEvents.DisplayTypeChanged,
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatSettingsView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private beat: Beat;
    private loopLengthInput!: NumberInputView;
    private bakeButton!: ActionButtonView;
    private loopCheckbox!: BoolBoxView;
    private loopLengthSection!: HTMLDivElement;
    private sub!: ISubscription;
    private title!: EditableTextFieldView;
    private editingTitle: boolean;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.editingTitle = false;
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.sub = this.beat.addSubscriber(this, EventTypeSubscriptions);
    }

    setBeat(beat: Beat): void {
        this.sub.unbind();
        this.beat = beat;
        this.setupBindings();
        EventTypeSubscriptions.forEach(eventType => this.notify(null, eventType));
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch(event) {
        case BeatEvents.NewName:
            this.title.setText(this.beat.getName());
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
        this.title = new EditableTextFieldView({
            initialText: this.beat.getName(),
            setter: (newText) => this.beat.setName(newText),
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
            UINode.make("div", {
                classes: ["beat-settings-title-container"]
            }, [
                this.title,
            ]),
            UINode.make("div", {
                classes: ["beat-settings-lower"],
            }, [
                this.bakeButton,
                new ActionButtonView({
                    icon: "trash",
                    type: "secondary",
                    alt: "Delete Track",
                    onClick: () => this.beat.delete(),
                }).render(),
                UINode.make("div", {
                    classes: ["loop-settings"],
                }, [
                    this.loopCheckbox,
                ]),
                this.loopLengthSection,
            ]),
        ]);
    }
}
