import UINode, {UINodeOptions} from "@/ui/UINode";
import Beat, {BeatEvents} from "@/Beat";
import {IPublisher} from "@/Publisher";
import ISubscriber from "@/Subscriber";
import BeatUnitView from "@/ui/BeatUnit/BeatUnitView";
import "./Beat.css";

export type BeatUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatView extends UINode implements ISubscriber {
    private beat: Beat;
    private title!: HTMLHeadingElement;
    private beatUnitViews: BeatUnitView[] = [];
    private beatUnitViewBlock: HTMLElement | null = null;
    private lastHoveredBeatUnitView: BeatUnitView | null = null;
    static deselectingUnits = false;
    static selectingUnits = false;

    constructor(options: BeatUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private onBeatViewHover(beatView: BeatUnitView) {
        this.lastHoveredBeatUnitView = beatView;
        if (BeatView.selectingUnits) {
            this.lastHoveredBeatUnitView.turnOn();
        } else if (BeatView.deselectingUnits) {
            this.lastHoveredBeatUnitView.turnOff();
        }
    }

    private setupBindings() {
        this.beat.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.NewName) {
            this.title.innerText = this.beat.getName();
        } else if (event === BeatEvents.NewTimeSig) {
            this.setupBeatUnits();
        } else if (event === BeatEvents.NewBarCount) {
            this.setupBeatUnits();
        } else if (event === BeatEvents.DisplayTypeChanged) {
            this.setupBeatUnits();
        } else if (event === BeatEvents.LoopLengthChanged) {
            this.setupBeatUnits();
        }
    }

    private rebuildBeatUnitViews() {
        const beatUnitCount = this.beat.getBarCount() * this.beat.getTimeSigUp();
        this.beatUnitViews.splice(beatUnitCount, this.beatUnitViews.length - beatUnitCount);
        for (let i = 0; i < beatUnitCount; i++) {
            const beatUnit = this.beat.getUnitByIndex(i);
            if (beatUnit) {
                let view: BeatUnitView;
                if (this.beatUnitViews[i]) {
                    view = this.beatUnitViews[i];
                    view.setUnit(beatUnit);
                } else {
                    view = new BeatUnitView({beatUnit});
                    this.beatUnitViews.push(view);
                }
                view.onHover(() => this.onBeatViewHover(view));
                view.onMouseDown((event: MouseEvent) => this.onBeatUnitClick(event.button, i));
            }
        }
    }

    private onBeatUnitClick(button: number, index: number) {
        if (button === 0) {
            BeatView.selectingUnits = true;
            this.beat.getUnitByIndex(index)?.toggle();
        } else if (button === 2) {
            BeatView.deselectingUnits = true;
            this.beat.getUnitByIndex(index)?.setOn(false);
        }
    }

    private buildBeatUnitViewBlock(): void {
        const beatUnitNodes: HTMLElement[] = [];
        for (let i = 0; i < this.beatUnitViews.length; i++) {
            beatUnitNodes.push(this.beatUnitViews[i].render());
        }
        if (this.beatUnitViewBlock) {
            this.beatUnitViewBlock.replaceChildren(...beatUnitNodes);
        } else {
            this.beatUnitViewBlock = UINode.make("div", {
                classes: ["beat-unit-block"],
                subs: [...beatUnitNodes],
            });
        }
    }

    private respaceBeatUnits(): void {
        if (!this.beatUnitViewBlock) {
            return;
        }
        this.beatUnitViewBlock.querySelectorAll(".beat-spacer").forEach(spacer => spacer.remove());
        const barLength = this.beat.getTimeSigUp();
        const barCount = this.beat.getBarCount();
        let bars = 0;
        let i = -1;
        let spacersInserted = false;
        while (!spacersInserted) {
            i += barLength;
            const newSpacer = UINode.make("div", {classes: ["beat-spacer"]});
            const leftNeighbour = this.beatUnitViewBlock.children.item(i);
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

    private setupBeatUnits(): void {
        this.rebuildBeatUnitViews();
        this.buildBeatUnitViewBlock();
        this.respaceBeatUnits();
    }

    build(): HTMLElement {
        this.title = UINode.make("h3", {
            innerText: this.beat.getName(),
            classes: ["beat-title"],
        });
        this.setupBeatUnits();
        if (!this.beatUnitViewBlock) {
            throw new Error("Beat unit block setup failed!");
        }
        return UINode.make("div", {
            classes: ["beat"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-main"],
                    subs: [
                        this.title,
                        this.beatUnitViewBlock,
                    ]
                }),
            ],
        });
    }
}

window.addEventListener("mouseup", () => {
    BeatView.selectingUnits = false;
    BeatView.deselectingUnits = false;
});