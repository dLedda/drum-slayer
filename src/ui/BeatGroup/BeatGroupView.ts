import UINode, {UINodeOptions} from "@/ui/UINode";
import BeatGroup, {BeatGroupEvents} from "@/BeatGroup";
import BeatView from "@/ui/Beat/BeatView";
import "./BeatGroup.css";
import ISubscriber from "@/Subscriber";

export type BeatGroupUINodeOptions = UINodeOptions & {
    title: string,
    beatGroup: BeatGroup,
};

const EventTypeSubscriptions = [
    BeatGroupEvents.BeatListChanged
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatGroupView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private title: string;
    private beatGroup: BeatGroup;
    private beatViews: BeatView[] = [];

    constructor(options: BeatGroupUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.title = options.title;
        this.beatGroup.addSubscriber(this, BeatGroupEvents.BeatListChanged);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        if (event === BeatGroupEvents.BeatListChanged) {
            this.redraw();
        }
    }

    setBeatGroup(newBeatGroup: BeatGroup): void {
        this.beatGroup = newBeatGroup;
        this.beatGroup.addSubscriber(this, BeatGroupEvents.BeatListChanged);
        this.redraw();
    }

    build(): HTMLDivElement {
        this.beatViews = [];
        for (let i = 0; i < this.beatGroup.getBeatCount(); i++) {
            this.beatViews.push(new BeatView({beat: this.beatGroup.getBeatByIndex(i)}));
        }
        return UINode.make("div", {
            classes: ["beat-group"],
        },[
            ...this.beatViews.map(bv => bv.render())
        ]);
    }
}