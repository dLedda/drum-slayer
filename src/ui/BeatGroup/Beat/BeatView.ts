import UINode, {UINodeOptions} from "../../UINode";
import Beat, {BeatEvents} from "../../../Beat";
import {IPublisher} from "../../../Publisher";
import BeatSettingsView from "./BeatSettings/BeatSettingsView";
import ISubscriber from "../../../Subscriber";
import BeatUnitView from "./BeatUnit/BeatUnitView";
import "./Beat.css";

//some comment

export type BeatUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatView extends UINode implements ISubscriber {
    private beat: Beat;
    private title!: HTMLHeadingElement;
    private settingsView!: BeatSettingsView;
    private settingsToggleButton!: HTMLDivElement;
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

    private toggleSettings() {
        this.settingsView.toggleVisible();
        if (this.settingsView.isOpen()) {
            this.settingsToggleButton.classList.add("active");
        } else {
            this.settingsToggleButton.classList.remove("active");
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
                view.onHover(() => {
                    this.lastHoveredBeatUnitView = view;
                    if (BeatView.selectingUnits) {
                        this.lastHoveredBeatUnitView.turnOn();
                    } else if (BeatView.deselectingUnits) {
                        this.lastHoveredBeatUnitView.turnOff();
                    }
                });
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

    rebuild(): HTMLElement {
        this.title = UINode.make("h3", {
            innerText: this.beat.getName(),
            classes: ["beat-title"],
        });
        this.setupBeatUnits();
        if (!this.beatUnitViewBlock) {
            throw new Error("Beat unit block setup failed!");
        }
        this.settingsView = new BeatSettingsView({beat: this.beat});
        this.settingsToggleButton = UINode.make("div", {
            classes: ["beat-settings-btn"],
            innerText: "Settings",
            onclick: () => this.toggleSettings()
        });
        this.node = UINode.make("div", {
            classes: ["beat"],
            subs: [
                UINode.make("div", {
                    classes: ["beat-main"],
                    subs: [
                        this.title,
                        this.beatUnitViewBlock,
                    ]
                }),
                this.settingsToggleButton,
                UINode.make("div", {
                    classes: ["beat-settings-container"],
                    subs: [this.settingsView.render()],
                }),
            ],
        });
        return this.node;
    }
}

window.addEventListener("mouseup", () => {
    BeatView.selectingUnits = false;
    BeatView.deselectingUnits = false;
});