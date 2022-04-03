import UINode, {h, UINodeOptions} from "@/ui/UINode";
import Beat, {BeatEvents} from "@/Beat";
import TrackView from "@/ui/Track/TrackView";
import "./Beat.css";
import ISubscriber from "@/Subscriber";
import {ISubscription} from "@/Publisher";

export type BeatUINodeOptions = UINodeOptions & {
    title: string,
    beat: Beat,
    orientation?: "horizontal" | "vertical",
};

const EventTypeSubscriptions = [
    BeatEvents.TrackListChanged
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private title: string;
    private beat: Beat;
    private trackViews: TrackView[] = [];
    private currentOrientation: "vertical" | "horizontal";
    private subscription: ISubscription;

    constructor(options: BeatUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.title = options.title;
        this.currentOrientation = options.orientation ?? "horizontal";
        this.subscription = this.beat.addSubscriber(this, EventTypeSubscriptions);
        this.setupTrackViews();
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        if (event === BeatEvents.TrackListChanged) {
            this.setupTrackViews();
            this.redraw();
        }
    }

    private setupTrackViews(): void {
        const newCount = this.beat.getTrackCount();
        for (let i = 0; i < newCount; i++) {
            const beat = this.beat.getTrackByIndex(i);
            if (beat && this.trackViews[i]) {
                this.trackViews[i].setBeat(beat);
            } else {
                this.trackViews.push(new TrackView({track: this.beat.getTrackByIndex(i)}));
            }
        }
        const deadTrackViews = this.trackViews.splice(newCount, this.trackViews.length - newCount);
        deadTrackViews.forEach(beatView => beatView.setBeat(null));
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
        this.trackViews.reverse();
        this.getNode().classList.toggle("vertical");
        this.redraw();
    }

    setBeat(newBeat: Beat): void {
        this.beat = newBeat;
        this.subscription.unbind();
        this.subscription = this.beat.addSubscriber(this, BeatEvents.TrackListChanged);
        this.setupTrackViews();
        this.redraw();
    }

    build(): HTMLDivElement {
        return h("div", {
            classes: ["beat"],
        },[
            ...this.trackViews
        ]);
    }
}