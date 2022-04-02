import BeatUnit, {BeatUnitEvent, BeatUnitType} from "@/BeatUnit";
import ISubscriber from "@/Subscriber";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import {IPublisher, ISubscription, Publisher} from "@/Publisher";
import "./BeatUnit.css";

export type BeatUnitUINodeOptions = UINodeOptions & {
    beatUnit: BeatUnit,
};

const EventTypeSubscriptions = [
    BeatUnitEvent.On,
    BeatUnitEvent.Off,
    BeatUnitEvent.TypeChange,
];
type EventTypeSubscriptions = FlatArray<typeof EventTypeSubscriptions, 1>;

export default class BeatUnitView extends UINode implements ISubscriber<EventTypeSubscriptions> {
    private beatUnit: BeatUnit;
    private subscription: ISubscription | null = null;
    private publisher: IPublisher<BeatUnitEvent> = new Publisher<BeatUnitEvent, BeatUnitView>(this);
    private touchTimeout: ReturnType<typeof setTimeout> | null = null;
    private mouseDownListeners: ((ev: MouseEvent) => void)[] = [];
    private hoverListeners: ((ev: MouseEvent) => void)[] = [];

    constructor(options: BeatUnitUINodeOptions) {
        super(options);
        this.beatUnit = options.beatUnit;
        this.setupBindings();
    }

    setUnit(beatUnit: BeatUnit): void {
        this.beatUnit = beatUnit;
        this.setupBindings();
        this.notify(this.publisher, beatUnit.isOn() ? BeatUnitEvent.On : BeatUnitEvent.Off);
        this.notify(this.publisher, BeatUnitEvent.TypeChange);
    }

    private handleMouseDown(ev: MouseEvent): void {
        if (ev.button === 1) {
            this.beatUnit.rotateType();
        }
    }

    private handleTouchStart(ev: TouchEvent): void {
        this.touchTimeout = this.touchTimeout || setTimeout(() => {
            this.beatUnit.rotateType();
            this.touchTimeout = null;
        }, 400);
    }

    private handleTouchEnd(ev: TouchEvent): void {
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
    }

    private setupBindings() {
        this.subscription?.unbind();
        this.subscription = this.beatUnit.addSubscriber(this, EventTypeSubscriptions);
        this.mouseDownListeners.forEach(listener => this.getNode().removeEventListener("mousedown", listener));
        this.hoverListeners.forEach(listener => this.getNode().removeEventListener("mouseover", listener));
        this.redraw();
        this.mouseDownListeners.forEach(listener => this.getNode().addEventListener("mousedown", listener));
        this.hoverListeners.forEach(listener => this.getNode().addEventListener("mouseover", listener));
        this.getNode().addEventListener("mousedown", (ev) => this.handleMouseDown(ev));
        this.getNode().addEventListener("touchstart", (ev) => this.handleTouchStart(ev));
        this.getNode().addEventListener("touchend", (ev) => this.handleTouchEnd(ev));
    }

    toggle(): void {
        this.beatUnit.toggle();
    }

    turnOn(): void {
        this.beatUnit.setOn(true);
    }

    turnOff(): void {
        this.beatUnit.setOn(false);
    }

    notify(publisher: unknown, event: EventTypeSubscriptions): void {
        switch (event) {
        case BeatUnitEvent.On:
            this.getNode().classList.add("beat-unit-on");
            break;
        case BeatUnitEvent.Off:
            this.getNode().classList.remove("beat-unit-on");
            break;
        case BeatUnitEvent.TypeChange:
            switch (this.beatUnit.getType()) {
            case BeatUnitType.Normal:
                this.getNode().classList.remove("beat-unit-ghost");
                this.getNode().classList.remove("beat-unit-accent");
                break;
            case BeatUnitType.GhostNote:
                this.getNode().classList.remove("beat-unit-accent");
                this.getNode().classList.add("beat-unit-ghost");
                break;
            case BeatUnitType.Accent:
                this.getNode().classList.remove("beat-unit-ghost");
                this.getNode().classList.add("beat-unit-accent");
                break;
            }
            break;
        }
    }

    build(): HTMLElement {
        const classes = ["beat-unit"];
        if (this.beatUnit.isOn()) {
            classes.push("beat-unit-on");
        }
        return h("div", {
            classes: classes,
            oncontextmenu: () => false,
        });
    }

    onHover(cb: () => void): void {
        this.hoverListeners.push(cb);
        this.setupBindings();
    }

    onMouseDown(cb: (ev: MouseEvent) => void): void {
        this.mouseDownListeners.push(cb);
        this.setupBindings();
    }
}
