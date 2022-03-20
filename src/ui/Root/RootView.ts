import UINode, {UINodeOptions} from "@/ui/UINode";
import BeatGroupView from "@/ui/BeatGroup/BeatGroupView";
import BeatGroup from "@/BeatGroup";
import "./Root.css";
import BeatGroupSettingsView from "@/ui/BeatGroupSettings/BeatGroupSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeatGroup?: BeatGroup,
};

export default class RootView extends UINode {
    private title: string;
    private beatGroupView: BeatGroupView;
    private mainBeatGroup: BeatGroup;
    private beatGroupSettingsView!: BeatGroupSettingsView;
    private sidebar!: HTMLDivElement;


    constructor(options: RootUINodeOptions) {
        super(options);
        this.mainBeatGroup = options.mainBeatGroup ?? RootView.defaultMainBeatGroup();
        this.beatGroupView = new BeatGroupView({title: options.title, beatGroup: this.mainBeatGroup});
        this.title = options.title;
    }

    static defaultMainBeatGroup(): BeatGroup {
        const defaultSettings = {
            barCount: 2,
            isLooping: false,
            timeSigUp: 8,
        };
        const mainBeatGroup = new BeatGroup(defaultSettings);
        mainBeatGroup.addBeat({name: "LF"});
        mainBeatGroup.addBeat({name: "LH"});
        mainBeatGroup.addBeat({name: "RH"});
        mainBeatGroup.addBeat({name: "RF"});
        return mainBeatGroup;
    }

    toggleSidebar(): void {
        this.getNode().classList.toggle("sidebar-visible");
    }

    toggleOrientation(): void {
        this.getNode().classList.toggle("vertical-mode");
    }

    build(): HTMLElement {
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.mainBeatGroup});
        const sidebarMain = UINode.make("div", {
            classes: ["root-settings"],
            subs: [
                UINode.make("h1", {innerText: this.title, classes: ["root-title"]}),
                this.beatGroupSettingsView.render(),
            ]
        });
        const sidebarStrip = UINode.make("div", {
            classes: ["root-sidebar-toggle"],
            subs: [
                UINode.make("div", {
                    classes: ["root-quick-access-button"],
                    subs: [new IconView({iconName: "list", color: "var(--color-ui-neutral-dark)"}).render()],
                    onclick: () => this.toggleSidebar(),
                }),
                UINode.make("div", {
                    classes: ["root-quick-access-button"],
                    subs: [new IconView({iconName: "arrowClockwise", color: "var(--color-ui-neutral-dark)"}).render()],
                    onclick: () => this.toggleOrientation(),
                }),
                UINode.make("div", {
                    classes: ["root-quick-access-button"],
                    subs: [new IconView({iconName: "snowflake", color: "var(--color-ui-neutral-dark)"}).render()],
                    onclick: () => this.mainBeatGroup.bakeLoops(),
                }),
                UINode.make("div", {
                    classes: ["root-quick-access-button"],
                    title: "Reset all",
                    subs: [new IconView({iconName: "trash", color: "var(--color-ui-neutral-dark)"}).render()],
                    onclick: () => {
                        this.mainBeatGroup = RootView.defaultMainBeatGroup();
                        this.beatGroupSettingsView.setBeatGroup(this.mainBeatGroup);
                        this.beatGroupView.setBeatGroup(this.mainBeatGroup);
                    },
                }),
            ]
        });
        this.sidebar = UINode.make("div", {
            classes: ["root-sidebar"],
            subs: [
                sidebarMain,
                sidebarStrip,
            ]
        });
        return UINode.make("div", {
            classes: ["root", "sidebar-visible"],
            subs: [
                this.sidebar,
                UINode.make("div", {
                    classes: ["root-beat-stage-container"],
                    subs: [
                        UINode.make("div", {
                            classes: ["root-beat-stage"],
                            subs: [
                                this.beatGroupView.render(),
                            ],
                        })
                    ]
                })
            ],
        });
    }
}