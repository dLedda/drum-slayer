import UINode, {h, UINodeOptions} from "@/ui/UINode";
import Beat, {BeatEvents} from "@/Beat";
import TrackView from "@/ui/Track/TrackView";
import "./Beat.css";
import ISubscriber from "@/Subscriber";
import {ISubscription} from "@/Publisher";
import EditableTextFieldView from "@/ui/Widgets/EditableTextFIeld/EditableTextFieldView";

export type BeatUINodeOptions = UINodeOptions & {
    beat: Beat,
    orientation?: "horizontal" | "vertical",
};

const EventTypeSubscriptions = [
    BeatEvents.TrackListChanged,
] as const;
type EventTypeSubscriptions = typeof EventTypeSubscriptions[number];

export default class BeatView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private beat: Beat;
    private title: EditableTextFieldView;
    private trackViews: TrackView[] = [];
    private currentOrientation: "vertical" | "horizontal";
    private subscription: ISubscription;

    constructor(options: BeatUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.currentOrientation = options.orientation ?? "horizontal";
        this.subscription = this.beat.addSubscriber(this, EventTypeSubscriptions);
        this.title = new EditableTextFieldView({
            setter: (text: string) => this.beat.setName(text),
            noEmpty: true,
            initialText: this.beat.getName().val,
        });
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

    private onNewBeat(): void {
        this.beat.getName().watch((newVal) => {
            this.title.setText(newVal);
        });
        this.title.setText(this.beat.getName().val);
        EventTypeSubscriptions.forEach(event => this.notify(this, event));
        this.setupTrackViews();
        this.redraw();
    }

    setBeat(newBeat: Beat): void {
        this.beat = newBeat;
        this.subscription.unbind();
        this.subscription = this.beat.addSubscriber(this, BeatEvents.TrackListChanged);
        this.onNewBeat();
    }

    build(): HTMLDivElement {
        return h("div", {
            className: "beat",
        },[
            h("h2", {
                className: "beat-title",
            }, [
                this.title,
            ]),
            h("div", {
                className: "beat-track-container",
            }, [
                ...this.trackViews,
            ]),
        ]);
    }
}