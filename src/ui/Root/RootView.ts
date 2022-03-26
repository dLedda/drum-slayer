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


    constructor(options: RootUINodeOptions) {
        super(options);
        this.mainBeatGroup = options.mainBeatGroup ?? RootView.defaultMainBeatGroup();
        this.beatGroupView = new BeatGroupView({title: options.title, beatGroup: this.mainBeatGroup});
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.mainBeatGroup});
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

    private buildSidebarStrip(): HTMLElement {
        return UINode.make("div", {
            classes: ["root-sidebar-toggle"],
        }, [
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.toggleSidebar(),
            }, [
                new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                }).render()
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.toggleOrientation(),
            }, [
                new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                }).render(),
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.mainBeatGroup.bakeLoops(),
            }, [
                new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                }).render(),
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                title: "Reset all",
                onclick: () => {
                    this.mainBeatGroup = RootView.defaultMainBeatGroup();
                    this.beatGroupSettingsView.setBeatGroup(this.mainBeatGroup);
                    this.beatGroupView.setBeatGroup(this.mainBeatGroup);
                },
            }, [
                new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                }).render()
            ]),
        ]);
    }

    private buildSidebar(): HTMLElement {
        return (
            UINode.make("div", {classes: ["root-sidebar"]}, [
                UINode.make("div", {classes: ["root-settings"]}, [
                    UINode.make("h1", {classes: ["root-title"], innerText: this.title}, [
                        this.beatGroupSettingsView.render(),
                    ]),
                    this.buildSidebarStrip(),
                ]),
            ])
        );
    }

    build(): HTMLElement {
        return (
            UINode.make("div", {classes: ["root", "sidebar-visible"]}, [
                this.buildSidebar(),
                UINode.make("div", {classes: ["root-beat-stage-container"]}, [
                    UINode.make("div", {classes: ["root-beat-stage"]}, [
                        this.beatGroupView.render(),
                    ])
                ])
            ])
        );
    }
}