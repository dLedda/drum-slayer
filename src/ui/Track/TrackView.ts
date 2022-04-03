import UINode, {h, UINodeOptions} from "@/ui/UINode";
import Track, {TrackEvents} from "@/Track";
import ISubscriber from "@/Subscriber";
import TrackUnitView from "@/ui/TrackUnit/TrackUnitView";
import "./Track.css";
import {ISubscription} from "@/Publisher";
import Ref from "@/Ref";

export type TrackUINodeOptions = UINodeOptions & {
    track: Track,
};

const EventTypeSubscriptions = [
    TrackEvents.NewName,
    TrackEvents.NewTimeSig,
    TrackEvents.NewBarCount,
    TrackEvents.DisplayTypeChanged,
    TrackEvents.LoopLengthChanged,
];

type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class TrackView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private track!: Track;
    private title = Ref.new<HTMLHeadingElement | null>(null);
    private trackUnitViews: TrackUnitView[] = [];
    private trackUnitViewBlock: HTMLElement | null = null;
    private lastHoveredTrackUnitView: TrackUnitView | null = null;
    private sub: ISubscription | null = null;
    static deselectingUnits = false;
    static selectingUnits = false;

    constructor(options: TrackUINodeOptions) {
        super(options);
        this.setBeat(options.track);
    }

    setBeat(track: Track | null): void {
        if (track) {
            this.track = track;
            this.sub?.unbind();
            this.sub = this.track.addSubscriber(this, EventTypeSubscriptions);
            this.redraw();
        } else {
            this.sub?.unbind();
        }
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch (event) {
        case TrackEvents.NewName:
            this.title.val!.innerText = this.track.getName();
            break;
        case TrackEvents.NewTimeSig:
        case TrackEvents.NewBarCount:
        case TrackEvents.DisplayTypeChanged:
        case TrackEvents.LoopLengthChanged:
            this.setupTrackUnits();
            break;
        }
    }

    private rebuildTrackUnitViews() {
        const trackUnitCount = this.track.getBarCount() * this.track.getTimeSigUp();
        for (let i = 0; i < trackUnitCount; i++) {
            const trackUnit = this.track.getUnitByIndex(i);
            if (trackUnit) {
                let view: TrackUnitView;
                if (this.trackUnitViews[i]) {
                    view = this.trackUnitViews[i];
                    view.setUnit(trackUnit);
                } else {
                    view = new TrackUnitView({trackUnit});
                    this.trackUnitViews.push(view);
                    view.onHover(() => this.onTrackUnitViewHover(view));
                    view.onMouseDown((event: MouseEvent) => this.onTrackUnitClick(event.button, i));
                }
            }
        }
        const deadViews = this.trackUnitViews.splice(trackUnitCount, this.trackUnitViews.length - trackUnitCount);
        deadViews.forEach(trackUnitView => trackUnitView.setUnit(null));
    }

    private onTrackUnitClick(button: number, index: number) {
        if (button === 0) {
            TrackView.selectingUnits = true;
        } else if (button === 2) {
            TrackView.deselectingUnits = true;
            this.track.getUnitByIndex(index)?.setOn(false);
        }
    }

    private onTrackUnitViewHover(trackUnitView: TrackUnitView) {
        this.lastHoveredTrackUnitView = trackUnitView;
        if (TrackView.selectingUnits) {
            this.lastHoveredTrackUnitView.turnOn();
        } else if (TrackView.deselectingUnits) {
            this.lastHoveredTrackUnitView.turnOff();
        }
    }

    private buildTrackUnitViewBlock(): void {
        const trackUnitNodes: HTMLElement[] = [];
        for (let i = 0; i < this.trackUnitViews.length; i++) {
            trackUnitNodes.push(this.trackUnitViews[i].render());
        }
        if (this.trackUnitViewBlock) {
            this.trackUnitViewBlock.replaceChildren(...trackUnitNodes);
        } else {
            this.trackUnitViewBlock = h("div", {
                classes: ["track-unit-block"],
            }, [
                ...trackUnitNodes
            ]);
        }
    }

    private respaceTrackUnits(): void {
        if (!this.trackUnitViewBlock) {
            return;
        }
        this.trackUnitViewBlock.querySelectorAll(".unit-spacer").forEach(spacer => spacer.remove());
        const barLength = this.track.getTimeSigUp();
        const barCount = this.track.getBarCount();
        let bars = 0;
        let i = -1;
        let spacersInserted = false;
        while (!spacersInserted) {
            i += barLength;
            const newSpacer = h("div", {classes: ["track-spacer"]});
            const leftNeighbour = this.trackUnitViewBlock.children.item(i);
            if (leftNeighbour) {
                leftNeighbour.insertAdjacentElement("afterend", newSpacer);
            } else {
                break;
            }
            i++;
            bars++;
            if (bars === barCount) {
                spacersInserted = true;
            }
        }
    }

    private setupTrackUnits(): void {
        this.rebuildTrackUnitViews();
        this.buildTrackUnitViewBlock();
        this.respaceTrackUnits();
    }

    build(): HTMLElement {
        this.setupTrackUnits();
        if (!this.trackUnitViewBlock) {
            throw new Error("Beat unit block setup failed!");
        }
        return h("div", {
            classes: ["track"],
        }, [
            h("div", {
                classes: ["track-main"],
            }, [
                h("h3", {
                    innerText: this.track.getName(),
                    saveTo: this.title,
                    classes: ["track-title"],
                }),
                this.trackUnitViewBlock,
            ]),
        ]);
    }
}

window.addEventListener("mouseup", () => {
    TrackView.selectingUnits = false;
    TrackView.deselectingUnits = false;
});