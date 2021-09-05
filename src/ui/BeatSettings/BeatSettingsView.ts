import "./BeatSettings.css";
import Beat, {BeatEvents} from "../../Beat";
import UINode, {UINodeOptions} from "../UINode";
import ISubscriber from "../../Subscriber";
import BeatLikeLoopSettingsView from "../BeatLikeLoopSettings/BeatLikeLoopSettingsView";
import {IPublisher} from "../../Publisher";

export type BeatSettingsViewUINodeOptions = UINodeOptions & {
    beat: Beat,
};

export default class BeatSettingsView extends UINode implements ISubscriber {
    private beat: Beat;
    private visible = false;
    private nameInput!: HTMLInputElement;
    private loopSettingsView!: BeatLikeLoopSettingsView;

    constructor(options: BeatSettingsViewUINodeOptions) {
        super(options);
        this.beat = options.beat;
        this.setupBindings();
    }

    private setupBindings() {
        this.beat.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatEvents.NewName) {
            this.nameInput.value = this.beat.getName();
        }
    }

    rebuild(): HTMLElement {
        this.loopSettingsView = new BeatLikeLoopSettingsView({beatLike: this.beat});
        this.nameInput = UINode.make("input", {
            value: this.beat.getName(),
            type: "text",
            oninput: (event: Event) => this.beat.setName((event.target as HTMLInputElement).value),
        });
        this.node = UINode.make("div", {
            classes: ["beat-settings"],
            subs: [
                this.nameInput,
                this.loopSettingsView.render(),
            ],
        });
        return this.node;
    }
}
