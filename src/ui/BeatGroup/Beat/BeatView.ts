import UINode, {UINodeOptions} from "../../UINode";
import Beat, {BeatEvents} from "../../../Beat";
import {IPublisher} from "../../../Publisher";
import BeatSettingsView from "./BeatSettings/BeatSettingsView";
import ISubscriber from "../../../Subscriber";
import BeatUnitView from "./BeatUnit/BeatUnitView";
import "./Beat.css";

export type BeatUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatView extends UINode implements ISubscriber {
    private beat: Beat;
    private title!: HTMLHeadingElement;
    private settingsView!: BeatSettingsView;
    private settingsToggleButton!: HTMLButtonElement;
    private beatUnitViews: BeatUnitView[] = [];
    private beatUnitViewBlock!: HTMLElement;

    constructor(options: BeatUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
        this.rebuild();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.NewName) {
            this.title.innerText = this.beat.getName();
        } else if (event === BeatEvents.NewTimeSig) {
            this.render();
        } else if (event === BeatEvents.NewBarCount) {
            this.render();
        }
    }

    private toggleSettings() {
        this.settingsView.toggleVisible();
        this.settingsToggleButton.innerText = this.settingsView.isOpen() ? "Hide Settings" : "Show Settings";
    }

    private makeBeatUnits() {
        const beatUnitCount = this.beat.getBarCount() * this.beat.getTimeSigUp();
        this.beatUnitViews = [];
        for (let i = 0; i < beatUnitCount; i++) {
            const beatUnit = this.beat.getUnitByIndex(i);
            if (beatUnit) {
                this.beatUnitViews.push(new BeatUnitView({beatUnit}));
            }
        }
    }

    private respaceBeatUnits(): void {
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

    rebuild(): HTMLElement {
        this.title = UINode.make("h3", {
            innerText: this.beat.getName(),
            classes: ["beat-title"],
        });
        this.makeBeatUnits();
        this.settingsView = new BeatSettingsView({beat: this.beat});
        this.settingsToggleButton = UINode.make("button", {
            classes: ["beat-settings-btn"],
            innerText: this.settingsView.isOpen() ? "Hide Settings" : "Show Settings",
        });
        this.settingsToggleButton.addEventListener("click", () => this.toggleSettings());
        this.beatUnitViewBlock = UINode.make("div", {
            classes: ["beat-unit-block"],
            subs: [
                ...this.beatUnitViews.map(view => view.rebuild()),
            ],
        });
        this.respaceBeatUnits();
        this.node = UINode.make("div", {
            classes: ["beat"],
            subs: [
                this.title,
                this.beatUnitViewBlock,
                this.settingsToggleButton,
                this.settingsView.rebuild(),
            ],
        });
        return this.node;
    }
}
