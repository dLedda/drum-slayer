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
        this.onMouseUp((ev: MouseEvent) => {
            if (ev.button === 1) {
                const currentType = this.beatUnit.getType();
                this.beatUnit.setType(currentType === BeatUnitType.GhostNote ? BeatUnitType.Normal : BeatUnitType.GhostNote);
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
            const showingAsGhost = this.getNode().classList.contains("beat-unit-ghost");
            const isGhost = this.beatUnit.getType() === BeatUnitType.GhostNote;
            if (isGhost && !showingAsGhost) {
                this.getNode().classList.add("beat-unit-ghost");
            } else if (!isGhost && showingAsGhost) {
                this.getNode().classList.remove("beat-unit-ghost");
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
        this.getNode().onmouseover = cb;
    }

    onMouseDown(cb: (ev: MouseEvent) => void): void {
        this.getNode().onmousedown = cb;
    }

    onMouseUp(cb: (ev: MouseEvent) => void): void {
        this.getNode().onmouseup = cb;
    }
}
