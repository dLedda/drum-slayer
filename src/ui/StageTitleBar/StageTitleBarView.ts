import "./StageTitleBar.css";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import {ISubscription} from "@/Publisher";
import BeatGroup, {BeatGroupEvents} from "@/BeatGroup";
import ISubscriber from "@/Subscriber";
import EditableTextFieldView from "@/ui/Widgets/EditableTextFIeld/EditableTextFieldView";

export type StageTitleBarViewOptions = UINodeOptions & {
    beatGroup: BeatGroup,
};

const EventTypeSubscription = [BeatGroupEvents.NameChanged];
type EventTypeSubscription = FlatArray<typeof EventTypeSubscription, 1>;

export default class StageTitleBarView extends UINode implements ISubscriber<EventTypeSubscription> {
    private sub: ISubscription;
    private beatGroup: BeatGroup;
    private title: EditableTextFieldView;

    constructor(options: StageTitleBarViewOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.sub = options.beatGroup.addSubscriber(this, EventTypeSubscription);
        this.title = new EditableTextFieldView({
            initialText: this.beatGroup.getName(),
            setter: (text) => this.beatGroup.setName(text),
            noEmpty: true,
        });
    }

    notify(publisher: unknown, event: EventTypeSubscription): void {
        if (event === BeatGroupEvents.NameChanged) {
            this.title.setText(this.beatGroup.getName());
        }
    }

    setBeatGroup(beatGroup: BeatGroup): void {
        this.sub.unbind();
        this.beatGroup = beatGroup;
        this.sub = beatGroup.addSubscriber(this, EventTypeSubscription);
        this.notify(this, BeatGroupEvents.NameChanged);
    }

    protected build(): HTMLElement {
        return h("div", {classes: ["stage-title-bar"]}, [
            h("div", {classes: ["stage-title-bar-preamble"], innerText: "Currently editing:"}),
            h("h2", {}, [this.title]),
        ]);
    }
}
