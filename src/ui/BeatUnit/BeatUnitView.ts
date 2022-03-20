import BeatUnit, {BeatUnitEvents, BeatUnitType} from "@/BeatUnit";
import ISubscriber from "@/Subscriber";
import UINode, {UINodeOptions} from "@/ui/UINode";
import {IPublisher, ISubscription, Publisher} from "@/Publisher";
import "./BeatUnit.css";

export type BeatUnitUINodeOptions = UINodeOptions & {
    beatUnit: BeatUnit,
};

export default class BeatUnitView extends UINode implements ISubscriber {
    private beatUnit: BeatUnit;
    private subscription: ISubscription | null = null;
    private publisher: IPublisher<BeatUnitEvents> = new Publisher<BeatUnitEvents, BeatUnitView>(this);
    private touchTimeout: ReturnType<typeof setTimeout> | null = null;


    constructor(options: BeatUnitUINodeOptions) {
        super(options);
        this.beatUnit = options.beatUnit;
        this.setupBindings();
    }

    setUnit(beatUnit: BeatUnit): void {
        this.beatUnit = beatUnit;
        this.setupBindings();
        this.notify(this.publisher, beatUnit.isOn() ? BeatUnitEvents.On : BeatUnitEvents.Off);
        this.notify(this.publisher, BeatUnitEvents.TypeChange);
    }

    private setupBindings() {
        this.subscription?.unbind();
        this.subscription = this.beatUnit.addSubscriber(this, "all");
        this.onMouseDown((ev: MouseEvent) => {
            if (ev.button === 1) {
                this.beatUnit.rotateType();
            }
        });
        this.getNode().addEventListener("touchstart", () => {
            this.touchTimeout = setTimeout(() => {
                this.beatUnit.rotateType();
                this.touchTimeout = null;
            }, 600);
        });
        this.getNode().addEventListener("touchend", () => {
            if (this.touchTimeout) {
                clearTimeout(this.touchTimeout);
                this.touchTimeout = null;
            }
        });
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

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatUnitEvents.On) {
            this.getNode().classList.add("beat-unit-on");
        } else if (event === BeatUnitEvents.Off) {
            this.getNode().classList.remove("beat-unit-on");
        } else if (event === BeatUnitEvents.TypeChange) {
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
        }
    }

    build(): HTMLElement {
        const classes = ["beat-unit"];
        if (this.beatUnit.isOn()) {
            classes.push("beat-unit-on");
        }
        return UINode.make("div", {
            classes: classes,
            oncontextmenu: () => false,
        });
    }

    onHover(cb: () => void): void {
        this.getNode().addEventListener("mouseover", cb);
    }

    onMouseDown(cb: (ev: MouseEvent) => void): void {
        this.getNode().addEventListener("mousedown", cb);
    }

    onMouseUp(cb: (ev: MouseEvent) => void): void {
        this.getNode().addEventListener("mouseup", cb);
    }
}
