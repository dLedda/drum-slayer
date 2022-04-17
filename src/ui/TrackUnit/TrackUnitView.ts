import TrackUnit, {TrackUnitEvent, TrackUnitType} from "@/TrackUnit";
import ISubscriber from "@/Subscriber";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import {IPublisher, ISubscription, Publisher} from "@/Publisher";
import "./TrackUnit.css";

export type TrackUnitUINodeOptions = UINodeOptions & {
    trackUnit: TrackUnit,
};

const EventTypeSubscriptions = [
    TrackUnitEvent.On,
    TrackUnitEvent.Off,
    TrackUnitEvent.TypeChange,
];
type EventTypeSubscriptions = typeof EventTypeSubscriptions[number];

export default class TrackUnitView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private trackUnit: TrackUnit;
    private subscription: ISubscription | null = null;
    private publisher: IPublisher<TrackUnitEvent> = new Publisher<TrackUnitEvent, TrackUnitView>(this);
    private rotationTimeout: ReturnType<typeof setTimeout> | null = null;
    private mouseDownListeners: ((ev: MouseEvent) => void)[] = [];
    private hoverListeners: ((ev: MouseEvent) => void)[] = [];
    private blockNextMouseUp = false;

    constructor(options: TrackUnitUINodeOptions) {
        super(options);
        this.trackUnit = options.trackUnit;
        this.setUnit(this.trackUnit);
    }

    setUnit(trackUnit: TrackUnit | null): void {
        if (trackUnit) {
            this.trackUnit = trackUnit;
            this.setupBindings();
            this.notify(this.publisher, trackUnit.isOn() ? TrackUnitEvent.On : TrackUnitEvent.Off);
            this.notify(this.publisher, TrackUnitEvent.TypeChange);
        } else {
            this.subscription?.unbind();
        }
    }

    private setupBindings() {
        this.subscription?.unbind();
        this.subscription = this.trackUnit.addSubscriber(this, EventTypeSubscriptions);
        this.hoverListeners.forEach(listener => this.getNode().removeEventListener("mouseover", listener));
        this.mouseDownListeners.forEach(listener => this.getNode().removeEventListener("mousedown", listener));
        this.redraw();
        this.hoverListeners.forEach(listener => this.getNode().addEventListener("mouseover", listener));
        this.mouseDownListeners.forEach(listener => this.getNode().addEventListener("mousedown", listener));
        this.getNode().addEventListener("mousedown", (ev) => this.handleMouseDown(ev));
        this.getNode().addEventListener("mouseout", (ev) => this.handleMouseOut(ev));
        this.getNode().addEventListener("mouseup", (ev) => this.handleMouseUp(ev));
        this.getNode().addEventListener("touchstart", (ev) => this.handleTouchStart(ev));
        this.getNode().addEventListener("touchend", (ev) => this.handleTouchEnd(ev));
    }

    private handleMouseDown(ev: MouseEvent): void {
        if (ev.button === 1) {
            this.trackUnit.rotateType();
        } else if (ev.button === 0) {
            this.toggle();
            this.rotationTimeout = this.rotationTimeout || setTimeout(() => {
                this.trackUnit.rotateType();
                this.blockNextMouseUp = true;
                this.rotationTimeout = null;
            }, 400);
        }
    }

    private handleMouseOut(ev: MouseEvent): void {
        if (this.rotationTimeout) {
            clearTimeout(this.rotationTimeout);
            this.rotationTimeout = null;
        }
    }

    private handleMouseUp(ev: MouseEvent): void {
        if (this.rotationTimeout) {
            clearTimeout(this.rotationTimeout);
            this.rotationTimeout = null;
        }
        if (!this.blockNextMouseUp) {
            this.mouseDownListeners.forEach(listener => listener(ev));
        }
        this.blockNextMouseUp = false;
    }

    private handleTouchStart(ev: TouchEvent): void {
        this.rotationTimeout = this.rotationTimeout || setTimeout(() => {
            this.trackUnit.rotateType();
            this.rotationTimeout = null;
        }, 400);
    }

    private handleTouchEnd(ev: TouchEvent): void {
        if (this.rotationTimeout) {
            clearTimeout(this.rotationTimeout);
            this.rotationTimeout = null;
        }
    }

    toggle(): void {
        this.trackUnit.toggle();
    }

    turnOn(): void {
        this.trackUnit.setOn(true);
    }

    turnOff(): void {
        this.trackUnit.setOn(false);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch (event) {
        case TrackUnitEvent.On:
            this.getNode().classList.add("track-unit-on");
            break;
        case TrackUnitEvent.Off:
            this.getNode().classList.remove("track-unit-on");
            break;
        case TrackUnitEvent.TypeChange:
            switch (this.trackUnit.getType()) {
            case TrackUnitType.Normal:
                this.getNode().classList.remove("track-unit-ghost");
                this.getNode().classList.remove("track-unit-accent");
                break;
            case TrackUnitType.GhostNote:
                this.getNode().classList.add("track-unit-ghost");
                this.getNode().classList.remove("track-unit-accent");
                break;
            case TrackUnitType.Accent:
                this.getNode().classList.remove("track-unit-ghost");
                this.getNode().classList.add("track-unit-accent");
                break;
            case TrackUnitType.GhostNoteAccent:
                this.getNode().classList.add("track-unit-ghost");
                this.getNode().classList.add("track-unit-accent");
                break;
            }
            break;
        }
    }

    build(): HTMLElement {
        const classes = ["track-unit"];
        if (this.trackUnit.isOn()) {
            classes.push("track-unit-on");
        }
        return h("div", {
            classes: classes,
            oncontextmenu: () => false,
        });
    }

    onHover(cb: () => void): void {
        this.hoverListeners.push(cb);
        this.getNode().addEventListener("mouseover", cb);
    }

    onMouseDown(cb: (ev: MouseEvent) => void): void {
        this.mouseDownListeners.push(cb);
        this.getNode().addEventListener("mousedown", cb);
    }
}
