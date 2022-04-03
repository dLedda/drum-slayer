import UINode, {h, UINodeOptions} from "@/ui/UINode";
import BeatGroup, {BeatGroupEvents} from "@/BeatGroup";
import BeatView from "@/ui/Beat/BeatView";
import "./BeatGroup.css";
import ISubscriber from "@/Subscriber";
import {ISubscription} from "@/Publisher";

export type BeatGroupUINodeOptions = UINodeOptions & {
    title: string,
    beatGroup: BeatGroup,
    orientation?: "horizontal" | "vertical",
};

const EventTypeSubscriptions = [
    BeatGroupEvents.BeatListChanged
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatGroupView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private title: string;
    private beatGroup: BeatGroup;
    private beatViews: BeatView[] = [];
    private currentOrientation: "vertical" | "horizontal";
    private subscription: ISubscription;

    constructor(options: BeatGroupUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.title = options.title;
        this.currentOrientation = options.orientation ?? "horizontal";
        this.subscription = this.beatGroup.addSubscriber(this, EventTypeSubscriptions);
        this.setupBeatViews();
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        if (event === BeatGroupEvents.BeatListChanged) {
            this.setupBeatViews();
            this.redraw();
        }
    }

    private setupBeatViews(): void {
        const newCount = this.beatGroup.getBeatCount();
        for (let i = 0; i < newCount; i++) {
            const beat = this.beatGroup.getBeatByIndex(i);
            if (beat && this.beatViews[i]) {
                this.beatViews[i].setBeat(beat);
            } else {
                this.beatViews.push(new BeatView({beat: this.beatGroup.getBeatByIndex(i)}));
            }
        }
        const deadBeatViews = this.beatViews.splice(newCount, this.beatViews.length - newCount);
        deadBeatViews.forEach(beatView => beatView.setBeat(null));
        if (this.currentOrientation === "horizontal") {
            this.reverseDisplayOrder();
        }
    }

    setOrientation(orientation: "vertical" | "horizontal"): void {
        if (this.currentOrientation !== orientation) {
            this.reverseDisplayOrder();
            this.currentOrientation = orientation;
        }
    }

    private reverseDisplayOrder(): void {
        this.beatViews.reverse();
        this.getNode().classList.toggle("vertical");
        this.redraw();
    }

    setBeatGroup(newBeatGroup: BeatGroup): void {
        this.beatGroup = newBeatGroup;
        this.subscription.unbind();
        this.subscription = this.beatGroup.addSubscriber(this, BeatGroupEvents.BeatListChanged);
        this.setupBeatViews();
        this.redraw();
    }

    build(): HTMLDivElement {
        return h("div", {
            classes: ["beat-group"],
        },[
            ...this.beatViews
        ]);
    }
}