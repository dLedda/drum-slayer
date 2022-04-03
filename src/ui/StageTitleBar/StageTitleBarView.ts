import "./StageTitleBar.css";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import {ISubscription} from "@/Publisher";
import Beat, {BeatEvents} from "@/Beat";
import ISubscriber from "@/Subscriber";
import EditableTextFieldView from "@/ui/Widgets/EditableTextFIeld/EditableTextFieldView";
import DropdownView, {DropdownViewOption} from "@/ui/Widgets/Dropdown/DropdownView";
import Ref from "@/Ref";

export type StageTitleBarViewOptions = UINodeOptions & {
    beat: Beat,
};

const EventTypeSubscription = [BeatEvents.NameChanged];
type EventTypeSubscription = FlatArray<typeof EventTypeSubscription, 1>;

export default class StageTitleBarView extends UINode implements ISubscriber<EventTypeSubscription> {
    private sub: ISubscription;
    private beat: Beat;
    private title: EditableTextFieldView;
    private options: Ref<DropdownViewOption[]>;

    constructor(options: StageTitleBarViewOptions) {
        super(options);
        this.beat = options.beat;
        this.sub = options.beat.addSubscriber(this, EventTypeSubscription);
        this.title = new EditableTextFieldView({
            initialText: this.beat.getName(),
            setter: (text) => this.beat.setName(text),
            noEmpty: true,
        });
        this.options = Ref.new<DropdownViewOption[]>([]);
    }

    notify(publisher: unknown, event: EventTypeSubscription): void {
        if (event === BeatEvents.NameChanged) {
            this.title.setText(this.beat.getName());
        }
    }

    setBeat(beat: Beat): void {
        this.sub.unbind();
        this.beat = beat;
        this.sub = beat.addSubscriber(this, EventTypeSubscription);
        this.notify(this, BeatEvents.NameChanged);
    }

    protected build(): HTMLElement {
        return h("div", {classes: ["stage-title-bar"]}, [
            h("h2", {}, [this.title]),
            new DropdownView({options: this.options})
        ]);
    }
}
