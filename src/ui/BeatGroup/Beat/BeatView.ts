import UINode, {UINodeOptions} from "../../UINode";
import Beat, {BeatEvents} from "../../../Beat";
import {IPublisher} from "../../../Publisher";
import BeatSettingsView from "./BeatSettings/BeatSettingsView";
import ISubscriber from "../../../Subscriber";

export type BeatUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatView extends UINode implements ISubscriber {
    private beat: Beat;
    private title!: HTMLHeadingElement;
    private settingsView!: BeatSettingsView;
    private settingsToggleButton!: HTMLButtonElement;

    constructor(options: BeatUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
        this.rebuild();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, BeatEvents.NewName);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T) {
        if (event === BeatEvents.NewName) {
            this.title.innerText = this.beat.getName();
        }
    }

    private toggleSettings() {
        this.settingsView.toggleVisible();
        this.settingsToggleButton.innerText = this.settingsView.isOpen() ? "Hide Settings" : "Show Settings";
    }

    rebuild(): HTMLElement {
        this.title = UINode.make("h3", {innerText: this.beat.getName()});
        this.settingsView = new BeatSettingsView({beat: this.beat});
        this.settingsToggleButton = UINode.make("button", {innerText: this.settingsView.isOpen() ? "Hide Settings" : "Show Settings"});
        this.settingsToggleButton.addEventListener("click", () => this.toggleSettings());
        this.node = UINode.make("div", {
            subs: [
                this.title,
                UINode.make("p", {innerText: "I am a BeatGroup"}),
                this.settingsToggleButton,
                this.settingsView.rebuild(),
            ],
        });
        return this.node;
    }
}
