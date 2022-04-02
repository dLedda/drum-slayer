import UINode, {h, UINodeOptions} from "@/ui/UINode";
import BeatGroupView from "@/ui/BeatGroup/BeatGroupView";
import BeatGroup from "@/BeatGroup";
import "./Root.css";
import BeatGroupSettingsView from "@/ui/BeatGroupSettings/BeatGroupSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";
import StageTitleBarView from "@/ui/StageTitleBar/StageTitleBarView";
import Ref from "@/Ref";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeatGroup?: BeatGroup,
    orientation?: "horizontal" | "vertical",
};

export default class RootView extends UINode {
    private title: string;
    private beatGroupView: BeatGroupView;
    private focusedBeatGroup: BeatGroup;
    private beatGroupSettingsView: BeatGroupSettingsView;
    private currentOrientation: "horizontal" | "vertical";
    private stageTitleBarView: StageTitleBarView;
    private showHideSidebarButton: Ref<HTMLDivElement | null> = new Ref<HTMLDivElement | null>(null);
    private sidebarActive = true;

    constructor(options: RootUINodeOptions) {
        super(options);
        this.currentOrientation = options.orientation ?? "horizontal";
        this.focusedBeatGroup = options.mainBeatGroup ?? RootView.defaultMainBeatGroup();
        this.beatGroupView = new BeatGroupView({
            title: options.title,
            beatGroup: this.focusedBeatGroup,
            orientation: this.currentOrientation,
        });
        this.stageTitleBarView = new StageTitleBarView({beatGroup: this.focusedBeatGroup});
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.focusedBeatGroup});
        this.title = options.title;
        this.setOrientation(this.currentOrientation);
        this.openSidebarForDesktop();
    }

    private openSidebarForDesktop() {
        const mediaQueryList = window.matchMedia("screen and (max-width: 900px)");
        if (mediaQueryList.matches) {
            this.toggleSidebar();
        }
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

    setMainBeatGroup(beatGroup: BeatGroup): void {
        this.focusedBeatGroup = beatGroup;
        this.beatGroupSettingsView.setBeatGroup(this.focusedBeatGroup);
        this.beatGroupView.setBeatGroup(this.focusedBeatGroup);
        this.stageTitleBarView.setBeatGroup(this.focusedBeatGroup);
    }

    toggleSidebar(): void {
        this.sidebarActive = !this.sidebarActive;
        this.showHideSidebarButton.val!.title = this.sidebarText();
        this.getNode().classList.toggle("sidebar-visible");
    }

    toggleOrientation(): void {
        if (this.currentOrientation === "vertical") {
            this.setOrientation("horizontal");
        } else {
            this.setOrientation("vertical");
        }
    }

    setOrientation(orientation: "horizontal" | "vertical"): void {
        this.currentOrientation = orientation;
        if (orientation === "vertical") {
            this.getNode().classList.add("vertical-mode");
        } else {
            this.getNode().classList.remove("vertical-mode");
        }
        this.beatGroupView.setOrientation(orientation);
    }

    private sidebarText(): string {
        return `${this.sidebarActive ? "Hide" : "Show"} sidebar`;
    }


    private buildSidebarStrip(): HTMLElement {
        return h("div", {
            classes: ["root-sidebar-toggle"],
        }, [
            h("div", {
                classes: ["root-quick-access-button"],
                title: this.sidebarText(),
                saveTo: this.showHideSidebarButton,
                onclick: () => this.toggleSidebar(),
            }, [
                new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Change orientation",
                onclick: () => this.toggleOrientation(),
            }, [
                new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Bake all tracks",
                onclick: () => this.focusedBeatGroup.bakeLoops(),
            }, [
                new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Reset all",
                onclick: () => this.setMainBeatGroup(RootView.defaultMainBeatGroup()),
            }, [
                new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
        ]);
    }

    private buildSidebar(): HTMLElement {
        return (
            h("div", {classes: ["root-sidebar"]}, [
                h("div", {classes: ["root-settings"]}, [
                    h("h1", {classes: ["root-title"], innerText: this.title}),
                    this.beatGroupSettingsView,
                ]),
                this.buildSidebarStrip(),
            ])
        );
    }

    build(): HTMLElement {
        return (
            h("div", {classes: ["root", "sidebar-visible"]}, [
                this.buildSidebar(),
                h("div", {classes: ["root-beat-stage-container"]}, [
                    this.stageTitleBarView,
                    h("div", {classes: ["root-beat-stage"]}, [
                        this.beatGroupView,
                    ])
                ])
            ])
        );
    }
}